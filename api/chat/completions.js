/**
 * Vercel serverless proxy for LMS Intelligence (OpenRouter).
 * Keeps OPENROUTER_API_KEY server-side — never exposed to the browser.
 */
import { proxyToOpenRouter } from './openrouterProxy.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const refererHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const referer = refererHost
    ? refererHost.startsWith('http')
      ? refererHost
      : `https://${refererHost}`
    : 'https://lms-platform.vercel.app';

  const incoming = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  const result = await proxyToOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL,
    referer,
    body: incoming,
  });

  res.status(result.status);
  res.setHeader('Content-Type', 'application/json');
  return res.send(result.body);
}
