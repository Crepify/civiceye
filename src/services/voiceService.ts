// SpeechRecognition is still vendor-prefixed in some browsers and is not in
// TypeScript's standard DOM definitions. Keep its types local to this adapter.
interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type VoiceWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
};

function voiceWindow(): VoiceWindow | undefined {
  return typeof window === 'undefined' ? undefined : (window as VoiceWindow);
}

export function voiceCapabilities() {
  const browser = voiceWindow();
  return {
    secure: Boolean(browser?.isSecureContext),
    recognition: Boolean(browser?.SpeechRecognition || browser?.webkitSpeechRecognition),
    synthesis: Boolean(browser?.speechSynthesis && browser?.SpeechSynthesisUtterance),
  };
}

export const VOICE_LANGUAGES = [
  ['en-IN', 'English (India)'],
  ['en-US', 'English (US)'],
  ['hi-IN', 'हिन्दी'],
  ['ta-IN', 'தமிழ்'],
  ['kn-IN', 'ಕನ್ನಡ'],
  ['te-IN', 'తెలుగు'],
  ['ml-IN', 'മലയാളം'],
] as const;

interface VoiceCallbacks {
  onListening: (listening: boolean) => void;
  onSpeaking: (speaking: boolean) => void;
  onError: (message: string) => void;
}

interface DictationCallbacks {
  onTranscript: (text: string) => void;
  onFinish: (finalText: string, successful: boolean) => void;
}

const RECOGNITION_ERRORS: Record<string, string> = {
  'not-allowed':
    'Microphone access was denied. Allow it in your browser’s site settings, then try again.',
  'service-not-allowed':
    'Voice input is blocked by your browser or device settings. You can still type.',
  'audio-capture':
    'No working microphone was found. Check your microphone connection and settings.',
  'no-speech': 'No speech was detected. Tap the microphone and try again.',
  network: 'The speech service could not connect. Check your connection or type your message.',
  'language-not-supported':
    'This speech language is unavailable in your browser. Choose another language.',
};

/** Strip visual markup and split long replies to avoid browser utterance limits. */
export function spokenChunks(content: string): string[] {
  let text = content
    .replace(/```[\s\S]*?(?:```|$)/g, ' Code is shown in the chat. ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, 'link in the chat')
    .replace(/<[^>]*>/g, '')
    .replace(/^[ \t]*#{1,6}\s+/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const chunks: string[] = [];
  while (text.length > 220) {
    const boundary = text.lastIndexOf(' ', 220);
    const end = boundary > 0 ? boundary : 220;
    chunks.push(text.slice(0, end));
    text = text.slice(end).trim();
  }
  if (text) chunks.push(text);
  return chunks;
}

/** One microphone session and one playback queue, shared by the chat UI. */
export class JarvisVoice {
  private recognition: Recognition | null = null;
  private finish: ((successful: boolean) => void) | null = null;
  private listeningTimer: ReturnType<typeof setTimeout> | undefined;
  private stopTimer: ReturnType<typeof setTimeout> | undefined;
  private speechId = 0;
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor(private readonly callbacks: VoiceCallbacks) {}

  startListening(language: string, callbacks: DictationCallbacks, maxLength: number): void {
    if (this.recognition) return;
    const browser = voiceWindow();
    const Constructor = browser?.SpeechRecognition || browser?.webkitSpeechRecognition;
    if (!browser?.isSecureContext || !Constructor) {
      this.callbacks.onError(
        !browser?.isSecureContext
          ? 'Voice input needs HTTPS or localhost. You can still type your message.'
          : 'Voice input is unavailable in this browser. Try Chrome or Edge, or keep typing.',
      );
      return;
    }
    if (maxLength <= 0) {
      this.callbacks.onError(
        'Your message is at the character limit. Shorten it before dictating.',
      );
      return;
    }

    this.stopSpeaking();
    this.callbacks.onError('');
    let finalText = '';
    let recognition: Recognition;
    try {
      recognition = new Constructor();
    } catch {
      this.callbacks.onError('Voice input could not start. You can still type your message.');
      return;
    }
    this.recognition = recognition;
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const finish = (successful: boolean) => {
      if (this.recognition !== recognition) return;
      this.recognition = null;
      this.finish = null;
      clearTimeout(this.listeningTimer);
      clearTimeout(this.stopTimer);
      this.listeningTimer = this.stopTimer = undefined;
      recognition.onresult = recognition.onerror = recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        /* Already stopped by the browser. */
      }
      this.callbacks.onListening(false);
      callbacks.onFinish(finalText, successful && Boolean(finalText.trim()));
    };
    this.finish = finish;
    recognition.onresult = ({ results }) => {
      if (this.recognition !== recognition) return;
      const snapshot = Array.from(results);
      // Results are a cumulative snapshot. Rebuild instead of appending,
      // otherwise interim revisions and repeated final events duplicate words.
      finalText = snapshot
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim()
        .slice(0, maxLength);
      const draft = snapshot
        .map((result) => result[0].transcript)
        .join(' ')
        .trim();
      callbacks.onTranscript(draft.slice(0, maxLength));
      if (draft.length >= maxLength) this.finishListening();
    };
    recognition.onerror = ({ error }) => {
      if (this.recognition !== recognition) return;
      if (error !== 'aborted') {
        this.callbacks.onError(
          RECOGNITION_ERRORS[error] || 'Voice input failed. Please try again or type your message.',
        );
      }
      finish(false);
    };
    recognition.onend = () => {
      if (this.recognition !== recognition) return;
      if (!finalText.trim()) this.callbacks.onError(RECOGNITION_ERRORS['no-speech']);
      finish(true);
    };
    this.callbacks.onListening(true);
    // Bound each recording; never keep the microphone open in the background.
    this.listeningTimer = setTimeout(() => this.finishListening(), 30000);
    try {
      recognition.start();
    } catch {
      this.callbacks.onError(
        'Could not start the microphone. Check site permissions and try again.',
      );
      finish(false);
    }
  }

  finishListening(): void {
    if (!this.recognition || this.stopTimer) return;
    // Keep handlers until onend so the browser can deliver its final transcript.
    // If it never ends, preserve finalized words without auto-sending.
    this.stopTimer = setTimeout(() => this.finish?.(false), 2000);
    try {
      this.recognition.stop();
    } catch {
      this.finish?.(false);
    }
  }

  cancelListening(): void {
    this.finish?.(false);
    this.stopTimer = undefined;
  }

  speak(content: string, language: string): void {
    const browser = voiceWindow();
    const Constructor = browser?.SpeechSynthesisUtterance;
    if (!browser?.speechSynthesis || !Constructor) {
      this.callbacks.onError(
        'Spoken replies are unavailable in this browser. The text reply is still available.',
      );
      return;
    }
    this.cancelListening();
    this.stopSpeaking();
    const chunks = spokenChunks(content);
    if (!chunks.length) return;
    this.callbacks.onError('');
    const id = this.speechId;
    let index = 0;
    const next = () => {
      if (id !== this.speechId) return;
      if (index >= chunks.length) {
        this.utterance = null;
        this.callbacks.onSpeaking(false);
        return;
      }
      const utterance = new Constructor(chunks[index++]);
      this.utterance = utterance; // Retain a reference until playback finishes.
      utterance.lang = language;
      const voices = browser.speechSynthesis.getVoices();
      utterance.voice =
        voices.find((voice) => voice.lang.toLowerCase() === language.toLowerCase()) ||
        voices.find((voice) => voice.lang.split('-')[0] === language.split('-')[0]) ||
        null;
      utterance.onend = next;
      const failed = () => {
        if (id !== this.speechId) return;
        this.stopSpeaking();
        this.callbacks.onError(
          'Audio playback was blocked or interrupted. Tap “Read last reply” to try again.',
        );
      };
      utterance.onerror = failed;
      try {
        browser.speechSynthesis.speak(utterance);
      } catch {
        failed();
      }
    };
    this.callbacks.onSpeaking(true);
    next();
  }

  stopSpeaking(): void {
    this.speechId += 1;
    if (this.utterance) {
      this.utterance.onend = this.utterance.onerror = null;
      this.utterance = null;
      voiceWindow()?.speechSynthesis?.cancel();
    }
    this.callbacks.onSpeaking(false);
  }

  stopAll(): void {
    this.cancelListening();
    this.stopSpeaking();
  }
}
