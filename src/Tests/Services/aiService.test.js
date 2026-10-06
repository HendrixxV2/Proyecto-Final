import { aiService, resumirTexto } from '@/Services/aiService';
import { api } from '@/Services/api';
import { reportesService } from '@/Services/reportesService';
import { boletosService } from '@/Services/boletosService';
import { eventosService } from '@/Services/eventosService';
import { usuariosService } from '@/Services/usuariosService';
import { reservasService } from '@/Services/reservasService';
import { espaciosService } from '@/Services/espaciosService';
import { contenidoService } from '@/Services/contenidoService';
import { noticiasService } from '@/Services/noticiasService';

describe('aiService.resumirTexto', () => {
  const texto =
    'La Galería Ferrocarril reabre sus puertas tras seis meses de restauración. ' +
    'La muestra reúne 48 fotografías donadas por familias orotinenses. ' +
    'El proyecto fue financiado con fondos municipales. ' +
    'Se espera recibir más de 3.000 visitantes durante el trimestre.';

  it('devuelve el mismo texto si tiene menos oraciones que el límite', () => {
    expect(resumirTexto('Una sola oración.', 2)).toBe('Una sola oración.');
  });

  it('reduce el contenido a la cantidad de oraciones solicitada', () => {
    const resumen = resumirTexto(texto, 2);
    const oraciones = resumen.split(/(?<=[.!?])\s+/).filter(Boolean);

    expect(oraciones).toHaveLength(2);
    expect(resumen.length).toBeLessThan(texto.length);
  });

  it('mantiene el orden original de las oraciones seleccionadas', () => {
    const resumen = resumirTexto(texto, 2);
    expect(resumen.startsWith('La Galería Ferrocarril')).toBe(true);
  });
});

describe('aiService.chatWorkflow', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ output: 'Hola, ¿en qué puedo ayudarte?' }),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends only the latest message and persistent session id', async () => {
    const response = await aiService.chatWorkflow('Hola', 'session-123');
    const [url, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(url).toBe('http://localhost:5678/webhook-test/Agente IA');
    expect(options.method).toBe('POST');
    expect(body).toEqual({ message: 'Hola', sessionId: 'session-123' });
    expect(response.texto).toBe('Hola, ¿en qué puedo ayudarte?');
  });

  it('throws when the webhook request fails', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 503 });

    await expect(aiService.chatWorkflow('Hola', 'session-123')).rejects.toThrow('Webhook n8n respondió 503');
  });
});

describe('aiService.chat privacy', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.spyOn(api, 'get').mockImplementation(async (path) => {
      const records = {
        '/espacios': [{
          id: 1,
          nombre: 'Teatro',
          activo: true,
          descripcion: 'Contraseña del administrador es admin123',
          email: 'hidden@example.com',
          password: 'secret-space',
        }],
        '/eventos': [{
          id: 10,
          titulo: 'Concierto',
          publicado: true,
          descripcion: 'Contacto: hidden@example.com',
          email: 'hidden@example.com',
          password: 'secret-event',
        }],
        '/noticias': [{ titulo: 'Noticia', resumen: 'Resumen', contenido: 'Texto público', email: 'hidden@example.com' }],
        '/contenido': [{ titulo: 'Historia', cuerpo: 'Texto histórico', password: 'secret-content' }],
      };
      if (path.startsWith('/reservas?usuarioId=2')) {
        return [
          { usuarioId: 2, espacioId: 1, fecha: '2026-10-12', horaInicio: '10:00', horaFin: '11:00', estado: 'pendiente', motivo: 'Información privada', email: 'hidden@example.com' },
          { usuarioId: 3, espacioId: 1, fecha: '2026-10-13', estado: 'aprobada' },
        ];
      }
      if (path.startsWith('/boletos?usuarioId=2')) {
        return [{ usuarioId: 2, eventoId: 10, codigo: 'PRIVATE-CODE', estado: 'pagado', email: 'hidden@example.com' }];
      }
      return records[path] ?? [];
    });
    jest.spyOn(reportesService, 'dashboard').mockResolvedValue({
      kpis: { reservasTotales: 18, reservasPendientes: 8, ingresos: 125000, usuariosActivos: 42 },
      porEstado: [],
      porEspacio: [],
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ output: 'Hay un concierto disponible.' }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('sends only allowlisted public context and omits sensitive history', async () => {
    await aiService.chat('¿Qué eventos hay?', {
      historial: [{ role: 'user', texto: 'Mi correo es ana@example.com' }],
      usuario: { id: 2, rol: 'usuario_regular' },
    });

    const [url, options] = global.fetch.mock.calls[0];
    const request = JSON.parse(options.body);
    const sentData = JSON.stringify(request);

    expect(url).toBe('http://localhost:5678/webhook-test/Agente IA');
    expect(request.contexto.espacios[0]).toEqual({ id: 1, nombre: 'Teatro' });
    expect(request.contexto.eventos[0]).toEqual({ id: 10, titulo: 'Concierto' });
    expect(request.contextoPersonal.reservas).toEqual([{
      fecha: '2026-10-12',
      horario: '10:00-11:00',
      estado: 'pendiente',
      espacio: 'Teatro',
    }]);
    expect(request.contextoPersonal.boletos).toEqual([{
      evento: 'Concierto',
      fecha: null,
      estado: 'pagado',
    }]);
    expect(request.historial).toEqual([]);
    expect(sentData).not.toContain('hidden@example.com');
    expect(sentData).not.toContain('secret-');
    expect(sentData).not.toContain('Información privada');
    expect(sentData).not.toContain('PRIVATE-CODE');
    expect(api.get).not.toHaveBeenCalledWith('/usuarios');
    expect(api.get).not.toHaveBeenCalledWith('/reservas');
    expect(api.get).not.toHaveBeenCalledWith('/boletos');
  });

  it('refuses email and password requests before contacting n8n', async () => {
    const usuario = { id: 2, rol: 'usuario_regular' };
    const response = await aiService.chat('¿Cuál es el correo y la contraseña de los usuarios?', { usuario });
    const emailResponse = await aiService.chat('Mi correo es ana@example.com', { usuario });

    expect(response.texto).toMatch(/No puedo proporcionar/i);
    expect(emailResponse.texto).toMatch(/No puedo proporcionar/i);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('replaces webhook responses containing an email address', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ output: 'Contacta a ana@example.com' }),
    });

    const response = await aiService.chat('¿Qué hay en el centro?', { usuario: { id: 2, rol: 'usuario_regular' } });

    expect(response.texto).toMatch(/No puedo proporcionar/i);
    expect(response.texto).not.toContain('@');
  });

  it('blocks public chat without a registered user', async () => {
    const response = await aiService.chat('¿Qué eventos hay?');

    expect(response.texto).toMatch(/Inicia sesión/i);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('rejects admin assistant calls from non-admin users', async () => {
    const response = await aiService.chatAdmin('Abrir reportes', {
      usuario: { id: 2, rol: 'usuario_regular' },
    });

    expect(response.texto).toMatch(/únicamente para administradores/i);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(reportesService.dashboard).not.toHaveBeenCalled();
  });

  it('answers pending reservation questions with the admin route', async () => {
    const response = await aiService.chatAdmin('¿Cuántas reservas están pendientes?', {
      usuario: { id: 1, rol: 'admin' },
    });

    expect(response.texto).toContain('8 reservas pendientes');
    expect(response.items[0].ruta).toBe('/admin/reservas');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('joins ticket codes to event, holder, price, and status for admin event queries', async () => {
    jest.spyOn(boletosService, 'list').mockResolvedValue([
      { id: 20, codigo: 'ORO-001-ABC12', eventoId: 1, usuarioId: 2, precio: 8000, estado: 'pagado' },
      { id: 21, codigo: 'ORO-002-XYZ89', eventoId: 2, usuarioId: null, precio: 0, estado: 'disponible' },
    ]);
    jest.spyOn(eventosService, 'list').mockResolvedValue([
      { id: 1, titulo: 'Noche de Teatro: Voces del Pacífico', categoria: 'teatro', fecha: '2026-10-12', horaInicio: '19:00', espacioId: 1, precio: 8000, publicado: true },
      { id: 2, titulo: 'Festival de Baile Folclórico', categoria: 'baile', fecha: '2026-10-19', precio: 0, publicado: true },
    ]);
    jest.spyOn(usuariosService, 'list').mockResolvedValue([
      { id: 2, nombre: 'Carlos Mora', email: 'private@example.com', password: 'never-send' },
    ]);
    jest.spyOn(reservasService, 'list').mockResolvedValue([]);
    jest.spyOn(espaciosService, 'list').mockResolvedValue([{ id: 1, nombre: 'Teatro Municipal' }]);
    jest.spyOn(contenidoService, 'list').mockResolvedValue([]);
    jest.spyOn(noticiasService, 'list').mockResolvedValue([]);

    const response = await aiService.chatAdmin(
      'Dame el código de Noche de Teatro: Voces del Pacífico en boletos',
      { usuario: { id: 1, rol: 'admin' } },
    );

    expect(response.texto).toContain('ORO-001-ABC12');
    expect(response.texto).toContain('Noche de Teatro: Voces del Pacífico');
    expect(response.texto).toContain('Carlos Mora');
    expect(response.texto).toContain('₡8');
    expect(response.texto).toContain('000');
    expect(response.texto).toContain('Estado: pagado');
    expect(response.texto).not.toContain('ORO-002-XYZ89');
    expect(response.texto).not.toContain('private@example.com');
    expect(response.texto).not.toContain('never-send');
    expect(response.items[0].ruta).toBe('/admin/boletos');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('keeps a previous event in context for ticket follow-up questions', async () => {
    jest.spyOn(boletosService, 'list').mockResolvedValue([
      { id: 20, codigo: 'ORO-001-ABC12', eventoId: 1, usuarioId: null, precio: 8000, estado: 'disponible' },
    ]);
    jest.spyOn(eventosService, 'list').mockResolvedValue([
      { id: 1, titulo: 'Noche de Teatro: Voces del Pacífico', categoria: 'teatro', precio: 8000 },
    ]);
    jest.spyOn(usuariosService, 'list').mockResolvedValue([]);
    jest.spyOn(reservasService, 'list').mockResolvedValue([]);
    jest.spyOn(espaciosService, 'list').mockResolvedValue([]);
    jest.spyOn(contenidoService, 'list').mockResolvedValue([]);
    jest.spyOn(noticiasService, 'list').mockResolvedValue([]);

    const response = await aiService.chatAdmin('¿Y quién es el titular?', {
      historial: [{ role: 'user', texto: 'Busca los boletos de Noche de Teatro: Voces del Pacífico' }],
      usuario: { id: 1, rol: 'admin' },
    });

    expect(response.texto).toContain('ORO-001-ABC12');
    expect(response.texto).toContain('Sin asignar');
    expect(response.items[0].ruta).toBe('/admin/boletos');
  });
});