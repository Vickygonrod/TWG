// src/components/CookieConsentBanner.jsx
import React, { useState, useEffect } from 'react';
import { useCookieConsent } from './CookieConsentContext';
import { useTranslation } from 'react-i18next';

export const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { setCookieConsentStatus } = useCookieConsent();
  const { t } = useTranslation();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
    setCookieConsentStatus('accepted');
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
    setCookieConsentStatus('declined');
  };

  if (!isVisible) {
    return null;
  }

  return (
    // CAMBIO 1: El banner ahora ocupa toda la pantalla y centra el contenido
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 p-4 sm:p-6 shadow-lg z-500">
      {/* CAMBIO 2: El contenido tiene fondo blanco y texto oscuro para sobresalir */}
      <div className="cookietext max-w-4xl w-full mx-auto bg-white text-gray-900 p-6 rounded-lg shadow-2xl flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <p className="text-sm sm:text-base text-center sm:text-left leading-relaxed">
            {t('cookie_banner_text') }
            {/* El enlace es ahora perfectamente visible */}
            <a href="/cookies" className="text-blue-600 hover:text-blue-700 underline font-semibold ml-1">{t('cookie_banner_1')}</a>.
        </p>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <button
            onClick={handleAcceptCookies}
            className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors duration-200 ease-in-out"
          >
            {t('cookie_banner_2')}
          </button>
          <button
            onClick={handleDeclineCookies}
            // Ajustamos los colores del botón para que encajen en el nuevo fondo
            className="w-full sm:w-auto px-5 py-2 border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-md shadow-md transition-colors duration-200 ease-in-out"
          >
            {t('cookie_banner_3')}
          </button>
        </div>
      </div>
    </div>
  );
}