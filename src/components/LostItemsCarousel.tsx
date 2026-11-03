import { useState, useEffect } from 'react';
import { ItemDetailModal } from './ItemDetailModal';
import '../styles/LostItemsCarousel.css';

interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string; 
  location: string;
  imageUrl: string;
  status: string;
  createdAt: string;
}

const MultiSelectDropdown = ({ 
  title, 
  options, 
  selectedValues, 
  toggleOption 
}: { 
  title: string, 
  options: { label: string, value: string }[], 
  selectedValues: string[], 
  toggleOption: (val: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="multiselect-container" onMouseLeave={() => setIsOpen(false)}>
      <div className="multiselect-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedValues.length > 0 ? `${title} (${selectedValues.length})` : title}</span>
        <span className="multiselect-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="multiselect-menu">
          {options.map(opt => (
            <label key={opt.value} className="multiselect-option">
              <input
                type="checkbox"
                checked={selectedValues.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const LostItemsCarousel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [cityFilters, setCityFilters] = useState<string[]>([]); 
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetch(`http://localhost:3000/items`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setItems(data);
        else setItems([]);
      })
      .catch(err => console.error('Error cargando objetos:', err));
  }, []);

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[], value: string) => {
    setter(current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCityFilters([]);
    setCategoryFilters([]);
    setStatusFilters([]);
    setCurrentPage(1);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = item.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCity = cityFilters.length === 0 || cityFilters.includes(item.city);
    const matchesCategory = categoryFilters.length === 0 || categoryFilters.includes(item.category);
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(item.status.toLowerCase());
    
    return matchesSearch && matchesCity && matchesLocation && matchesCategory && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const selectedItem = items.find(item => item.id === selectedItemId) || null;

  return (
    <div className="items-container">
      <h2 className="section-title">Objetos Reportados Recientemente</h2>
      <p className="section-subtitle">Explora los objetos que otros han encontrado en el campus, o busca si alguien ya reportó eso que perdiste.</p>
      
      <div className="filters-wrapper">
        <div className="search-bar-row">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="main-search-input"
          />
        </div>
        
        <div className="secondary-filters-row">
          <MultiSelectDropdown 
            title="Filtrar por sede..." 
            selectedValues={cityFilters} 
            toggleOption={(val) => toggleFilter(setCityFilters, cityFilters, val)}
            options={[
              { label: 'Amalfi', value: 'Amalfi, Colombia' },
              { label: 'Andes', value: 'Andes, Colombia' },
              { label: 'Apartadó', value: 'Apartadó, Colombia' },
              { label: 'Carepa', value: 'Carepa, Colombia' },
              { label: 'Caucasia', value: 'Caucasia, Colombia' },
              { label: 'El Carmen de Viboral', value: 'El Carmen de Viboral, Colombia' },
              { label: 'Medellín', value: 'Medellín, Colombia' },
              { label: 'Puerto Berrío', value: 'Puerto Berrío, Colombia' },
              { label: 'Santa Fe de Antioquia', value: 'Santa Fe de Antioquia, Colombia' },
              { label: 'Segovia', value: 'Segovia, Colombia' },
              { label: 'Sonsón', value: 'Sonsón, Colombia' },
              { label: 'Turbo', value: 'Turbo, Colombia' },
              { label: 'Yarumal', value: 'Yarumal, Colombia' }
            ]}
          />

          <input
            type="text"
            placeholder="Ubicación específica..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="filter-input-text"
          />
          
          <MultiSelectDropdown 
            title="Filtrar por categoría..." 
            selectedValues={categoryFilters} 
            toggleOption={(val) => toggleFilter(setCategoryFilters, categoryFilters, val)}
            options={[
              { label: 'Documentos', value: 'documentos' },
              { label: 'Tecnología', value: 'tecnologia' },
              { label: 'Ropa', value: 'ropa' },
              { label: 'Termos', value: 'termos' },
              { label: 'Accesorios', value: 'accesorios' },
              { label: 'Material de estudio', value: 'estudio' },
              { label: 'Llaves', value: 'llaves' },
              { label: 'Otro', value: 'otro' }
            ]}
          />
          
          <MultiSelectDropdown 
            title="Filtrar por estado..." 
            selectedValues={statusFilters} 
            toggleOption={(val) => toggleFilter(setStatusFilters, statusFilters, val)}
            options={[
              { label: 'Perdidos', value: 'lost' },
              { label: 'Encontrados', value: 'found' }
            ]}
          />

          <button className="clear-filters-btn" onClick={clearFilters}>
            Borrar filtros
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
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
                    <div className="item-placeholder">Sin foto</div>
                  )}
                  <span className={`status-badge-small ${item.status.toLowerCase()}`}>
                    {['found', 'encontrado'].includes(item.status.toLowerCase()) ? 'Encontrado' : 'Perdido'}
                  </span>
                </div>
                
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-category">{item.category}</p>
                  
                  <p className="item-location">
                    {item.city ? `${item.city.split(',')[0]} - ` : ''}{item.location}
                  </p>
                  
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