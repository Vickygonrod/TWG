import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export const ContactForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
        subscribeToNewsletter: false,
    });
    const [status, setStatus] = useState(''); // Para mostrar mensajes de éxito o error
    const [loading, setLoading] = useState(false); // Para el estado de carga
    const { t, i18n } = useTranslation(); // <-- AÑADIDO: accedemos al objeto i18n

    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('');
        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                // El idioma de la app se envía automáticamente.
                // Usamos i18n.language para obtener el idioma actual ('es' o 'en').
                language: i18n.language, 
            };

            const response = await axios.post(`${BACKEND_BASE_URL}/api/contact`, dataToSend);
            
            if (response.status === 200) {
                setStatus('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    message: '',
                    subscribeToNewsletter: false,
                });
            } else {
                setStatus('Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo.');
            }
        } catch (error) {
            console.error("Error al enviar el formulario de contacto:", error);
            if (error.response && error.response.data && error.response.data.error) {
                setStatus(`Error: ${error.response.data.error}`);
            } else if (error.message === 'Network Error') {
                setStatus('Error de red. Asegúrate de que tu backend está funcionando.');
            } else {
                setStatus('Ocurrió un error inesperado al enviar el mensaje.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
         <div className="contact-form min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
            <div className="rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-lg w-full transform transition-all duration-300 hover:scale-105">
            <h2 className="mb-4 text-center">{t('contact_form_1')}</h2>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="firstName" className="form-label">{t('contact_form_2')}</label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label">{t('contact_form_3')}</label>
                        <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">{t('contact_form_4')}</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="message" className="form-label">{t('contact_form_5')}</label>
                    <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="form-check mb-3">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="subscribeToNewsletter"
                        name="subscribeToNewsletter"
                        checked={formData.subscribeToNewsletter}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="subscribeToNewsletter">
                        {t('contact_form_6')}
                    </label>
                </div>
                <button type="submit" className="btn btn-orange" disabled={loading}>
                    {loading ? t('contact_form_7') : t('contact_form_8')}
                </button>
            </form>

            {status && (
                <div className={`mt-3 alert ${status.includes('éxito') ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {status}
                </div>
            )}
        </div>
        </div>
    );
};