import CrudManager from '@/Components/Admin/CrudManager';
import { eventosService } from '@/Services/eventosService';
import Badge from '@/Components/UI/Badge';
import { CATEGORIAS_EVENTO } from '@/Utils/constants';
import { formatColones, formatFecha } from '@/Utils/format';
import { required, min } from '@/Utils/validators';

export default function EventosAdmin() {
  return (
    <CrudManager
      titulo="Eventos"
      descripcion="Publica y administra la cartelera cultural del centro."
      service={eventosService}
      searchKeys={['titulo', 'categoria']}
      columns={[
        { key: 'titulo', label: 'Título' },
        { key: 'categoria', label: 'Categoría', render: (r) => <Badge tone="info">{r.categoria}</Badge> },
        { key: 'fecha', label: 'Fecha', render: (r) => formatFecha(r.fecha, 'dd/MM/yyyy') },
        { key: 'horaInicio', label: 'Hora' },
        { key: 'precio', label: 'Entrada', align: 'right', render: (r) => (r.precio > 0 ? formatColones(r.precio) : 'Gratuita') },
        { key: 'publicado', label: 'Publicado', render: (r) => <Badge tone={r.publicado ? 'success' : 'neutral'}>{r.publicado ? 'Sí' : 'Borrador'}</Badge> },
      ]}
      fields={[
        { name: 'titulo', label: 'Título', required: true, fullWidth: true, rules: [required('El título es obligatorio.'), min(5, 'Mínimo 5 caracteres.')] },
        { name: 'categoria', label: 'Categoría', type: 'select', required: true, options: CATEGORIAS_EVENTO.map((c) => ({ value: c, label: c })), rules: [required()] },
        { name: 'espacioId', label: 'Espacio (ID)', type: 'number', required: true, rules: [required()] },
        { name: 'fecha', label: 'Fecha', type: 'date', required: true, rules: [required()] },
        { name: 'horaInicio', label: 'Hora inicio', type: 'time', required: true, rules: [required()] },
        { name: 'horaFin', label: 'Hora fin', type: 'time', required: true, rules: [required()] },
        { name: 'aforo', label: 'Aforo', type: 'number', required: true, rules: [required()] },
        { name: 'precio', label: 'Precio (₡)', type: 'number', default: 0 },
        { name: 'descripcion', label: 'Descripción', type: 'textarea', fullWidth: true, rows: 3 },
        { name: 'publicado', label: 'Publicar en el sitio', type: 'checkbox', default: true },
      ]}
    />
  );
}