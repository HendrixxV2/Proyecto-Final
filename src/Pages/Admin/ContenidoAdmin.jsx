import CrudManager from '@/Components/Admin/CrudManager';
import { contenidoService } from '@/Services/contenidoService';
import Badge from '@/Components/UI/Badge';
import { required, min } from '@/Utils/validators';

const SECCIONES = ['historia', 'galeria_ferrocarril', 'teatro', 'baile', 'canto'];

export default function ContenidoAdmin() {
  return (
    <CrudManager
      titulo="Contenido histórico-cultural"
      descripcion="Gestiona los bloques de historia, galería y programas artísticos."
      service={contenidoService}
      searchKeys={['titulo', 'seccion']}
      columns={[
        { key: 'seccion', label: 'Sección', render: (r) => <Badge tone="info">{r.seccion.replace('_', ' ')}</Badge> },
        { key: 'titulo', label: 'Título' },
        { key: 'orden', label: 'Orden', align: 'right' },
      ]}
      fields={[
        { name: 'seccion', label: 'Sección', type: 'select', required: true, options: SECCIONES.map((s) => ({ value: s, label: s.replace('_', ' ') })), rules: [required()] },
        { name: 'titulo', label: 'Título', required: true, rules: [required(), min(4, 'Mínimo 4 caracteres.')] },
        { name: 'cuerpo', label: 'Contenido', type: 'textarea', required: true, fullWidth: true, rows: 6, rules: [required(), min(20, 'Mínimo 20 caracteres.')] },
        { name: 'imagen', label: 'Ruta de imagen', placeholder: '/assets/contenido/imagen.jpg' },
        { name: 'orden', label: 'Orden', type: 'number', default: 1 },
      ]}
    />
  );
}