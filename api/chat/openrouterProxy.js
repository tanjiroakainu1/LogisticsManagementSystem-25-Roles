/** Shared OpenRouter proxy logic — used by Vercel serverless + Vite dev middleware */

const DEFAULT_MODEL = 'qwen/qwen-2.5-7b-instruct';

export function buildOpenRouterPayload(incoming, modelOverride) {
  const incomingObj =
    typeof incoming === 'string'
      ? JSON.parse(incoming || '{}')
      : incoming && typeof incoming === 'object'
        ? incoming
        : {};

  return {
    ...incomingObj,
    model: modelOverride || incomingObj.model || DEFAULT_MODEL,
    max_tokens: incomingObj.max_tokens ?? 1024,
    temperature: incomingObj.temperature ?? 0.7,
  };
}

export async function proxyToOpenRouter({ apiKey, model, referer, body }) {
  if (!apiKey?.trim()) {
    return {
      status: 503,
      body: JSON.stringify({
        error: {
          message:
            'LMS Intelligence is not configured. Add OPENROUTER_API_KEY to .env (local) or Vercel Environment Variables.',
        },
      }),
    };
  }

  const payload = buildOpenRouterPayload(body, model);
  const site = referer || 'https://lms-platform.vercel.app';

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': site,
        'X-Title': 'LMS Platform - Logistics Management System',
      },
      body: JSON.stringify(payload),
    });

    return { status: upstream.status, body: await upstream.text() };
  } catch {
    return {
      status: 502,
      body: JSON.stringify({
        error: { message: 'LMS Intelligence gateway unavailable. Please try again.' },
      }),
    };
  }
}

export { DEFAULT_MODEL };
