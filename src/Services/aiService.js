// src/services/aiService.js
// ─────────────────────────────────────────────────────────────────────────────
// Asistente Cultural · Motor local + base de conocimiento Q&A
// Fuente de verdad: db.json (JSON Server)
// API externa: Open-Meteo (weatherService)
// ─────────────────────────────────────────────────────────────────────────────

import { eventosService }    from './eventosService';
import { espaciosService }   from './espaciosService';
import { noticiasService }   from './noticiasService';
import { contenidoService }  from './contenidoService';
import { boletosService }    from './boletosService';
import { reservasService }   from './reservasService';
import { usuariosService }   from './usuariosService';
import { weatherService }    from './weatherService';
import { formatFecha, formatColones, formatHora, formatRangoHoras } from '@/utils/format';

const readViteEnv = (key, fallback = '') => {
  try {
    const env = Function('return import.meta.env')();
    return env?.[key] ?? fallback;
  } catch {
    return fallback;
  }
};

const AI_ENDPOINT = readViteEnv('VITE_AI_ENDPOINT');

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                       UTILIDADES DE LENGUAJE NATURAL                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

const STOPWORDS = new Set([
  'de','la','el','los','las','un','una','y','o','que','en','para','con','por','del','al','es','son','como',
  'más','muy','me','mi','te','tu','se','su','hay','quiero','busco','necesito','dónde','donde','cuándo',
  'cuando','cuál','cual','qué','que','algo','sobre','puedo','podría','sabes','dime','decir','hola','favor',
  'porque','porqué','tengo','tiene','hacer','hago','esta','este','esto','esa','ese','eso','cómo','como',
]);

export const normalizar = (t) =>
  String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (t) =>
  normalizar(t)
    .split(' ')
    .filter((x) => x.length > 2 && !STOPWORDS.has(x));

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                        RESUMEN EXTRACTIVO (IA LOCAL)                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

const dividirOraciones = (t) =>
  String(t ?? '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

export const resumirTexto = (texto, maxOraciones = 2) => {
  const oraciones = dividirOraciones(texto);
  if (oraciones.length <= maxOraciones) return oraciones.join(' ');

  const freq = {};
  tokenize(texto).forEach((t) => { freq[t] = (freq[t] ?? 0) + 1; });

  return oraciones
    .map((oracion, index) => {
      const tokens = tokenize(oracion);
      const base = tokens.reduce((a, t) => a + (freq[t] ?? 0), 0) / (tokens.length || 1);
      const bonus = index === 0 ? 1.5 : 0;
      return { oracion, index, score: base + bonus };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxOraciones)
    .sort((a, b) => a.index - b.index)
    .map((o) => o.oracion)
    .join(' ');
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                                   HELPERS                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

const hoy = () => new Date().toISOString().slice(0, 10);
const enDias = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const finDeMes = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
};
const finDeSemana = () => {
  const d = new Date();
  const diff = (6 - d.getDay() + 7) % 7 || 7; // próximo sábado
  return enDias(diff);
};

const r = (texto, items = []) => ({ texto, items });

const itemEvento = (e) => ({
  tipo: 'evento',
  id: e.id,
  titulo: e.titulo,
  meta: `${formatFecha(e.fecha, "d 'de' MMM")} · ${formatHora(e.horaInicio)} · ${e.categoria}`,
  ruta: '/calendario',
});

const itemEspacio = (e) => ({
  tipo: 'espacio',
  id: e.id,
  titulo: e.nombre,
  meta: `${String(e.tipo).replace('_', ' ')} · ${e.capacidad} pers. · ${formatColones(e.precioHora)}/h`,
  ruta: `/espacios/${e.id}`,
});

const itemNoticia = (n) => ({
  tipo: 'noticia',
  id: n.id,
  titulo: n.titulo,
  meta: resumirTexto(n.resumen || n.contenido, 1),
  ruta: `/noticias/${n.id}`,
});

const itemRuta = (titulo, meta, ruta) => ({ tipo: 'ruta', titulo, meta, ruta });

/** ¿El mensaje contiene alguno de los tags? Útil para filtros por categoría */
const contieneCategoria = (normalized, lista) =>
  lista.find((c) => normalized.includes(normalizar(c)));

/** Busca en una lista por coincidencia de tokens con alguno de sus campos */
const mejorCoincidencia = (lista, tokens, campos) => {
  let mejor = null;
  let mejorScore = 0;
  for (const item of lista) {
    const texto = campos.map((c) => normalizar(item[c] ?? '')).join(' ');
    let score = 0;
    for (const t of tokens) {
      if (t.length > 3 && texto.includes(t)) score += t.length;
    }
    if (score > mejorScore) { mejor = item; mejorScore = score; }
  }
  return mejorScore >= 4 ? mejor : null;
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                    BASE DE CONOCIMIENTO — INTENTS Q&A                      */
/* ═══════════════════════════════════════════════════════════════════════════ */
/*                                                                            */
/*  Estructura:                                                               */
/*    id       → identificador único (namespace.accion)                       */
/*    tags[]   → palabras gatillo (match por inclusión + tokens)              */
/*    regex?   → bonus de match exacto                                        */
/*    resolve  → async (ctx) => { texto, items }                              */
/*                                                                            */
/*  Reglas de diseño:                                                         */
/*    1. Respuestas ≤ 3 líneas.                                               */
/*    2. Máximo 4 chips por respuesta.                                        */
/*    3. Cuando aplique, cita datos exactos de db.json.                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

const INTENTS = [

  /* ══════════════════════════ 1. EVENTOS ══════════════════════════ */

  {
    id: 'eventos.hoy',
    tags: ['hoy', 'esta noche', 'ahora', 'en este momento', 'proximas horas', 'esta tarde'],
    regex: /(evento|funcion|actividad|que hay).*(hoy|ahora|esta noche)/i,
    resolve: async () => {
      const eventos = await eventosService.listPublicados();
      const delDia = eventos.filter((e) => e.fecha === hoy());
      if (!delDia.length) return r('Hoy no hay actividades programadas en el centro.');
      return r(`Hoy hay ${delDia.length} actividad(es):`, delDia.map(itemEvento));
    },
  },

  {
    id: 'eventos.manana',
    tags: ['manana', 'el dia siguiente', 'proximo dia'],
    regex: /(evento|funcion|actividad).*(manana)/i,
    resolve: async () => {
      const eventos = await eventosService.listPublicados();
      const manana = enDias(1);
      const lista = eventos.filter((e) => e.fecha === manana);
      if (!lista.length) return r('Mañana no hay actividades programadas.');
      return r(`Mañana: ${lista.length} actividad(es).`, lista.map(itemEvento));
    },
  },

  {
    id: 'eventos.semana',
    tags: ['semana', 'esta semana', 'proximos dias', 'proximos 7 dias'],
    resolve: async () => {
      const eventos = await eventosService.listPublicados();
      const desde = hoy();
      const hasta = enDias(7);
      const rango = eventos.filter((e) => e.fecha >= desde && e.fecha <= hasta);
      if (!rango.length) return r('No hay eventos programados en los próximos 7 días.');
      return r(`En los próximos 7 días: ${rango.length} actividad(es).`, rango.slice(0, 4).map(itemEvento));
    },
  },

  {
    id: 'eventos.fin_de_semana',
    tags: ['fin de semana', 'sabado', 'domingo', 'finde', 'este sabado', 'este domingo'],
    resolve: async () => {
      const eventos = await eventosService.listPublicados();
      const sab = finDeSemana();
      const dom = enDias(1);
      const lista = eventos.filter((e) => e.fecha >= sab && e.fecha <= dom);
      if (!lista.length) return r('No hay eventos programados para este fin de semana.');
      return r(`Fin de semana con ${lista.length} actividad(es):`, lista.slice(0, 4).map(itemEvento));
    },
  },

  {
    id: 'eventos.mes',
    tags: ['mes', 'este mes', 'mensual', 'agenda del mes', 'calendario del mes'],
    resolve: async () => {
      const eventos = await eventosService.listPublicados();
      const delMes = eventos.filter((e) => e.fecha >= hoy() && e.fecha <= finDeMes());
      if (!delMes.length) return r('No hay eventos publicados para lo que resta de este mes.');
      return r(`Este mes hay ${delMes.length} actividad(es):`, delMes.slice(0, 5).map(itemEvento));
    },
  },

  {
    id: 'eventos.gratis',
    tags: ['gratis', 'gratuito', 'gratuitos', 'gratuita', 'sin costo', 'entrada libre', 'libre'],
    regex: /(evento|funcion|actividad|boleto|entrada).*(gratis|gratuit|libre)/i,
    resolve: async () => {
      const eventos = await eventosService.listPublicados();
      const gratis = eventos.filter((e) => Number(e.precio) === 0);
      if (!gratis.length) return r('Por ahora no hay eventos gratuitos publicados.');
      return r(
        `Tenemos ${gratis.length} evento(s) gratuito(s):`,
        gratis.slice(0, 4).map(itemEvento),
      );
    },
  },

  {
    id: 'eventos.categoria',
    tags: ['teatro', 'obra', 'drama', 'baile', 'danza', 'folclor', 'canto', 'musica', 'concierto', 'exposicion', 'taller', 'feria'],
    resolve: async (ctx) => {
      const cat = contieneCategoria(
        ctx.normalized,
        ['teatro','baile','canto','exposicion','taller','feria','concierto'],
      );
      if (!cat) return null;
      const eventos = await eventosService.listPublicados();
      const filtrados = eventos.filter((e) => e.categoria === cat);
      if (!filtrados.length) return r(`No hay eventos de ${cat} por ahora.`);
      return r(`Eventos de ${cat} (${filtrados.length}):`, filtrados.slice(0, 4).map(itemEvento));
    },
  },

  {
    id: 'eventos.precio',
    tags: ['cuanto cuesta', 'precio', 'precios', 'tarifa', 'costo', 'valor', 'cuanto vale'],
    regex: /(cuanto|precio|tarifa|costo|vale).*(entrada|boleto|evento|funcion)/i,
    resolve: async () => {
      const eventos = await eventosService.listPublicados();
      if (!eventos.length) return r('No hay eventos publicados por ahora.');
      const gratis = eventos.filter((e) => Number(e.precio) === 0).length;
      const conPrecio = eventos.filter((e) => Number(e.precio) > 0);
      const rango = conPrecio.length
        ? `${formatColones(Math.min(...conPrecio.map((e) => e.precio)))} – ${formatColones(Math.max(...conPrecio.map((e) => e.precio)))}`
        : 'sin entradas con costo actualmente';
      return r(
        `${gratis} evento(s) gratis. Entradas con costo: ${rango}. Reserva en Boletos.`,
        [itemRuta('Ir a Boletos', 'Reserva tu entrada en línea', '/boletos')],
      );
    },
  },

  {
    id: 'eventos.aforo',
    tags: ['aforo', 'cuantas personas', 'capacidad del evento', 'cupo', 'entran personas'],
    resolve: async (ctx) => {
      const eventos = await eventosService.listPublicados();
      const mencionado = mejorCoincidencia(eventos, ctx.tokens, ['titulo', 'descripcion', 'categoria']);
      if (mencionado) return r(`"${mencionado.titulo}" tiene aforo para ${mencionado.aforo} personas.`);
      const mayor = [...eventos].sort((a, b) => b.aforo - a.aforo)[0];
      return r(mayor
        ? `El evento con mayor aforo es "${mayor.titulo}" (${mayor.aforo} personas).`
        : 'No hay eventos publicados.');
    },
  },

  {
    id: 'eventos.especifico',
    tags: ['voces del pacifico', 'festival de baile', 'taller de canto', 'rieles y memoria', 'sobre el evento'],
    resolve: async (ctx) => {
      const eventos = await eventosService.listPublicados();
      const match = mejorCoincidencia(eventos, ctx.tokens, ['titulo', 'descripcion']);
      if (!match) return null;
      return r(
        `${match.titulo} · ${formatFecha(match.fecha)} a las ${formatHora(match.horaInicio)}. Aforo ${match.aforo}. Entrada ${match.precio > 0 ? formatColones(match.precio) : 'gratuita'}.`,
        [itemEvento(match)],
      );
    },
  },

  {
    id: 'eventos.lista',
    tags: ['evento','eventos','agenda','calendario','funcion','funciones','cartelera','programacion','proximos','que hay'],
    resolve: async () => {
      const eventos = await eventosService.listPublicados();
      if (!eventos.length) return r('Aún no hay eventos publicados. Vuelve pronto.');
      return r(
        `Estos son los próximos eventos (${eventos.length} en total):`,
        eventos.slice(0, 5).map(itemEvento),
      );
    },
  },

  /* ══════════════════════════ 2. ESPACIOS ══════════════════════════ */

  {
    id: 'espacios.accesibles',
    tags: ['accesible', 'accesibles', 'discapacidad', 'silla de ruedas', 'movilidad reducida', 'rampa', 'ascensor'],
    resolve: async () => {
      const espacios = await espaciosService.list({ accesible: true });
      if (!espacios.length) return r('Ningún espacio está marcado como accesible actualmente.');
      return r(`${espacios.length} espacio(s) accesibles:`, espacios.map(itemEspacio));
    },
  },

  {
    id: 'espacios.precio',
    tags: ['precio', 'tarifa', 'cuanto cuesta', 'alquiler', 'alquilar', 'costo', 'renta', 'vale alquilar'],
    regex: /(cuanto|precio|tarifa|costo|vale).*(espacio|sala|alquiler|alquilar)/i,
    resolve: async (ctx) => {
      const espacios = await espaciosService.list({ activo: true });
      const mencionado = mejorCoincidencia(espacios, ctx.tokens, ['nombre', 'tipo', 'descripcion']);
      if (mencionado) return r(`"${mencionado.nombre}" cuesta ${formatColones(mencionado.precioHora)} por hora.`);
      const min = Math.min(...espacios.map((e) => e.precioHora));
      const max = Math.max(...espacios.map((e) => e.precioHora));
      return r(`Tarifas por hora entre ${formatColones(min)} y ${formatColones(max)}, según el espacio.`);
    },
  },

  {
    id: 'espacios.capacidad',
    tags: ['capacidad', 'cuantas personas', 'aforo de la sala', 'cupo', 'mas grande', 'mas pequeno'],
    resolve: async (ctx) => {
      const espacios = await espaciosService.list({ activo: true });
      const mencionado = mejorCoincidencia(espacios, ctx.tokens, ['nombre', 'tipo', 'descripcion']);
      if (mencionado) return r(`"${mencionado.nombre}" tiene capacidad para ${mencionado.capacidad} personas.`);
      const mayor = [...espacios].sort((a, b) => b.capacidad - a.capacidad)[0];
      const menor = [...espacios].sort((a, b) => a.capacidad - b.capacidad)[0];
      return r(
        `El más amplio es "${mayor.nombre}" (${mayor.capacidad} pers.) y el más íntimo "${menor.nombre}" (${menor.capacidad} pers.).`,
        [itemEspacio(mayor), itemEspacio(menor)],
      );
    },
  },

  {
    id: 'espacios.especifico',
    tags: ['teatro municipal', 'galeria ferrocarril', 'sala de danza', 'aula taller', 'explanada', 'sala', 'galeria', 'trocha'],
    resolve: async (ctx) => {
      const espacios = await espaciosService.list({ activo: true });
      const match = mejorCoincidencia(espacios, ctx.tokens, ['nombre', 'tipo', 'descripcion', 'ubicacion']);
      if (!match) return null;
      return r(
        `${match.nombre} · ${match.capacidad} personas · ${formatColones(match.precioHora)}/h. ${match.descripcion}`,
        [itemEspacio(match)],
      );
    },
  },

  {
    id: 'espacios.aire_libre',
    tags: ['aire libre', 'explanada', 'exterior', 'al aire libre', 'patio', 'afuera'],
    resolve: async () => {
      const espacios = await espaciosService.list({ tipo: 'aire_libre', activo: true });
      if (!espacios.length) return r('No hay espacios al aire libre registrados.');
      return r('Espacios al aire libre:', espacios.map(itemEspacio));
    },
  },

  {
    id: 'espacios.tipo',
    tags: ['teatro', 'danza', 'galeria', 'taller', 'multiuso', 'que tipo de espacio'],
    resolve: async (ctx) => {
      const espacios = await espaciosService.list({ activo: true });
      const tipo = contieneCategoria(ctx.normalized, ['teatro', 'danza', 'galeria', 'taller', 'aire_libre', 'multiuso']);
      if (!tipo) return null;
      const lista = espacios.filter((e) => e.tipo === tipo);
      if (!lista.length) return r(`No hay espacios de tipo ${tipo.replace('_', ' ')} activos.`);
      return r(`Espacios de tipo ${tipo.replace('_', ' ')}:`, lista.map(itemEspacio));
    },
  },

  {
    id: 'espacios.lista',
    tags: ['espacio','espacios','sala','salas','galeria','galerias','alquiler','alquilar','locales','instalaciones'],
    resolve: async () => {
      const espacios = await espaciosService.list({ activo: true });
      if (!espacios.length) return r('No hay espacios activos por ahora.');
      return r(`Contamos con ${espacios.length} espacios disponibles:`, espacios.map(itemEspacio));
    },
  },

  /* ══════════════════════════ 3. RESERVAS ══════════════════════════ */

  {
    id: 'reservas.como',
    tags: ['como reservar', 'reservar', 'reservacion', 'solicitar', 'apartar', 'alquilar', 'proceso de reserva'],
    resolve: async () =>
      r(
        'Completa el formulario en Reservas: espacio, fecha, horario y motivo. Te confirmamos por correo en 48 h.',
        [itemRuta('Ir a Reservas', 'Formulario de solicitud', '/reservas')],
      ),
  },

  {
    id: 'reservas.cancelar',
    tags: ['cancelar', 'cancelacion', 'anular', 'revertir reserva', 'politica de cancelacion'],
    resolve: async () =>
      r(
        'Puedes cancelar desde "Mis reservas" hasta 72 h antes. Con menos tiempo, aplica un recargo del 25 %.',
        [itemRuta('Ir a Mis reservas', 'Gestiona tus solicitudes', '/mis-reservas')],
      ),
  },

  {
    id: 'reservas.tiempo',
    tags: ['cuanto tarda', 'demora', 'tiempo de respuesta', 'cuando responden', 'cuando aprueban', 'cuanto tiempo'],
    resolve: async () => r('Las solicitudes de reserva se responden en un máximo de 48 horas hábiles.'),
  },

  {
    id: 'reservas.requisitos',
    tags: ['requisitos', 'necesito', 'documentos', 'que piden', 'condiciones para reservar', 'que se necesita'],
    resolve: async () =>
      r(
        'Necesitas: cuenta activa, fecha con al menos 24 h de anticipación y motivo detallado. El pago se hace en recepción al aprobarse.',
      ),
  },

  {
    id: 'reservas.estado',
    tags: ['estado de mi reserva', 'mi reserva', 'aprobaron', 'aprobar', 'pendiente', 'rechazada', 'revisar reserva'],
    resolve: async () =>
      r(
        'El estado puede ser: pendiente, aprobada, rechazada o cancelada. Consulta en "Mis reservas".',
        [itemRuta('Ver mis reservas', 'Estado y detalle de cada solicitud', '/mis-reservas')],
      ),
  },

  {
    id: 'reservas.disponibilidad',
    tags: ['disponible', 'disponibilidad', 'libre', 'ocupado', 'hay espacio', 'esta libre'],
    resolve: async () =>
      r(
        'Cada ficha de espacio muestra la ocupación del día. También puedes consultar en Reservas al elegir fecha y hora.',
        [itemRuta('Ver espacios', 'Selecciona un espacio y revisa su disponibilidad', '/espacios')],
      ),
  },

  {
    id: 'reservas.motivo',
    tags: ['motivo', 'para que', 'uso del espacio', 'actividad', 'que puedo hacer'],
    resolve: async () =>
      r(
        'El espacio puede usarse para ensayos, talleres, presentaciones, exposiciones o actividades comunitarias. Describe el motivo al solicitar.',
      ),
  },

  /* ══════════════════════════ 4. BOLETOS ══════════════════════════ */

  {
    id: 'boletos.como',
    tags: ['boleto','boletos','entrada','entradas','reservar boleto','comprar entrada','ticket','tickets','como comprar'],
    resolve: async () =>
      r(
        'Entra a Boletos, elige el evento y presiona "Reservar boleto". El pago se realiza en recepción.',
        [itemRuta('Ir a Boletos', 'Reserva tu entrada en línea', '/boletos')],
      ),
  },

  {
    id: 'boletos.gratis',
    tags: ['boleto gratis', 'boletos gratis', 'entrada gratis', 'boletos gratuitos'],
    resolve: async () => {
      const eventos = await eventosService.listPublicados();
      const gratis = eventos.filter((e) => Number(e.precio) === 0);
      if (!gratis.length) return r('No hay eventos gratuitos actualmente.');
      return r(`Eventos con entrada gratuita: ${gratis.length}.`, gratis.slice(0, 4).map(itemEvento));
    },
  },

  {
    id: 'boletos.mis',
    tags: ['mis boletos', 'mis entradas', 'boleto comprado', 'ya compre', 'mis tickets'],
    resolve: async () =>
      r(
        'Puedes revisar tus boletos activos en la sección Mis reservas.',
        [itemRuta('Ver mis boletos', 'Entradas reservadas o pagadas', '/mis-reservas')],
      ),
  },

  {
    id: 'boletos.codigo',
    tags: ['codigo de boleto', 'numero de boleto', 'identificador', 'referencia del boleto'],
    resolve: async () => r('Cada boleto tiene un código único tipo ORO-XXX-XXXXX que verás en tu confirmación y en Mis reservas.'),
  },

  {
    id: 'boletos.devolucion',
    tags: ['devolucion', 'reembolso', 'devolver boleto', 'reintegrar', 'reembolsar'],
    resolve: async () =>
      r('Las devoluciones se gestionan en recepción con al menos 72 h de anticipación, presentando el código del boleto.'),
  },

  /* ══════════════════════════ 5. CUENTA ══════════════════════════ */

  {
    id: 'cuenta.roles',
    tags: ['roles', 'tipo de usuario', 'administrador', 'usuario regular', 'permisos', 'admin', 'que roles hay'],
    resolve: async () =>
      r('Existen 2 roles: usuario_regular (reserva espacios, compra boletos) y admin (gestiona todo el sistema).'),
  },

  {
    id: 'cuenta.password',
    tags: ['olvide contrasena', 'recuperar contrasena', 'resetear', 'cambiar contrasena', 'contrasena olvidada', 'no puedo entrar'],
    resolve: async () =>
      r('Escríbenos a info@caco.orotina.cr desde tu correo registrado y restablecemos tu contraseña en 24 h.'),
  },

  {
    id: 'cuenta.registro',
    tags: ['registrar', 'registrarme', 'crear cuenta', 'registro', 'nueva cuenta', 'inscribirme', 'abrir cuenta'],
    resolve: async () =>
      r(
        'Puedes crear tu cuenta en la sección Registro con nombre, correo y contraseña (mín. 6 caracteres).',
        [itemRuta('Crear cuenta', 'Registro gratuito', '/registro')],
      ),
  },

  {
    id: 'cuenta.login',
    tags: ['iniciar sesion', 'login', 'entrar', 'acceder', 'ingresar', 'mi cuenta', 'iniciar'],
    resolve: async () =>
      r(
        'Ingresa con tu correo y contraseña desde la sección Ingresar. La sesión se mantiene activa al cerrar el navegador.',
        [itemRuta('Iniciar sesión', 'Accede a tu cuenta', '/login')],
      ),
  },

  {
    id: 'cuenta.datos',
    tags: ['mis datos', 'mi perfil', 'cambiar correo', 'actualizar datos', 'mi informacion'],
    resolve: async () =>
      r('Puedes solicitar cambios a tus datos escribiendo a info@caco.orotina.cr desde tu correo registrado.'),
  },

  /* ══════════════════════════ 6. HISTORIA Y CONTENIDO ══════════════════════════ */

  {
    id: 'historia.ferrocarril',
    tags: ['ferrocarril', 'tren', 'riel', 'rieles', 'estacion', 'tren al pacifico', 'maquina'],
    resolve: async () => {
      const bloques = await contenidoService.bySeccion('galeria_ferrocarril');
      const base = bloques[0]?.cuerpo ?? 'El Ferrocarril al Pacífico conectó Orotina con Caldera y el Valle Central.';
      return r(
        `Orotina creció al ritmo del tren. ${resumirTexto(base, 1)}`,
        [itemRuta('Galería Ferrocarril', 'Archivo fotográfico del tren', '/galeria')],
      );
    },
  },

  {
    id: 'historia.ferrero',
    tags: ['luis ferrero', 'ferrero acosta', 'escritor', 'nombre del centro', 'quien fue ferrero', 'ferrero'],
    resolve: async () =>
      r(
        'Luis Ferrero Acosta (1906–1973) fue escritor y educador costarricense. El centro lleva su nombre por su vínculo con Orotina y la cultura del Pacífico.',
        [itemRuta('Historia de Orotina', 'Contexto del cantón', '/historia')],
      ),
  },

  {
    id: 'historia.orotina',
    tags: ['historia', 'orotina', 'patrimonio', 'memoria', 'pasado', 'fundacion', 'origen', 'cuando se fundo'],
    resolve: async () => {
      const bloques = await contenidoService.bySeccion('historia');
      if (!bloques.length) return r('Estamos digitalizando el archivo histórico de Orotina.');
      return r(
        resumirTexto(bloques[0].cuerpo, 2),
        [itemRuta('Historia de Orotina', 'Línea de tiempo completa', '/historia')],
      );
    },
  },

  {
    id: 'historia.galeria',
    tags: ['galeria', 'fotos antiguas', 'archivo', 'fotografias', 'imagenes historicas'],
    resolve: async () => {
      const bloques = await contenidoService.bySeccion('galeria_ferrocarril');
      if (!bloques.length) return r('La galería está en curaduría; pronto publicaremos nuevas piezas.');
      return r(
        `La Galería Ferrocarril reúne ${bloques.length} pieza(s) del archivo histórico.`,
        [itemRuta('Ver galería', 'Archivo fotográfico del tren', '/galeria')],
      );
    },
  },

  /* ══════════════════════════ 7. NOTICIAS ══════════════════════════ */

  {
    id: 'noticias.ultimas',
    tags: ['noticia', 'noticias', 'novedad', 'novedades', 'prensa', 'comunicado', 'convocatoria', 'ultima hora'],
    resolve: async () => {
      const noticias = await noticiasService.latest(3);
      if (!noticias.length) return r('No hay noticias recientes publicadas.');
      return r('Últimas noticias:', noticias.map(itemNoticia));
    },
  },

  {
    id: 'noticias.especifica',
    tags: ['sobre la noticia', 'mas informacion', 'leer nota', 'detalle de la noticia'],
    resolve: async (ctx) => {
      const noticias = await noticiasService.list();
      const match = mejorCoincidencia(noticias, ctx.tokens, ['titulo', 'resumen', 'contenido']);
      if (!match) return null;
      return r(
        `${match.titulo}. ${resumirTexto(match.contenido, 1)}`,
        [itemNoticia(match)],
      );
    },
  },

  /* ══════════════════════════ 8. CLIMA ══════════════════════════ */

  {
    id: 'clima.aire_libre',
    tags: ['va a llover', 'llovera', 'clima manana', 'pronostico', 'lluvia', 'tiempo', 'clima del fin de semana'],
    regex: /(llover|lluvia|clima|pronostico|tiempo).*(manana|hoy|fin de semana|sabado|domingo)/i,
    resolve: async () => {
      const { diario } = await weatherService.forecast({ days: 3 });
      const dia = diario[0];
      const eval_ = weatherService.evaluarAireLibre(dia);
      return r(`${dia.texto}, ${dia.max}°C máx., ${dia.lluvia}% de lluvia. ${eval_.mensaje}`);
    },
  },

  {
    id: 'clima.hoy',
    tags: ['clima', 'temperatura', 'calor', 'frio', 'tiempo de hoy', 'que temperatura hace'],
    resolve: async () => {
      const { actual } = await weatherService.forecast();
      return r(`Ahora en Orotina: ${actual.texto}, ${actual.temperatura}°C, ${actual.humedad}% humedad.`);
    },
  },

  /* ══════════════════════════ 9. SISTEMA / UI ══════════════════════════ */

  {
    id: 'sistema.accesibilidad',
    tags: ['accesibilidad del sitio', 'accesible el sitio', 'wcag', 'lector de pantalla', 'braille', 'accesible la web'],
    resolve: async () =>
      r('La plataforma cumple WCAG 2.1 AA: tema claro/oscuro, tamaño de texto ajustable, HTML semántico con ARIA y estados con ícono+texto.'),
  },

  {
    id: 'sistema.tema',
    tags: ['modo oscuro', 'dark mode', 'tema oscuro', 'tema claro', 'cambiar tema', 'colores del sitio'],
    resolve: async () => r('Usa el selector de tema en la barra superior (Claro / Oscuro).'),
  },

  {
    id: 'sistema.tamano',
    tags: ['tamano de texto', 'letra mas grande', 'agrandar letra', 'zoom', 'tipografia', 'texto pequeno'],
    resolve: async () => r('Ajusta el tamaño del texto con el control "A" en la barra superior. Hay 4 niveles disponibles.'),
  },

  {
    id: 'sistema.idioma',
    tags: ['idioma', 'language', 'ingles', 'espanol', 'traducir'],
    resolve: async () => r('La plataforma está disponible únicamente en español.'),
  },

  /* ══════════════════════════ 10. INFORMACIÓN GENERAL ══════════════════════════ */

  {
    id: 'general.horario',
    tags: ['horario', 'horarios', 'abierto', 'abren', 'cierran', 'atienden', 'a que hora', 'cuando abren'],
    resolve: async () => r('Abrimos de martes a domingo, de 9:00 a. m. a 8:00 p. m. Cerrado los lunes.'),
  },

  {
    id: 'general.ubicacion',
    tags: ['ubicacion', 'donde queda', 'donde estan', 'direccion', 'como llegar', 'mapa', 'llegar', 'donde es'],
    resolve: async () =>
      r(
        'Estamos en el antiguo complejo del Ferrocarril al Pacífico, costado este del Parque de Orotina, Alajuela.',
        [itemRuta('Ver espacios', 'Mapa y detalles de cada sala', '/espacios')],
      ),
  },

  {
    id: 'general.contacto',
    tags: ['contacto', 'telefono', 'correo', 'email', 'whatsapp', 'comunicarme', 'escribir', 'llamar'],
    resolve: async () => r('Tel: +506 2412 0000 · Correo: info@caco.orotina.cr'),
  },

  {
    id: 'general.estacionamiento',
    tags: ['parqueo', 'estacionamiento', 'donde parquear', 'carro', 'vehiculo', 'parking'],
    resolve: async () => r('Hay parqueo gratuito sobre la calle lateral del antiguo complejo ferroviario (30 espacios).'),
  },

  {
    id: 'general.pago',
    tags: ['pago', 'pagar', 'formas de pago', 'tarjeta', 'efectivo', 'sinpe', 'transferencia', 'como se paga'],
    resolve: async () => r('Aceptamos efectivo, tarjeta y SINPE Móvil. Los pagos se realizan presencialmente en recepción.'),
  },

  {
    id: 'general.wifi',
    tags: ['wifi', 'internet', 'conexion', 'red inalambrica'],
    resolve: async () => r('Hay WiFi gratuito "CACO-Visitantes" en todas las áreas comunes del centro.'),
  },

  {
    id: 'general.mascotas',
    tags: ['mascota', 'perro', 'gato', 'animal', 'puedo llevar mi perro'],
    resolve: async () => r('Se permiten mascotas guía y de asistencia. Otras mascotas solo en la Explanada del Ferrocarril.'),
  },

  {
    id: 'general.comida',
    tags: ['comida', 'cafeteria', 'restaurante', 'comer', 'bebida', 'refrigerio'],
    resolve: async () => r('Hay una cafetería interna abierta de martes a domingo, de 10 a. m. a 7 p. m.'),
  },

  {
    id: 'general.fotografia',
    tags: ['fotografia', 'tomar fotos', 'camara', 'grabar', 'video'],
    resolve: async () => r('Se permite fotografiar sin flash en exposiciones. Para grabaciones profesionales se requiere autorización escrita.'),
  },

  /* ══════════════════════════ 11. SOCIAL ══════════════════════════ */

  {
    id: 'social.saludo',
    tags: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'que tal', 'saludos'],
    resolve: async () => r('¡Hola! Soy el Asistente Cultural. ¿Qué te gustaría saber del Centro?'),
  },

  {
    id: 'social.ayuda',
    tags: ['que puedes hacer', 'ayuda', 'ayudame', 'opciones', 'menu', 'temas', 'en que me puedes ayudar'],
    resolve: async () =>
      r('Puedo ayudarte con: eventos, espacios, reservas, boletos, cuenta, historia, noticias, clima y accesibilidad. ¿Sobre cuál quieres saber?'),
  },

  {
    id: 'social.gracias',
    tags: ['gracias', 'gracias totales', 'muchas gracias', 'te agradezco', 'perfecto', 'excelente'],
    resolve: async () => r('¡Con gusto! Si necesitas algo más, aquí estoy.'),
  },

  {
    id: 'social.despedida',
    tags: ['adios', 'chao', 'hasta luego', 'nos vemos', 'bye'],
    resolve: async () => r('¡Hasta pronto! Recuerda que puedes consultarme cuando quieras.'),
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                            MOTOR DE SCORING                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

const puntuar = (intent, mensaje, normalized, tokens) => {
  let score = 0;

  for (const tag of intent.tags) {
    const tagN = normalizar(tag);
    if (!tagN) continue;
    if (normalized.includes(tagN)) score += tagN.includes(' ') ? 5 : 3;
    if (tokens.includes(tagN)) score += 2;
  }

  if (intent.regex?.test(mensaje)) score += 6;

  // Bonus por especificidad: intents con más tags ganan empates
  score += intent.tags.length * 0.1;

  return score;
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                          SERVICIO PÚBLICO EXPORTADO                        */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const aiService = {

  /* ── Resumen IA para noticias ─────────────────────────────────────── */
  async resumirNoticia(noticia, maxOraciones = 2) {
    if (!noticia) return '';
    return resumirTexto(noticia.contenido || noticia.resumen || '', maxOraciones);
  },

  /* ── Recomendador por afinidad ────────────────────────────────────── */
  async recomendar({ usuarioId, categoriasPreferidas = [], limite = 3 } = {}) {
    const eventos = await eventosService.listPublicados();

    let historial = [];
    if (usuarioId) {
      const boletos = await boletosService.listByUsuario(usuarioId);
      const ids = boletos.map((b) => b.eventoId);
      historial = eventos.filter((e) => ids.includes(e.id)).map((e) => e.categoria);
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

  /* ── Chat conversacional ──────────────────────────────────────────── */
  async chat(mensaje, { historial = [] } = {}) {
    if (!mensaje?.trim()) return r('¿En qué puedo ayudarte?');

    // 1) Endpoint IA externo (opcional)
    if (AI_ENDPOINT) {
      try {
        const res = await fetch(`${AI_ENDPOINT}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje, historial }),
        });
        if (res.ok) return res.json();
      } catch { /* fallback local */ }
    }

    // 2) Normalizar y puntuar todos los intents
    const normalized = normalizar(mensaje);
    const tokens = tokenize(mensaje);

    const ranked = INTENTS
      .map((intent) => ({ intent, score: puntuar(intent, mensaje, normalized, tokens) }))
      .sort((a, b) => b.score - a.score);

    const mejor = ranked[0];

    // 3) Si hay match suficientemente bueno, resolver
    if (mejor && mejor.score >= 3) {
      try {
        const out = await mejor.intent.resolve({ mensaje, normalized, tokens });
        if (out) return { ...out, intent: mejor.intent.id };
      } catch {
        return r('No pude consultar los datos en este momento. Intenta de nuevo.');
      }
    }

    // 4) Fallback: sugerir los 3 temas más probables por relevancia
    const sugerencias = ranked.slice(0, 3).map(({ intent }) => ({
      tipo: 'ruta',
      titulo: intent.id.split('.').slice(-1)[0].replace(/_/g, ' '),
      meta: intent.tags.slice(0, 3).join(' · '),
      ruta: '#',
    }));

    return r(
      'No estoy seguro de haber entendido. Puedo ayudarte con: eventos, espacios, reservas, boletos, cuenta, historia, noticias, clima o accesibilidad. ¿Cuál te interesa?',
      sugerencias,
    );
  },

  /* ── Utilidad de depuración (opcional) ────────────────────────────── */
  _intents: INTENTS,
  _normalizar: normalizar,
};

export default aiService;