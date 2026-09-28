import React, { useEffect, useState } from 'react';
import '../styles/ItemDetailModal.css';

interface ItemDetailModalProps {
  itemId: string | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ itemId, onClose }) => {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!itemId) return;
    
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/items/${itemId}`);
        if (!response.ok) throw new Error('Error al obtener los detalles');
        
        console.log('Response status:', response.status); // Log the response status
        console.log('Response body:', response.body); // Log the response status
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemId]);

  if (!itemId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>
        
        {loading ? (
          <p className="loading-text">Cargando detalles...</p>
        ) : item ? (
          <div className="item-details">
            <h2>{item.name || 'Objeto sin nombre'}</h2>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="item-image" />
            )}
            <div className="item-info">
              <p><strong>Estado:</strong> {item.status}</p>
              <p><strong>Categoría:</strong> {item.category}</p>
              <p><strong>Descripción:</strong> {item.description}</p>
              <p><strong>Ubicación donde se encontró:</strong> {item.location}</p>
              <p><strong>Fecha:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>

            </div>
          </div>
        ) : (
          <p>No se encontró información para este objeto.</p>
        )}
      </div>
    </div>
  );
};