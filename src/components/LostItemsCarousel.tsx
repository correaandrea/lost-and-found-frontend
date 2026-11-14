import { useEffect, useMemo, useState } from 'react';
import { ItemDetailModal } from './ItemDetailModal';
import { API_URL, isFoundStatus, presetRange } from '../types';
import type { DatePreset, Item, ItemsPage } from '../types';
import '../styles/LostItemsCarousel.css';

const ITEMS_PER_PAGE = 20;

const CITY_OPTIONS = [
  'Amalfi', 'Andes', 'Apartadó', 'Carepa', 'Caucasia', 'El Carmen de Viboral', 'Medellín',
  'Puerto Berrío', 'Santa Fe de Antioquia', 'Segovia', 'Sonsón', 'Turbo', 'Yarumal',
].map((name) => ({ label: name, value: `${name}, Colombia` }));

const CATEGORY_OPTIONS = [
  { label: 'Documentos', value: 'documentos' },
  { label: 'Tecnología', value: 'tecnologia' },
  { label: 'Ropa', value: 'ropa' },
  { label: 'Termos', value: 'termos' },
  { label: 'Accesorios', value: 'accesorios' },
  { label: 'Material de estudio', value: 'estudio' },
  { label: 'Llaves', value: 'llaves' },
  { label: 'Otro', value: 'otro' },
];

const STATUS_OPTIONS = [
  { label: 'Perdidos', value: 'lost' },
  { label: 'Encontrados', value: 'found' },
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'today', label: 'Hoy' },
  { value: '3d', label: 'Últimos 3 días' },
  { value: 'week', label: 'Última semana' },
];

const MultiSelectDropdown = ({
  title,
  options,
  selectedValues,
  toggleOption,
}: {
  title: string;
  options: { label: string; value: string }[];
  selectedValues: string[];
  toggleOption: (val: string) => void;
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
          {options.map((opt) => (
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

/** Resultado de una consulta, etiquetado con la consulta que lo produjo. */
type Result = { key: string; data: ItemsPage | null; error: boolean };

export const LostItemsCarousel = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Texto: se separa el valor del campo del valor "estable" que dispara la consulta
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const [cityFilters, setCityFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [result, setResult] = useState<Result>({ key: '', data: null, error: false });

  // Espera a que el usuario deje de escribir antes de consultar al servidor
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setLocationFilter(locationInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, locationInput]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (locationFilter) params.set('location', locationFilter);
    if (cityFilters.length) params.set('city', cityFilters.join('|'));
    if (categoryFilters.length) params.set('category', categoryFilters.join('|'));
    if (statusFilters.length) params.set('status', statusFilters.join('|'));
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    params.set('page', String(currentPage));
    params.set('limit', String(ITEMS_PER_PAGE));
    return params.toString();
  }, [searchTerm, locationFilter, cityFilters, categoryFilters, statusFilters, fromDate, toDate, currentPage]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/items?${queryString}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: ItemsPage) => setResult({ key: queryString, data, error: false }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error cargando objetos:', err);
        setResult({ key: queryString, data: null, error: true });
      });
    return () => controller.abort();
  }, [queryString]);

  const loading = result.key !== queryString;
  const items = result.data?.items ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = result.data?.totalPages ?? 1;

  const toggleFilter = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[],
    value: string,
  ) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
    setCurrentPage(1);
  };

  const applyPreset = (preset: DatePreset) => {
    const range = presetRange(preset);
    setDatePreset(preset);
    setFromDate(range.from);
    setToDate(range.to);
    setCurrentPage(1);
  };

  const changeCustomDate = (field: 'from' | 'to', value: string) => {
    setDatePreset('custom');
    if (field === 'from') setFromDate(value);
    else setToDate(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setLocationInput('');
    setLocationFilter('');
    setCityFilters([]);
    setCategoryFilters([]);
    setStatusFilters([]);
    applyPreset('all');
  };

  return (
    <div className="items-container">
      <h2 className="section-title">Objetos Reportados Recientemente</h2>
      <p className="section-subtitle">
        Explora los objetos que otros han encontrado en el campus, o busca si alguien ya reportó eso que perdiste.
      </p>

      <div className="filters-wrapper">
        <div className="search-bar-row">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            className="main-search-input"
          />
        </div>

        <div className="date-filters-row">
          <span className="date-filters-label">Publicados:</span>
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`date-chip ${datePreset === preset.value ? 'active' : ''}`}
              onClick={() => applyPreset(preset.value)}
            >
              {preset.label}
            </button>
          ))}
          <label className="date-input-label">
            Desde
            <input
              type="date"
              className="date-input"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => changeCustomDate('from', e.target.value)}
            />
          </label>
          <label className="date-input-label">
            Hasta
            <input
              type="date"
              className="date-input"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => changeCustomDate('to', e.target.value)}
            />
          </label>
        </div>

        <div className="secondary-filters-row">
          <MultiSelectDropdown
            title="Filtrar por sede..."
            selectedValues={cityFilters}
            toggleOption={(val) => toggleFilter(setCityFilters, cityFilters, val)}
            options={CITY_OPTIONS}
          />
          <input
            type="text"
            placeholder="Ubicación específica..."
            value={locationInput}
            onChange={(e) => {
              setLocationInput(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input-text"
          />
          <MultiSelectDropdown
            title="Filtrar por categoría..."
            selectedValues={categoryFilters}
            toggleOption={(val) => toggleFilter(setCategoryFilters, categoryFilters, val)}
            options={CATEGORY_OPTIONS}
          />
          <MultiSelectDropdown
            title="Filtrar por estado..."
            selectedValues={statusFilters}
            toggleOption={(val) => toggleFilter(setStatusFilters, statusFilters, val)}
            options={STATUS_OPTIONS}
          />
          <button className="clear-filters-btn" onClick={clearFilters}>
            Borrar filtros
          </button>
        </div>
      </div>

      {result.error && !loading ? (
        <p className="no-items">No se pudieron cargar los objetos. Intenta de nuevo más tarde.</p>
      ) : loading && !result.data ? (
        <p className="no-items">Cargando objetos...</p>
      ) : items.length === 0 ? (
        <p className="no-items">No se encontraron objetos con esos filtros.</p>
      ) : (
        <>
          <p className="results-count">
            {total} {total === 1 ? 'objeto encontrado' : 'objetos encontrados'}
          </p>
          <div className={`items-grid ${loading ? 'is-loading' : ''}`}>
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-image-wrapper">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="item-image" />
                  ) : (
                    <div className="item-placeholder">Sin foto</div>
                  )}
                  <span className={`status-badge-small ${item.status.toLowerCase()}`}>
                    {isFoundStatus(item.status) ? 'Encontrado' : 'Perdido'}
                  </span>
                </div>
                <div className="item-info">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-category">{item.category}</p>
                  <p className="item-location">
                    {item.city ? `${item.city.split(',')[0]} - ` : ''}
                    {item.location}
                  </p>
                  <button className="view-details-btn" onClick={() => setSelectedItem(item)}>
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="page-btn"
              >
                Anterior
              </button>
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {selectedItem && (
        <ItemDetailModal item={selectedItem} onSelectItem={setSelectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default LostItemsCarousel;
