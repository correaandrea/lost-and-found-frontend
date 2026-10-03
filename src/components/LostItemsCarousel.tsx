import { useState, useEffect } from 'react';
import { ItemDetailModal } from './ItemDetailModal';
import '../styles/LostItemsCarousel.css';

interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string;
  status: string;
  createdAt: string;
}

export const LostItemsCarousel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 4 columnas x 5 filas = 20 objetos por página

  useEffect(() => {
    fetch('http://localhost:3000/items')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Error cargando objetos:', err));
  }, []);

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const selectedItem = items.find(item => item.id === selectedItemId) || null;

  return (
    <div className="items-container">
      <h2 className="section-title">Objetos Reportados Recientemente</h2>
      
      {items.length === 0 ? (
        <p className="no-items">No hay objetos reportados aún.</p>
      ) : (
        <>
          {/* Contenedor de la Cuadrícula */}
          <div className="items-grid">
            {currentItems.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-image-wrapper">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="item-image" />
                  ) : (
                    <div className="item-placeholder">📷 Sin foto</div>
                  )}
                  <span className={`status-badge-small ${item.status.toLowerCase()}`}>
                    {item.status === 'found' || item.status === 'ENCONTRADO' ? 'Encontrado' : 'Perdido'}
                  </span>
                </div>
                
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-category">{item.category}</p>
                  <p className="item-location">📍 {item.location}</p>
                  
                  <button 
                    className="view-details-btn" 
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => prev - 1)} 
                disabled={currentPage === 1}
                className="page-btn"
              >
                Anterior
              </button>
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)} 
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalles */}
      {selectedItemId && (
        <ItemDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItemId(null)} 
        />
      )}
    </div>
  );
};

export default LostItemsCarousel;