import { useEffect, useState } from 'react';
import '../styles/UserProfile.css';
import '../styles/Notices.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" pinta el botón de confirmar en rojo (acciones destructivas); "primary" en verde. */
  tone?: 'primary' | 'danger';
  /** Si se indica, muestra un campo de texto opcional cuyo valor se entrega al confirmar. */
  noteLabel?: string;
  notePlaceholder?: string;
  /** Mientras es verdadero se deshabilitan los botones. */
  busy?: boolean;
  /** Mensaje de error de la última acción, para mostrarlo dentro del diálogo. */
  error?: string | null;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

/** Diálogo de confirmación propio de la aplicación, en lugar de los `confirm`/`prompt` del navegador. */
export const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'primary',
  noteLabel,
  notePlaceholder,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [note, setNote] = useState('');

  // Permite cerrar con la tecla Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  return (
    <div className="confirm-modal-overlay" onClick={() => !busy && onCancel()}>
      <div
        className="confirm-modal-content confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-dialog-title">{title}</h3>
        <p>{message}</p>

        {noteLabel && (
          <label className="confirm-dialog-note">
            {noteLabel}
            <textarea
              rows={2}
              maxLength={500}
              placeholder={notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        )}

        {error && <p className="notice notice-error">{error}</p>}

        <div className="confirm-modal-actions">
          <button className="btn-cancel" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            className={`btn-confirm ${tone === 'primary' ? 'btn-confirm-primary' : ''}`}
            onClick={() => onConfirm(note.trim())}
            disabled={busy}
          >
            {busy ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
