import { useState } from 'react';
import { api } from '../auth';
import { useApi } from '../useApi';
import { isFoundStatus, resolveActionLabel, resolvedLabel } from '../types';
import type { Item } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import '../styles/LostItemsCarousel.css';
import '../styles/UserProfile.css';
import '../styles/Notices.css';

type DialogKind = 'resolve' | 'reopen' | 'delete';

export const UserProfile = ({ user }: { user: { name: string } | null }) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [dialog, setDialog] = useState<{ kind: DialogKind; item: Item } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const { data, loading, error } = useApi<Item[]>('/items/me', reloadKey);
  const items = Array.isArray(data) ? data : [];

  const open = (kind: DialogKind, item: Item) => {
    setDialogError(null);
    setDialog({ kind, item });
  };

  const confirm = async (note: string) => {
    if (!dialog) return;
    const { kind, item } = dialog;
    setBusy(true);
    setDialogError(null);
    try {
      if (kind === 'delete') {
        await api(`/items/${item.id}`, { method: 'DELETE' });
      } else {
        await api(`/items/${item.id}/state`, {
          method: 'PATCH',
          body: { state: kind === 'resolve' ? 'RESOLVED' : 'ACTIVE', note },
        });
      }
      setDialog(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setDialogError((err as Error).message || 'No se pudo completar la acción. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const dialogProps = (() => {
    if (!dialog) return null;
    const { kind, item } = dialog;
    const found = isFoundStatus(item.status);
    if (kind === 'delete') {
      return {
        title: '¿Eliminar publicación?',
        message: 'Esta acción no se puede deshacer y el objeto desaparecerá de la lista pública.',
        confirmLabel: 'Sí, eliminar',
        tone: 'danger' as const,
      };
    }
    if (kind === 'reopen') {
      return {
        title: '¿Reabrir el reporte?',
        message: `«${item.title}» volverá a mostrarse en la búsqueda pública.`,
        confirmLabel: 'Sí, reabrir',
        tone: 'primary' as const,
      };
    }
    return {
      title: found ? '¿Marcar como entregado?' : '¿Marcar como encontrado?',
      message: found
        ? `Confirma que ya le entregaste «${item.title}» a su dueño. Dejará de aparecer en la búsqueda pública.`
        : `Confirma que ya recuperaste «${item.title}». Dejará de aparecer en la búsqueda pública.`,
      confirmLabel: found ? 'Sí, fue entregado' : 'Sí, lo encontré',
      tone: 'primary' as const,
      noteLabel: 'Nota (opcional)',
      notePlaceholder: found ? 'Por ejemplo: se lo entregué en la portería del bloque 22' : 'Por ejemplo: apareció en la biblioteca',
    };
  })();

  if (loading && !data) return <p className="loading-text">Cargando tus objetos...</p>;

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h2>Hola, {user?.name} 👋</h2>
        <p>Acá podrás ver y gestionar tus objetos publicados.</p>
      </div>

      {error && <p className="notice notice-error">{error}</p>}

      {items.length === 0 ? (
        <p className="no-items">Aún no has publicado ningún objeto o hubo un error al cargarlos.</p>
      ) : (
        <div className="items-grid">
          {items.map((item) => {
            const resolved = item.state === 'RESOLVED';
            return (
              <div key={item.id} className="item-card">
                <div className="item-image-wrapper">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="item-image" />
                  ) : (
                    <div className="item-placeholder">📷 Sin foto</div>
                  )}
                  <span className={`status-badge-small ${item.status.toLowerCase()}`}>
                    {isFoundStatus(item.status) ? 'Encontrado' : 'Perdido'}
                  </span>
                </div>
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-category">{item.category}</p>
                  <p className="item-location"><small>{new Date(item.createdAt).toLocaleDateString()}</small></p>
                  {item.privateDetail && (
                    <p className="private-detail-note">🔒 Detalle privado: {item.privateDetail}</p>
                  )}
                  {resolved && <p className="resolved-tag">✔ {resolvedLabel(item.status)}</p>}
                  {resolved ? (
                    <button className="btn-reopen" onClick={() => open('reopen', item)}>Reabrir</button>
                  ) : (
                    <button className="btn-resolve" onClick={() => open('resolve', item)}>
                      {resolveActionLabel(item.status)}
                    </button>
                  )}
                  <button className="delete-item-btn" onClick={() => open('delete', item)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dialog && dialogProps && (
        <ConfirmDialog
          {...dialogProps}
          busy={busy}
          error={dialogError}
          onConfirm={confirm}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
};
