import CrudManager from '@/Components/Admin/CrudManager';
import { usuariosService } from '@/Services/usuariosService';
import Badge from '@/Components/UI/Badge';
import { ROLES, ROL_LABEL } from '@/Utils/constants';
import { formatFecha } from '@/Utils/format';
import { required, email, min } from '@/Utils/validators';

export default function UsuariosAdmin() {
  return (
    <CrudManager
      titulo="Usuarios"
      descripcion="Administra las cuentas y los roles de acceso a la plataforma."
      service={usuariosService}
      searchKeys={['nombre', 'email', 'rol']}
      columns={[
        { key: 'nombre', label: 'Nombre' },
        { key: 'email', label: 'Correo' },
        {
          key: 'rol',
          label: 'Rol',
          render: (r) => <Badge tone={r.rol === ROLES.ADMIN ? 'danger' : 'info'}>{ROL_LABEL[r.rol] ?? r.rol}</Badge>,
        },
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