import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/landingStyle.css';
import eventImage from '../images/valencia.jpg'; 
import { useNavigate, Link } from 'react-router-dom';

export const EventInfoLanding = ({ checkoutPath = '/events/checkout/event-id' }) => {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); 
    
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    
    const EVENT_INFO_ENDPOINT = `${BACKEND_BASE_URL}/api/waitlist-subscribe`;
    const CHECKOUT_ROUTE = checkoutPath;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setIsError(false);

        // Lógica de validación simplificada (solo Nombre y Email)
        if (!firstName || !email) {
            setMessage(t('leadmagnet_form_validation_1')); 
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            setMessage(t('leadmagnet_form_validation_2'));
            setIsError(true);
            setIsSubmitting(false);
            return;
        }
        
        const requestBody = {
            firstName,
            email,
            language: i18n.language,
            source: 'event_info_landing_simplified',
        };

        try {
            const response = await axios.post(EVENT_INFO_ENDPOINT, requestBody); 

            if (response.status === 200) {
                setIsError(false);
                setIsSuccess(true);
                
                setTimeout(() => {
                    navigate(CHECKOUT_ROUTE);
                }, 1000); 

            } else {
                setMessage(response.data.message || t('eventinfo_error_message_1')); // Mantengo el fallback solo para errores inesperados
                setIsError(true);
            }
        } catch (error) {
            console.error('ERROR Frontend: Fallo al suscribirse como Lead:', error);
            setMessage(t('leadmagnet_unexpected_error')); // Mantengo el fallback solo para errores inesperados
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Contenido de la Landing ---

    if (isSuccess) {
        // VISTA DE ÉXITO
        return (
            <div className="landing-page-wrapper">
                <div className="landing-section hero lead-magnet-hero">
                    <div className="row headerRow">
                        <div className="leftheader col-12">
                            <h1>{t('eventinfo_success_title')}</h1>
                            <h2>{t('eventinfo_success_subtitle')}</h2>
                            <h4 className="subtitle">{t('eventinfo_success_redirect_text')}</h4>
                            <br />
                            <Link to={CHECKOUT_ROUTE} className="btn btn-orange large-btn">
                                {t('eventinfo_success_cta')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="info-page-wrapper"> 
            <div className="landing-section hero lead-magnet-hero">
                <div className="row headerRow">
                    <div className="leftheader col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                        {/* TÍTULOS Y DESCRIPCIONES (sin fallbacks) */}
                        <h2>{t('eventinfo_title')}</h2>
                        <h3>{t('eventinfo_subtitle')}</h3>
                        <h4 className="subtitle">{t('eventinfo_description')}</h4>
                        <h4> {t('eventinfo_subdescription')} </h4> <br />
                        
                        {message && (
                            <div className={`form-message ${isError ? 'error' : 'success'}`}>
                                {message}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="lead-magnet-form">
                            {/* CAMPOS (sin fallbacks) */}
                            <div className="form-group">
                                <label htmlFor="firstName">{t('leadmagnet_firstname_label')}</label>
                                <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isSubmitting}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">{t('leadmagnet_email_label')}</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting}/>
                            </div>
                            
                            {/* DISCLAIMER DE PRIVACIDAD Y TÉRMINOS (sin fallbacks) */}
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
                            
                            <button type="submit" className="btn btn-orange" disabled={isSubmitting}>
                                {t('eventinfo_submit_btn')}
                            </button>
                        </form>
                    </div>
                    
                    <div className="col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                        <img src={eventImage} alt={t('waitlist_img_alt')}/>
                    </div>
                </div>
            </div>
        </div>
    );
};