export interface NavigationIntent {
  label: string;
  path?: string;
  back?: boolean;
}

interface RouteTarget extends NavigationIntent {
  aliases: string[];
  actionWords?: string[];
}

const ROUTES: RouteTarget[] = [
  {
    label: 'the home page',
    path: '/',
    aliases: ['home', 'homepage', 'home page', 'landing page', 'main page', 'start page'],
  },
  {
    label: 'the city map',
    path: '/map',
    aliases: [
      'map',
      'maps',
      'city map',
      'live map',
      'street map',
      'issue map',
      'reports map',
      'nearby reports',
      'nearby complaints',
    ],
    actionWords: ['map', 'nearby', 'location', 'locations', 'street', 'reports', 'complaints'],
  },
  {
    label: 'the campus map',
    path: '/amrita/map',
    aliases: [
      'campus map',
      'amrita map',
      'amrita campus map',
      'college map',
      'campus locations',
      'campus reports',
    ],
    actionWords: ['campus', 'amrita', 'college'],
  },
  {
    label: 'the report form',
    path: '/report',
    aliases: [
      'report',
      'report issue',
      'report an issue',
      'new report',
      'file a report',
      'file a complaint',
      'lodge a complaint',
      'raise an issue',
      'submit an issue',
      'complaint form',
      'reporting page',
    ],
    actionWords: ['report', 'complaint', 'pothole', 'garbage', 'leak', 'broken light', 'issue'],
  },
  {
    label: 'the community feed',
    path: '/community',
    aliases: [
      'community',
      'community feed',
      'community page',
      'community posts',
      'public reports',
      'neighbour reports',
      'neighbor reports',
      'what people reported',
      'see all reports',
    ],
    actionWords: ['community', 'neighbour', 'neighbor', 'posts', 'feed', 'people'],
  },
  {
    label: 'the food-hygiene complaint form',
    path: '/food-hygiene',
    aliases: [
      'food hygiene',
      'food complaint',
      'food safety',
      'mess complaint',
      'mess issue',
      'canteen complaint',
      'kitchen complaint',
      'meal complaint',
      'food hygiene page',
    ],
    actionWords: ['food', 'hygiene', 'mess', 'canteen', 'kitchen', 'meal'],
  },
  {
    label: 'the live AI page',
    path: '/live',
    aliases: [
      'live AI',
      'live detection',
      'camera detection',
      'camera AI',
      'watchtower',
      'real time detection',
    ],
    actionWords: ['live', 'camera', 'detection', 'real time'],
  },
  {
    label: 'the authority dashboard',
    path: '/dashboard',
    aliases: [
      'dashboard',
      'authority dashboard',
      'official dashboard',
      'stats dashboard',
      'reports dashboard',
    ],
    actionWords: ['dashboard', 'authority', 'official', 'stats', 'statistics'],
  },
  {
    label: 'the Amrita Eye page',
    path: '/amrita',
    aliases: ['amrita eye', 'amrita portal', 'campus portal', 'college portal', 'campus home'],
    actionWords: ['amrita', 'campus', 'college'],
  },
  {
    label: 'the features page',
    path: '/features',
    aliases: ['features', 'features page', 'what can civic eye do', 'what can civiceye do'],
    actionWords: ['features', 'capabilities'],
  },
  {
    label: 'the about page',
    path: '/about',
    aliases: ['about', 'about page', 'about civic eye', 'about civiceye', 'founders', 'team'],
    actionWords: ['about', 'founders', 'team'],
  },
  {
    label: 'the contact page',
    path: '/contact',
    aliases: ['contact', 'contact page', 'contact us', 'get in touch', 'support'],
    actionWords: ['contact', 'support', 'email'],
  },
];

const NAVIGATION_WORDS = [
  'go',
  'take',
  'bring',
  'open',
  'show',
  'navigate',
  'visit',
  'send',
  'lead',
  'switch',
  'view',
  'find',
  'get',
  'see',
  'head',
  'want',
  'need',
  'let',
  'bring',
  'back',
];

const ACTION_PHRASES = [
  'take me',
  'bring me',
  'show me',
  'go to',
  'open up',
  'navigate to',
  'send me',
  'lead me',
  'let me see',
  'i want to see',
  'i want to go',
  'i need to report',
  'how do i report',
  'where can i report',
  'where do i report',
  'file a',
  'lodge a',
  'raise a',
  'submit a',
  'view the',
  'see the',
  'find the',
  'get to',
];

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = row[j];
      row[j] =
        a[i - 1] === b[j - 1] ? diagonal : Math.min(diagonal + 1, row[j] + 1, row[j - 1] + 1);
      diagonal = above;
    }
  }
  return row[b.length];
}

function tokenMatches(inputToken: string, aliasToken: string): boolean {
  if (inputToken === aliasToken) return true;
  if (inputToken.length < 4 || aliasToken.length < 4) return false;
  const allowedDistance = Math.max(inputToken.length, aliasToken.length) >= 8 ? 2 : 1;
  return editDistance(inputToken, aliasToken) <= allowedDistance;
}

function aliasScore(input: string, alias: string): number {
  if (input.includes(alias)) return 100 + alias.length;
  const inputTokens = input.split(' ');
  const aliasTokens = alias.split(' ');
  const matched = aliasTokens.filter((aliasToken) =>
    inputTokens.some((token) => tokenMatches(token, aliasToken)),
  ).length;
  if (!matched) return 0;
  return (matched / aliasTokens.length) * 70 + matched * 2;
}

/**
 * Recognize navigation commands in natural spoken or typed English. This is
 * intentionally local and deterministic: a model never receives permission
 * to invent a URL or trigger an external side effect.
 */
export function parseNavigationIntent(raw: string): NavigationIntent | null {
  const input = normalize(raw);
  if (!input) return null;
  if (/^(go )?back$|^take me back$|^previous page$|^last page$/.test(input)) {
    return { label: 'the previous page', back: true };
  }

  const hasNavigationCue =
    NAVIGATION_WORDS.some((word) => input.split(' ').includes(word)) ||
    ACTION_PHRASES.some((phrase) => input.includes(phrase));
  if (!hasNavigationCue) return null;

  const campusIntent = /\b(amrita|campus|college)\b/.test(input);
  let best: { target: RouteTarget; score: number } | null = null;
  for (const target of ROUTES) {
    for (const alias of target.aliases) {
      let score = aliasScore(input, normalize(alias));
      if (!score) continue;
      if (campusIntent && target.path === '/amrita/map') score += 50;
      if (campusIntent && target.path === '/amrita') score += 25;
      if (campusIntent && target.path === '/map') score -= 20;
      if (target.actionWords?.some((word) => input.includes(word))) score += 8;
      if (!best || score > best.score) best = { target, score };
    }
  }

  // Require a strong phrase match or a short destination with navigation
  // language. This prevents ordinary questions such as "what is the map?"
  // from unexpectedly changing pages.
  if (!best || best.score < 45) return null;
  return { label: best.target.label, path: best.target.path };
}
