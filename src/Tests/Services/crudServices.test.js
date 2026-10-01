import { api } from '@/Services/api';
import { contenidoService } from '@/Services/contenidoService';
import { espaciosService } from '@/Services/espaciosService';
import { eventosService } from '@/Services/eventosService';
import { noticiasService } from '@/Services/noticiasService';
import { usuariosService } from '@/Services/usuariosService';

jest.mock('@/Services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('CRUD services', () => {
  beforeEach(() => jest.clearAllMocks());

  it('delegates content listing, section filtering, and mutations', async () => {
    const data = { titulo: 'Taller' };

    await contenidoService.list();
    await contenidoService.bySeccion('historia');
    await contenidoService.create(data);
    await contenidoService.update(3, data);
    await contenidoService.remove(3);

    expect(api.get).toHaveBeenNthCalledWith(1, '/contenido?_sort=orden');
    expect(api.get).toHaveBeenNthCalledWith(2, '/contenido?seccion=historia&_sort=orden');
    expect(api.post).toHaveBeenCalledWith('/contenido', data);
    expect(api.put).toHaveBeenCalledWith('/contenido/3', data);
    expect(api.delete).toHaveBeenCalledWith('/contenido/3');
  });

  it('delegates space operations and encodes optional query parameters', async () => {
    const data = { nombre: 'Salón principal' };

    await espaciosService.list({ capacidad: 20, disponible: true });
    await espaciosService.list();
    await espaciosService.getById(4);
    await espaciosService.create(data);
    await espaciosService.update(4, data);
    await espaciosService.remove(4);

    expect(api.get).toHaveBeenNthCalledWith(1, '/espacios?capacidad=20&disponible=true');
    expect(api.get).toHaveBeenNthCalledWith(2, '/espacios');
    expect(api.get).toHaveBeenNthCalledWith(3, '/espacios/4');
    expect(api.post).toHaveBeenCalledWith('/espacios', data);
    expect(api.put).toHaveBeenCalledWith('/espacios/4', data);
    expect(api.delete).toHaveBeenCalledWith('/espacios/4');
  });

  it('delegates event queries and mutations', async () => {
    const data = { titulo: 'Concierto' };

    await eventosService.list({ publicado: true });
    await eventosService.list();
    await eventosService.listPublicados();
    await eventosService.getById(7);
    await eventosService.create(data);
    await eventosService.update(7, data);
    await eventosService.remove(7);

    expect(api.get).toHaveBeenNthCalledWith(1, '/eventos?publicado=true');
    expect(api.get).toHaveBeenNthCalledWith(2, '/eventos');
    expect(api.get).toHaveBeenNthCalledWith(3, '/eventos?publicado=true');
    expect(api.get).toHaveBeenNthCalledWith(4, '/eventos/7');
    expect(api.post).toHaveBeenCalledWith('/eventos', data);
    expect(api.put).toHaveBeenCalledWith('/eventos/7', data);
    expect(api.delete).toHaveBeenCalledWith('/eventos/7');
  });

  it('delegates news queries, limits, and mutations', async () => {
    const data = { titulo: 'Anuncio' };

    await noticiasService.list({ categoria: 'cultura' });
    await noticiasService.list();
    await noticiasService.latest();
    await noticiasService.latest(5);
    await noticiasService.getById(8);
    await noticiasService.create(data);
    await noticiasService.update(8, data);
    await noticiasService.remove(8);

    expect(api.get).toHaveBeenNthCalledWith(1, '/noticias?categoria=cultura');
    expect(api.get).toHaveBeenNthCalledWith(2, '/noticias');
    expect(api.get).toHaveBeenNthCalledWith(3, '/noticias?_sort=fecha&_order=desc&_limit=3');
    expect(api.get).toHaveBeenNthCalledWith(4, '/noticias?_sort=fecha&_order=desc&_limit=5');
    expect(api.get).toHaveBeenNthCalledWith(5, '/noticias/8');
    expect(api.post).toHaveBeenCalledWith('/noticias', data);
    expect(api.put).toHaveBeenCalledWith('/noticias/8', data);
    expect(api.delete).toHaveBeenCalledWith('/noticias/8');
  });

  it('delegates user listing, retrieval, and mutations', async () => {
    const data = { nombre: 'Ana' };

    await usuariosService.list();
    await usuariosService.getById(2);
    await usuariosService.create(data);
    await usuariosService.update(2, data);
    await usuariosService.remove(2);

    expect(api.get).toHaveBeenNthCalledWith(1, '/usuarios');
    expect(api.get).toHaveBeenNthCalledWith(2, '/usuarios/2');
    expect(api.post).toHaveBeenCalledWith('/usuarios', data);
    expect(api.put).toHaveBeenCalledWith('/usuarios/2', data);
    expect(api.delete).toHaveBeenCalledWith('/usuarios/2');
  });
});