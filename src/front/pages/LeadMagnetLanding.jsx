import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/landingStyle.css';
import guiarapidaimg from '../images/guiarapidaimg.png';
import quickguideimg from '../images/quickguideimg.png';
import { Link } from 'react-router-dom'; // Importa Link para el enlace interno

export const LeadMagnetLanding = () => {
    // Estados para los campos del formulario
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    // Estado para la casilla de consentimiento de privacidad
    const [isConsentChecked, setIsConsentChecked] = useState(false);

    // Estados para mensajes de feedback al usuario
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { t, i18n } = useTranslation();
    const currentEbookImage = i18n.language === 'en' ? quickguideimg : guiarapidaimg;
    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // Función que se ejecuta al enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setIsError(false);

        // 1. Validación Básica en el cliente
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

        // 2. Nueva validación para el consentimiento
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
            const response = await axios.post(`${BACKEND_BASE_URL}/api/lead-magnet-subscribe`, requestBody);

            if (response.status === 200) {
                setMessage(response.data.message || t('leadmagnet_success_message'));
                setIsError(false);
                setFirstName('');
                setLastName('');
                setEmail('');
                setIsConsentChecked(false); // Limpiamos también el checkbox
            } else {
                setMessage(response.data.message || t('leadmagnet_error_message_1'));
                setIsError(true);
            }
        } catch (error) {
            console.error('ERROR Frontend: Fallo en la conexión o respuesta del formulario:', error);
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
                        <h1>{t('leadmagnet_title')}</h1>
                        <h2>{t('leadmagnet_subtitle')}</h2>
                        <h4 className="subtitle">{t('leadmagnet_description')}</h4>
                        {/* Mensajes de feedback */}
                        {message && (
                            <div className={`form-message ${isError ? 'error' : 'success'}`}>
                                {message}
                            </div>
                        )}
                        {/* Formulario de suscripción */}
                        <form onSubmit={handleSubmit} className="lead-magnet-form">
                            <div className="form-group">
                                <label htmlFor="firstName">{t('leadmagnet_firstname_label')}</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">{t('leadmagnet_lastname_label')}</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">{t('leadmagnet_email_label')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            {/* Nuevo grupo para el checkbox de privacidad */}
                            <div className="form-group privacy-checkbox">
                                <input
                                    type="checkbox"
                                    id="privacy-consent"
                                    checked={isConsentChecked}
                                    onChange={(e) => setIsConsentChecked(e.target.checked)}
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="privacy-consent">
                                    <span dangerouslySetInnerHTML={{
                                        __html: t('leadmagnet_privacy_consent', { privacyPolicyLink: `<a href="/privacy" target="_blank" rel="noopener noreferrer">${t('leadmagnet_privacy_link_text')}</a>` })
                                    }} />
                                </label>
                            </div>
                            <button type="submit" className="btn btn-orange" disabled={isSubmitting || !isConsentChecked}>
                                {isSubmitting ? t('leadmagnet_submitting_btn') : t('leadmagnet_submit_btn')}
                            </button>
                        </form>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                        <img src={currentEbookImage} alt={t('leadmagnet_img_alt')} className="lead-magnet-image"/>
                    </div>
                </div>
            </div>
        </div>
    );
};