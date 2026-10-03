import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(
  new URL('../src/services/navigationService.ts', import.meta.url),
  'utf8',
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { parseNavigationIntent } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

const cases = [
  ['take me to the map', { path: '/map' }],
  ['show me nearby complaints', { path: '/map' }],
  ['open the campus map', { path: '/amrita/map' }],
  ['take me to the cominity posts', { path: '/community' }],
  ['I want to file a complaint about a pothole', { path: '/report' }],
  ['go to the food complaint page', { path: '/food-hygiene' }],
  ['can you take me to the contact page', { path: '/contact' }],
  ['go home', { path: '/' }],
  ['take me back', { back: true }],
];

for (const [spoken, expected] of cases) {
  const intent = parseNavigationIntent(spoken);
  assert.ok(intent, `Expected navigation intent for: ${spoken}`);
  for (const [key, value] of Object.entries(expected)) assert.equal(intent[key], value, spoken);
}

for (const ordinaryQuestion of [
  'What is the map used for?',
  'Explain community validation.',
  'What can you help me with?',
]) {
  assert.equal(parseNavigationIntent(ordinaryQuestion), null, ordinaryQuestion);
}

console.log('JARVIS navigation checks passed.');
