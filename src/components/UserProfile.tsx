import { useState, useEffect } from 'react';
import '../styles/LostItemsCarousel.css'; 
import '../styles/UserProfile.css';

export const UserProfile = ({ user }: { user: any }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const fetchMyItems = async () => {
    try {
      const response = await fetch('http://localhost:3000/items/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]); 
      }
    } catch (error) {
      console.error('Error fatal al cargar mis objetos:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3000/items/${itemToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        setItems(items.filter(item => item.id !== itemToDelete));
      } else {
        alert('Hubo un error al eliminar el objeto.');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setItemToDelete(null); 
    }
  };

  if (loading) return <p className="loading-text">Cargando tus objetos...</p>;

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h2>Hola, {user?.name} 👋</h2>
        <p>Acá podrás ver y modificar tus objetos publicados.</p>
      </div>

      {items.length === 0 ? (
        <p className="no-items">Aún no has publicado ningún objeto o hubo un error al cargarlos.</p>
      ) : (
        <div className="items-grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-image-wrapper">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="item-image" />
                ) : (
                  <div className="item-placeholder">📷 Sin foto</div>
                )}
                <span className={`status-badge-small ${item.status.toLowerCase()}`}>
                  {item.status === 'ENCONTRADO' || item.status === 'found' ? 'Encontrado' : 'Perdido'}
                </span>
              </div>
              
              <div className="item-info">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-category">{item.category}</p>
                <p className="item-location"><small>{new Date(item.createdAt).toLocaleDateString()}</small></p>
                
                <button 
                  className="delete-item-btn" 
                  onClick={() => setItemToDelete(item.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP DE CONFIRMACIÓN */}
      {itemToDelete && (
        <div className="confirm-modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar publicación?</h3>
            <p>Esta acción no se puede deshacer y el objeto desaparecerá de la lista pública.</p>
            <div className="confirm-modal-actions">
              <button className="btn-cancel" onClick={() => setItemToDelete(null)}>Cancelar</button>
              <button className="btn-confirm" onClick={confirmDelete}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};