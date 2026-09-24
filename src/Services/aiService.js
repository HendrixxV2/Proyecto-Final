import { eventosService } from './eventosService';
import { espaciosService } from './espaciosService';
import { noticiasService } from './noticiasService';

const AI_ENDPOINT = import.meta.env?.VITE_AI_ENDPOINT ?? '';

const STOPWORDS = new Set([
  'de','la','el','los','las','un','una','y','o','que','en','para','con','por','del','al','es','son','como','más','muy','me','mi','te','tu','se','su','hay','quiero','busco','necesito','dónde','donde','cuándo','cuando','cuál','cual','qué','que',
]);

const tokenize = (texto) =>
  String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));

const score = (tokens, texto) => {
  const target = String(texto).toLowerCase();
  return tokens.reduce((acc, t) => (target.includes(t) ? acc + 1 : acc), 0);
};

/* ------------------------------- Resumen IA ------------------------------ */

const dividirOraciones = (texto) =>
  String(texto)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

export const resumirTexto = (texto, maxOraciones = 2) => {
  const oraciones = dividirOraciones(texto);
  if (oraciones.length <= maxOraciones) return oraciones.join(' ');

  const freq = {};
  tokenize(texto).forEach((t) => {
    freq[t] = (freq[t] ?? 0) + 1;
  });

  const puntuadas = oraciones.map((oracion, index) => {
    const tokens = tokenize(oracion);
    const base = tokens.reduce((acc, t) => acc + (freq[t] ?? 0), 0) / (tokens.length || 1);
    const bonus = index === 0 ? 1.5 : 0; // la primera oración suele ser la entrada
    return { oracion, index, puntaje: base + bonus };
  });

  return puntuadas
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, maxOraciones)
    .sort((a, b) => a.index - b.index)
    .map((o) => o.oracion)
    .join(' ');
};

/* ------------------------------ Motor de chat ---------------------------- */

const INTENTS = [
  {
    id: 'eventos',
    keywords: ['evento', 'eventos', 'agenda', 'funcion', 'obra', 'concierto', 'espectaculo', 'cartelera'],
    run: async (tokens) => {
      const eventos = await eventosService.listPublicados();
      const ranked = eventos
        .map((e) => ({ e, s: score(tokens, `${e.titulo} ${e.categoria} ${e.descripcion}`) }))
        .sort((a, b) => b.s - a.s);
      const top = (ranked[0]?.s > 0 ? ranked : eventos.map((e) => ({ e }))).slice(0, 3);
      return {
        texto:
          top.length > 0
            ? `Encontré ${top.length} actividad(es) que podrían interesarte:`
            : 'Por ahora no hay eventos publicados.',
        items: top.map(({ e }) => ({
          tipo: 'evento',
          id: e.id,
          titulo: e.titulo,
          meta: `${e.fecha} · ${e.horaInicio} · ${e.categoria}`,
          ruta: '/calendario',
        })),
      };
    },
  },
  {
    id: 'espacios',
    keywords: ['espacio', 'espacios', 'sala', 'alquiler', 'alquilar', 'reservar', 'teatro', 'galeria', 'taller', 'capacidad'],
    run: async (tokens) => {
      const espacios = await espaciosService.list({ activo: true });
      const ranked = espacios
        .map((e) => ({ e, s: score(tokens, `${e.nombre} ${e.tipo} ${e.descripcion} ${e.ubicacion}`) }))
        .sort((a, b) => b.s - a.s);
      const top = (ranked[0]?.s > 0 ? ranked : ranked).slice(0, 3);
      return {
        texto: 'Estos espacios podrían ajustarse a lo que necesitas:',
        items: top.map(({ e }) => ({
          tipo: 'espacio',
          id: e.id,
          titulo: e.nombre,
          meta: `${e.tipo} · ${e.capacidad} personas · ₡${Number(e.precioHora).toLocaleString('es-CR')}/hora`,
          ruta: `/espacios/${e.id}`,
        })),
      };
    },
  },
  {
    id: 'noticias',
    keywords: ['noticia', 'noticias', 'novedad', 'novedades', 'prensa', 'comunicado', 'convocatoria'],
    run: async () => {
      const noticias = await noticiasService.latest(3);
      return {
        texto: 'Estas son las noticias más recientes del centro:',
        items: noticias.map((n) => ({
          tipo: 'noticia',
          id: n.id,
          titulo: n.titulo,
          meta: resumirTexto(n.resumen || n.contenido, 1),
          ruta: `/noticias/${n.id}`,
        })),
      };
    },
  },
  {
    id: 'historia',
    keywords: ['historia', 'orotina', 'ferrocarril', 'tren', 'memoria', 'patrimonio', 'museo'],
    run: async () => ({
      texto:
        'Orotina se consolidó como nudo comercial gracias al Ferrocarril al Pacífico. La Galería Ferrocarril del centro conserva esa memoria en fotografías, planos y objetos donados por familias del cantón.',
      items: [
        { tipo: 'ruta', titulo: 'Historia de Orotina', meta: 'Línea de tiempo y patrimonio', ruta: '/historia' },
        { tipo: 'ruta', titulo: 'Galería Ferrocarril', meta: 'Archivo fotográfico', ruta: '/galeria' },
      ],
    }),
  },
  {
    id: 'horario',
    keywords: ['horario', 'abierto', 'atienden', 'direccion', 'ubicacion', 'llegar', 'telefono', 'contacto'],
    run: async () => ({
      texto:
        'El Centro Cultural Orotinense atiende de martes a domingo, de 9:00 a. m. a 8:00 p. m. Está ubicado en el antiguo complejo del Ferrocarril al Pacífico, costado este del Parque de Orotina.',
      items: [{ tipo: 'ruta', titulo: 'Ver espacios disponibles', meta: 'Mapa y direcciones', ruta: '/espacios' }],
    }),
  },
];

export const aiService = {
  /** Resumen inteligente de una noticia */
  async resumirNoticia(noticia, maxOraciones = 2) {
    if (!noticia) return '';
    return resumirTexto(noticia.contenido || noticia.resumen || '', maxOraciones);
  },

  /** Motor de recomendación de eventos por afinidad */
  async recomendar({ usuarioId, categoriasPreferidas = [], limite = 3 } = {}) {
    const eventos = await eventosService.listPublicados();

    let historial = [];
    if (usuarioId) {
      const { boletosService } = await import('./boletosService');
      const boletos = await boletosService.listByUsuario(usuarioId);
      const idsEventos = boletos.map((b) => b.eventoId);
      historial = eventos.filter((e) => idsEventos.includes(e.id)).map((e) => e.categoria);
    }

    const afinidad = [...new Set([...categoriasPreferidas, ...historial])];

    return eventos
      .map((e) => ({
        ...e,
        afinidad: afinidad.includes(e.categoria) ? 2 : 0,
        proximidad: new Date(e.fecha).getTime(),
      }))
      .sort((a, b) => b.afinidad - a.afinidad || a.proximidad - b.proximidad)
      .slice(0, limite);
  },

  /** Chat conversacional del "Asistente Cultural" */
  async chat(mensaje, { historial = [] } = {}) {
    if (!mensaje?.trim()) return { texto: '¿En qué puedo ayudarte?', items: [] };

    // 1) Si hay un endpoint remoto configurado, se delega (RAG sobre el backend)
    if (AI_ENDPOINT) {
      try {
        const res = await fetch(`${AI_ENDPOINT}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje, historial }),
        });
        if (res.ok) return res.json();
      } catch {
        /* fallback local */
      }
    }

    // 2) Motor local basado en intenciones + búsqueda por relevancia
    const tokens = tokenize(mensaje);
    const ranked = INTENTS.map((intent) => ({
      intent,
      s: intent.keywords.reduce((acc, k) => (mensaje.toLowerCase().includes(k) ? acc + 2 : acc), 0) + score(tokens, intent.keywords.join(' ')),
    })).sort((a, b) => b.s - a.s);

    const mejor = ranked[0];

    if (!mejor || mejor.s === 0) {
      const eventos = await eventosService.listPublicados();
      return {
        texto:
          'Puedo ayudarte con eventos, espacios disponibles, noticias, historia de Orotina y horarios. ¿Sobre cuál te gustaría saber más?',
        items: eventos.slice(0, 2).map((e) => ({
          tipo: 'evento',
          id: e.id,
          titulo: e.titulo,
          meta: `${e.fecha} · ${e.horaInicio}`,
          ruta: '/calendario',
        })),
      };
    }

    const resultado = await mejor.intent.run(tokens);
    return { ...resultado, intent: mejor.intent.id };
  },
};