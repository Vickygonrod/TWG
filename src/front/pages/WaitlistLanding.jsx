import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/landingStyle.css';
// Puedes usar una imagen diferente o la misma si aplica
import eventImage from '../images/valencia.jpg'; 
import { Link } from 'react-router-dom';

export const WaitlistLanding = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [isConsentChecked, setIsConsentChecked] = useState(false);

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { t, i18n } = useTranslation();
    // NOTA: Revisa si necesitas lógica de imagen por idioma o usa una estática
    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    
    // *** CAMBIO CLAVE 1: El nuevo endpoint para la lista de espera ***
    const WAITLIST_ENDPOINT = `${BACKEND_BASE_URL}/api/waitlist-subscribe`; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setIsError(false);

        // ... Tu lógica de validación básica (mantenerla igual) ...
        if (!firstName || !lastName || !email) {
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

        if (!isConsentChecked) {
            setMessage(t('leadmagnet_privacy_error')); // "Debes aceptar la política de privacidad para continuar."
            setIsError(true);
            setIsSubmitting(false);
            return;
        }
        
        // 3. Envío al backend
        const requestBody = {
            firstName,
            lastName,
            email,
            language: i18n.language,
        };

        try {
            // *** CAMBIO CLAVE 2: Llamada al nuevo endpoint ***
            const response = await axios.post(WAITLIST_ENDPOINT, requestBody); 

            if (response.status === 200) {
                // *** CAMBIO CLAVE 3: Mensaje de éxito adaptado ***
                setMessage(response.data.message || t('waitlist_success_message_default', '¡Estás dentro! Te avisaremos cuando se lance el evento.'));
                setIsError(false);
                setFirstName('');
                setLastName('');
                setEmail('');
                setIsConsentChecked(false); 
            } else {
                setMessage(response.data.message || t('waitlist_error_message_1', 'Error al unirte a la lista de espera.'));
                setIsError(true);
            }
        } catch (error) {
            console.error('ERROR Frontend: Fallo al suscribirse a la lista de espera:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setMessage(error.response.data.error);
            } else if (error.message === 'Network Error') {
                setMessage(t('leadmagnet_network_error'));
            } else {
                setMessage(t('leadmagnet_unexpected_error'));
            }
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="landing-page-wrapper">
            <div className="landing-section hero lead-magnet-hero">
                <div className="row headerRow">
                    <div className="leftheader col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                        {/* *** CAMBIO DE TEXTOS PARA EL EVENTO *** */}
                        <h1>{t('waitlist_title')}</h1>
                        <h2>{t('waitlist_subtitle')}</h2>
                        <h4 className="subtitle">{t('waitlist_description')}</h4>
                        <h4> {t('waitlist_subdescription')} </h4> <br />
                        {/* -------------------------------------- */}
                        
                        {message && (
                            <div className={`form-message ${isError ? 'error' : 'success'}`}>
                                {message}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="lead-magnet-form">
                            {/* ... Campos del formulario (iguales) ... */}
                            <div className="form-group">
                                <label htmlFor="firstName">{t('leadmagnet_firstname_label')}</label>
                                <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isSubmitting}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">{t('leadmagnet_lastname_label')}</label>
                                <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isSubmitting}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">{t('leadmagnet_email_label')}</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting}/>
                            </div>
                            
                            <div className="form-group privacy-checkbox">
                                <input type="checkbox" id="privacy-consent" checked={isConsentChecked} onChange={(e) => setIsConsentChecked(e.target.checked)} disabled={isSubmitting}/>
                                <label htmlFor="privacy-consent">
                                    <span dangerouslySetInnerHTML={{
                                        __html: t('leadmagnet_privacy_consent', { privacyPolicyLink: `<a href="/privacy" target="_blank" rel="noopener noreferrer">${t('leadmagnet_privacy_link_text')}</a>` })
                                    }} />
                                </label>
                            </div>
                            
                            <button type="submit" className="btn btn-orange" disabled={isSubmitting || !isConsentChecked}>
                                {/* *** CAMBIO DE TEXTO DEL BOTÓN *** */}
                                {isSubmitting ? t('waitlist_submitting_btn') : t('waitlist_submit_btn')}
                            </button>
                        </form>
                    </div>
                    
                    <div className="col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                        <img src={eventImage} alt={t('waitlist_img_alt', 'Imagen del evento')} className="lead-magnet-image"/>
                    </div>
                </div>
            </div>
        </div>
    );
};