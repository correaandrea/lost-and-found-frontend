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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      fetch(`http://localhost:3000/items?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setItems(data);
          setCurrentPage(1); 
        })
        .catch(err => console.error('Error cargando objetos:', err));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, locationFilter, categoryFilter, statusFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const selectedItem = items.find(item => item.id === selectedItemId) || null;

  return (
    <div className="items-container">
      <h2 className="section-title">Objetos Reportados Recientemente</h2>
      
      <div className="filters-container">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input search-input"
        />
        <input
          type="text"
          placeholder="📍 Filtrar por ubicación..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="filter-input location-input"
        />
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-input"
        >
          <option value="">📁 Todas las categorías</option>
          <option value="Llaves">Llaves</option>
          <option value="Ropa">Ropa</option>
          <option value="Termos">Termos</option>
          <option value="Tecnologia">Tecnología</option>
        </select>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-input"
        >
          <option value="">📌 Todos los estados</option>
          <option value="perdido">Perdidos</option>
          <option value="encontrado">Encontrados</option>
        </select>
      </div>

      {items.length === 0 ? (
        <p className="no-items">No se encontraron objetos con esos filtros.</p>
      ) : (
        <>
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
                    {['found', 'encontrado'].includes(item.status.toLowerCase()) ? 'Encontrado' : 'Perdido'}
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