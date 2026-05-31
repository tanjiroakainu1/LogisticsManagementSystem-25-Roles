/**
 * Vercel serverless proxy for LMS Intelligence (OpenRouter).
 * Keeps OPENROUTER_API_KEY server-side — never exposed to the browser.
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: {
        message: 'LMS Intelligence is not configured. Add OPENROUTER_API_KEY in Vercel project settings.',
      },
    });
  }

  const model = process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-7b-instruct';
  const refererHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const referer = refererHost
    ? refererHost.startsWith('http')
      ? refererHost
      : `https://${refererHost}`
    : 'https://lms-platform.vercel.app';

  try {
    const incoming = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const payload = {
      ...incoming,
      model,
      max_tokens: incoming.max_tokens ?? 1024,
      temperature: incoming.temperature ?? 0.7,
    };

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': referer,
        'X-Title': 'LMS Platform — Logistics Management System',
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch {
    return res.status(502).json({
      error: { message: 'LMS Intelligence gateway unavailable. Please try again.' },
    });
  }
}
