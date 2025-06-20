
import React, { useState, useEffect } from 'react';
// Ya no necesitamos importaciones de Firebase/Firestore aquí
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const EventRegistration = () => {
  // Estados para los campos del formulario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [howDidYouHear, setHowDidYouHear] = useState(''); // Nuevo campo
  const [artisticExpression, setArtisticExpression] = useState(''); // Nuevo campo
  const [whyInterested, setWhyInterested] = useState(''); // Nuevo campo
  const [comments, setComments] = useState('');

  // Estados para la UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // No necesitamos inicializar Firebase/Firestore aquí, solo la lógica de envío HTTP
  // useEffect(() => { ... }, []);

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita el recargado de la página por defecto
    setIsSubmitting(true);
    setSubmissionError('');
    setSubmissionSuccess(false);

    // Obtener la URL del backend desde las variables de entorno
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      setSubmissionError("Error de configuración: URL del backend no definida.");
      setIsSubmitting(false);
      return;
    }

    // Datos a enviar al backend
    const formData = {
      fullName,
      email,
      eventName,
      howDidYouHear,
      artisticExpression,
      whyInterested,
      comments,
    };

    try {
      const response = await fetch(`${backendUrl}/api/event-register`, { // Nueva URL del endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) { // Si la respuesta HTTP es 2xx
        setSubmissionSuccess(true);
        // Limpiar el formulario después del éxito
        setFullName('');
        setEmail('');
        setEventName('');
        setHowDidYouHear('');
        setArtisticExpression('');
        setWhyInterested('');
        setComments('');
        console.log("Formulario de evento enviado con éxito al backend!", data);
      } else {
        // Manejar errores del backend
        setSubmissionError(data.error || "Ocurrió un error al registrarse.");
        console.error("Error al enviar el formulario al backend:", data);
      }

    } catch (error) {
      console.error("Error de red o inesperado al enviar el formulario:", error);
      setSubmissionError("No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-lg w-full transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-6">
          Registro para Eventos
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Completa el formulario para asegurar tu plaza en nuestro próximo evento.
        </p>

        {submissionSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-6" role="alert">
            <strong className="font-bold">¡Éxito!</strong>
            <span className="block sm:inline ml-2">Tu registro ha sido enviado correctamente. ¡Nos vemos pronto!</span>
          </div>
        )}

        {submissionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline ml-2">{submissionError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
              Evento al que te registras <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="eventName"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ej: Taller de Creatividad, Conferencia de Mindfulness"
              required
            />
          </div>

          <div>
            <label htmlFor="howDidYouHear" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Cómo te enteraste de este evento?
            </label>
            <input
              type="text"
              id="howDidYouHear"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={howDidYouHear}
              onChange={(e) => setHowDidYouHear(e.target.value)}
              placeholder="Ej: Redes Sociales, Amigo, Newsletter"
            />
          </div>

          <div>
            <label htmlFor="artisticExpression" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Tienes alguna expresión artística favorita o que te interese explorar?
            </label>
            <input
              type="text"
              id="artisticExpression"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={artisticExpression}
              onChange={(e) => setArtisticExpression(e.target.value)}
              placeholder="Ej: Pintura, escritura, danza, música, collage"
            />
          </div>

          <div>
            <label htmlFor="whyInterested" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Qué te atrae o qué esperas obtener de este evento?
            </label>
            <textarea
              id="whyInterested"
              rows="3"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={whyInterested}
              onChange={(e) => setWhyInterested(e.target.value)}
              placeholder="Queremos entender tus motivaciones."
            ></textarea>
          </div>

          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Algún comentario o pregunta adicional?
            </label>
            <textarea
              id="comments"
              rows="3"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Escribe aquí cualquier otra cosa que quieras compartir."
            ></textarea>
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
              'Registrarse al Evento'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

