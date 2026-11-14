import { useState } from 'react';
import { api } from '../auth';
import { useApi } from '../useApi';
import { isFoundStatus, resolveActionLabel, resolvedLabel } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import '../styles/Notices.css';
import '../styles/AdminPanel.css';

type Tab = 'items' | 'audit';

interface Paged {
  total: number;
  page: number;
  totalPages: number;
}

interface AdminItem {
  id: number;
  title: string;
  status: string;
  state: string;
  createdAt: string;
  user: { name: string; email: string } | null;
}

interface AuditLog {
  id: number;
  action: string;
  itemId: number | null;
  details: unknown;
  createdAt: string;
  actor: { name: string; email: string } | null;
}

const ACTION_LABEL: Record<string, string> = {
  ITEM_CREATED: 'Reporte publicado',
  ITEM_DELETED: 'Reporte eliminado por su autor',
  ITEM_DELETED_BY_ADMIN: 'Reporte eliminado por un administrador',
  ITEM_RESOLVED: 'Reporte marcado como resuelto',
  ITEM_REOPENED: 'Reporte reabierto',
  ITEM_STATE_CHANGED: 'Estado modificado por un administrador',
  CONTACT_REQUESTED: 'Contacto solicitado',
};

const Pager = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) =>
  totalPages > 1 ? (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>Anterior</button>
      <span className="page-info">Página {page} de {totalPages}</span>
      <button className="page-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)}>Siguiente</button>
    </div>
  ) : null;

type Pending = { kind: 'state' | 'delete'; item: AdminItem };

const ItemsTab = () => {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const query = new URLSearchParams({ page: String(page), ...(state ? { state } : {}), ...(search.trim() ? { search: search.trim() } : {}) });
  const { data, loading, error } = useApi<{ items: AdminItem[] } & Paged>(`/admin/items?${query}`, reloadKey);

  const ask = (kind: Pending['kind'], item: AdminItem) => {
    setDialogError(null);
    setPending({ kind, item });
  };

  const confirm = async (note: string) => {
    if (!pending) return;
    const { kind, item } = pending;
    setBusy(true);
    setDialogError(null);
    try {
      if (kind === 'delete') {
        await api(`/admin/items/${item.id}`, { method: 'DELETE' });
      } else {
        const next = item.state === 'ACTIVE' ? 'RESOLVED' : 'ACTIVE';
        await api(`/admin/items/${item.id}/state`, { method: 'PATCH', body: { state: next, note } });
      }
      setPending(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setDialogError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const dialog = (() => {
    if (!pending) return null;
    const { kind, item } = pending;
    if (kind === 'delete') {
      return {
        title: `¿Eliminar «${item.title}»?`,
        message: 'Se eliminará el reporte de forma permanente. La acción quedará registrada en la auditoría.',
        confirmLabel: 'Sí, eliminar',
        tone: 'danger' as const,
      };
    }
    const resolving = item.state === 'ACTIVE';
    return {
      title: resolving ? `${resolveActionLabel(item.status)}: «${item.title}»` : `¿Reabrir «${item.title}»?`,
      message: resolving
        ? 'El reporte dejará de aparecer en la búsqueda pública. El cambio quedará registrado en la auditoría.'
        : 'El reporte volverá a mostrarse en la búsqueda pública. El cambio quedará registrado en la auditoría.',
      confirmLabel: resolving ? 'Confirmar' : 'Sí, reabrir',
      tone: 'primary' as const,
      noteLabel: 'Motivo (opcional)',
      notePlaceholder: resolving ? 'Por ejemplo: el dueño ya recogió el objeto' : 'Por ejemplo: se marcó como resuelto por error',
    };
  })();

  return (
    <div>
      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <label>
          Estado
          <select value={state} onChange={(e) => { setState(e.target.value); setPage(1); }}>
            <option value="">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="RESOLVED">Resueltos</option>
          </select>
        </label>
        {data && <span className="admin-count">{data.total} reportes</span>}
      </div>
      {error && <p className="notice notice-error">{error}</p>}
      {loading && !data && <p className="matches-empty">Cargando...</p>}

      {data && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Objeto</th><th>Tipo</th><th>Publicado por</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{isFoundStatus(item.status) ? 'Encontrado' : 'Perdido'}</td>
                  <td>{item.user ? item.user.email : '—'}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`state-pill state-${item.state.toLowerCase()}`}>
                      {item.state === 'ACTIVE' ? 'Activo' : resolvedLabel(item.status)}
                    </span>
                  </td>
                  <td className="admin-row-actions">
                    <button onClick={() => ask('state', item)}>
                      {item.state === 'ACTIVE' ? resolveActionLabel(item.status) : 'Reabrir'}
                    </button>
                    <button className="danger" onClick={() => ask('delete', item)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <p className="matches-empty">No hay reportes con esos filtros.</p>}
        </div>
      )}
      {data && <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />}

      {pending && dialog && (
        <ConfirmDialog {...dialog} busy={busy} error={dialogError} onConfirm={confirm} onCancel={() => setPending(null)} />
      )}
    </div>
  );
};

const AuditTab = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useApi<{ logs: AuditLog[] } & Paged>(`/admin/audit?page=${page}`);

  return (
    <div>
      {error && <p className="notice notice-error">{error}</p>}
      {loading && !data && <p className="matches-empty">Cargando...</p>}
      {data && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Reporte</th><th>Detalle</th></tr>
            </thead>
            <tbody>
              {data.logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.actor ? log.actor.email : 'Sistema'}</td>
                  <td>{ACTION_LABEL[log.action] ?? log.action}</td>
                  <td>{log.itemId ?? '—'}</td>
                  <td className="audit-details">{log.details ? JSON.stringify(log.details) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.logs.length === 0 && <p className="matches-empty">Aún no hay registros.</p>}
        </div>
      )}
      {data && <Pager page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  );
};

/** Panel de administración: moderación de reportes y bitácora de auditoría. */
export const AdminPanel = () => {
  const [tab, setTab] = useState<Tab>('items');
  const tabs: { id: Tab; label: string }[] = [
    { id: 'items', label: 'Reportes' },
    { id: 'audit', label: 'Auditoría' },
  ];

  return (
    <div className="admin-panel">
      <h2>Panel de administración</h2>
      <div className="admin-tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'items' && <ItemsTab />}
      {tab === 'audit' && <AuditTab />}
    </div>
  );
};
