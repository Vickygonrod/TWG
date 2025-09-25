// src/components/TrustpilotWidget.jsx

import React, { useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next'; // Importa el hook de i18n

export const TrustpilotWidget = () => {
    // Obtenemos el idioma actual de la aplicación
    const { i18n } = useTranslation();
    const ref = useRef(null);

    useEffect(() => {
        if (window.Trustpilot) {
            window.Trustpilot.loadFromElement(ref.current, true);
        }
    }, [i18n.language]); // Ahora el efecto se ejecuta cada vez que el idioma cambia

    // Mapeamos el idioma de i18n al formato de Trustpilot
    const getTrustpilotLocale = (lang) => {
        switch (lang) {
            case 'es':
                return 'es-ES'; // O el locale específico de español que uses
            case 'en':
                return 'en-US'; // O el locale específico de inglés que uses
            default:
                return 'es-ES'; // Idioma por defecto
        }
    };

    const currentLocale = getTrustpilotLocale(i18n.language);

    return (
        <div
            ref={ref}
            className="trustpilot-widget"
            data-locale={currentLocale} // ¡Cambiamos a la variable dinámica!
            data-template-id="56278e9abfbbba0bdcd568bc"
            data-businessunit-id="68d2db61bc1ed3e03b66e1f2"
            data-style-height="52px"
            data-style-width="100%"
            data-token="922318d7-aa9e-4f7c-83a6-96a6d31f558d"
        >
            <a
                href="https://au.trustpilot.com/review/thewomensground.com"
                target="_blank"
                rel="noopener"
            >
                Trustpilot
            </a>
        </div>
    );
};