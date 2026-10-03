import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import '../styles/ReportItemForm.css';

export const ReportItemForm = () => {
  const initialState = {
    title: '',
    category: '',
    location: '',
    status: 'found',
    description: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); 
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('category', formData.category);
    payload.append('location', formData.location);
    payload.append('status', formData.status);
    payload.append('description', formData.description);
    
    if (imageFile) {
      payload.append('image', imageFile); 
    }

    try {

      const response = await fetch('http://localhost:3000/items', {
        method: 'POST',
        body: payload, 
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      setFormData(initialState);
      setImagePreview(null);
      setImageFile(null);
      setMessage({ type: 'success', text: '¡Objeto publicado exitosamente!' });
      
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Hubo un error al publicar el objeto. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-card">
        <h2 className="form-title">¿Encontraste o perdiste algo?</h2>
        <p className="form-subtitle">Ingresa los detalles del objeto para ayudar a recuperarlo.</p>

        {message && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-field">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="Ej. Cuaderno cuadriculado, Llaves..."
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="category">Categoría</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="" disabled>Selecciona una opción</option>
                <option value="documentos">Documentos personales (TIP, Cédula)</option>
                <option value="tecnologia">Tecnología (Celulares, cargadores)</option>
                <option value="ropa">Ropa (Chaquetas, suéteres)</option>
                <option value="termos">Termos y recipientes</option>
                <option value="accesorios">Accesorios (Gafas, joyas, sombrillas)</option>
                <option value="estudio">Material de estudio (Cuadernos, libros)</option>
                <option value="llaves">Llaves</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="found">Encontrado</option>
                <option value="lost">Perdido</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="location">Ubicación</label>
            <input
              id="location"
              type="text"
              name="location"
              placeholder="Ej. Bloque 19, Biblioteca central..."
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              placeholder="Color, marca, características particulares..."
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Fotografía del objeto</label>
            <div className="file-upload-container">
              <label htmlFor="file-upload" className="file-upload-label">
                {imagePreview ? (
                  <img src={imagePreview} alt="Vista previa" className="preview-image" />
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span>Haz clic aquí para subir una foto</span>
                  </div>
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden-input"
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Publicando...' : 'Publicar Objeto'}
          </button>
        </form>
      </div>
    </div>
  );
};