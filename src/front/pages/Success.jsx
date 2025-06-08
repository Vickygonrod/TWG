import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import "../styles/landingStyle.css"; // Asegúrate de que los estilos sean los correctos
import { useTranslation } from 'react-i18next';

// IMPORTA AMBAS IMÁGENES AQUÍ
import ebookimgEs from "../images/booksNBG-es.png"; // Imagen para español
import ebookimgEn from "../images/booksNBG-en.png"; // Imagen para inglés


export const Success = () => { // Asumiendo que este es tu componente Success
    const location = useLocation();
    const [sessionId, setSessionId] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadInitiated, setDownloadInitiated] = useState(false); // Para controlar si el botón de descarga ya se hizo clic
    const [error, setError] = useState(null);

    const { t, i18n } = useTranslation(); // Desestructura i18n aquí para acceder al idioma

    // Lógica para seleccionar la imagen basada en el idioma actual
    const currentEbookImage = i18n.language === 'en' ? ebookimgEn : ebookimgEs;


    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const id = query.get('session_id');
        if (id) {
            setSessionId(id);
        } else {
            setError("No se encontró ID de sesión. La compra no se pudo verificar.");
        }
    }, [location]);

    const handleDownload = async () => {
        if (!sessionId) {
            setError("No hay ID de sesión para iniciar la descarga.");
            return;
        }

        setDownloading(true);
        setDownloadInitiated(true); // Indica que la descarga ha sido iniciada

        try {
            const response = await axios.get(`https://animated-space-invention-r47gg4gqjrx53wwg6-3001.app.github.dev/api/download-ebook?session_id=${sessionId}`, {
                responseType: 'blob', // Importante para manejar archivos
            });

            // Crea un objeto URL para el blob y crea un enlace de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Juega_a_Crear_Pack.zip'); // Nombre del archivo de descarga
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Libera la URL del objeto

        } catch (err) {
            console.error("Error durante la descarga:", err);
            setError("Error al descargar el archivo. Por favor, contacta con soporte.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="container containersuccess mt-5 text-center">
            <h1>{t('success_1')}</h1>
            <h3>{t('success_2')}</h3>
            {/* Usa la imagen seleccionada dinámicamente aquí */}
            <img src={currentEbookImage} alt={t('success_1')} className="ebookimgSuccess"/>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            {sessionId ? (
                !downloadInitiated ? (
                    <button
                        className="btn btn-orange btn-lg mt-4"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? t('success_3') : t('success_3b')}
                    </button>
                ) : (
                    <Link to="/community" className="btn btn-secondary btn-lg mt-4">
                        {t('success_4')}
                    </Link>
                )
            ) : (
                <p className="mt-4">{t('success_5')}</p>
            )}

            <p className="mt-5">{t('success_6')} <Link to="/contact">{t('success_7')}</Link>.</p>
        </div>
    );
};