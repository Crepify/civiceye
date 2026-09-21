/**
 * Vercel serverless function — CivicEye Chatbot API
 * Implements exact logic from civiceye-chat/app/api/chat/route.ts
 * Supports OpenCode Zen (FREE models), OpenRouter, DeepSeek, custom OpenAI-compatible
 * 
 * POST /api/chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }] }
 * Returns: SSE stream with { type: 'content', text } chunks + { type: 'done' }
 */

const MAX_HISTORY = 12;

function getEnv(name) {
  return (process.env[name] || '').trim();
}

function getLlmConfig() {
  const genericBase = getEnv('LLM_BASE_URL');
  if (genericBase) {
    return {
      provider: 'custom',
      baseUrl: genericBase.replace(/\/+$/, ''),
      apiKey: getEnv('LLM_API_KEY') || getEnv('DEEPSEEK_API_KEY') || getEnv('OPENCODE_API_KEY') || getEnv('OPENROUTER_API_KEY') || getEnv('OMNIROUTER_API_KEY'),
      model: getEnv('LLM_MODEL') || 'deepseek/deepseek-chat:free',
      fallbacks: [],
      extraHeaders: {},
    };
  }
  if (getEnv('OPENCODE_API_KEY')) {
    return {
      provider: 'opencode',
      baseUrl: 'https://opencode.ai/zen/v1',
      apiKey: getEnv('OPENCODE_API_KEY'),
      model: getEnv('LLM_MODEL') || 'deepseek/deepseek-chat:free',
      fallbacks: ['meta-llama/llama-3.1-8b-instruct:free'],
      extraHeaders: {},
    };
  }
  if (getEnv('OPENROUTER_API_KEY')) {
    return {
      provider: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: getEnv('OPENROUTER_API_KEY'),
      model: getEnv('LLM_MODEL') || 'deepseek/deepseek-chat:free',
      fallbacks: [],
      extraHeaders: {
        'HTTP-Referer': getEnv('LLM_HTTP_REFERER') || 'https://civiceye.co.in',
        'X-Title': getEnv('LLM_X_TITLE') || 'CivicEye Chat',
      },
    };
  }
  if (getEnv('OMNIROUTER_API_KEY')) {
    return {
      provider: 'omnirouter',
      baseUrl: 'https://api.omnirouter.li/v1',
      apiKey: getEnv('OMNIROUTER_API_KEY'),
      model: getEnv('LLM_MODEL') || 'deepseek/deepseek-chat:free',
      fallbacks: [],
      extraHeaders: {},
    };
  }
  return {
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com',
    apiKey: getEnv('DEEPSEEK_API_KEY'),
    model: getEnv('DEEPSEEK_MODEL') || 'deepseek/deepseek-chat:free',
    fallbacks: [],
    extraHeaders: {},
  };
}

function civicEyeFrontendPrompt(extraContext) {
  const extra = extraContext?.trim();
  return [
    `You are the CivicEye Assistant — the official AI helper embedded on the CivicEye website.`,
    ``,
    `CivicEye is a civic-issue reporting platform. Its tagline is "Making cities better, one report at a time." Citizens report local problems (potholes, garbage, broken streetlights, water leaks, etc.) by uploading a photo plus a short description with a location. The platform uses computer-vision AI to classify the issue from the photo and routes the report to the right authority or campus team. Users can track the status of their reports.`,
    ``,
    `WHAT YOU KNOW ABOUT USING CIVICEYE:`,
    `- Signing in: email + password, or a passwordless "magic link". Auth is powered by Supabase.`,
    `- Email verification: after sign-up a confirmation email is sent by Supabase. It frequently lands in the Spam/Junk folder — especially for @amrita.edu mailboxes. If a user did not receive it: check spam/junk, wait 1-2 minutes, use the "resend confirmation" option on the login page, and double-check the email address for typos.`,
    `- Amrita Eye campus portal: signing in with an @amrita.edu email switches the app into "Amrita Eye" mode, where reports are routed directly to campus staff. Custom campus map with buildings A-E (E is square with all halls on 1st/2nd/3rd floor), floor plans with exact room shapes and facing, 155 faculty searchable, every location pinnable.`,
    `- Reporting an issue: sign in → create a new report → attach a clear photo (AI will generate exact outline annotation, not just bounding box) → write a short description → confirm the location on map (custom campus map for Amrita Eye, Google Maps for city) → submit → track status. Report gets code like CE-XXXX.`,
    `- Community: reports from neighbours, search/filter/sort, upvote/confirm/reject, View AI button to toggle original vs AI annotated with exact outline, leaderboard top reporters, certificate Street Guardian for 3 verified reports.`,
    `- Authorities: BBMP handles city (comm@bbmp.gov.in, helpline 1533, WhatsApp 9480685700), Estate Office handles campus (civiceyeoffcial@gmail.com). Email includes original + AI annotated images + Google Maps link + severity + report link. SLA: Critical 24h, High 48h, Medium 7d, Low 14d, auto-escalation when breached. Proof of fix with before/after slider and AI verification.`,
    ``,
    `RULES:`,
    `- Be warm, concise and helpful. Use short sentences and bullet lists for step-by-step answers.`,
    `- Only answer questions about CivicEye, reporting issues, account/login/verification, and the Amrita Eye campus portal.`,
    `- Never invent features, policies, phone numbers, prices or email addresses. If you are unsure, say you're not sure and suggest contacting the CivicEye team.`,
    `- Never ask for passwords or handle sensitive personal data. Direct account-specific questions to the website.`,
    `- Keep answers short — under ~150 words unless a step list is genuinely needed.`,
    extra ? `\nADDITIONAL CONTEXT FROM THE SITE OWNER:\n${extra}` : ``,
  ].filter(Boolean).join('\n');
}

function allowedOrigin(origin) {
  const cfg = (process.env.CIVICEYE_ORIGIN || '*').trim();
  if (cfg === '*') return '*';
  const allowed = cfg.split(',').map((s) => s.trim()).filter(Boolean);
  if (origin && allowed.includes(origin)) return origin;
  return null;
}

function corsHeaders(origin) {
  const ao = allowedOrigin(origin);
  return {
    ...(ao ? { 'Access-Control-Allow-Origin': ao } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

// Simple in-memory rate limit (per process, not shared across serverless instances)
const rateMap = new Map();
function rateLimit(ip, max, windowMs) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > windowMs) {
    rateMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

async function streamLLM({ model, messages, apiKey, baseUrl, extraHeaders, maxTokens = 1024, temperature = 0.6 }, onChunk) {
  const body = {
    model,
    messages,
    stream: true,
    max_tokens: maxTokens,
    temperature,
  };

  const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    let detail = '';
    try {
      const j = JSON.parse(text);
      detail = j?.error?.message || j?.error || text.slice(0, 400);
    } catch {
      detail = text.slice(0, 400);
    }
    if (/FreeTierError|only be used from within OpenCode/i.test(detail)) {
      throw new Error(`FreeTierError: ${detail} — OpenCode free tier blocked for standalone use`);
    }
    throw new Error(`LLM error ${res.status}: ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta || {};
        const content = delta.content;
        if (typeof content === 'string' && content) {
          onChunk(content);
        }
      } catch {
        // ignore
      }
    }
  }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || null;

  if (req.method === 'OPTIONS') {
    const allowed = allowedOrigin(origin);
    res.writeHead(allowed ? 204 : 403, corsHeaders(origin));
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  if (allowedOrigin(origin) === null) {
    res.writeHead(403, corsHeaders(origin));
    res.end('Forbidden origin');
    return;
  }

  const ip = (req.headers['x-forwarded-for']?.split(',')[0]?.trim()) || req.headers['x-real-ip'] || 'unknown';
  if (!rateLimit(ip, 30, 60_000)) {
    res.writeHead(429, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
    res.end(JSON.stringify({ error: 'Too many requests. Please wait a minute.' }));
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    body = req.body;
  }

  const messages = (body?.messages || []).filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'));
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
    res.end(JSON.stringify({ error: 'Expected conversation ending with user message' }));
    return;
  }

  const last = messages[messages.length - 1].content;
  if (last.length > 8000) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
    res.end(JSON.stringify({ error: 'Message too long (max 8000 chars)' }));
    return;
  }

  const system = civicEyeFrontendPrompt(process.env.CIVICEYE_EXTRA_CONTEXT);
  const CFG = getLlmConfig();
  const MOCK = process.env.MOCK_LLM === '1';

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    ...corsHeaders(origin),
  });

  const send = (obj) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  try {
    if (!CFG.apiKey || MOCK) {
      // Mock stream with helpful CivicEye knowledge
      const mockText = [
        `Hi! 👋 I'm CivicEye Assistant — I can help with reporting issues, BBMP/Estate Office, campus map, AI annotations with exact outline, leaderboard, certificates, SLA escalation, proof of fix, etc.`,
        `\n\n**How to report:**\n- Go to Report → Pick category → Add photo (AI generates exact outline, not just bounding box) → Pin location → Submit → Track status`,
        `\n\n**If you didn't get confirmation email:**\n- Check Spam/Junk (especially @amrita.edu) → Wait 1-2 min → Use Resend on login → Check email typo`,
        `\n\n**Amrita Eye:**\n- @amrita.edu login → custom campus map with Blocks A-E (E is square 50.8m with all halls on 1st/2nd/3rd), 155 faculty searchable, floor plans accurate`,
        `\n\n**Live stats on main page:**\n- Fixed: ${0} resolved with before/after proof\n- Pending: awaiting verification (needs 3 confirms)\n- Escalated: SLA breached → auto-escalated to higher authority\n- Leaderboard: top reporters, 3 verified → Street Guardian certificate`,
        `\n\nAsk me about BBMP, Estate Office, maps, AI exact outline, or how to report!`,
      ].join('');
      for (const chunk of mockText.split(/(\s+)/)) {
        send({ type: 'content', text: chunk });
        await new Promise((r) => setTimeout(r, 12));
      }
    } else {
      const history = messages.slice(-MAX_HISTORY);
      const models = [CFG.model, ...CFG.fallbacks];
      let emitted = false;
      let lastErr = null;
      
      for (const model of models) {
        try {
          await streamLLM(
            {
              model,
              messages: [{ role: 'system', content: system }, ...history],
              apiKey: CFG.apiKey,
              baseUrl: CFG.baseUrl,
              extraHeaders: CFG.extraHeaders,
              maxTokens: 1024,
              temperature: 0.6,
            },
            (text) => {
              emitted = true;
              send({ type: 'content', text });
            }
          );
          break;
        } catch (err) {
          lastErr = err;
          if (emitted) throw err;
          // Only retry on model unavailable, not on auth/tier errors
          if (!/Model unavailable|not found|unavailable/i.test(err.message)) throw err;
        }
      }
      if (lastErr && !emitted) throw lastErr;
    }
    send({ type: 'done' });
  } catch (err) {
    send({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong' });
  } finally {
    res.end();
  }
}
