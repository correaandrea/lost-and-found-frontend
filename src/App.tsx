import { useState, useEffect } from 'react';
import LostItemsCarousel from './components/LostItemsCarousel'; 
import { ReportItemForm } from './components/ReportItemForm';
import { UserProfile } from './components/UserProfile.tsx';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'publish' | 'profile'>('search');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; picture: string; email: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleToken = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    try {
     
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ name: payload.name, picture: payload.picture, email: payload.email });
    } catch (e) {
      console.error("Error leyendo el token", e);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) handleToken(storedToken);

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      handleToken(tokenFromUrl);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setShowDropdown(false);
    setActiveTab('search');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">Lost & Found UdeA</div>
        <div className="nav-links">
          <button className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>Buscar Objetos</button>
          
          {isAuthenticated && (
            <button className={`nav-btn ${activeTab === 'publish' ? 'active' : ''}`} onClick={() => setActiveTab('publish')}>Publicar Objeto</button>
          )}

          {isAuthenticated && user ? (
            <div className="profile-menu-container">
              <button className="profile-btn" onClick={() => setShowDropdown(!showDropdown)}>
                {user.picture ? (
                  <img src={user.picture} alt="Perfil" className="profile-img" />
                ) : (
                  <div className="profile-avatar">{user.name.charAt(0)}</div>
                )}
                <span className="profile-name">{user.name}</span>
                <span className="dropdown-icon">▼</span>
              </button>
              
              {showDropdown && (
                <div className="profile-dropdown">
                  <button onClick={() => { setActiveTab('profile'); setShowDropdown(false); }}>Mi Perfil</button>
                  <button onClick={handleLogout} className="logout-text">Cerrar Sesión</button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-btn login-btn" onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>Ingresar con Google</button>
          )}
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'search' && <LostItemsCarousel />}
        {activeTab === 'publish' && isAuthenticated && <ReportItemForm />}
        {activeTab === 'profile' && isAuthenticated && <UserProfile user={user} />}
        
        {activeTab !== 'search' && !isAuthenticated && (
          <div className="login-message">
            <h2>Debes iniciar sesión</h2>
            <p>Por favor ingresa con tu cuenta institucional de la UdeA.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;