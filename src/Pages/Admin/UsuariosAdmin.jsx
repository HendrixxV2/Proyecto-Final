import CrudManager from '@/Components/Admin/CrudManager';
import { usuariosService } from '@/Services/usuariosService';
import { reservasService } from '@/Services/reservasService';
import Badge from '@/Components/UI/Badge';
import { ROLES, ROL_LABEL } from '@/Utils/constants';
import { formatFecha } from '@/Utils/format';
import { required, email, min } from '@/Utils/validators';

const usuariosConReservasService = {
  list: async () => {
    const [usuarios, reservas] = await Promise.all([
      usuariosService.list(),
      reservasService.list(),
    ]);

    const usuariosConReservas = usuarios
      .filter((usuario) => usuario.rol !== ROLES.ADMIN)
      .map((usuario) => {
        const solicitudes = reservas.filter((reserva) => reserva.usuarioId === usuario.id);
        return {
          ...usuario,
          solicitudes: solicitudes.length,
          reservasActivas: solicitudes.filter((reserva) => reserva.estado === 'pendiente' || reserva.estado === 'aprobada').length,
        };
      })
      .filter((usuario) => usuario.solicitudes > 0);

    return usuariosConReservas;
  },
  getById: usuariosService.getById,
  create: usuariosService.create,
  update: usuariosService.update,
  remove: usuariosService.remove,
};

export default function UsuariosAdmin() {
  return (
    <CrudManager
      titulo="Usuarios con reservas y solicitudes"
      descripcion="Revisa los perfiles que están haciendo reservas o requieren seguimiento."
      service={usuariosConReservasService}
      searchKeys={['nombre', 'email', 'rol', 'solicitudes']}
      createLabel="Nuevo administrador"
      createDefaults={{ rol: ROLES.ADMIN }}
      columns={[
        { key: 'nombre', label: 'Nombre' },
        { key: 'email', label: 'Correo' },
        {
          key: 'rol',
          label: 'Rol',
          render: (r) => <Badge tone={r.rol === ROLES.ADMIN ? 'danger' : 'info'}>{ROL_LABEL[r.rol] ?? r.rol}</Badge>,
        },
        { key: 'solicitudes', label: 'Solicitudes' },
        { key: 'reservasActivas', label: 'Activas' },
        { key: 'creadoEn', label: 'Registro', render: (r) => formatFecha(r.creadoEn, 'dd/MM/yyyy') },
      ]}
      fields={[
        { name: 'nombre', label: 'Nombre completo', required: true, fullWidth: true, rules: [required(), min(3, 'Mínimo 3 caracteres.')] },
        { name: 'email', label: 'Correo electrónico', type: 'email', required: true, rules: [required(), email()] },
        { name: 'password', label: 'Contraseña', required: true, rules: [required(), min(6, 'Mínimo 6 caracteres.')] },
        {
          name: 'rol',
          label: 'Rol',
          type: 'select',
          required: true,
          options: Object.values(ROLES).map((r) => ({ value: r, label: ROL_LABEL[r] })),
          rules: [required()],
        },
      ]}
    />
  );
}