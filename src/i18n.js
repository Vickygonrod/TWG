  import i18n from 'i18next';
  import { initReactI18next } from 'react-i18next';
  import LanguageDetector from 'i18next-browser-languagedetector';
  import HttpBackend from 'i18next-http-backend';



i18n
  // Carga las traducciones a través de http (para archivos locales o remotos)
  // Puedes eliminarlo si prefieres cargar todas las traducciones directamente en init()
  .use(HttpBackend)
  // Detecta el idioma del usuario (ej. del navegador)
  .use(LanguageDetector)
  // Pasa la instancia de i18n a react-i18next
  .use(initReactI18next)
  // Inicializa i18next
  .init({
    // Configuración para el backend HTTP
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Ruta donde se cargarán los archivos JSON
    },
    // Idioma por defecto si no se detecta uno o no está disponible
    fallbackLng: 'es', // Español como idioma de respaldo
    debug: true, // Desactiva el debug en producción
    interpolation: {
      escapeValue: false, // React ya escapa los valores para prevenir XSS
    },
    // Definir los namespaces (si no usas namespaces, puedes quitar esto o usar 'translation' por defecto)
    ns: ['translation'], // Namespace por defecto. Puedes tener múltiples (ej. 'common', 'home', 'footer')
    defaultNS: 'translation', // Namespace por defecto
    react: {
      useSuspense: false, // Desactiva Suspense para la carga inicial si no estás configurada para ello
    },
  });

export default i18n;
