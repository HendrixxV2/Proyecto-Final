import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { aiService } from '@/Services/aiService';
import { useAuth } from '@/Hooks/useAuth';
import { cn } from '@/Utils/cn';

const SUGERENCIAS_ADMIN = [
  '¿Cuántas reservas están pendientes?',
  'Ver boletos de Noche de Teatro: Voces del Pacífico',
  'Resume los indicadores del panel',
  'Abrir disponibilidad',
];

export default function AdminAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      texto: 'Hola, soy Lulu Admin. Puedo resumir indicadores y llevarte a la sección para revisar reservas, eventos, espacios, usuarios o reportes. No ejecuto cambios desde el chat.',
      items: [],
    },
  ]);
  const listRef = useRef(null);
  const { user } = useAuth();

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
      const response = await aiService.chatAdmin(pregunta, { historial: messages, usuario: user });
      setMessages((prev) => [...prev, { role: 'assistant', texto: response.texto, items: response.items ?? [] }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        texto: 'No pude procesar la consulta. Intenta de nuevo desde el panel.',
        items: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (user?.rol !== 'admin') return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="asistente-admin"
        aria-label={open ? 'Cerrar Lulu Admin' : 'Abrir Lulu Admin'}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Bot aria-hidden="true" className="h-6 w-6" />}
      </button>

      {open && (
        <section
          id="asistente-admin"
          aria-label="Lulu Admin, asistente exclusivo del panel administrativo"
          className="fixed bottom-24 right-5 z-50 flex h-[70vh] max-h-[600px] w-[calc(100vw-2.5rem)] max-w-md flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-2xl animate-slide-up dark:border-ink-700 dark:bg-ink-800"
        >
          <header className="flex items-center gap-3 border-b border-blue-700 bg-blue-600 px-4 py-3 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
              <Bot aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Lulu Admin</p>
              <p className="text-[11px] text-white/80">Asistencia administrativa · solo lectura</p>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message, index) => (
              <article
                key={index}
                className={cn(
                  'max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm',
                  message.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'bg-ink-100 text-ink-800 dark:bg-ink-700 dark:text-ink-100',
                )}
              >
                <p className="whitespace-pre-line">{message.texto}</p>
                {message.items?.length > 0 && (
                  <ul className="mt-2.5 space-y-2">
                    {message.items.map((item, itemIndex) => (
                      <li key={`${item.ruta}-${itemIndex}`}>
                        <Link
                          to={item.ruta}
                          onClick={() => setOpen(false)}
                          className="block rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs text-ink-800 transition hover:border-blue-500 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100"
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
                Consultando registros e indicadores del panel…
              </p>
            )}
          </div>

          <div className="border-t border-ink-200 p-3 dark:border-ink-700">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGERENCIAS_ADMIN.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => enviar(suggestion)}
                  disabled={loading}
                  className="rounded-full border border-ink-200 px-2.5 py-1 text-[11px] text-ink-600 transition hover:border-blue-500 hover:text-blue-700 disabled:opacity-50 dark:border-ink-600 dark:text-ink-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                enviar();
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="admin-ai-input" className="sr-only">Escribe una consulta administrativa</label>
              <input
                id="admin-ai-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Busca códigos, eventos, titulares o abre una sección…"
                className="h-10 flex-1 rounded-lg border border-ink-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Enviar consulta administrativa"
                className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
              >
                <Send aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}