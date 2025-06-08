import React from "react";

export const Cookies = () => {


    return (
        <>
        <div className="bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto px-5 py-5 shadow-lg rounded-lg p-6 sm:p-8 lg:p-10">
        {/* Título principal */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4 rounded-md">
          Política de Cookies de www.thewomensground.com </h1>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-8">
          Última actualización: 08 de junio de 2025
        </p>

        <p className="mb-6 text-sm sm:text-base leading-relaxed">
          Esta Política de Cookies explica qué son las cookies, cómo y por qué las utilizamos, y cómo puedes gestionarlas en nuestro sitio web
          <a href="[Tu URL de la Landing Page]" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer"> www.thewomensground.com</a>. Te recomendamos leer esta política para que entiendas qué tipo de información recopilamos a través de las cookies y cómo se utiliza.
        </p>

        {/* Sección: ¿Qué son las Cookies? */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          ¿Qué son las Cookies?
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          Las cookies son pequeños archivos de texto que se almacenan en tu navegador web o en tu dispositivo (ordenador, tableta, teléfono móvil) cuando visitas un sitio web. Permiten que el sitio web recuerde tus acciones y preferencias (como el inicio de sesión, el idioma o la configuración de visualización) durante un período de tiempo, para que no tengas que volver a introducirlas cada vez que regresas al sitio o navegas de una página a otra.
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">De sesión:</strong> Se eliminan cuando cierras el navegador.</li>
          <li><strong className="font-medium">Persistentes:</strong> Permanecen en tu dispositivo durante un período de tiempo predefinido o hasta que las elimines manualmente.</li>
          <li><strong className="font-medium">De origen (propias):</strong> Establecidas por el sitio web que estás visitando.</li>
          <li><strong className="font-medium">De terceros:</strong> Establecidas por un dominio diferente al del sitio web que estás visitando (por ejemplo, Google Analytics).</li>
        </ul>

        {/* Sección: ¿Cómo y Por Qué Utilizamos las Cookies? */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          ¿Cómo y Por Qué Utilizamos las Cookies?
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          Utilizamos cookies por diversas razones para mejorar tu experiencia en nuestro sitio web:
        </p>

        {/* Subsección: Cookies Necesarias o Técnicas */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          Cookies Necesarias o Técnicas:
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">Propósito:</strong> Son esenciales para que nuestra landing page funcione correctamente y te permita navegar por ella y utilizar sus funciones básicas. Sin estas cookies, algunas partes de nuestro sitio no funcionarían.</li>
          <li><strong className="font-medium">Datos que Recopilan:</strong> No recopilan información personal identificable. Solo registran acciones básicas como el estado de tu sesión o la aceptación de la política de cookies.</li>
          <li><strong className="font-medium">Duración:</strong> Generalmente de sesión.</li>
        </ul>

        {/* Subsección: Cookies de Rendimiento o Analíticas */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          Cookies de Rendimiento o Analíticas:
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">Propósito:</strong> Nos ayudan a comprender cómo interactúas con nuestra landing page, qué secciones son las más visitadas, cómo llegas a nuestro sitio y si encuentras algún error. Esta información nos permite mejorar la estructura y el contenido de la página para ofrecerte una mejor experiencia.</li>
          <li><strong className="font-medium">Terceros:</strong> Utilizamos Google Analytics para este fin.</li>
          <li><strong className="font-medium">Datos que Recopilan:</strong> Principalmente datos anonimizados o pseudonimizados, como tu dirección IP (enmascarada), tipo de dispositivo, sistema operativo, comportamiento de navegación (páginas visitadas, tiempo en el sitio).</li>
          <li><strong className="font-medium">Duración:</strong> Persistentes (ej., hasta 13 meses para Google Analytics).</li>
        </ul>

        {/* Subsección: Cookies de Funcionalidad o Personalización */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          Cookies de Funcionalidad o Personalización:
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">Propósito:</strong> Nos permiten recordar las elecciones que haces (como tu idioma preferido o las preferencias de configuración) y ofrecerte funciones mejoradas y más personalizadas.</li>
          <li><strong className="font-medium">Datos que Recopilan:</strong> Pueden recopilar información que tú nos proporcionas para personalizar tu experiencia, como preferencias de idioma.</li>
          <li><strong className="font-medium">Duración:</strong> Persistentes (ej., hasta 1 año).</li>
        </ul>

        {/* Subsección: Cookies de Publicidad o Marketing */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          Cookies de Publicidad o Marketing:
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">Propósito:</strong> (Aunque aún no las utilizas activamente, esta sección se incluirá para cuando lo hagas). Estas cookies se utilizan para mostrarte anuncios relevantes y personalizados basados en tus intereses y comportamiento de navegación en nuestro sitio y en otros. También nos ayudan a medir la efectividad de nuestras campañas publicitarias.</li>
          <li><strong className="font-medium">Terceros (potenciales):</strong> Pueden incluir servicios como Google Ads, Facebook Ads, etc.</li>
          <li><strong className="font-medium">Datos que Recopilan:</strong> Información sobre tus interacciones con anuncios y con el sitio, ID de cookies, direcciones IP (enmascaradas).</li>
          <li><strong className="font-medium">Duración:</strong> Persistentes (ej., hasta 1 año o más, dependiendo del tercero).</li>
        </ul>

        {/* Subsección: Cookies de Redes Sociales */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          Cookies de Redes Sociales:
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">Propósito:</strong> Si nuestro sitio incluye botones o funcionalidades de redes sociales (como "Me gusta" o "Compartir"), estas plataformas pueden establecer cookies para reconocer a los usuarios y recopilar información sobre sus interacciones con los plugins sociales.</li>
          <li><strong className="font-medium">Terceros:</strong> Facebook, Instagram, Twitter, etc.</li>
          <li><strong className="font-medium">Datos que Recopilan:</strong> Información sobre tus interacciones con los botones de redes sociales, y si estás logueado en dichas redes, pueden vincular tu actividad a tu perfil.</li>
          <li><strong className="font-medium">Duración:</strong> Persistentes.</li>
        </ul>

        {/* Subsección: Cookies de Terceros Específicos */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          Cookies de Terceros Específicos:
        </h3>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          Además de las mencionadas en las categorías anteriores, utilizamos cookies de los siguientes terceros para sus propósitos específicos:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-6 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">Stripe:</strong> Utiliza cookies necesarias para procesar pagos de forma segura y detectar fraudes si realizas transacciones en nuestro sitio.</li>
          <li><strong className="font-medium">MailerLite / MailerSend:</strong> Pueden utilizar cookies o píxeles para rastrear la apertura de correos electrónicos, los clics en enlaces dentro de los correos y para gestionar el envío y seguimiento de formularios en nuestro sitio que se conectan con sus servicios. Esto nos ayuda a mejorar nuestras comunicaciones.</li>
        </ul>

        {/* Sección: ¿Qué Datos Recopilan las Cookies? */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          ¿Qué Datos Recopilan las Cookies?
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          Las cookies que utilizamos pueden recopilar la siguiente información (dependiendo de su tipo y propósito):
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-sm sm:text-base leading-relaxed pl-4">
          <li>Dirección IP (a menudo anonimizada o enmascarada).</li>
          <li>Comportamiento de navegación en el sitio (páginas visitadas, tiempo en cada página, enlaces clicados).</li>
          <li>Tipo de dispositivo y navegador.</li>
          <li>Ubicación geográfica aproximada.</li>
          <li>Preferencias del usuario (idioma, etc.).</li>
        </ul>

        {/* Sección: Tu Consentimiento y Gestión de Cookies */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          Tu Consentimiento y Gestión de Cookies
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          Cuando visites nuestra landing page por primera vez, verás un <strong className="font-medium">banner de cookies</strong> que te informará sobre el uso de cookies y te dará la opción de gestionarlas. Podrás aceptar todas las cookies, rechazarlas (excepto las estrictamente necesarias) o personalizar tus preferencias.
        </p>
        <p className="mb-6 text-sm sm:text-base leading-relaxed">
          Al hacer clic en "Aceptar" o al continuar navegando después de ser informado en el banner (si no se opta por otra opción), estás dando tu consentimiento para el uso de las cookies descritas en esta política, de acuerdo con tus selecciones en el banner.
        </p>

        {/* Subsección: ¿Cómo puedes gestionar o desactivar las cookies? */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          ¿Cómo puedes gestionar o desactivar las cookies?
        </h3>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          Además de las opciones en nuestro banner de consentimiento, la mayoría de los navegadores web te permiten gestionar tus preferencias de cookies directamente. Puedes configurar tu navegador para que rechace todas las cookies, para que solo acepte ciertas cookies, o para que te avise cuando un sitio web intente colocar una cookie.
        </p>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          Ten en cuenta que desactivar ciertas cookies (especialmente las necesarias) puede afectar el funcionamiento de nuestro sitio web y la experiencia de usuario.
        </p>
        <p className="mb-3 text-sm sm:text-base leading-relaxed">
          A continuación, te proporcionamos enlaces a las páginas de ayuda de los navegadores más comunes para gestionar las cookies:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-sm sm:text-base leading-relaxed pl-4">
          <li><a href="https://support.google.com/chrome/answer/95647?hl=es" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-que-los-sitios-web" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
          <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63944794-2506-446a-becd-adc5611d713a" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          <li><a href="https://support.apple.com/es-es/HT201265" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer">Safari (iPhone, iPad, Mac)</a></li>
        </ul>

        {/* Sección: Cambios en esta Política de Cookies */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          Cambios en esta Política de Cookies
        </h2>
        <p className="mb-6 text-sm sm:text-base leading-relaxed">
          Podemos actualizar nuestra Política de Cookies ocasionalmente para reflejar cambios en nuestras prácticas o por otras razones operativas, legales o reglamentarias. Te notificaremos cualquier cambio publicando la nueva Política de Cookies en esta página. Te recomendamos revisar esta política periódicamente.
        </p>

        {/* Sección: Contacto */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          Contacto
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          Si tienes preguntas sobre nuestra Política de Cookies, puedes contactarnos en:
        </p>
        <p className="text-sm sm:text-base font-medium">
          info@thewomensground.com
        </p>
      </div>
    </div>
        </>
    )
} 