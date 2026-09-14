import { LostItemsCarousel } from './components/LostItemsCarousel';
import './index.css';

function App() {
  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Lost & Found Uni</h1>
      </header>
      
      <section className="content-section">
        <LostItemsCarousel />
      </section>
    </main>
  );
}

export default App;