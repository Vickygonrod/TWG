import React, { useState } from 'react';
import axios from 'axios';

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

    const BACKEND_URL = "https://animated-space-invention-r47gg4gqjrx53wwg6-3001.app.github.dev"; // ¡Verifica tu URL actual del backend!

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
            const response = await axios.post(`${BACKEND_URL}/api/contact`, formData);
            if (response.status === 200) {
                setStatus('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
                setFormData({ // Limpiar el formulario
                    firstName: '',
                    lastName: '',
                    email: '',
                    message: '',
                    subscribeToNewsletter: false,
                });
            } else {
                // Esto es más para errores que no son 2xx pero que el backend no devuelve como error directamente
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
        <div className="container mt-5">
            <h2 className="mb-4 text-center">Contáctanos</h2>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="firstName" className="form-label">Nombre</label>
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
                        <label htmlFor="lastName" className="form-label">Apellido</label>
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
                    <label htmlFor="email" className="form-label">Correo Electrónico</label>
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
                    <label htmlFor="message" className="form-label">Tu Mensaje</label>
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
                        Sí, quiero suscribirme a la lista de correo para recibir novedades.
                    </label>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
            </form>

            {status && (
                <div className={`mt-3 alert ${status.includes('éxito') ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {status}
                </div>
            )}
        </div>
    );
};