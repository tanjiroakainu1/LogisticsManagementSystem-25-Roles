export function buildOpenRouterPayload(
  incoming: string | Record<string, unknown>,
  modelOverride?: string
): Record<string, unknown>;

export function proxyToOpenRouter(opts: {
  apiKey?: string;
  model?: string;
  referer?: string;
  body: string;
}): Promise<{ status: number; body: string }>;

export const DEFAULT_MODEL: string;
