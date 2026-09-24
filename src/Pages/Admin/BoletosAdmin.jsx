import { useState } from 'react';
import { Plus } from 'lucide-react';
import CrudManager from '@/Components/Admin/CrudManager';
import Button from '@/Components/UI/Button';
import Modal from '@/Components/UI/Modal';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import { boletosService } from '@/Services/boletosService';
import { eventosService } from '@/Services/eventosService';
import { usuariosService } from '@/Services/usuariosService';
import { useFetch } from '@/Hooks/useFetch';
import { useToast } from '@/Hooks/useToast';
import Badge from '@/Components/UI/Badge';
import { BADGE_TONE_BY_ESTADO, ESTADOS_BOLETO } from '@/Utils/constants';
import { formatColones } from '@/Utils/format';
import { required } from '@/Utils/validators';

export default function BoletosAdmin() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ eventoId: '', cantidad: 10, precio: 0 });
  const [emitiendo, setEmitiendo] = useState(false);

  const { data: eventos } = useFetch(() => eventosService.list(), []);
  const { data: usuarios } = useFetch(() => usuariosService.list(), []);

  const nombreEvento = (id) => eventos?.find((e) => e.id === id)?.titulo ?? `Evento #${id}`;
  const nombreUsuario = (id) => usuarios?.find((u) => u.id === id)?.nombre ?? '—';

  const emitir = async () => {
    if (!form.eventoId) {
      toast.warning('Selecciona un evento', 'Debes indicar el evento para el que se emiten boletos.');
      return;
    }

    setEmitiendo(true);
    try {
      await Promise.all(
        Array.from({ length: Number(form.cantidad) }).map(() => boletosService.emitir(Number(form.eventoId), Number(form.precio))),
      );
      toast.success('Boletos emitidos', `Se generaron ${form.cantidad} boletos.`);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error('No se pudieron emitir', err.message);
    } finally {
      setEmitiendo(false);
    }
  };

  return (
    <>
      <CrudManager
        titulo="Boletos"
        descripcion="Controla la emisión, venta y validación de entradas."
        service={boletosService}
        searchKeys={['codigo', 'estado']}
        columns={[
          { key: 'codigo', label: 'Código' },
          { key: 'eventoId', label: 'Evento', render: (r) => nombreEvento(r.eventoId) },
          { key: 'usuarioId', label: 'Titular', render: (r) => (r.usuarioId ? nombreUsuario(r.usuarioId) : 'Sin asignar') },
          { key: 'precio', label: 'Precio', align: 'right', render: (r) => formatColones(r.precio) },
          { key: 'estado', label: 'Estado', render: (r) => <Badge tone={BADGE_TONE_BY_ESTADO[r.estado] ?? 'neutral'}>{r.estado}</Badge> },
        ]}
        fields={[
          { name: 'codigo', label: 'Código', required: true, rules: [required()] },
          { name: 'eventoId', label: 'Evento (ID)', type: 'number', required: true, rules: [required()] },
          { name: 'precio', label: 'Precio (₡)', type: 'number', rules: [required()] },
          { name: 'estado', label: 'Estado', type: 'select', required: true, options: Object.values(ESTADOS_BOLETO).map((e) => ({ value: e, label: e })), rules: [required()] },
        ]}
        extraActions={() => (
          <Button variant="ghost" size="icon" aria-label="Emitir boletos" onClick={() => setOpen(true)}>
            <Plus aria-hidden="true" className="h-4 w-4" />
          </Button>
        )}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Emisión masiva de boletos"
        description="Genera varios boletos disponibles para un evento."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={emitir} loading={emitiendo}>Emitir boletos</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Evento"
            placeholder="Selecciona un evento"
            value={form.eventoId}
            onChange={(e) => setForm((f) => ({ ...f, eventoId: e.target.value }))}
            options={(eventos ?? []).map((e) => ({ value: String(e.id), label: e.titulo }))}
          />
          <Input
            label="Cantidad"
            type="number"
            min={1}
            max={500}
            value={form.cantidad}
            onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
          />
          <Input
            label="Precio unitario (₡)"
            type="number"
            min={0}
            value={form.precio}
            onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
          />
        </div>
      </Modal>
    </>
  );
}