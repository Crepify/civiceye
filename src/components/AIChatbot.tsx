import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  LoaderCircle,
  MessageSquare,
  Mic,
  MicOff,
  Plus,
  Send,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBrand } from '@/hooks/useBrand';
import { useAuth } from '@/hooks/useAuth';
import { parseNavigationIntent } from '@/services/navigationService';
import { JarvisVoice, VOICE_LANGUAGES, voiceCapabilities } from '@/services/voiceService';
import {
  ChatServiceError,
  isChatAbortError,
  streamChat,
  type ChatRequestMessage,
} from '@/services/chatService';
import { cn } from '@/utils/cn';

const MAX_INPUT_LENGTH = 8000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_CHARS = 32000;

const QUICK_PROMPTS = [
  'What can you help me with?',
  'How do I get started?',
  'Explain this page',
  'Help me report an issue',
  'Take me to the map',
];

interface ChatMessage extends ChatRequestMessage {
  id: string;
}

function messageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Keep the request limited to the user's chat, never app or account context. */
function buildRequestHistory(messages: ChatMessage[]): ChatRequestMessage[] {
  const eligible = messages.filter((message) => message.content.trim().length > 0);
  const selected: ChatRequestMessage[] = [];
  let totalChars = 0;

  for (
    let index = eligible.length - 1;
    index >= 0 && selected.length < MAX_HISTORY_MESSAGES;
    index -= 1
  ) {
    const message = eligible[index];
    const remaining = MAX_HISTORY_CHARS - totalChars;
    if (remaining <= 0) break;

    const content =
      message.content.length > remaining ? message.content.slice(-remaining) : message.content;
    selected.unshift({ role: message.role, content });
    totalChars += content.length;
  }

  return selected;
}

function latestUserMessage(messages: ChatMessage[]): ChatMessage | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') return messages[index];
  }
  return undefined;
}

function isHiddenRoute(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/reset' ||
    pathname.startsWith('/reset/') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/')
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof ChatServiceError) return error.message;
  if (error instanceof Error && error.message) {
    return `JARVIS could not complete that response: ${error.message}`;
  }
  return 'JARVIS could not complete that response. Please try again.';
}

/** Render text and fenced code as React nodes; never interpret response HTML. */
function SafeMessageContent({ content }: { content: string }) {
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        if (segment.startsWith('```')) {
          const code = segment.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
          return (
            <pre
              key={`code-${index}`}
              className="my-2 overflow-x-auto rounded-lg bg-slate-950/10 p-2 text-[12px] dark:bg-black/25"
            >
              <code>{code}</code>
            </pre>
          );
        }
        return <span key={`text-${index}`}>{segment}</span>;
      })}
    </div>
  );
}

export function AIChatbot() {
  const { isAmrita } = useBrand();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hidden = isHiddenRoute(location.pathname);
  const brandName = isAmrita ? 'Amrita Eye' : 'CivicEye';
  const accent = isAmrita ? '#A51636' : '#4F46E5';

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState('en-IN');
  const [capabilities] = useState(voiceCapabilities);
  const hasSpeechSynthesis = capabilities.synthesis;
  const [readAloud, setReadAloud] = useState(capabilities.synthesis);
  const [autoSendVoice, setAutoSendVoice] = useState(false);
  const [voice] = useState(
    () =>
      new JarvisVoice({
        onListening: setListening,
        onSpeaking: setSpeaking,
        onError: setVoiceError,
      }),
  );
  const voicePrefsRef = useRef({ readAloud, voiceLanguage, active: false });
  voicePrefsRef.current = { readAloud, voiceLanguage, active: open && !hidden };
  const voiceEpochRef = useRef(0);

  const stopVoice = useCallback(() => {
    voiceEpochRef.current += 1;
    voice.stopAll();
  }, [voice]);

  const abortRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const closeChat = useCallback(() => {
    stopVoice();
    setOpen(false);
    window.setTimeout(() => fabRef.current?.focus(), 0);
  }, [stopVoice]);

  const clearChat = useCallback(() => {
    stopVoice();
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStreamingText('');
    setInput('');
    setBusy(false);
    setError(null);
    setStatus(null);
    setVoiceError('');
  }, [stopVoice]);

  const beginGeneration = useCallback(
    async (history: ChatRequestMessage[]) => {
      stopVoice();
      const voiceEpoch = voiceEpochRef.current;
      const controller = new AbortController();
      const generation = generationRef.current + 1;
      generationRef.current = generation;
      abortRef.current = controller;
      setBusy(true);
      setError(null);
      setStatus(null);
      setStreamingText('');

      let completedText = '';
      try {
        await streamChat(history, {
          signal: controller.signal,
          onText: (text) => {
            if (generation !== generationRef.current) return;
            completedText += text;
            setStreamingText(completedText);
          },
        });

        if (!completedText.trim()) {
          throw new ChatServiceError('JARVIS returned an empty response.');
        }

        if (generation !== generationRef.current) return;
        setMessages((current) => [
          ...current,
          { id: messageId('assistant'), role: 'assistant', content: completedText },
        ]);
        setStreamingText('');
        // Speak only complete replies, while the chat is visible and opted in.
        // Closing, navigation, Stop, or switching tabs invalidates queued audio.
        const prefs = voicePrefsRef.current;
        if (
          prefs.readAloud &&
          prefs.active &&
          voiceEpoch === voiceEpochRef.current &&
          document.visibilityState !== 'hidden'
        ) {
          voice.speak(completedText, prefs.voiceLanguage);
        }
      } catch (caughtError) {
        if (generation !== generationRef.current) return;
        setStreamingText('');
        if (controller.signal.aborted || isChatAbortError(caughtError)) return;
        setError(errorMessage(caughtError));
      } finally {
        if (generation === generationRef.current) {
          abortRef.current = null;
          setBusy(false);
        }
      }
    },
    [stopVoice, voice],
  );

  const sendText = useCallback(
    (draft: string) => {
      if (busy || abortRef.current) return;
      const text = draft.trim().slice(0, MAX_INPUT_LENGTH);
      if (!text) return;

      const userMessage: ChatMessage = {
        id: messageId('user'),
        role: 'user',
        content: text,
      };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput('');
      setVoiceError('');

      const navigation = parseNavigationIntent(text);
      if (navigation) {
        const reply = navigation.back
          ? 'Going back to the previous page.'
          : `Opening ${navigation.label}.`;
        setMessages([
          ...nextMessages,
          { id: messageId('assistant'), role: 'assistant', content: reply },
        ]);
        setError(null);
        setStatus(reply);
        if (navigation.back) navigate(-1);
        else if (navigation.path) navigate(navigation.path);

        const prefs = voicePrefsRef.current;
        if (prefs.readAloud && prefs.active && document.visibilityState !== 'hidden') {
          voice.speak(reply, prefs.voiceLanguage);
        }
        return;
      }

      void beginGeneration(buildRequestHistory(nextMessages));
    },
    [beginGeneration, busy, messages, navigate, voice],
  );

  const send = useCallback(() => sendText(input), [sendText, input]);

  const toggleMicrophone = () => {
    if (busy) return;
    if (listening) {
      voice.finishListening();
      return;
    }
    stopVoice();
    const prefix = input.trimEnd();
    const join = (text: string) => (text ? `${prefix}${prefix ? ' ' : ''}${text}` : prefix);
    voice.startListening(
      voiceLanguage,
      {
        onTranscript: (text) => setInput(join(text)),
        onFinish: (text, successful) => {
          const draft = join(text);
          setInput(draft);
          // Only final, successful recognition can auto-send. Aborts/errors
          // restore finalized words for editing and never call the chat API.
          if (successful && (autoSendVoice || Boolean(parseNavigationIntent(draft)))) {
            sendText(draft);
          }
        },
      },
      MAX_INPUT_LENGTH - prefix.length - (prefix ? 1 : 0),
    );
  };

  const retry = useCallback(() => {
    if (busy || listening || abortRef.current) return;
    const latestUser = latestUserMessage(messages);
    if (!latestUser) return;
    void beginGeneration(buildRequestHistory(messages));
  }, [beginGeneration, busy, listening, messages]);

  const stopGeneration = useCallback(() => {
    stopVoice();
    if (!busy) return;
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    setStreamingText('');
    setError(null);
    setStatus('Generation stopped. The unfinished reply was not saved.');
  }, [busy, stopVoice]);

  // Auth and reset screens must not expose or send chat context.
  useEffect(() => {
    if (!hidden) return;
    setOpen(false);
    clearChat();
  }, [hidden, clearChat]);

  useEffect(() => {
    clearChat();
    setReadAloud(hasSpeechSynthesis);
    setAutoSendVoice(false);
  }, [user?.id, clearChat, hasSpeechSynthesis]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stopVoice();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', stopVoice);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', stopVoice);
      stopVoice();
    };
  }, [stopVoice, location.pathname]);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, streamingText, busy, error, status, open]);

  // Lock page scroll while the sheet/card is open, including the mobile safe area.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeChat();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeChat, open]);

  if (hidden) return null;

  const canRetry = !busy && !listening && Boolean(latestUserMessage(messages));
  const lastReply = [...messages].reverse().find((message) => message.role === 'assistant');
  const sharedMessageListProps = {
    messages,
    streamingText,
    busy,
    error,
    status,
    canRetry,
    onRetry: retry,
    bottomRef,
    accent,
    isAmrita,
  };
  const sharedComposerProps = {
    input,
    busy,
    accent,
    isAmrita,
    onChange: setInput,
    onSend: send,
    onStop: stopGeneration,
    onPrompt: setInput,
    listening,
    speaking,
    voiceError,
    capabilities,
    voiceLanguage,
    readAloud,
    autoSendVoice,
    onMicrophone: toggleMicrophone,
    onLanguage: setVoiceLanguage,
    onReadAloud: (enabled: boolean) => {
      setReadAloud(enabled);
      if (!enabled) {
        voiceEpochRef.current += 1;
        voice.stopSpeaking();
      }
    },
    onAutoSendVoice: setAutoSendVoice,
    onStopSpeaking: () => voice.stopSpeaking(),
    onReadReply: () => {
      if (lastReply) voice.speak(lastReply.content, voiceLanguage);
    },
    hasReply: Boolean(lastReply),
  };

  const panel = (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90]"
          id="jarvis-chat-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jarvis-chat-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* One responsive panel keeps refs, microphone controls and IDs unique. */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className={cn(
              'absolute inset-x-0 bottom-0 flex h-[calc(100dvh-16px)] flex-col overflow-hidden border-t-4 bg-white pb-[env(safe-area-inset-bottom,0)] shadow-[0_-20px_50px_rgba(0,0,0,0.35)] sm:inset-x-auto sm:bottom-24 sm:right-7 sm:h-[640px] sm:max-h-[calc(100dvh-120px)] sm:w-[400px] sm:rounded-2xl sm:border-2 sm:pb-0',
              isAmrita ? 'border-[#A51636]' : 'border-indigo-600',
            )}
          >
            <ChatHeader
              brandName={brandName}
              accent={accent}
              onClose={closeChat}
              onClear={clearChat}
            />
            <MessageList {...sharedMessageListProps} />
            <Composer {...sharedComposerProps} inputRef={inputRef} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        ref={fabRef}
        onClick={() => (open ? closeChat() : setOpen(true))}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        className="fixed bottom-24 left-4 z-[89] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(15,23,42,0.3)] sm:bottom-8 sm:left-auto sm:right-7"
        style={{ backgroundColor: accent }}
        aria-label={open ? 'Close JARVIS chat' : 'Open JARVIS chat'}
        aria-expanded={open}
        aria-controls="jarvis-chat-panel"
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2.5} />
        ) : (
          <MessageSquare className="h-6 w-6" strokeWidth={2.3} />
        )}
      </motion.button>

      {typeof document !== 'undefined' ? createPortal(panel, document.body) : null}
    </>
  );
}

function ChatHeader({
  brandName,
  accent,
  onClose,
  onClear,
}: {
  brandName: string;
  accent: string;
  onClose: () => void;
  onClear: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 border-b border-black/10 px-4 py-3 text-white"
      style={{ backgroundColor: accent }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
        <Bot className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div
          id="jarvis-chat-title"
          className="flex items-center gap-1.5 text-sm font-bold leading-tight"
        >
          JARVIS <Sparkles className="h-3.5 w-3.5 text-amber-200" />
        </div>
        <div className="truncate text-[11px] text-white/80">{brandName} assistant</div>
      </div>
      <button
        onClick={onClear}
        aria-label="Start a new chat"
        title="New chat"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition active:bg-white/25 sm:hover:bg-white/20"
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </button>
      <button
        onClick={onClose}
        aria-label="Close chat"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition active:bg-white/25 sm:hover:bg-white/20"
      >
        <X className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function MessageList({
  messages,
  streamingText,
  busy,
  error,
  status,
  canRetry,
  onRetry,
  bottomRef,
  accent,
  isAmrita,
}: {
  messages: ChatMessage[];
  streamingText: string;
  busy: boolean;
  error: string | null;
  status: string | null;
  canRetry: boolean;
  onRetry: () => void;
  bottomRef: RefObject<HTMLDivElement>;
  accent: string;
  isAmrita: boolean;
}) {
  return (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-y-auto overscroll-contain p-3',
        isAmrita ? 'bg-[#FFF6F7] dark:bg-[#1a0f14]' : 'bg-slate-50 dark:bg-slate-950',
      )}
      aria-live="polite"
      aria-busy={busy}
    >
      <div className="space-y-3">
        {messages.length === 0 && !busy && !streamingText ? (
          <div className="flex gap-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: accent }}
            >
              <Bot className="h-4 w-4" />
            </div>
            <div className="max-w-[86%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-800 shadow-sm dark:bg-white/10 dark:text-slate-100">
              <p>Hello. I’m JARVIS, the {isAmrita ? 'Amrita Eye' : 'CivicEye'} assistant.</p>
              <p className="mt-1 text-slate-500 dark:text-slate-300">
                Ask a question in your own words to get started.
              </p>
            </div>
          </div>
        ) : null}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} accent={accent} />
        ))}

        {streamingText ? (
          <MessageBubble
            message={{ id: 'streaming', role: 'assistant', content: streamingText }}
            accent={accent}
          />
        ) : null}

        {busy && !streamingText ? (
          <div
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300"
            role="status"
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: accent }}
            >
              <LoaderCircle className="h-4 w-4 animate-spin" />
            </div>
            JARVIS is working on a response…
          </div>
        ) : null}

        {status ? (
          <div
            className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            role="status"
          >
            {status}
          </div>
        ) : null}

        {error ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800 dark:border-red-400/30 dark:bg-red-950/30 dark:text-red-200"
            role="alert"
          >
            <p>{error}</p>
            {canRetry ? (
              <button
                onClick={onRetry}
                className="mt-2 rounded-md font-semibold underline underline-offset-2 hover:no-underline"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageBubble({ message, accent }: { message: ChatMessage; accent: string }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser ? (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: accent }}
        >
          <Bot className="h-4 w-4" />
        </div>
      ) : null}
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm',
          isUser
            ? 'rounded-br-md text-white'
            : 'rounded-bl-md bg-white text-slate-800 dark:bg-white/10 dark:text-slate-100',
        )}
        style={isUser ? { backgroundColor: accent } : undefined}
      >
        <SafeMessageContent content={message.content} />
      </div>
    </div>
  );
}

function Composer({
  input,
  busy,
  accent,
  isAmrita,
  inputRef,
  onChange,
  onSend,
  onStop,
  onPrompt,
  listening,
  speaking,
  voiceError,
  capabilities,
  voiceLanguage,
  readAloud,
  autoSendVoice,
  onMicrophone,
  onLanguage,
  onReadAloud,
  onAutoSendVoice,
  onStopSpeaking,
  onReadReply,
  hasReply,
}: {
  input: string;
  busy: boolean;
  accent: string;
  isAmrita: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onPrompt: (value: string) => void;
  listening: boolean;
  speaking: boolean;
  voiceError: string;
  capabilities: ReturnType<typeof voiceCapabilities>;
  voiceLanguage: string;
  readAloud: boolean;
  autoSendVoice: boolean;
  onMicrophone: () => void;
  onLanguage: (value: string) => void;
  onReadAloud: (value: boolean) => void;
  onAutoSendVoice: (value: boolean) => void;
  onStopSpeaking: () => void;
  onReadReply: () => void;
  hasReply: boolean;
}) {
  const canRecord = capabilities.secure && capabilities.recognition;
  return (
    <div className="max-h-[55dvh] shrink-0 overflow-y-auto border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
      <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            disabled={busy || listening}
            className={cn(
              'shrink-0 rounded-full border bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-slate-300',
              isAmrita
                ? 'border-[#A51636]/25 active:bg-[#A51636]/10'
                : 'border-indigo-200 active:bg-indigo-50',
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
      <div role="status" aria-live="polite" className="text-xs text-slate-600 dark:text-slate-300">
        {listening ? (
          <p className="mb-2 font-medium text-red-600 dark:text-red-300">
            Listening… speak, then pause or tap the mic to finish.
          </p>
        ) : null}
        {speaking ? <p className="mb-2">Reading reply aloud…</p> : null}
      </div>
      {voiceError ? (
        <p role="alert" className="mb-2 text-xs text-red-700 dark:text-red-300">
          {voiceError}
        </p>
      ) : null}
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={onMicrophone}
          disabled={busy || !canRecord}
          aria-label={listening ? 'Finish voice input' : 'Start voice input'}
          aria-pressed={listening}
          title={
            canRecord ? 'Dictate a message' : 'Voice input requires a supported browser and HTTPS'
          }
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40',
            listening
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white',
          )}
        >
          {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <textarea
          ref={inputRef}
          value={input}
          maxLength={MAX_INPUT_LENGTH}
          disabled={busy || listening}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_INPUT_LENGTH))}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              !busy &&
              !listening
            ) {
              event.preventDefault();
              onSend();
            }
          }}
          rows={1}
          placeholder="Ask JARVIS a question…"
          aria-label="Message JARVIS"
          className={cn(
            'min-h-[42px] min-w-0 max-h-28 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[14px] leading-snug outline-none focus:bg-white focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10',
            isAmrita
              ? 'focus:border-[#A51636]/50 focus:ring-[#A51636]/20'
              : 'focus:border-indigo-500/50 focus:ring-indigo-500/20',
          )}
        />
        {busy ? (
          <button
            onClick={onStop}
            aria-label="Stop generation"
            title="Stop generation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white transition hover:bg-slate-800"
          >
            <Square className="h-4 w-4" fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={!input.trim() || listening}
            aria-label="Send message"
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-white/10',
            )}
            style={input.trim() ? { backgroundColor: accent } : undefined}
          >
            <Send className="h-4 w-4" strokeWidth={2.4} />
          </button>
        )}
      </div>
      {!canRecord ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {capabilities.secure
            ? 'Voice input is unavailable here. Try Chrome or Edge, or type below.'
            : 'Voice input needs HTTPS or localhost.'}
        </p>
      ) : null}
      <details className="mt-2 text-xs text-slate-600 dark:text-slate-300">
        <summary className="cursor-pointer py-1 font-medium">Voice settings</summary>
        <div className="mt-2 space-y-2">
          <label className="flex items-center justify-between gap-2">
            Speech language
            <select
              value={voiceLanguage}
              onChange={(event) => onLanguage(event.target.value)}
              disabled={listening || speaking || busy}
              className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 dark:border-white/20 dark:bg-slate-800"
            >
              {VOICE_LANGUAGES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-9 items-center gap-2">
            <input
              type="checkbox"
              checked={autoSendVoice}
              disabled={!canRecord || listening || busy}
              onChange={(event) => onAutoSendVoice(event.target.checked)}
            />
            Send after speaking
          </label>
          <label className="flex min-h-9 items-center gap-2">
            <input
              type="checkbox"
              checked={readAloud}
              disabled={!capabilities.synthesis}
              onChange={(event) => onReadAloud(event.target.checked)}
            />
            Read replies aloud
          </label>
          {!capabilities.synthesis ? <p>Spoken replies are unavailable in this browser.</p> : null}
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Voice uses your browser’s speech service, which may process audio online. Only the
            transcript is sent to JARVIS.
          </p>
        </div>
      </details>
      {capabilities.synthesis && (hasReply || speaking) ? (
        <button
          type="button"
          onClick={speaking ? onStopSpeaking : onReadReply}
          disabled={!speaking && (busy || listening)}
          className="mt-1 inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-indigo-600 disabled:opacity-40 dark:text-indigo-300"
        >
          {speaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          {speaking ? 'Stop speaking' : 'Read last reply'}
        </button>
      ) : null}
      <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-400">
        <span>Shift + Enter for a new line</span>
        <span>
          {input.length}/{MAX_INPUT_LENGTH}
        </span>
      </div>
    </div>
  );
}
