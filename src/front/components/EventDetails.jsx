import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale'; 
import { useTranslation } from 'react-i18next'; 
import {
  Calendar,
  User,
  Users,
  Locate,
  Mail,
  Phone,
  Send,
  Ticket,
  MessageCircle,
  X,
  Upload,
  CreditCard // <--- Importa este ícono
} from 'lucide-react';
import '../styles/EventDetails.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

// --- COMPONENTES ---
import UploadPhotoForm from '../pages/UploadPhotoForm.jsx';
import PhotoGallery from '../pages/PhotoGallery.jsx';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventDetails = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [reservationData, setReservationData] = useState({
    name: '',
    email: '',
    phone: '',
    participants_count: 1
  });
  const [infoRequestData, setInfoRequestData] = useState({
    name: '',
    email: '',
    phone: '',
    comments: ''
  });

  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');

  // --- Lógica para verificar si es admin ---
  // const jwtToken = localStorage.getItem("admin_access_token");
  // const isAdmin = !!jwtToken;
  // const [showAdminUploadForm, setShowAdminUploadForm] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      const eventId = parseInt(id);
      if (isNaN(eventId)) {
        setError(t('event_details_invalid_id'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_BASE_URL}/api/events/${eventId}`);
        if (response.data) {
          setEvent(response.data);
        } else {
          setError(t('event_details_not_found'));
        }
      } catch (err) {
        console.error("Error en la llamada a la API:", err);
        setError(t('event_details_api_error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id, t]);

  // --- Lógica para actualizar las fotos localmente tras una subida exitosa ---
  const handlePhotoUploadSuccess = (newPhoto) => {
    setEvent(prevEvent => ({
      ...prevEvent,
      photos: [...(prevEvent.photos || []), newPhoto]
    }));
  };
  
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

  // --- FUNCIÓN ORIGINAL: Maneja la reserva SIN PAGO ---
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
      setSubmissionMessage(t(response.data.msg) || t('event_reservation_success'));

      setReservationData({
        name: '',
        email: '',
        phone: '',
        participants_count: 1
      });

    } catch (err) {
      setSubmissionStatus('error');
      setSubmissionMessage(t(err.response?.data?.msg) || t('event_reservation_error'));
      console.error("Error al enviar el formulario de reserva:", err);
    }
  };

  // --- FUNCIÓN NUEVA: Manejar el pago con Stripe ---
  const handleStripeCheckout = async (e) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setSubmissionMessage('');

    if (!reservationData.name || !reservationData.email) {
      setSubmissionStatus('error');
      setSubmissionMessage(t('form_error_missing_name_email'));
      return;
    }
    
    // Verificación adicional para el precio
    if (!event.stripe_price_id) {
        setSubmissionStatus('error');
        setSubmissionMessage(t('payment_error_no_price_id'));
        return;
    }

    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/api/create-checkout-session`, {
        price_id: event.stripe_price_id,
        customer_email: reservationData.email,
        customer_name: reservationData.name,
        event_id: event.id,
      });

      const { checkout_url } = response.data;
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        setSubmissionStatus('error');
        setSubmissionMessage(t('payment_error_no_url'));
      }
    } catch (err) {
      setSubmissionStatus('error');
      setSubmissionMessage(t(err.response?.data?.error) || t('payment_error_general'));
      console.error("Error en la llamada a la API de Stripe:", err);
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
      setSubmissionMessage(t(response.data.msg) || t('event_info_request_success'));
      setShowInfoModal(false);

      setInfoRequestData({
        name: '',
        email: '',
        phone: '',
        comments: ''
      });

    } catch (err) {
      setSubmissionStatus('error');
      setSubmissionMessage(t(err.response?.data?.msg) || t('event_info_request_error'));
      console.error("Error al enviar la solicitud de información:", err);
    }
  };

  const getLocale = () => {
    return i18n.language === 'en' ? enUS : es;
  };

  if (loading) {
    return (
      <div className="event-loading">
        <div className="spinner"></div>
        <p>{t('event_details_loading')}</p>
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
        <p>{t('event_details_not_found_message')}</p>
      </div>
    );
  }
  
  const formattedDate = event.date
    ? format(new Date(event.date), 'd MMMM yyyy', { locale: getLocale() })
    : t('event_details_date_not_available');

  // --- CAMBIO AÑADIDO: Lógica para manejar el precio con descuento ---
  const formattedPrice = event.price_1 ? `${event.price_1} €` : t('event_details_price_not_available');
  const hasDiscount = event.price_2 && event.price_2 < event.price_1;
  const formattedDiscountPrice = hasDiscount ? `${event.price_2} €` : null;

  const isEventPast = new Date(event.date) <= new Date();

  // --- CÓDIGO DEL CARRUSEL ---
  const photos = [
    event.image_url,
    event.second_image_url,
    event.third_image_url,
    event.fourth_image_url,
    event.fifth_image_url
  ].filter(url => url);

  return (
    <div className="event-details-container">
      
      {/* ------------------- SECCIÓN SÓLO PARA ADMIN ------------------- */}
      {/* {isAdmin && (
        <div className="admin-section">
          <button 
            className="admin-button" 
            onClick={() => setShowAdminUploadForm(!showAdminUploadForm)}
          >
            <Upload size={20} />
            {showAdminUploadForm ? 'Ocultar Formulario de Fotos' : 'Subir Fotos al Álbum'}
          </button>
          {showAdminUploadForm && (
            <div className="admin-upload-form-container">
              <UploadPhotoForm 
                eventId={event.id} 
                jwtToken={jwtToken}
                onUploadSuccess={handlePhotoUploadSuccess}
              />
            </div>
          )}
        </div>
      )} */}
      
      <div className="event-card-container">
        
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
                <span>{event.max_participants ? t('event_details_participants', { count: event.max_participants }) : t('event_details_unlimited_capacity')}</span>
              </li>
            </ul>
          </div>
          <div className="event-image-container">
            {photos.length > 0 ? (
              <Carousel 
                showArrows={true} 
                showStatus={false} 
                showThumbs={true}
                swipeable={false}      
                emulateTouch={false}    
                className="event-carousel"
              >
                {photos.map((url, index) => (
                  <div key={index}>
                    <img src={url} alt={`${event.name} - Foto ${index + 1}`} className="event-image" />
                  </div>
                ))}
              </Carousel>
            ) : (
              <p>No hay fotos disponibles para este evento.</p>
            )}
          </div>
        </div>
        
        <div className="event-description-section">
          <h2 className="section-title">{t('event_details_about_title')}</h2>
          <p className="event-long-description">
            {event.long_description}
          </p>
          <div className="event-price">
            {/* --- CAMBIO AÑADIDO: Lógica para mostrar el precio original y el de descuento --- */}
            {hasDiscount ? (
              <>
                
                <span className="price-text original-price">{formattedPrice}</span>
                <span className="price-text discount-price">{formattedDiscountPrice}</span>
              </>
            ) : (
              <>
                <span className="price-icon">€</span>
                <span className="price-text">{formattedPrice}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      

      <div className="event-form-section">
        {isEventPast ? (
          <div className="event-ended-message">
            <h2 className="section-title text-center">{t('event_details_ended_title')}</h2>
            <p>{t('event_details_ended_message')}</p>
          </div>
        ) : (
          <>
            <h2 className="section-title text-center">{t('event_details_reserve_now')}</h2>
            
            {submissionMessage && (
              <div className={`submission-message ${submissionStatus}`}>
                {submissionMessage}
              </div>
            )}

            <form className="reservation-form">
              <div className="form-input-group">
                <User size={20} className="form-icon" />
                <input 
                  type="text" 
                  placeholder={t('form_placeholder_full_name')}
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
                  placeholder={t('form_placeholder_email')}
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
                  placeholder={t('form_placeholder_phone_optional')}
                  name="phone"
                  value={reservationData.phone}
                  onChange={handleReservationChange} 
                />
              </div>
              <div className="form-input-group">
                <Ticket size={20} className="form-icon" />
                <input 
                  type="number" 
                  placeholder={t('form_placeholder_participants')}
                  name="participants_count"
                  value={reservationData.participants_count}
                  onChange={handleReservationChange} 
                  min="1"
                  required 
                />
              </div>
              {/* --- RENDERIZADO CONDICIONAL DEL BOTÓN DE PAGO/RESERVA --- */}
              {event.stripe_price_id ? (
                <button 
                  type="button" 
                  className="submit-button"
                  onClick={handleStripeCheckout}
                >
                  <CreditCard size={20} />
                  {t('form_button_pay_with_stripe')}
                </button>
              ) : (
                <button 
                  type="button" 
                  className="submit-button"
                  onClick={handleReservationSubmit}
                >
                  <Send size={20} />
                  {t('form_button_confirm_reservation')}
                </button>
              )}
            <div className="info-contact-section">
              <span onClick={() => setShowInfoModal(true)} className="info-link">
                <MessageCircle size={20} />
                {t('form_button_more_info')}
              </span>
            </div>
            </form>

          </>
        )}
      </div>

      {showInfoModal && (
        <div className="modal-overlay">
          <div className="info-modal">
            <button className="modal-close-button" onClick={() => setShowInfoModal(false)}>
              <X size={24} />
            </button>
            <h2 className="section-title text-center">{t('modal_title_info_request')}</h2>
            <form onSubmit={handleInfoRequestSubmit} className="info-request-form">
              <div className="form-input-group">
                <User size={20} className="form-icon" />
                <input 
                  type="text" 
                  placeholder={t('form_placeholder_full_name')}
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
                  placeholder={t('form_placeholder_email')}
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
                  placeholder={t('form_placeholder_phone_optional')}
                  name="phone"
                  value={infoRequestData.phone}
                  onChange={handleInfoRequestChange} 
                />
              </div>
              <div className="form-input-group">
                <MessageCircle size={20} className="form-icon" />
                <textarea 
                  placeholder={t('form_placeholder_comments')}
                  name="comments"
                  value={infoRequestData.comments}
                  onChange={handleInfoRequestChange}
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                <Send size={20} />
                {t('form_button_send_request')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};