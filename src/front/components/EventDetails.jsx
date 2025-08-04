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
  Ticket,
  MessageCircle,
  X
} from 'lucide-react';
import '../styles/EventDetails.css';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [reservationData, setReservationData] = useState({
    name: '',
    email: '',
    phone: '',
    participants_count: 1 // Nombre del campo actualizado
  });
  const [infoRequestData, setInfoRequestData] = useState({
    name: '',
    email: '',
    phone: '',
    comments: ''
  });

  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');

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

  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setReservationData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleInfoRequestChange = (e) => {
    const { name, value } = e.target;
    setInfoRequestData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setSubmissionMessage('');

    try {
      const event_id = parseInt(id);
      const response = await axios.post(`${BACKEND_BASE_URL}/api/reservation`, {
        event_id: event_id,
        ...reservationData
      });

      setSubmissionStatus('success');
      setSubmissionMessage(response.data.msg);

      setReservationData({
        name: '',
        email: '',
        phone: '',
        participants_count: 1
      });

    } catch (err) {
      setSubmissionStatus('error');
      setSubmissionMessage(err.response?.data?.msg || "Ocurrió un error al procesar tu reserva.");
      console.error("Error al enviar el formulario de reserva:", err);
    }
  };

  const handleInfoRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setSubmissionMessage('');

    try {
      const event_id = parseInt(id);
      const response = await axios.post(`${BACKEND_BASE_URL}/api/information-request`, {
        event_id: event_id,
        ...infoRequestData
      });

      setSubmissionStatus('success');
      setSubmissionMessage(response.data.msg);
      setShowInfoModal(false);

      setInfoRequestData({
        name: '',
        email: '',
        phone: '',
        comments: ''
      });

    } catch (err) {
      setSubmissionStatus('error');
      setSubmissionMessage(err.response?.data?.msg || "Ocurrió un error al enviar tu solicitud.");
      console.error("Error al enviar la solicitud de información:", err);
    }
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

      {/* Sección 3: Formularios y Botones */}
      <div className="event-form-section">
        <h2 className="section-title text-center">¡Reserva tu Plaza Ahora!</h2>
        
        {submissionMessage && (
            <div className={`submission-message ${submissionStatus}`}>
                {submissionMessage}
            </div>
        )}

        <form onSubmit={handleReservationSubmit} className="reservation-form">
          <div className="form-input-group">
            <User size={20} className="form-icon" />
            <input 
              type="text" 
              placeholder="Nombre completo"
              name="name"
              value={reservationData.name}
              onChange={handleReservationChange}
              required 
            />
          </div>
          <div className="form-input-group">
            <Mail size={20} className="form-icon" />
            <input 
              type="email" 
              placeholder="Correo electrónico"
              name="email"
              value={reservationData.email}
              onChange={handleReservationChange}
              required 
            />
          </div>
          <div className="form-input-group">
            <Phone size={20} className="form-icon" />
            <input 
              type="tel" 
              placeholder="Teléfono (opcional)"
              name="phone"
              value={reservationData.phone}
              onChange={handleReservationChange} 
            />
          </div>
          <div className="form-input-group">
            <Ticket size={20} className="form-icon" />
            <input 
              type="number" 
              placeholder="Número de participantes"
              name="participants_count"
              value={reservationData.participants_count}
              onChange={handleReservationChange} 
              min="1"
              required 
            />
          </div>
          <button type="submit" className="submit-button">
            <Send size={20} />
            Confirmar Reserva
          </button>
        </form>

        <div className="info-contact-section">
          <button onClick={() => setShowInfoModal(true)} className="info-button">
            <MessageCircle size={20} />
            Más información o Contacto
          </button>
        </div>
      </div>

      {/* Modal para la solicitud de información */}
      {showInfoModal && (
        <div className="modal-overlay">
          <div className="info-modal">
            <button className="modal-close-button" onClick={() => setShowInfoModal(false)}>
              <X size={24} />
            </button>
            <h2 className="section-title text-center">Solicitar Más Información</h2>
            <form onSubmit={handleInfoRequestSubmit} className="info-request-form">
              <div className="form-input-group">
                <User size={20} className="form-icon" />
                <input 
                  type="text" 
                  placeholder="Nombre completo"
                  name="name"
                  value={infoRequestData.name}
                  onChange={handleInfoRequestChange}
                  required 
                />
              </div>
              <div className="form-input-group">
                <Mail size={20} className="form-icon" />
                <input 
                  type="email" 
                  placeholder="Correo electrónico"
                  name="email"
                  value={infoRequestData.email}
                  onChange={handleInfoRequestChange}
                  required 
                />
              </div>
              <div className="form-input-group">
                <Phone size={20} className="form-icon" />
                <input 
                  type="tel" 
                  placeholder="Teléfono (opcional)"
                  name="phone"
                  value={infoRequestData.phone}
                  onChange={handleInfoRequestChange} 
                />
              </div>
              <div className="form-input-group">
                <MessageCircle size={20} className="form-icon" />
                <textarea 
                  placeholder="Comentarios o preguntas"
                  name="comments"
                  value={infoRequestData.comments}
                  onChange={handleInfoRequestChange}
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                <Send size={20} />
                Enviar Solicitud
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;


//me quedé por añadir a los contactos y las reservas a sus grupos de mailer send! Hay que revisar los estilos, hacer las traducciones y los condicionales de los idiomas también. 
