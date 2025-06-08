// src/components/CookieConsentContext.jsx
import React, { createContext, useContext } from 'react';

// Crea el contexto de consentimiento de cookies
export const CookieConsentContext = createContext(null);

// Hook personalizado para usar el contexto de consentimiento de cookies
export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};
