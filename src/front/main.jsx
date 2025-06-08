// main.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Global styles for your application
import { RouterProvider } from "react-router-dom"; // Import RouterProvider to use the router
import { router } from "./routes"; // Import the router configuration
import { StoreProvider } from './hooks/useGlobalReducer'; // Import the StoreProvider for global state management
import { BackendURL } from './components/BackendURL'; // Assuming this component exists
import { CookieConsentContext } from './components/CookieConsentContext'; // Import the new context

import '../i18n.js'; // Importa la configuración de i18n
import { I18nextProvider } from 'react-i18next'; // Importa el proveedor de contexto de i18next
import i18n from 'i18next'; // Importa la instancia de i18n configurada

// --- Funciones de inicialización de scripts de terceros (EJEMPLOS) ---
// **IMPORTANTE:** Reemplaza estas funciones con el código real de tus scripts.

function initGoogleAnalytics() {
  console.log('Google Analytics: Inicializando...');
  // Aquí iría el código real de Google Analytics (ej. gtag.js)
  // Ejemplo:
  /*
  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR_GA_TRACKING_ID';
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'YOUR_GA_TRACKING_ID');
    console.log('Google Analytics cargado.');
  };
  */
}

function initFacebookPixel() {
  console.log('Facebook Pixel: Inicializando...');
  // Aquí iría el código real de Facebook Pixel
  // Ejemplo:
  /*
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
  console.log('Facebook Pixel cargado.');
  */
}

function initMailerLiteOrSendTracking() {
  console.log('MailerLite/Send Tracking: Inicializando...');
  // Aquí iría el código de seguimiento de MailerLite/Send si lo proporcionan como script
}


const Main = () => {
    // Estado para guardar el consentimiento de cookies (null al inicio, 'accepted' o 'declined')
    const [cookieConsentStatus, setCookieConsentStatus] = useState(null);

    // useEffect que se ejecuta una vez al montar el componente Main
    // para leer el estado del consentimiento de localStorage
    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (consent) {
            setCookieConsentStatus(consent);
        } else {
            // Si no hay consentimiento, el banner lo mostrará.
            // El banner (CookieConsentBanner) usará el contexto para actualizar este estado
            // cuando el usuario acepte o rechace.
        }
    }, []); // Se ejecuta solo una vez al inicio

    // useEffect para cargar scripts de terceros basado en el consentimiento
    useEffect(() => {
        if (cookieConsentStatus === 'accepted') {
            console.log('Consentimiento aceptado. Cargando scripts de terceros...');
            initGoogleAnalytics();
            initFacebookPixel();
            initMailerLiteOrSendTracking();
            // ...inicializa cualquier otro script que requiera consentimiento
        } else if (cookieConsentStatus === 'declined') {
            console.log('Consentimiento rechazado. No se cargan scripts de terceros.');
            // Asegúrate de que no se carguen (o se desactiven si ya estuvieran)
            // Por ejemplo, si los scripts se inyectan en el HTML directamente,
            // deberías tener un "administrador de etiquetas" o un script que los bloquee.
        }
        // Este efecto se ejecutará cada vez que cookieConsentStatus cambie.
        // Esto es importante para que los scripts se carguen tan pronto como el usuario
        // acepte el consentimiento en el banner.
    }, [cookieConsentStatus]);

    if(! import.meta.env.VITE_BACKEND_URL ||  import.meta.env.VITE_BACKEND_URL == "") return (
        <React.StrictMode>
              <BackendURL/ >
        </React.StrictMode>
        );
    return (
        <React.StrictMode>
            {/* Provee el contexto de consentimiento de cookies a toda la aplicación */}
            <CookieConsentContext.Provider value={{ cookieConsentStatus, setCookieConsentStatus }}>
                {/* Provide global state to all components */}
                <StoreProvider>
                    {/* Set up routing for the application */}
                    <RouterProvider router={router}>
                    </RouterProvider>
                </StoreProvider>
            </CookieConsentContext.Provider>
        </React.StrictMode>
    );
}

// Render the Main component into the root DOM element.
ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
