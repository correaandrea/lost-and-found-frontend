import { useState } from 'react';
import { LostItemsCarousel } from './components/LostItemsCarousel'; 
import { ReportItemForm } from './components/ReportItemForm';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'publish'>('search');

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">Lost & Found UdeA</div>
        <div className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Buscar Objetos
          </button>
          <button 
            className={`nav-btn ${activeTab === 'publish' ? 'active' : ''}`}
            onClick={() => setActiveTab('publish')}
          >
            Publicar Objeto
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'search' ? (
          <LostItemsCarousel />
        ) : (
          <ReportItemForm />
        )}
      </main>
    </div>
  );
}

export default App;