import { reservasService } from './reservasService';
import { boletosService } from './boletosService';
import { espaciosService } from './espaciosService';
import { usuariosService } from './usuariosService';

export const reportesService = {
  async dashboard() {
    const [reservas, boletos, espacios, usuarios] = await Promise.all([
      reservasService.list(),
      boletosService.list(),
      espaciosService.list(),
      usuariosService.list(),
    ]);

    const ingresos = boletos
      .filter((b) => b.estado === 'pagado')
      .reduce((acc, b) => acc + Number(b.precio || 0), 0);

    const porEspacio = espacios.map((e) => ({
      nombre: e.nombre.length > 22 ? `${e.nombre.slice(0, 22)}…` : e.nombre,
      reservas: reservas.filter((r) => r.espacioId === e.id).length,
    }));

    const porEstado = ['pendiente', 'aprobada', 'rechazada', 'cancelada'].map((estado) => ({
      estado,
      total: reservas.filter((r) => r.estado === estado).length,
    }));

    return {
      kpis: {
        reservasTotales: reservas.length,
        reservasPendientes: reservas.filter((r) => r.estado === 'pendiente').length,
        ingresos,
        usuariosActivos: usuarios.length,
      },
      porEspacio,
      porEstado,
    };
  },
};