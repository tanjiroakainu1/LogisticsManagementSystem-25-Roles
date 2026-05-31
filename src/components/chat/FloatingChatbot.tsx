import { FormEvent, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DEVELOPER } from '@/config/brand';
import {
  buildSystemPrompt,
  getQuickQuestions,
  newMessageId,
  type ChatContext,
  type ChatMessage,
} from '@/config/chatbot';
import { ALL_ROLE_KEYS, getRoleFolder } from '@/config/roles';
import { sendChatMessage } from '@/lib/aiChat';

function detectContext(pathname: string, userRole?: string): ChatContext {
  if (userRole && (ALL_ROLE_KEYS as readonly string[]).includes(userRole)) {
    return userRole as ChatContext;
  }
  for (const role of ALL_ROLE_KEYS) {
    if (pathname.startsWith(`/${getRoleFolder(role)}`)) return role;
  }
  return 'guest';
}

export function FloatingChatbot() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const context = detectContext(pathname, user?.role);
  const quickQuestions = getQuickQuestions(context);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: newMessageId(),
      role: 'assistant',
      content: `Hi! I'm **LMS Intelligence** ✨\n\nAsk me **anything** — logistics workflows, how this platform works, general knowledge, or any other topic. I adapt to your role and can walk you through step by step.\n\n_Crafted for ${DEVELOPER.name}'s Logistics Management System._`,
      ts: Date.now(),
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus({ preventScroll: true });
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [open, messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: newMessageId(), role: 'user', content: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setOnline(true);

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content.replace(/\*\*/g, '') }));

      const reply = await sendChatMessage(history, buildSystemPrompt(context, user?.full_name));
      setMessages((prev) => [
        ...prev,
        { id: newMessageId(), role: 'assistant', content: reply, ts: Date.now() },
      ]);
    } catch (err) {
      setOnline(false);
      setMessages((prev) => [
        ...prev,
        {
          id: newMessageId(),
          role: 'assistant',
          content: `Sorry, I couldn't reach LMS Intelligence right now. If you're on Vercel, confirm **OPENROUTER_API_KEY** is set in project Environment Variables. Locally, add it to \`.env\` and run \`npm run dev\`.\n\n${err instanceof Error ? err.message : ''}`,
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          className="chatbot-backdrop fixed inset-0 z-[190] bg-candy-900/40 backdrop-blur-[2px] sm:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close chat overlay"
        />
      )}

      <div
        className={`chatbot-root pointer-events-none z-[200] ${
          open
            ? 'fixed inset-0 flex flex-col sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:items-end'
            : 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6'
        }`}
        style={{ paddingBottom: open ? undefined : 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {open && (
          <div
            className="chatbot-panel pointer-events-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden border-candy-200/80 bg-white/95 shadow-2xl backdrop-blur-xl max-sm:rounded-none sm:mb-3 sm:max-h-[min(85dvh,680px)] sm:w-[min(calc(100vw-2rem),420px)] sm:flex-none sm:rounded-3xl sm:border"
            role="dialog"
            aria-label="LMS Intelligence chat"
            aria-modal="true"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-candy-header px-3 py-3 text-white sm:px-4 sm:py-4">
              <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" aria-hidden />
              <div className="relative flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <span className="chatbot-orb flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg backdrop-blur sm:h-11 sm:w-11 sm:rounded-2xl sm:text-xl">✨</span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold tracking-tight sm:text-base">LMS Intelligence</h3>
                    <p className="truncate text-[10px] text-white/75 sm:text-[11px]">
                      By {DEVELOPER.name} · Smart logistics guide
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 sm:h-8 sm:w-8"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>
              <div className="relative mt-2 flex items-center gap-2 sm:mt-3">
                <span className={`inline-flex h-2 w-2 shrink-0 rounded-full ${online ? 'bg-pastel-mint animate-pulse' : 'bg-pastel-rose'}`} />
                <span className="truncate text-[10px] font-semibold text-white/80">
                  {online ? 'Online · Ask me anything' : 'Offline · Check API key config'}
                </span>
              </div>
            </div>

            {/* Quick questions — horizontal scroll on mobile */}
            <div className="shrink-0 border-b border-candy-100 bg-candy-50/80 px-3 py-2.5 sm:py-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-candy-500 sm:mb-2">Quick questions</p>
              <div className="chatbot-chips -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:max-h-28 sm:flex-wrap sm:overflow-y-auto sm:overflow-x-hidden sm:pb-0">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={loading}
                    onClick={() => send(q)}
                    className="shrink-0 rounded-full border border-candy-200/80 bg-white px-2.5 py-1.5 text-left text-[10px] font-semibold text-candy-700 transition hover:border-accent-light hover:bg-accent-soft/60 disabled:opacity-50 sm:max-w-full sm:whitespace-normal sm:py-1 sm:text-[11px]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-3 sm:max-h-[min(50vh,400px)] sm:py-4"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[88%] sm:px-3.5 sm:py-2.5 ${
                      m.role === 'user'
                        ? 'rounded-br-md bg-primary text-white shadow-candy'
                        : 'rounded-bl-md border border-candy-100 bg-candy-50 text-candy-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-candy-100 bg-candy-50 px-4 py-3">
                    <span className="chatbot-dot h-2 w-2 rounded-full bg-accent" />
                    <span className="chatbot-dot animation-delay-150 h-2 w-2 rounded-full bg-accent" />
                    <span className="chatbot-dot animation-delay-300 h-2 w-2 rounded-full bg-accent" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={onSubmit}
              className="shrink-0 border-t border-candy-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask LMS Intelligence anything…"
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-xl border border-candy-200 bg-candy-50/50 px-3 py-2.5 text-base outline-none focus:border-accent-light focus:ring-2 focus:ring-accent-soft disabled:opacity-60 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="btn btn-primary w-full !min-h-[44px] shrink-0 sm:w-auto sm:!px-5"
                >
                  Send
                </button>
              </div>
              <p className="mt-2 hidden text-center text-[9px] text-candy-400 sm:block">Secure · Private · LMS Intelligence only</p>
            </form>
          </div>
        )}

        {/* FAB — hidden on mobile when panel is open (header has close) */}
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="chatbot-fab pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-candy-header text-2xl text-white shadow-glow transition hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
            aria-label="Open LMS Intelligence"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            ✨
          </button>
        )}

        {/* Desktop: mini close FAB when open (optional - header already has close). Keep for sm+ consistency */}
        {open && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="chatbot-fab pointer-events-auto mt-2 hidden h-14 w-14 items-center justify-center rounded-2xl bg-candy-header text-xl text-white shadow-glow transition hover:scale-105 active:scale-95 sm:flex sm:h-16 sm:w-16"
            aria-label="Close LMS Intelligence"
          >
            ✕
          </button>
        )}
      </div>
    </>
  );
}
