import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import "../styles/landingStyle.css"; 
import { useTranslation } from 'react-i18next';
import NewsletterSignUpPopup from '../components/NewsletterSignUpPopup.jsx';


// IMPORTA AMBAS IMÁGENES AQUÍ
import ebookimgEs from "../images/booksNBG-es.png";
import ebookimgEn from "../images/booksNBG-en.png";


export const Success = () => {
    const location = useLocation();
    const [sessionId, setSessionId] = useState(null);
    const [showPopup, setShowPopup] = useState(false); // <-- Estado para el pop-up
    const [userData, setUserData] = useState(null); // <-- Estado para los datos del usuario
    const [downloadLink, setDownloadLink] = useState(null); // <-- Estado para el enlace de descarga
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // <-- NUEVO: Estado para controlar la carga de datos

    const { t, i18n } = useTranslation();

    const currentEbookImage = i18n.language === 'en' ? ebookimgEn : ebookimgEs;

    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const id = query.get('session_id');

        if (id) {
            setSessionId(id);
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`${BACKEND_BASE_URL}/api/get-session-data?session_id=${id}`);
                    setUserData(response.data);
                    // Una vez que tenemos los datos, generamos el enlace de descarga
                    setDownloadLink(`${BACKEND_BASE_URL}/api/download-ebook?session_id=${id}`);
                    // Y mostramos el pop-up
                    setShowPopup(true);
                } catch (err) {
                    console.error("Error al obtener datos del usuario:", err);
                    setError("No se pudo obtener la información de tu compra.");
                } finally {
                    setIsLoading(false); // Siempre termina la carga
                }
            };
            fetchUserData();
        } else {
            setError("No se encontró ID de sesión. La compra no se pudo verificar.");
            setIsLoading(false); // Termina la carga si no hay ID de sesión
        }
    }, [location, BACKEND_BASE_URL]);

    // Función para cerrar el pop-up
    const handlePopupClose = () => {
        setShowPopup(false);
        // El enlace de descarga ya está generado en el useEffect
    };

    return (
        <div className="container containersuccess mt-5 text-center row">
            <div className="col-md-8 col-lg-8 col-xl-8 col-sm-12 col-xs-12 allign-items-center justify-content-center mx-auto"> 
            {/* El pop-up se muestra condicionalmente, superpuesto al resto del contenido */}
            {showPopup && userData && (
                <NewsletterSignUpPopup 
                    onClose={handlePopupClose} 
                    initialEmail={userData.email}
                    initialName={userData.name}
                />
            )}

            {/* El contenido de la página se renderiza siempre, a menos que esté cargando o haya un error crítico */}
            {isLoading ? (
                <p>{t('success_5')}</p> // Muestra un mensaje de carga
            ) : error ? (
                <div className="alert alert-danger" role="alert">{error}</div>
            ) : (
                <>
                    <h2>{t('success_1')}</h2>
                    <br />
                    <h5>{t('success_2')}</h5>
                    <h5>{t('success_2b')}</h5>

                    <img src={currentEbookImage} alt={t('success_1')} className="ebookimgSuccess"/>
                    
                    {/* El botón de descarga se muestra si downloadLink está disponible */}
                    {downloadLink ? (
                        <a 
                            href={downloadLink}
                            className="btn btn-orange btn-lg mt-4"
                            target="_self"
                            rel="noopener noreferrer"
                        >
                            {t('success_3b')}
                        </a>
                    ) : (
                        // Esto solo se mostrará si no hay link de descarga pero no hay error ni está cargando
                        <p className="mt-4">{t('success_5')}</p> 
                    )}
                </>
            )}

            <p className="mt-5">{t('success_6')} <Link to="/contact">{t('success_7')}</Link>.</p>
            </div>
        </div>
    );
};