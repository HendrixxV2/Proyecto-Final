import { aiService, resumirTexto } from '@/Services/aiService';
import { api } from '@/Services/api';
import { reportesService } from '@/Services/reportesService';

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
});