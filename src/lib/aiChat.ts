import type { ChatMessage } from '@/config/chatbot';

const CHAT_ENDPOINT = '/api/chat/completions';

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

export async function sendChatMessage(
  messages: Pick<ChatMessage, 'role' | 'content'>[],
  systemPrompt: string
): Promise<string> {
  const res = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data = (await res.json()) as ChatCompletionResponse;

  if (!res.ok) {
    throw new Error(data.error?.message ?? `Assistant unavailable (${res.status})`);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('No response from LMS Intelligence. Please try again.');
  return content;
}

/** Health check — uses proxy, key stays server-side */
export async function pingAssistant(): Promise<boolean> {
  try {
    const reply = await sendChatMessage(
      [{ role: 'user', content: 'Reply with exactly: ONLINE' }],
      'Reply with exactly one word: ONLINE'
    );
    return reply.toUpperCase().includes('ONLINE');
  } catch {
    return false;
  }
}
