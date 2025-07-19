import React, { useState, useEffect } from 'react';
import '../styles/NewsletterSignUpPopup.css'; // Importa el archivo CSS para los estilos del pop-up
import axios from 'axios'; // ¡IMPORTA AXIOS!
import { useTranslation } from 'react-i18next';

const NewsletterSignUpPopup = ({ showPopup, onClose }) => {
    // Estados para los campos del formulario
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const { t, i18n } = useTranslation(); // <-- ¡MODIFICADO AQUÍ! Añadido `i18n`

    // Estados para mensajes de feedback al usuario
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- ¡CAMBIO CRÍTICO AQUÍ! ---
    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // Efecto para limpiar el formulario y mensajes cuando el pop-up se abre
    useEffect(() => {
        if (showPopup) {
            setMessage('');
            setIsError(false);
            setFirstName('');
            setLastName('');
            setEmail('');
        }
    }, [showPopup]);

    // Función que se ejecuta al enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita la recarga de la página
        setIsSubmitting(true); // Bloquea el botón de envío

        // 1. Validación Básica en el cliente
        if (!firstName || !lastName || !email) {
            setMessage('Todos los campos son obligatorios.');
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        // Validación simple de formato de email
        if (!email.includes('@') || !email.includes('.')) {
            setMessage('Por favor, introduce un email válido.');
            setIsError(true);
            setIsSubmitting(false);
            return;
        }

        // Limpiar mensajes de feedback anteriores
        setMessage('');
        setIsError(false);

        // Prepara los datos a enviar al backend.
        const requestBody = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            // Este mensaje irá al email de notificación del Contact Form
            message: "Suscripción desde pop-up de newsletter en la Comunidad.",
            // Esto es CRUCIAL: siempre true para este pop-up
            subscribeToNewsletter: true,
            // ¡NUEVO! Envía el idioma detectado automáticamente
            language: i18n.language // <-- ¡AÑADIDO AQUÍ!
        };

        // --- DEBUGGING: Revisa estos logs en la Consola de tu navegador (F12) ---
        console.log("DEBUG POPUP Frontend: Datos a enviar:", requestBody);
        console.log("DEBUG POPUP Frontend: URL de envío:", `${BACKEND_BASE_URL}/api/contact`);
        // -------------------------------------------------------------------------

        try {
            const response = await axios.post(`${BACKEND_BASE_URL}/api/contact`, requestBody);

            if (response.status === 200) {
                setMessage(response.data.message || '¡Gracias por suscribirte! Revisa tu bandeja de entrada.');
                setIsError(false);
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setMessage(response.data.message || 'Error al suscribirte. Por favor, inténtalo de nuevo.');
                setIsError(true);
            }
        } catch (error) {
            console.error('ERROR POPUP Frontend: Fallo en la conexión o respuesta del formulario de suscripción:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setMessage(error.response.data.error);
            } else if (error.message === 'Network Error') {
                setMessage('Error de red. Asegúrate de que tu backend está funcionando.');
            } else {
                setMessage('Hubo un problema de conexión. Por favor, inténtalo más tarde.');
            }
            setIsError(true);
        } finally {
            setIsSubmitting(false); // Habilita el botón de envío de nuevo
        }
    };

    if (!showPopup) {
        return null;
    }

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2 className="popup-title">{t('newsletter_popup_1')}</h2>
                <p className="popup-description">
                    {t('newsletter_popup_2')}
                </p>

                {message && (
                    <div className={`form-message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="newsletter-form">
                    <div className="form-group">
                        <label htmlFor="popupFirstName">{t('newsletter_popup_3')}</label>
                        <input
                            type="text"
                            id="popupFirstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="popupLastName">{t('newsletter_popup_4')}</label>
                        <input
                            type="text"
                            id="popupLastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="popupEmail">{t('newsletter_popup_5')}</label>
                        <input
                            type="email"
                            id="popupEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? t('newsletter_popup_6') : t('newsletter_popup_7')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewsletterSignUpPopup;