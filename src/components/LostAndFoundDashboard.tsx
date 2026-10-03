import React, { useState } from 'react';
import { ReportItemForm } from './ReportItemForm';
// import { SearchItems } from './SearchItems'; // Tu otro componente

export const LostAndFoundDashboard = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'publish'>('publish');

  return (
    <div className="dashboard-container">
      <div className="hero-text">
        <h1>¿Encontraste algo? Ayuda a otros a recuperar sus pertenencias reportando un objeto.</h1>
      </div>

      <div className="tabs-header">
        <button 
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Buscar Objetos
        </button>
        <button 
          className={`tab-button ${activeTab === 'publish' ? 'active' : ''}`}
          onClick={() => setActiveTab('publish')}
        >
          ➕ Publicar Objeto
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'publish' ? (
          <ReportItemForm />
        ) : (
          <div>{/* <SearchItems /> */} <p>Sección de búsqueda en construcción...</p></div>
        )}
      </div>
    </div>
  );
};