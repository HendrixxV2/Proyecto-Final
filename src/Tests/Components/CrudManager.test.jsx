import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CrudManager from '@/Components/Admin/CrudManager';
import { useFetch } from '@/Hooks/useFetch';
import { useToast } from '@/Hooks/useToast';
import { required } from '@/Utils/validators';

jest.mock('@/Hooks/useFetch', () => ({ useFetch: jest.fn() }));
jest.mock('@/Hooks/useDebounce', () => ({ useDebounce: (value) => value }));
jest.mock('@/Hooks/useToast', () => ({ useToast: jest.fn() }));

const mockToast = {
  warning: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};
const mockRefetch = jest.fn().mockResolvedValue([]);
const mockService = {
  list: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};
const fields = [
  { name: 'nombre', label: 'Nombre', required: true, rules: [required('El nombre es obligatorio.')] },
  { name: 'capacidad', label: 'Capacidad', type: 'number' },
  { name: 'activo', label: 'Activo', type: 'checkbox', default: true },
  {
    name: 'categoria',
    label: 'Categoría',
    type: 'select',
    placeholder: 'Selecciona una categoría',
    options: [{ value: 'taller', label: 'Taller' }],
  },
  { name: 'descripcion', label: 'Descripción', type: 'textarea' },
];

function renderManager(data = [{ id: 4, nombre: 'Sala Norte', capacidad: 20, activo: true }], overrides = {}) {
  useFetch.mockReturnValue({ data, loading: false, error: null, refetch: mockRefetch });
  useToast.mockReturnValue(mockToast);
  return render(
    <CrudManager
      titulo="Espacios"
      service={mockService}
      columns={[{ key: 'nombre', label: 'Nombre' }]}
      fields={fields}
      {...overrides}
    />,
  );
}

describe('CrudManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefetch.mockResolvedValue([]);
    mockService.create.mockResolvedValue({ id: 5 });
    mockService.update.mockResolvedValue({ id: 4 });
    mockService.remove.mockResolvedValue(null);
  });

  it('filters rows by the configured searchable fields', () => {
    renderManager([
      { id: 1, nombre: 'Sala Norte', categoria: 'Música' },
      { id: 2, nombre: 'Galería', categoria: 'Teatro' },
    ], { searchKeys: ['nombre', 'categoria'] });

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar en Espacios' }), {
      target: { value: 'teatro' },
    });

    expect(screen.getByText('Galería')).toBeInTheDocument();
    expect(screen.queryByText('Sala Norte')).not.toBeInTheDocument();
  });

  it('validates required fields before creating a record', async () => {
    const user = userEvent.setup();
    renderManager([]);
    await user.click(screen.getByRole('button', { name: 'Nuevo' }));
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    expect(mockToast.warning).toHaveBeenCalledWith(
      'Revisa el formulario',
      'Hay campos con información inválida.',
    );
    expect(mockService.create).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('El nombre es obligatorio.');
  });

  it('creates records with correctly converted field values', async () => {
    const user = userEvent.setup();
    renderManager([], { createDefaults: { capacidad: '25' } });
    await user.click(screen.getByRole('button', { name: 'Nuevo' }));
    await user.type(screen.getByLabelText(/^Nombre/), 'Sala Sur');
    await user.clear(screen.getByLabelText('Capacidad'));
    await user.type(screen.getByLabelText('Capacidad'), '45');
    await user.click(screen.getByLabelText('Activo'));
    await user.selectOptions(screen.getByLabelText('Categoría'), 'taller');
    await user.type(screen.getByLabelText('Descripción'), 'Espacio para talleres');
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => expect(mockService.create).toHaveBeenCalledWith({
      nombre: 'Sala Sur',
      capacidad: 45,
      activo: false,
      categoria: 'taller',
      descripcion: 'Espacio para talleres',
    }));
    expect(mockToast.success).toHaveBeenCalledWith('Registro creado', 'El nuevo elemento ya está disponible.');
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('edits a row using its key and preserves existing properties', async () => {
    const user = userEvent.setup();
    const row = {
      id: 4,
      nombre: 'Sala Norte',
      capacidad: 20,
      activo: true,
      categoria: 'taller',
      descripcion: 'Descripción anterior',
      codigo: 'SN-4',
    };
    renderManager([row]);
    await user.click(screen.getByRole('button', { name: 'Editar Sala Norte' }));
    await user.clear(screen.getByLabelText(/^Nombre/));
    await user.type(screen.getByLabelText(/^Nombre/), 'Sala renovada');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(mockService.update).toHaveBeenCalledWith(4, {
      ...row,
      nombre: 'Sala renovada',
    }));
    expect(mockToast.success).toHaveBeenCalledWith('Registro actualizado', 'Los cambios se guardaron correctamente.');
  });

  it('requires confirmation before deleting a row', async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByRole('button', { name: 'Eliminar Sala Norte' }));

    expect(screen.getByRole('dialog', { name: 'Confirmar eliminación' })).toBeInTheDocument();
    expect(mockService.remove).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Sí, eliminar' }));

    await waitFor(() => expect(mockService.remove).toHaveBeenCalledWith(4));
    expect(mockToast.success).toHaveBeenCalledWith('Registro eliminado', 'El elemento se retiró del sistema.');
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('shows service errors without closing the form', async () => {
    const user = userEvent.setup();
    mockService.create.mockRejectedValue(new Error('No se pudo guardar en el servidor.'));
    renderManager([]);
    await user.click(screen.getByRole('button', { name: 'Nuevo' }));
    await user.type(screen.getByLabelText(/^Nombre/), 'Sala Este');
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith(
      'No se pudo guardar',
      'No se pudo guardar en el servidor.',
    ));
    expect(screen.getByRole('dialog', { name: 'Nuevo espacios' })).toBeInTheDocument();
  });
});