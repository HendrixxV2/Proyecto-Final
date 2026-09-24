import { Check, X } from 'lucide-react';
import CrudManager from '@/Components/Admin/CrudManager';
import { reservasService } from '@/Services/reservasService';
import { espaciosService } from '@/Services/espaciosService';
import { usuariosService } from '@/Services/usuariosService';
import { useFetch } from '@/Hooks/useFetch';
import { useToast } from '@/Hooks/useToast';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { BADGE_TONE_BY_ESTADO, ESTADOS_RESERVA } from '@/Utils/constants';
import { formatFecha, formatRangoHoras } from '@/Utils/format';
import { required, isFutureDate } from '@/Utils/validators';

export default function ReservasAdmin() {
  const toast = useToast();
  const { data: espacios } = useFetch(() => espaciosService.list(), []);
  const { data: usuarios } = useFetch(() => usuariosService.list(), []);

  const nombreEspacio = (id) => espacios?.find((e) => e.id === id)?.nombre ?? `Espacio #${id}`;
  const nombreUsuario = (id) => usuarios?.find((u) => u.id === id)?.nombre ?? `Usuario #${id}`;

  const accion = async (fn, id, mensaje) => {
    try {
      await fn(id);
      toast.success(mensaje);
      window.location.reload();
    } catch (err) {
      toast.error('No se pudo actualizar', err.message);
    }
  };

  return (
    <CrudManager
      titulo="Reservas"
      descripcion="Aprueba, rechaza o modifica las solicitudes de espacio."
      service={reservasService}
      searchKeys={['motivo', 'fecha', 'estado']}
      columns={[
        { key: 'espacioId', label: 'Espacio', render: (r) => nombreEspacio(r.espacioId) },
        { key: 'usuarioId', label: 'Solicitante', render: (r) => nombreUsuario(r.usuarioId) },
        { key: 'fecha', label: 'Fecha', render: (r) => formatFecha(r.fecha, 'dd/MM/yyyy') },
        { key: 'horaInicio', label: 'Horario', render: (r) => formatRangoHoras(r.horaInicio, r.horaFin) },
        { key: 'estado', label: 'Estado', render: (r) => <Badge tone={BADGE_TONE_BY_ESTADO[r.estado] ?? 'neutral'}>{r.estado}</Badge> },
      ]}
      fields={[
        { name: 'espacioId', label: 'Espacio (ID)', type: 'number', required: true, rules: [required()] },
        { name: 'usuarioId', label: 'Usuario (ID)', type: 'number', required: true, rules: [required()] },
        { name: 'fecha', label: 'Fecha', type: 'date', required: true, rules: [required(), (v) => (!isFutureDate(v) ? 'Fecha inválida.' : null)] },
        { name: 'horaInicio', label: 'Hora inicio', type: 'time', required: true, rules: [required()] },
        { name: 'horaFin', label: 'Hora fin', type: 'time', required: true, rules: [required()] },
        { name: 'estado', label: 'Estado', type: 'select', required: true, options: Object.values(ESTADOS_RESERVA).map((e) => ({ value: e, label: e })), rules: [required()] },
        { name: 'motivo', label: 'Motivo', type: 'textarea', fullWidth: true, rows: 3 },
      ]}
      extraActions={(row) =>
        row.estado === ESTADOS_RESERVA.PENDIENTE ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Aprobar reserva"
              className="text-green-600"
              onClick={() => accion(reservasService.aprobar, row.id, 'Reserva aprobada')}
            >
              <Check size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Rechazar reserva"
              className="text-red-600"
              onClick={() => accion(reservasService.rechazar, row.id, 'Reserva rechazada')}
            >
              <X size={16} />
            </Button>
          </>
        ) : null}
    />
  );
}