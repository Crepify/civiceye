import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Exercise the real browser adapter without a live speech provider or microphone.
const source = readFileSync(new URL('../src/services/voiceService.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { JarvisVoice, spokenChunks, voiceCapabilities } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

const originals = {
  window: globalThis.window,
  setTimeout: globalThis.setTimeout,
  clearTimeout: globalThis.clearTimeout,
};
const timers = new Map();
let nextTimer = 0;
globalThis.setTimeout = (callback, ms) => {
  const id = ++nextTimer;
  timers.set(id, { callback, ms });
  return id;
};
globalThis.clearTimeout = (id) => timers.delete(id);

class MockRecognition {
  static instances = [];
  static failStart = false;
  aborted = false;
  stopped = false;
  constructor() {
    MockRecognition.instances.push(this);
  }
  start() {
    if (MockRecognition.failStart) throw new Error('permission');
  }
  stop() {
    this.stopped = true;
  }
  abort() {
    this.aborted = true;
  }
  result(transcripts) {
    this.onresult?.({
      results: transcripts.map(([transcript, isFinal]) => ({ isFinal, 0: { transcript } })),
    });
  }
}

class MockUtterance {
  constructor(text) {
    this.text = text;
  }
}

const played = [];
let cancelled = 0;
const speechSynthesis = {
  getVoices: () => [
    { lang: 'en-IN', name: 'Indian English' },
    { lang: 'hi-IN', name: 'Hindi' },
  ],
  speak: (utterance) => played.push(utterance),
  cancel: () => {
    cancelled++;
  },
};
const callbacks = { listening: [], speaking: [], errors: [] };
const voice = new JarvisVoice({
  onListening: (value) => callbacks.listening.push(value),
  onSpeaking: (value) => callbacks.speaking.push(value),
  onError: (value) => callbacks.errors.push(value),
});
const drafts = [];
const finishes = [];
const dictation = {
  onTranscript: (text) => drafts.push(text),
  onFinish: (text, successful) => finishes.push({ text, successful }),
};

try {
  globalThis.window = {
    isSecureContext: true,
    navigator: {
      mediaDevices: {
        getUserMedia: async () => ({ getTracks: () => [{ stop: () => {} }] }),
      },
    },
    webkitSpeechRecognition: MockRecognition,
    SpeechSynthesisUtterance: MockUtterance,
    speechSynthesis,
  };
  assert.deepEqual(voiceCapabilities(), { secure: true, recognition: true, synthesis: true });

  await voice.startListening('hi-IN', dictation, 8000);
  const first = MockRecognition.instances.at(-1);
  assert.equal(first.lang, 'hi-IN');
  assert.equal(first.continuous, false);
  assert.equal(callbacks.listening.at(-1), true);
  first.result([['hello', false]]);
  first.result([['hello world', true]]);
  first.result([['hello world', true]]);
  assert.equal(drafts.at(-1), 'hello world', 'final snapshots must not duplicate previous words');
  voice.finishListening();
  assert.equal(first.stopped, true);
  first.onend();
  assert.deepEqual(finishes.at(-1), { text: 'hello world', successful: true });
  assert.equal(callbacks.listening.at(-1), false);
  assert.equal(first.aborted, true);
  assert.equal(timers.size, 0);

  await voice.startListening('en-IN', dictation, 8000);
  const abandoned = MockRecognition.instances.at(-1);
  abandoned.result([
    ['final words', true],
    ['unfinished words', false],
  ]);
  const staleResult = abandoned.onresult;
  voice.cancelListening();
  assert.deepEqual(finishes.at(-1), { text: 'final words', successful: false });
  const finishCount = finishes.length;
  staleResult({ results: [{ isFinal: true, 0: { transcript: 'late words' } }] });
  assert.equal(finishes.length, finishCount);
  assert.equal(drafts.at(-1), 'final words unfinished words');

  await voice.startListening('en-IN', dictation, 8000);
  MockRecognition.instances.at(-1).onerror({ error: 'not-allowed' });
  assert.match(callbacks.errors.at(-1), /denied/);
  assert.equal(finishes.at(-1).successful, false, 'errors must not auto-send');

  await voice.startListening('en-IN', dictation, 8000);
  MockRecognition.instances.at(-1).onend();
  assert.match(callbacks.errors.at(-1), /No speech/);
  assert.equal(finishes.at(-1).successful, false);

  // A second session must be able to stop after the previous session ended.
  await voice.startListening('en-IN', dictation, 5);
  const bounded = MockRecognition.instances.at(-1);
  bounded.result([['123456789', true]]);
  assert.equal(drafts.at(-1), '12345');
  assert.equal(bounded.stopped, true);
  bounded.onend();
  assert.equal(finishes.at(-1).text, '12345');

  // Watchdog stops listening at 30 seconds; stalled finalization cannot submit.
  await voice.startListening('en-IN', dictation, 8000);
  const watchdog = MockRecognition.instances.at(-1);
  [...timers.values()].find((timer) => timer.ms === 30000).callback();
  assert.equal(watchdog.stopped, true);
  [...timers.values()].find((timer) => timer.ms === 2000).callback();
  assert.equal(finishes.at(-1).successful, false);
  assert.equal(timers.size, 0);

  MockRecognition.failStart = true;
  await voice.startListening('en-IN', dictation, 8000);
  assert.match(callbacks.errors.at(-1), /Could not start/);
  assert.equal(callbacks.listening.at(-1), false);
  MockRecognition.failStart = false;

  const readable = spokenChunks(
    '## Summary\n**Hello** [docs](https://example.com)\n```js\nalert(1);\n```',
  ).join(' ');
  assert.match(readable, /Hello docs/);
  assert.ok(!readable.includes('alert(1)'));
  assert.ok(!readable.includes('https://'));
  assert.ok(spokenChunks('word '.repeat(200)).every((chunk) => chunk.length <= 220));
  voice.speak('word '.repeat(200), 'hi-IN');
  assert.equal(played.length, 1, 'queue speaks one chunk at a time');
  assert.equal(played[0].voice.lang, 'hi-IN');
  played[0].onend();
  assert.equal(played.length, 2);
  const lateEnd = played.at(-1).onend;
  voice.stopSpeaking();
  lateEnd();
  assert.equal(played.length, 2, 'cancelled audio must not restart');
  assert.equal(callbacks.speaking.at(-1), false);
  assert.equal(cancelled, 1);

  voice.speak('Read me', 'en-IN');
  await voice.startListening('en-IN', dictation, 8000);
  assert.equal(cancelled, 2, 'starting the mic must stop playback to avoid feedback');
  voice.stopAll();
  assert.equal(callbacks.listening.at(-1), false);
  assert.equal(timers.size, 0);

  delete globalThis.window.webkitSpeechRecognition;
  await voice.startListening('en-IN', dictation, 8000);
  assert.match(callbacks.errors.at(-1), /unavailable/);
  globalThis.window.isSecureContext = false;
  await voice.startListening('en-IN', dictation, 8000);
  assert.match(callbacks.errors.at(-1), /HTTPS/);
  delete globalThis.window.speechSynthesis;
  voice.speak('Hello', 'en-IN');
  assert.match(callbacks.errors.at(-1), /unavailable/);

  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const permissions = config.headers
    .flatMap((rule) => rule.headers)
    .find((header) => header.key === 'Permissions-Policy');
  assert.ok(
    permissions.value.includes('microphone=(self)'),
    'deployed page must allow the microphone',
  );
  console.log(
    'JARVIS voice checks passed: dictation, errors, cancellation, limits, playback, and permissions.',
  );
} finally {
  voice.stopAll();
  globalThis.window = originals.window;
  globalThis.setTimeout = originals.setTimeout;
  globalThis.clearTimeout = originals.clearTimeout;
}
