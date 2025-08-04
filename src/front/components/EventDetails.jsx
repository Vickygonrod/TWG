import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  DollarSign,
  User,
  Users,
  Locate,
  Mail,
  Phone,
  Send,
  Ticket
} from 'lucide-react';
import '../styles/EventDetails.css'; // ¡Importante! No olvides esta línea

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    participants: 1
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      const eventId = parseInt(id);
      if (isNaN(eventId)) {
        setError("El ID del evento no es válido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_BASE_URL}/api/events/${eventId}`);
        if (response.data) {
          setEvent(response.data);
        } else {
          setError("El evento no fue encontrado.");
        }
      } catch (err) {
        console.error("Error en la llamada a la API:", err);
        setError("Error al cargar los detalles del evento.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del formulario enviados:", formData);
  };

  if (loading) {
    return (
      <div className="event-loading">
        <div className="spinner"></div>
        <p>Cargando detalles del evento...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="event-error">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="event-not-found">
        <p>Evento no encontrado.</p>
      </div>
    );
  }
  
  const formattedDate = event.date
    ? format(new Date(event.date), 'd MMMM yyyy', { locale: es })
    : 'Fecha no disponible';

  const formattedPrice = event.price_1 ? `${event.price_1} €` : 'Precio no disponible';

  return (
    <div className="event-details-container">
      <div className="event-card-container">
        
        {/* Sección 1: Imagen y Detalles Principales */}
        <div className="event-main-content">
          <div className="event-details-info">
            <h1 className="event-title">{event.name}</h1>
            <p className="event-short-description">{event.short_description}</p>
            
            <ul className="event-info-list">
              <li>
                <Calendar className="event-icon" size={24} />
                <span>{formattedDate}</span>
              </li>
              <li>
                <Locate className="event-icon" size={24} />
                <span>{event.location}</span>
              </li>
              <li>
                <Users className="event-icon" size={24} />
                <span>{event.max_participants ? `${event.max_participants} Participantes` : 'Capacidad ilimitada'}</span>
              </li>
            </ul>
          </div>
          <div className="event-image-container">
            <img 
              src={event.image_url} 
              alt={event.name} 
              className="event-image"
            />
          </div>
        </div>
        
        {/* Sección 2: Descripción Larga y Precio */}
        <div className="event-description-section">
          <h2 className="section-title">Sobre el evento</h2>
          <p className="event-long-description">
            {event.long_description}
          </p>
          <div className="event-price">
            <DollarSign className="price-icon" size={24} />
            <span className="price-text">{formattedPrice}</span>
          </div>
        </div>
      </div>

      {/* Sección 3: Formulario de Reserva */}
      <div className="event-form-section">
        <h2 className="section-title text-center">¡Reserva tu Plaza Ahora!</h2>
        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-input-group">
            <User size={20} className="form-icon" />
            <input 
              type="text" 
              placeholder="Nombre completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-input-group">
            <Mail size={20} className="form-icon" />
            <input 
              type="email" 
              placeholder="Correo electrónico"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-input-group">
            <Phone size={20} className="form-icon" />
            <input 
              type="tel" 
              placeholder="Teléfono (opcional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange} 
            />
          </div>
          <div className="form-input-group">
            <Ticket size={20} className="form-icon" />
            <input 
              type="number" 
              placeholder="Número de participantes"
              name="participants"
              value={formData.participants}
              onChange={handleChange} 
              min="1"
              required 
            />
          </div>
          <button type="submit" className="submit-button">
            <Send size={20} />
            Confirmar Reserva
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventDetails;