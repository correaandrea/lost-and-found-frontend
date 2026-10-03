import React from 'react';
import '../styles/ItemDetailModal.css';


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


interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  // Si por alguna razón no llega el item, no renderizamos el modal
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>
        
        <div className="item-details">
          <h2>{item.title || 'Objeto sin nombre'}</h2>
          
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.title} className="item-image" />
          )}
          
          <div className="item-info">
            <p><strong>Estado:</strong> {item.status}</p>
            <p><strong>Categoría:</strong> {item.category}</p>
            <p><strong>Descripción:</strong> {item.description}</p>
            <p><strong>Ubicación donde se encontró:</strong> {item.location}</p>
            <p><strong>Fecha:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};