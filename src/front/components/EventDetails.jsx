import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  CreditCard 
} from 'lucide-react';
import '../styles/EventDetails.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

// --- NUEVAS IMPORTACIONES DE CAROUSELES ---
import { TestimonialsCarousel } from '../components/TestimonialsCarousel.jsx'; // Asumiendo esta ruta
import { PastEventsCarousel } from '../components/PastEventsCarousel.jsx';     // Asumiendo esta ruta
import { TrustpilotWidget } from "../components/TrustpilotWidget.jsx";


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
  
  // Estado inicial simplificado para la captura de leads
  const [infoRequestData, setInfoRequestData] = useState({
    name: '',
    email: '',
    phone: '', 
    message: ''
  });

  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');

  // --- Lógica de useEffect (se mantiene) ---
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

  useEffect(() => {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
          script.async = true;
          document.body.appendChild(script);
          return () => {
              document.body.removeChild(script);
          };
      }, []);

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
  // AHORA ACEPTAMOS NAME, EMAIL, PHONE y MESSAGE
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

  // Lógica de captura de Lead y Redirección
  const handleInfoRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setSubmissionMessage('');

    // Validación simplificada
    if (!infoRequestData.name || !infoRequestData.email) {
        setSubmissionStatus('error');
        setSubmissionMessage(t('form_error_missing_name_email_info'));
        return;
    }
    
    const INFO_REQUEST_ENDPOINT = `${BACKEND_BASE_URL}/api/information-request`; 

    try {
        const event_id = parseInt(id);
        
        // Envío de datos completo (incluyendo phone y message)
        const response = await axios.post(INFO_REQUEST_ENDPOINT, {
            event_id: event_id,
            name: infoRequestData.name,
            email: infoRequestData.email,
            phone: infoRequestData.phone,   
            message: infoRequestData.message, 
            source: 'event_details_modal_info_lead'
        });

        setSubmissionStatus('success');
        setSubmissionMessage(t(response.data.msg) || t('event_info_request_success_lead'));
        
        // 1. Resetear todos los campos del formulario de información
        setInfoRequestData({ name: '', email: '', phone: '', message: '' }); 
        
        // 2. Cerramos el modal
        setTimeout(() => {
          setShowInfoModal(false); 
        }, 500); 

    } catch (err) {
      setSubmissionStatus('error');
      // El mensaje de error permanece en el modal para que el usuario lo vea
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

  const formattedPrice = event.price_1 ? `${event.price_1} €` : t('event_details_price_not_available');
  const hasDiscount = event.price_2 && event.price_2 < event.price_1;
  const formattedDiscountPrice = hasDiscount ? `${event.price_2} €` : null;

  const isEventPast = new Date(event.date) <= new Date();

  const photos = [
    event.image_url,
    event.second_image_url,
    event.third_image_url,
    event.fourth_image_url,
    event.fifth_image_url
  ].filter(url => url);

  return (
    <div className="event-details-container">
      
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

        {!isEventPast && (
            <a 
                href="#reservation-form-section" 
                className="cta-main-button submit-button btn-orange" 
                style={{ 
                    textDecoration: 'none', 
                    display: 'inline-block', 
                    textAlign: 'center',
                    padding: '15px 40px', 
                    marginLeft: '50px',
                    fontSize: '1.1rem',
                    alignSelf: 'center'
                }} 
            >
                {t('cta_main_reserve_spot')} 
            </a>
        )}
        
        <div className="event-description-section">
          <h2 className="section-title">{t('event_details_about_title')}</h2>
          <p className="event-long-description">
            {event.long_description}
          </p>
          <div className="event-price">
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
      
      
      {/* SECCIÓN DE FORMULARIO DE RESERVA (con ID para el scroll) */}
      <div className="event-form-section" id="reservation-form-section"> 
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
              {/* Formulario de Reserva: Mantiene todos los campos */}
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
              {/* Botones de Reserva / Pago */}
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
                {t('form_button_more_info')}
              </span>
            </div>
            </form>

          </>
        )}
      </div>
      
      {/* ------------------------------------------- */}
      {/* --- NUEVOS CAROUSELES PARA CONFIANZA --- */}
      {/* ------------------------------------------- */}
      
      <PastEventsCarousel />

      <TestimonialsCarousel />
      <div className="trustpilot flex justify-center my-8 px-4">
                      <TrustpilotWidget />
      </div>

      {/* --- MODAL DE CAPTURA DE LEAD (Contáctanos) - CENTRADO Y MEJORADO --- */}
      {showInfoModal && (
        <div 
          className="modal-overlay"
          // *** Estilos Flexbox para centrar el modal en la pantalla ***
          style={{
            display: 'flex',
            alignItems: 'center', // Centrado vertical
            justifyContent: 'center', // Centrado horizontal
          }}
        >
          <div className="info-modal">
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button className="modal-close-button" onClick={() => setShowInfoModal(false)}>
                    <X size={20} />
                </button>
            </div>
            
            {/* Títulos y Subtítulos de Captura de Lead */}
            <h3 className="section-title text-center">{t('modal_title_info_lead')}</h3>
            <p className="modal-subtitle">{t('modal_subtitle_info_lead')}</p>
            
            {submissionMessage && submissionStatus && (
                <div className={`submission-message ${submissionStatus}`}>
                    {submissionMessage}
                </div>
            )}

            <form onSubmit={handleInfoRequestSubmit} className="info-request-form">
              {/* Campo Nombre (Simplificado) */}
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
              {/* Campo Email (Simplificado) */}
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
              {/* AÑADIDO: Campo Teléfono */}
              <div className="form-input-group">
                <Phone size={20} className="form-icon" />
                <input 
                  type="tel" 
                  placeholder={t('form_placeholder_phone_optional')} // Reutilizamos esta clave
                  name="phone"
                  value={infoRequestData.phone}
                  onChange={handleInfoRequestChange}
                />
              </div>
              {/* AÑADIDO: Campo Comentarios/Mensaje */}
              <div className="form-input-group message-group">
                <MessageCircle size={20} className="form-icon" style={{ alignSelf: 'flex-start', marginTop: '10px' }} />
                <textarea 
                  placeholder={t('form_placeholder_message_optional')} // NUEVA CLAVE DE TRADUCCIÓN
                  name="message"
                  value={infoRequestData.message}
                  onChange={handleInfoRequestChange}
                  rows="4" 
                />
              </div>
              
              {/* DISCLAIMER DE TÉRMINOS Y CONDICIONES */}
              <p className="privacy-disclaimer">
                  <small>
                      <span dangerouslySetInnerHTML={{
                          __html: t('eventinfo_privacy_disclaimer', { 
                              privacyPolicyLink: `<a href="/privacy" target="_blank" rel="noopener noreferrer">${t('leadmagnet_privacy_link_text')}</a>`,
                              termsLink: `<a href="/terms" target="_blank" rel="noopener noreferrer">${t('eventinfo_terms_link_text')}</a>`
                          })
                      }} />
                  </small>
              </p>

              <button type="submit" className="submit-button">
                <Send size={20} />
                {t('form_button_send_info_and_reserve')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};