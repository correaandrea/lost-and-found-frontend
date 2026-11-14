import React, { useEffect, useState } from 'react';
import { API_URL, isFoundStatus } from '../types';
import type { Item, ItemMatch } from '../types';
import { api, getSession } from '../auth';
import { buildContactEmail, gmailComposeUrl } from '../contact';
import type { ContactInfo } from '../contact';
import '../styles/ItemDetailModal.css';
import '../styles/Notices.css';

/**
 * Botón "Contactar": obtiene el correo de quien publicó el reporte (solo con sesión iniciada)
 * y abre Gmail con un mensaje ya dirigido a esa persona.
 */
const ContactSection = ({ item }: { item: Item }) => {
  const session = getSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Si el navegador bloquea la ventana nueva, se ofrece el enlace para abrirla a mano
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  if (item.state !== 'ACTIVE') return <p className="notice notice-success">Este reporte ya fue resuelto.</p>;
  if (!session) {
    return <p className="notice notice-hint">Inicia sesión con tu correo institucional para contactar a quien publicó este reporte.</p>;
  }
  if (session.id === item.userId) {
    return <p className="notice notice-hint">Este reporte es tuyo. Puedes marcarlo como resuelto desde «Mi Perfil».</p>;
  }

  const contact = async () => {
    setBusy(true);
    setError(null);
    setFallbackUrl(null);
    // La ventana se abre al instante (dentro del clic) para que el navegador no la bloquee
    // y se redirige a Gmail cuando llega el correo del publicador.
    const win = window.open('about:blank', '_blank');
    if (win) win.opener = null;
    try {
      const info = await api<ContactInfo>(`/items/${item.id}/contact`);
      const url = gmailComposeUrl(buildContactEmail(info, session.name));
      if (win) win.location.href = url;
      else setFallbackUrl(url);
    } catch (err) {
      win?.close();
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="contact-section">
      <button className="btn-contact" onClick={contact} disabled={busy}>
        {busy ? 'Abriendo Gmail...' : 'Contactar'}
      </button>
      {error && <p className="notice notice-error">{error}</p>}
      {fallbackUrl && (
        <p className="contact-fallback">
          Tu navegador bloqueó la ventana. <a href={fallbackUrl} target="_blank" rel="noopener noreferrer">Abrir Gmail</a>
        </p>
      )}
    </div>
  );
};

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  /** Permite navegar a una coincidencia sugerida. */
  onSelectItem?: (item: Item) => void;
}

/** Coincidencias de un reporte, etiquetadas con el identificador al que corresponden. */
type MatchesState = { itemId: number; matches: ItemMatch[]; error: boolean };

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onSelectItem }) => {
  const [matchesState, setMatchesState] = useState<MatchesState | null>(null);
  const itemId = item?.id;

  useEffect(() => {
    if (itemId === undefined) return;
    const controller = new AbortController();
    fetch(`${API_URL}/items/${itemId}/matches`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((matches: ItemMatch[]) => setMatchesState({ itemId, matches, error: false }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setMatchesState({ itemId, matches: [], error: true });
      });
    return () => controller.abort();
  }, [itemId]);

  // Si por alguna razón no llega el item, no renderizamos el modal
  if (!item) return null;

  const found = isFoundStatus(item.status);
  const loadingMatches = matchesState?.itemId !== item.id;
  const matches = matchesState?.itemId === item.id ? matchesState.matches : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>

        <div className="item-details">
          <h2>{item.title || 'Objeto sin nombre'}</h2>

          {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="item-image" />}

          <div className="item-info">
            <p><strong>Estado:</strong> {found ? 'Encontrado' : 'Perdido'}</p>
            <p><strong>Categoría:</strong> {item.category}</p>
            <p><strong>Descripción:</strong> {item.description}</p>
            {item.city && <p><strong>Sede:</strong> {item.city}</p>}
            <p><strong>Ubicación donde se {found ? 'encontró' : 'perdió'}:</strong> {item.location}</p>
            <p><strong>Fecha de publicación:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <ContactSection key={item.id} item={item} />

        <div className="matches-section">
          <h3>{found ? 'Posibles dueños (reportes de objetos perdidos)' : 'Posibles coincidencias (objetos encontrados)'}</h3>
          {loadingMatches ? (
            <p className="matches-empty">Buscando coincidencias...</p>
          ) : matchesState?.error ? (
            <p className="matches-empty">No se pudieron cargar las coincidencias.</p>
          ) : matches.length === 0 ? (
            <p className="matches-empty">
              No hay reportes similares en la misma sede y categoría por ahora.
            </p>
          ) : (
            <ul className="matches-list">
              {matches.map((match) => (
                <li key={match.id}>
                  <button
                    type="button"
                    className="match-card"
                    onClick={() => onSelectItem?.(match)}
                    disabled={!onSelectItem}
                  >
                    {match.imageUrl ? (
                      <img src={match.imageUrl} alt="" className="match-thumb" />
                    ) : (
                      <div className="match-thumb match-thumb-empty">Sin foto</div>
                    )}
                    <span className="match-text">
                      <span className="match-title">{match.title}</span>
                      <span className="match-meta">
                        {isFoundStatus(match.status) ? 'Encontrado' : 'Perdido'} · {match.location}
                      </span>
                    </span>
                    <span className="match-score">{Math.round(match.matchScore * 100)}%</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
