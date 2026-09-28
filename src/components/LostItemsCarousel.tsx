import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ItemDetailModal } from './ItemDetailModal'; // Importa el modal

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/LostItemsCarousel.css';

/**
 * Interface defining the structure of the data coming from Neon/Prisma
 */
interface Item {
  id: number;
  title: string;
  imageUrl: string;
}

export const LostItemsCarousel = () => {
  // 1. State to store the real items coming from the backend
  const [items, setItems] = useState<Item[]>([]);

  // Estado para controlar qué ID de ítem mostrar en el modal. null = modal cerrado
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // 2. Fetch data from NestJS as soon as the component loads
  useEffect(() => {
    fetch('http://localhost:3000/items')
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error('Error fetching items:', error));
  }, []);


  const handleOpenDetails = (id: number) => {
    setSelectedItemId(id);
  };

  const handleCloseDetails = () => {
    setSelectedItemId(null);
  };
  
  return (
    <div className="carousel-container">
      <h2 className="carousel-header">Recently Reported Items</h2>
      
      {/* 3. Conditional rendering: display a message if the database is empty */}
      {items.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#3b6935' }}>No items reported yet.</p>
      ) : (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          className="items-swiper"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="card">
                <div className="card-image-wrapper">
                  <img src={item.imageUrl} alt={item.title} className="card-image" />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{item.title}</h3>
                  <button className="card-button" onClick={() => handleOpenDetails(item.id)}>
                    View details
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <ItemDetailModal 
        itemId={selectedItemId} 
        onClose={handleCloseDetails} 
      />
    </div>
  );
};