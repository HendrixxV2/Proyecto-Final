import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react';
import { aiService } from '@/Services/aiService';
import { useAuth } from '@/Hooks/useAuth';
import { cn } from '@/Utils/cn';
import { useLanguage } from '@/Hooks/useLanguage';

const SUGERENCIAS = ['¿Qué eventos hay este mes?', '¿Qué espacios puedo reservar?', 'Cuéntame del Ferrocarril', 'Últimas noticias'];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      texto: '¡Hola! Soy el Asistente Cultural del Centro Orotinense. Puedo recomendarte eventos, espacios y contar la historia del cantón.',
      items: [],
    },
  ]);

  const listRef = useRef(null);
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const suggestions = language === 'en'
    ? ['What events are on this month?', 'What spaces can I book?', 'Tell me about the Railway', 'Latest news']
    : language === 'zh'
      ? ['本月有哪些活動？', '哪些空間可以預約？', '介紹太平洋鐵路', '最新消息']
      : SUGERENCIAS;

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const enviar = async (texto) => {
    const pregunta = (texto ?? input).trim();
    if (!pregunta || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', texto: pregunta }]);
    setLoading(true);

    try {
      const res = await aiService.chat(pregunta, { historial: messages });
      setMessages((prev) => [...prev, { role: 'assistant', texto: res.texto, items: res.items ?? [] }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', texto: 'No pude procesar tu consulta. Intenta de nuevo en un momento.', items: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="asistente-cultural"
        aria-label={open ? t('common.close') : t('common.assistant')}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-jade-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-jade-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-500"
      >
        {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Sparkles aria-hidden="true" className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? t('common.close') : t('common.assistant')}</span>
      </button>

      {open && (
          <section
          id="asistente-cultural"
          aria-label="Asistente cultural con inteligencia artificial"
          className="fixed bottom-20 right-5 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl animate-slide-up dark:border-ink-700 dark:bg-ink-800"
        >
          <header className="flex items-center gap-3 border-b border-ink-200 bg-jade-500 px-4 py-3 text-white dark:border-ink-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
              <Bot aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t('common.assistant')}</p>
              <p className="text-[11px] text-white/80">Recomendaciones · Historia · Reservas</p>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m, i) => (
              <article
                key={i}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                  m.role === 'user'
                    ? 'ml-auto bg-brand-500 text-white'
                    : 'bg-ink-100 text-ink-800 dark:bg-ink-700 dark:text-ink-100',
                )}
              >
                <p>{m.texto}</p>

                {m.items?.length > 0 && (
                  <ul className="mt-2.5 space-y-2">
                    {m.items.map((item, idx) => (
                      <li key={idx}>
                        <Link
                          to={item.ruta}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl border border-white/25 bg-white/70 px-3 py-2 text-xs text-ink-800 transition hover:border-brand-400 dark:bg-ink-800/70 dark:text-ink-100"
                        >
                          <span className="font-semibold">{item.titulo}</span>
                          <span className="mt-0.5 block text-ink-500 dark:text-ink-400">{item.meta}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            {loading && (
              <p className="inline-flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                Analizando el catálogo cultural…
              </p>
            )}
          </div>

          <div className="border-t border-ink-200 p-3 dark:border-ink-700">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => enviar(s)}
                  className="rounded-full border border-ink-200 px-2.5 py-1 text-[11px] text-ink-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-ink-600 dark:text-ink-300"
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="ai-input" className="sr-only">Escribe tu consulta al asistente cultural</label>
              <input
                id="ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'en' ? 'Ask me anything…' : language === 'zh' ? '請輸入你的問題…' : 'Pregúntame lo que necesites…'}
                className="h-10 flex-1 rounded-xl border border-ink-300 bg-white px-3 text-sm outline-none focus:border-jade-500 focus:ring-2 focus:ring-jade-500/30 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Enviar consulta"
                className="grid h-10 w-10 place-items-center rounded-xl bg-jade-500 text-white transition hover:bg-jade-600 disabled:opacity-40"
              >
                <Send aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>

            {user && (
              <p className="mt-2 text-[10px] text-ink-400">
                Sesión de {user.nombre} · las recomendaciones se personalizan con tu historial.
              </p>
            )}
          </div>
        </section>
      )}
    </>
  );
}