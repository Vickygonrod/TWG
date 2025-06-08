// src/pages/Success.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Asegúrate de importar Link si vas a usarlo
import "../styles/landingStyle.css"
import ebookimg from "../images/booksNBG.png"

export const Success = () => {
    const location = useLocation();
    const [sessionId, setSessionId] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadInitiated, setDownloadInitiated] = useState(false); // Nuevo estado
    const [error, setError] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const id = queryParams.get('session_id');
        if (id) {
            setSessionId(id);
            console.log("DEBUG FRONTEND: Session ID en URL:", id);
        } else {
            setError("No se encontró el ID de sesión en la URL.");
        }
    }, [location]);

    const handleDownload = async () => {
        if (!sessionId) {
            setError("No hay ID de sesión para la descarga.");
            return;
        }

        setDownloading(true);
        setError(null);

        try {
            const BACKEND_URL = "https://animated-space-invention-r47gg4gqjrx53wwg6-3001.app.github.dev"; // ¡Verifica tu URL!
            const downloadUrl = `${BACKEND_URL}/api/download-ebook/${sessionId}`;
            console.log("DEBUG FRONTEND: Intentando descargar desde:", downloadUrl);

            // Inicia la descarga
            window.location.href = downloadUrl;

            // Marca que la descarga se ha iniciado.
            // Aunque no sabemos si ha finalizado, esto es suficiente para cambiar el UI.
            setDownloadInitiated(true);

        } catch (err) {
            console.error("Error al iniciar la descarga:", err);
            setError("No se pudo iniciar la descarga del eBook. Por favor, contacta con soporte.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="container containersuccess mt-5 text-center">
            <h1>¡Gracias por tu compra!</h1>
            <h3>Tu pedido Juega a Crear: eBook + Cuaderno de Actividades ha sido procesado exitosamente. Puedes descargarlo a continuación:</h3>
            <img src={ebookimg} className="ebookimgSuccess"/>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            {sessionId ? (
                // Condicionalmente renderizamos el botón de descarga O el botón de "Ir a la comunidad"
                !downloadInitiated ? ( // Si la descarga NO se ha iniciado aún
                    <button
                        className="btn btn-orange btn-lg mt-4"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? 'Descargando...' : 'Descargar Pack eBook'}
                    </button>
                ) : ( // Si la descarga YA se ha iniciado
                    <Link to="/community" className="btn btn-secondary btn-lg mt-4">
                        Ir a la Comunidad
                    </Link>
                )
            ) : (
                <p className="mt-4">Cargando detalles del pedido...</p>
            )}

            <p className="mt-5">Si tienes algún problema, por favor <Link to="/contact">contacta con nosotros</Link>.</p>
        </div>
    );href="#"
};