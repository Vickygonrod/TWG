import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/landingStyle.css'; // Mantenemos el estilo de la landing
import ebookimgEs from '../images/booksNBG-es.png';
import ebookimgEn from '../images/booksNBG-en.png';

export const LeadMagnetLanding = () => {
    // Estados para los campos del formulario
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    // Estados para mensajes de feedback al usuario
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { t, i18n } = useTranslation();
    const currentEbookImage = i18n.language === 'en' ? ebookimgEn : ebookimgEs;
    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // Función que se ejecuta al enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setIsError(false);

        // 1. Validación Básica en el cliente
        if (!firstName || !lastName || !email) {
            setMessage(t('leadmagnet_form_validation_1')); // "Todos los campos son obligatorios."
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        // Validación simple de formato de email
        if (!email.includes('@') || !email.includes('.')) {
            setMessage(t('leadmagnet_form_validation_2')); // "Por favor, introduce un email válido."
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        const requestBody = {
            firstName,
            lastName,
            email,
            language: i18n.language,
        };

        try {
            const response = await axios.post(`${BACKEND_BASE_URL}/api/lead-magnet-subscribe`, requestBody);

            if (response.status === 200) {
                setMessage(response.data.message || t('leadmagnet_success_message')); // "¡Gracias por suscribirte! Revisa tu bandeja de entrada."
                setIsError(false);
                // Opcional: Limpiar el formulario al tener éxito
                setFirstName('');
                setLastName('');
                setEmail('');
            } else {
                setMessage(response.data.message || t('leadmagnet_error_message_1')); // "Error al suscribirte. Por favor, inténtalo de nuevo."
                setIsError(true);
            }
        } catch (error) {
            console.error('ERROR Frontend: Fallo en la conexión o respuesta del formulario:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setMessage(error.response.data.error);
            } else if (error.message === 'Network Error') {
                setMessage(t('leadmagnet_network_error')); // "Error de red. Asegúrate de que tu backend está funcionando."
            } else {
                setMessage(t('leadmagnet_unexpected_error')); // "Hubo un problema de conexión. Por favor, inténtalo más tarde."
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
                            <button type="submit" className="btn btn-orange" disabled={isSubmitting}>
                                {isSubmitting ? t('leadmagnet_submitting_btn') : t('leadmagnet_submit_btn')}
                            </button>
                        </form>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                        <img src={currentEbookImage} alt={t('leadmagnet_img_alt')} className="lead-magnet-image"/>
                    </div>
                </div>
            </div>
            {/* Puedes añadir más secciones aquí si quieres */}
        </div>
    );
};