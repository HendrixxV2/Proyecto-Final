import CrudManager from '@/Components/Admin/CrudManager';
import { espaciosService } from '@/Services/espaciosService';
import Badge from '@/Components/UI/Badge';
import { formatColones } from '@/Utils/format';
import { required, min } from '@/Utils/validators';

const TIPOS = ['teatro', 'danza', 'galeria', 'taller', 'aire_libre', 'multiuso'];

export default function EspaciosAdmin() {
  return (
    <CrudManager
      titulo="Espacios"
      descripcion="Gestiona salas, galerías y explanadas del centro."
      service={espaciosService}
      searchKeys={['nombre', 'tipo', 'ubicacion']}
      columns={[
        { key: 'nombre', label: 'Nombre' },
        { key: 'tipo', label: 'Tipo', render: (r) => <Badge tone="info">{r.tipo}</Badge> },
        { key: 'capacidad', label: 'Capacidad', align: 'right' },
        { key: 'precioHora', label: 'Tarifa/hora', align: 'right', render: (r) => formatColones(r.precioHora) },
        { key: 'activo', label: 'Estado', render: (r) => <Badge tone={r.activo ? 'success' : 'danger'}>{r.activo ? 'Activo' : 'Inactivo'}</Badge> },
      ]}
      fields={[
        { name: 'nombre', label: 'Nombre', required: true, fullWidth: true, rules: [required('El nombre es obligatorio.'), min(4, 'Mínimo 4 caracteres.')] },
        { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: TIPOS.map((t) => ({ value: t, label: t })), rules: [required('Selecciona un tipo.')] },
        { name: 'capacidad', label: 'Capacidad', type: 'number', required: true, min: 1, rules: [required('Indica la capacidad.')] },
        { name: 'precioHora', label: 'Tarifa por hora (₡)', type: 'number', required: true, rules: [required('Indica la tarifa.')] },
        { name: 'ubicacion', label: 'Ubicación', required: true, fullWidth: true, rules: [required('Indica la ubicación.')] },
        { name: 'descripcion', label: 'Descripción', type: 'textarea', fullWidth: true, rows: 3 },
        { name: 'accesible', label: 'Espacio accesible', type: 'checkbox', default: true },
        { name: 'activo', label: 'Disponible para reservas', type: 'checkbox', default: true },
      ]}
    />
  );
}