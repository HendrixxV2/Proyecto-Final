import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { useDebounce } from '@/Hooks/useDebounce';
import { useToast } from '@/Hooks/useToast';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';
import Modal from '@/Components/UI/Modal';
import DataTable from '@/Components/UI/DataTable';
import EmptyState from '@/Components/UI/EmptyState';
import ErrorState from '@/Components/UI/ErrorState';
import { SkeletonTable } from '@/Components/UI/Skeleton';
import { validateForm } from '@/Utils/validators';
import { useLanguage } from '@/Hooks/useLanguage';

const inputPorTipo = (field, value, onChange, error) => {
  switch (field.type) {
    case 'textarea':
      return <Textarea label={field.label} value={value ?? ''} onChange={onChange} error={error} required={field.required} rows={field.rows ?? 4} />;
    case 'select':
      return (
        <Select
          label={field.label}
          value={value ?? ''}
          onChange={onChange}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
          options={field.options}
        />
      );
    case 'number':
      return <Input label={field.label} type="number" value={value ?? ''} onChange={onChange} error={error} required={field.required} min={field.min} max={field.max} />;
    case 'checkbox':
      return (
        <label className="flex items-center gap-2.5 text-sm text-ink-700 dark:text-ink-200">
          <input type="checkbox" checked={Boolean(value)} onChange={onChange} className="h-4 w-4 rounded border-ink-300 text-brand-500" />
          {field.label}
        </label>
      );
    default:
      return <Input label={field.label} type={field.type ?? 'text'} value={value ?? ''} onChange={onChange} error={error} required={field.required} placeholder={field.placeholder} />;
  }
};

export default function CrudManager({
  titulo,
  descripcion,
  service,
  columns,
  fields,
  searchKeys = ['nombre'],
  emptyMessage = 'No hay registros todavía.',
  extraActions,
  rowKey = 'id',
  createLabel = 'Nuevo',
  createDefaults = {},
}) {
  const { t } = useLanguage();
  const { data, loading, error, refetch } = useFetch(() => service.list(), []);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toast = useToast();

  const registros = useMemo(() => {
    if (!data) return [];
    const q = debounced.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) =>
      searchKeys.some((k) => String(item[k] ?? '').toLowerCase().includes(q)),
    );
  }, [data, debounced, searchKeys]);

  const openCreate = () => {
    const inicial = {};
    fields.forEach((f) => {
      inicial[f.name] = createDefaults[f.name] ?? (f.type === 'checkbox' ? Boolean(f.default) : f.default ?? '');
    });
    setEditing(null);
    setForm(inicial);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const inicial = {};
    fields.forEach((f) => {
      inicial[f.name] = row[f.name] ?? (f.type === 'checkbox' ? false : '');
    });
    setEditing(row);
    setForm(inicial);
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (name, type) => (event) => {
    const raw = type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [name]: raw }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const rules = {};
    fields.forEach((f) => {
      if (f.rules?.length) rules[f.name] = f.rules;
    });

    const { errors: validationErrors, isValid } = validateForm(form, rules);
    if (!isValid) {
      setErrors(validationErrors);
      toast.warning(t('crud.reviewForm'), t('crud.invalidFields'));
      return;
    }

    setSaving(true);
    try {
      const payload = fields.reduce((acc, f) => {
        const value = form[f.name];
        acc[f.name] =
          f.type === 'number' && value !== '' ? Number(value) : f.type === 'checkbox' ? Boolean(value) : value;
        return acc;
      }, {});

      if (editing) {
        await service.update(editing[rowKey], { ...editing, ...payload });
        toast.success(t('crud.updated'), t('crud.saved'));
      } else {
        await service.create(payload);
        toast.success(t('crud.created'), t('crud.available'));
      }

      setModalOpen(false);
      await refetch();
    } catch (err) {
      toast.error(t('crud.saveError'), err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await service.remove(confirmDelete[rowKey]);
      toast.success(t('crud.deleted'), t('crud.removed'));
      setConfirmDelete(null);
      await refetch();
    } catch (err) {
      toast.error(t('crud.deleteError'), err.message);
    }
  };

  const tableColumns = [
    ...columns,
    {
      key: '__acciones',
      label: t('crud.actions'),
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          {extraActions?.(row)}
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label={t('crud.edit', { name: row.nombre ?? row.titulo ?? row[rowKey] })}>
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmDelete(row)}
            aria-label={t('crud.delete', { name: row.nombre ?? row.titulo ?? row[rowKey] })}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{titulo}</h1>
          {descripcion && <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{descripcion}</p>}
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('crud.search')}
              aria-label={t('crud.searchIn', { name: titulo })}
              className="h-11 w-full rounded-xl border border-ink-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100"
            />
          </div>
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            {createLabel}
          </Button>
        </div>
      </header>

      {loading && <SkeletonTable rows={6} />}

      {error && !loading && (
        <ErrorState description={error.message} onRetry={() => refetch()} />
      )}

      {!loading && !error && (
        <DataTable
          caption={titulo}
          columns={tableColumns}
          rows={registros}
          keyField={rowKey}
          empty={
            <EmptyState
              title={t('crud.empty')}
              description={query ? t('crud.noMatches') : emptyMessage}
              action={<Button onClick={openCreate}>{t('crud.createFirst')}</Button>}
            />
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('crud.editTitle', { name: titulo.toLowerCase() }) : t('crud.newTitle', { name: titulo.toLowerCase() })}
        description={editing ? t('crud.editDescription') : t('crud.newDescription')}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t('crud.cancel')}</Button>
            <Button onClick={handleSubmit} loading={saving}>{editing ? t('crud.save') : t('crud.create')}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
              {inputPorTipo(field, form[field.name], handleChange(field.name, field.type), errors[field.name])}
            </div>
          ))}
        </form>
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={t('crud.confirmDelete')}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>{t('crud.cancel')}</Button>
            <Button variant="danger" onClick={handleDelete}>{t('crud.yesDelete')}</Button>
          </>
        }
      >
        <p className="text-sm text-ink-700 dark:text-ink-200">
          {t('crud.deletePrompt', { name: confirmDelete?.nombre ?? confirmDelete?.titulo ?? t('crud.defaultRecord') })}
        </p>
      </Modal>
    </section>
  );
}