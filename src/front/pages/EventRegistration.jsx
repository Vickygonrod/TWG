import React, { useState } from 'react';
import axios from 'axios';
import '../styles/eventRegistrationForm.css'; // Ruta CSS en minúscula
import { useTranslation } from 'react-i18next';

export const EventRegistration = () => {
  const { t } = useTranslation();

  // --- Datos predefinidos (NO SE TRADUCEN, son nombres fijos de eventos) ---
  const predefinedEvents = [
    "Juega a Crear 29/06/25",
    "Play and Create 08/06/25",
    "Creative Flow Full-Day 20/07/25"
  ];

  // --- Opciones artísticas (CON ESTRUCTURA DE OBJETO PARA TRADUCCIÓN) ---
  const artisticOptions = [
    { key: "artistic_watercolor", value: "Acuarela" },
    { key: "artistic_acting", value: "Actuación" },
    { key: "artistic_clay", value: "Arcilla" },
    { key: "artistic_dance", value: "Baile" },
    { key: "artistic_embroidery", value: "Bordado" },
    { key: "artistic_singing", value: "Canto" },
    { key: "artistic_ceramics", value: "Cerámica" },
    { key: "artistic_sewing", value: "Costura" },
    { key: "artistic_drawing", value: "Dibujo" },
    { key: "artistic_design", value: "Diseño" },
    { key: "artistic_graphic_design", value: "Diseño Gráfico" },
    { key: "artistic_writing", value: "Escritura" },
    { key: "artistic_sculpture", value: "Escultura" },
    { key: "artistic_photography", value: "Fotografía" },
    { key: "artistic_engraving", value: "Grabado" },
    { key: "artistic_illustration", value: "Ilustración" },
    { key: "artistic_music", value: "Música" },
    { key: "artistic_painting", value: "Pintura" },
    { key: "artistic_poetry", value: "Poesía" },
    { key: "artistic_knitting", value: "Tejer" }
  ];

  // --- Estado para los campos del formulario ---
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    eventName: '',
    howDidYouHear: '',
    selectedArtisticExpressions: [],
    otherArtisticExpression: '',
    whyInterested: '',
    comments: '',
    subscribeToNewsletter: false,
  });

  // --- Estados para la UI y feedback ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Manejador genérico para todos los campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'artisticExpression') {
      const optionValue = value;
      setFormData(prevData => {
        const newSelectedExpressions = checked
          ? [...prevData.selectedArtisticExpressions, optionValue]
          : prevData.selectedArtisticExpressions.filter(item => item !== optionValue);
        return {
          ...prevData,
          selectedArtisticExpressions: newSelectedExpressions,
        };
      });
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // --- Manejador del envío del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError('');
    setSubmissionSuccess(false);

    if (!BACKEND_BASE_URL) {
      setSubmissionError(t('registration_failure_backend_url'));
      setIsSubmitting(false);
      return;
    }

    let finalArtisticExpression = formData.selectedArtisticExpressions.join(', ');
    if (formData.selectedArtisticExpressions.includes('Otra')) {
        if (!formData.otherArtisticExpression.trim()) {
            setSubmissionError(t('error_specify_other_artistic_expression'));
            setIsSubmitting(false);
            return;
        }
        if (finalArtisticExpression) {
            finalArtisticExpression += `, ${formData.otherArtisticExpression.trim()}`;
        } else {
            finalArtisticExpression = formData.otherArtisticExpression.trim();
        }
    }

    const eventRegistrationPayload = {
      fullName: formData.fullName,
      email: formData.email,
      eventName: formData.eventName,
      howDidYouHear: formData.howDidYouHear,
      artisticExpression: finalArtisticExpression,
      whyInterested: formData.whyInterested,
      comments: formData.comments,
    };

    try {
      // 1. Enviar registro de evento
      const eventResponse = await axios.post(`${BACKEND_BASE_URL}/api/event-registration`, eventRegistrationPayload);

      if (eventResponse.status < 200 || eventResponse.status >= 300) {
        setSubmissionError(t('registration_failure'));
        console.error("Error al enviar registro de evento:", eventResponse.data);
        return;
      }

      // 2. Si el registro del evento es exitoso Y el usuario quiere suscribirse
      if (formData.subscribeToNewsletter) {
        console.log("Checkbox de suscripción marcado. Intentando enviar suscripción a /api/contact...");

        const nameParts = formData.fullName.split(' ');
        const firstNameForContact = nameParts[0] || '';
        const lastNameForContact = nameParts.slice(1).join(' ') || '';

        const subscriberPayload = {
            firstName: firstNameForContact,
            lastName: lastNameForContact,
            email: formData.email,
            message: "Suscripción a la newsletter desde el formulario de registro de eventos.",
            subscribeToNewsletter: true // Siempre true para este propósito
        };

        try {
            const subscribeResponse = await axios.post(`${BACKEND_BASE_URL}/api/contact`, subscriberPayload);

            if (subscribeResponse.status < 200 || subscribeResponse.status >= 300) {
                // Si la suscripción falla, mostramos una advertencia pero no bloqueamos el éxito del registro del evento
                console.warn("Advertencia: El registro a la comunidad falló (vía /api/contact):", subscribeResponse.data?.error);
                setSubmissionError(t('registration_failure') + ". " + t('subscription_partial_failure')); // Usar traducciones
            } else {
                console.log("Suscripción a la comunidad exitosa (vía /api/contact)!", subscribeResponse.data);
            }
        } catch (subscribeError) {
            // Manejo de errores de red o Axios para la suscripción
            console.warn("Advertencia: Error de red o inesperado al intentar suscribir (vía /api/contact):", subscribeError);
            const errorMessage = subscribeError.response?.data?.error || subscribeError.message || "Error desconocido.";
            setSubmissionError(t('registration_failure') + ". " + t('subscription_network_error') + `: ${errorMessage}`); // Usar traducciones
        }
      }

      // Si el registro del evento fue exitoso, mostramos el mensaje de éxito general
      setSubmissionSuccess(true);

      // Limpiar el formulario
      setFormData({
        fullName: '',
        email: '',
        eventName: '',
        howDidYouHear: '',
        selectedArtisticExpressions: [],
        otherArtisticExpression: '',
        whyInterested: '',
        comments: '',
        subscribeToNewsletter: false,
      });
      console.log("Formulario de evento enviado con éxito al backend!", eventResponse.data);

    } catch (error) {
      setSubmissionError(t('registration_failure'));
      console.error("Error general al enviar el formulario:", error);
      // Detalle adicional para errores del registro del evento
      if (error.response && error.response.data && error.response.data.error) {
          setSubmissionError(`${t('registration_failure')}: ${error.response.data.error}`);
      } else if (error.message === 'Network Error') {
          setSubmissionError(t('registration_network_error'));
      } else {
          setSubmissionError(t('registration_unexpected_error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="event-registration-form min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-lg w-full transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-6">
          {t('event_registration_title')}
        </h2>
        <p className="text-gray-600 text-center mb-8">
          {t('event_registration_description')}
        </p>

        {submissionSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-6">
            <strong className="font-bold">{t('registration_success')}</strong>
            {formData.subscribeToNewsletter && (
              <span className="block sm:inline ml-2">{t('registration_success_newsletter')}</span>
            )}
          </div>
        )}

        {submissionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6">
            <strong className="font-bold">{t('error_prefix')}</strong>
            <span className="block sm:inline ml-2">{submissionError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de Evento (Dropdown) */}
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('event_name_label')} <span className="text-red-500">*</span>
            </label>
            <select
              id="eventName"
              name="eventName"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={formData.eventName}
              onChange={handleChange}
              required
            >
              <option value="">{t('select_event_placeholder')}</option>
              {predefinedEvents.map((event, index) => (
                <option key={index} value={event}>{event}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('full_name_label')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('email_label')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="howDidYouHear" className="block text-sm font-medium text-gray-700 mb-1">
              {t('how_did_you_hear_label')}
            </label>
            <input
              type="text"
              id="howDidYouHear"
              name="howDidYouHear"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={formData.howDidYouHear}
              onChange={handleChange}
              placeholder={t('how_did_you_hear_placeholder')}
            />
          </div>

          {/* Campo de Expresión Artística (Múltiple Selección + Otra) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('artistic_expression_label')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {artisticOptions.map((option) => (
                <div key={option.key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`artistic-${option.key}`}
                    name="artisticExpression"
                    value={option.value} // El valor que se envía es el `value` original
                    checked={formData.selectedArtisticExpressions.includes(option.value)}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`artistic-${option.key}`} className="ml-2 text-sm text-gray-700">
                    {t(option.key)} {/* ¡Aquí usamos t(option.key) para traducir el texto visible! */}
                  </label>
                </div>
              ))}
               <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="artistic-otra"
                    name="artisticExpression"
                    value="Otra" // El valor "Otra" siempre es en español para el backend
                    checked={formData.selectedArtisticExpressions.includes('Otra')}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="artistic-otra" className="ml-2 text-sm text-gray-700">
                    {t('artistic_other')}:
                  </label>
                  {formData.selectedArtisticExpressions.includes('Otra') && (
                      <input
                        type="text"
                        name="otherArtisticExpression"
                        className="ml-2 mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                        value={formData.otherArtisticExpression}
                        onChange={handleChange}
                        placeholder={t('artistic_other_placeholder')}
                        required={formData.selectedArtisticExpressions.includes('Otra')}
                      />
                  )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="whyInterested" className="block text-sm font-medium text-gray-700 mb-1">
              {t('why_interested_label')}
            </label>
            <textarea
              id="whyInterested"
              name="whyInterested"
              rows="3"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={formData.whyInterested}
              onChange={handleChange}
              placeholder={t('why_interested_placeholder')}
            ></textarea>
          </div>

          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
              {t('comments_label')}
            </label>
            <textarea
              id="comments"
              name="comments"
              rows="3"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={formData.comments}
              onChange={handleChange}
              placeholder={t('comments_placeholder')}
            ></textarea>
          </div>

          {/* Opción de Suscripción a la Comunidad */}
          <div className="subscription-option">
            <input
              type="checkbox"
              id="subscribeToNewsletter"
              name="subscribeToNewsletter"
              checked={formData.subscribeToNewsletter}
              onChange={handleChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <div className="text-content">
              <label htmlFor="subscribeToNewsletter" className="font-medium text-gray-700">
                {t('subscribe_newsletter_question')}
              </label>
              <p className="text-gray-500">{t('subscribe_newsletter_description')}</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              t('register_button')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}