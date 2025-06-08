// src/components/CookieConsentBanner.jsx
import React, { useState, useEffect } from 'react';
import { useCookieConsent } from './CookieConsentContext'; // Importa el hook del contexto

export const CookieConsentBanner = () => {
  // Estado para controlar si el banner es visible (solo si el consentimiento no está guardado)
  const [isVisible, setIsVisible] = useState(false);
  // Usa el contexto para obtener la función que actualizará el estado global del consentimiento
  const { setCookieConsentStatus } = useCookieConsent();

  // useEffect para verificar el estado del consentimiento cuando el componente se monta
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    }
  }, []);

  // Función para manejar la aceptación de cookies
  const handleAcceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
    // Notifica al componente padre (Main) que el consentimiento ha sido aceptado
    setCookieConsentStatus('accepted');
  };

  // Función para manejar el rechazo de cookies
  const handleDeclineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
    // Notifica al componente padre (Main) que el consentimiento ha sido rechazado
    setCookieConsentStatus('declined');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 p-4 sm:p-6 shadow-lg z-100">
      <div className="cookietext max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <p className="text-sm sm:text-base text-center sm:text-left leading-relaxed">
          Utilizamos cookies para mejorar tu experiencia de navegación, ofrecer funciones de redes sociales y analizar nuestro tráfico. Al hacer clic en "Aceptar", consientes el uso de todas las cookies. Para más información o para personalizar tus preferencias, consulta nuestra
          <a href="/cookies" className="text-blue-400 hover:text-blue-300 underline ml-1">Política de Cookies</a>.
        </p>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <button
            onClick={handleAcceptCookies}
            className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 font-medium rounded-md shadow-md transition-colors duration-200 ease-in-out"
          >
            Aceptar
          </button>
          <button
            onClick={handleDeclineCookies}
            className="w-full sm:w-auto px-5 py-2 bg-gray-700 hover:bg-gray-800 font-medium rounded-md shadow-md transition-colors duration-200 ease-in-out"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}

