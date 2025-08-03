import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/landingStyle.css"; // Estilos de tu landing page
import eventoplaya from '../images/eventoplaya.jpeg';


export const EventsHub = () => {

    // --- LOGICA DE DATOS ---
    // Aquí es donde iría tu lógica para obtener los eventos del backend.
    // Usarías useState y useEffect para guardar los datos.
    const [proximosEventos, setProximosEventos] = useState([]);
    const [eventosAnteriores, setEventosAnteriores] = useState([]);
    const [testimonios, setTestimonios] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        // Lógica para llamar a tu API y obtener los datos de los eventos
        // fetch('/api/eventos').then(res => res.json()).then(data => {
        //     setProximosEventos(data.futuros);
        //     setEventosAnteriores(data.pasados);
        //     setTestimonios(data.testimonios);
        // });
    }, []);


    // --- LA ESTRUCTURA COMPLETA DE LA PAGINA ---
    return (
        <>
            <div className="landing-page-wrapper">

                <header className="landing-section hero-eventos">
                    <div className="hero-content">
                    <h1 className="hero-title">Próximos eventos</h1>
                    <p className="hero-subtitle">Descubre nuestros próximos eventos</p>
                </div>
                <img src={eventoplaya} alt="Imagen de fondo de eventos" className="hero-image" />
                </header>   

                {/* SECCION DE PROXIMOS EVENTOS */}
                <section className="landing-section proximos-eventos-section">
                    <div className="container">
                        <h2 className="section-title">{t('proximos_eventos_title')}</h2>
                        <div className="event-grid">
                            {/* Mapea tus datos para crear las tarjetas de eventos */}
                            {proximosEventos.map(evento => (
                                <div key={evento.id} className="event-card">
                                    <img src={evento.imagen} alt={evento.titulo} className="event-image" />
                                    <div className="event-content">
                                        <h3 className="event-title">{evento.titulo}</h3>
                                        <p className="event-meta">{evento.fecha} | {evento.hora}</p>
                                        <button className="btn btn-orange">{t('ver_detalles_btn')}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECCION DE EVENTOS ANTERIORES Y TESTIMONIOS */}
                <section className="landing-section eventos-anteriores-section">
                    <div className="container">
                        <h2 className="section-title">{t('eventos_anteriores_title')}</h2>
                        
                        {/* GALERIA DE FOTOS */}
                        <div className="photo-grid">
                            {eventosAnteriores.map(foto => (
                                <img key={foto.id} src={foto.url} alt={foto.alt} className="photo-item" />
                            ))}
                        </div>

                        {/* CARRUSEL DE TESTIMONIOS (REUTILIZA TU COMPONENTE) */}
                        {/* Aquí puedes reutilizar el mismo componente que usaste en la landing del libro */}
                        {/* Tendrías que pasarle los testimonios como props */}
                        {/* <Testimonios testimoniosData={testimonios} /> */}
                        {/* Como lo quieres en un solo archivo, la lógica sería algo así: */}
                        <div className="testimonial-carousel-wrapper">
                            {/* Lógica de los botones y el carrusel de testimonios aquí */}
                            {/* ... */}
                        </div>

                    </div>
                </section>

            </div>
        </>
    );
};