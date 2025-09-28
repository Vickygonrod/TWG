import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EventCard } from './EventCard';
import "../styles/EventsGrid.css"; 

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventsCarousel = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const carouselRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -350 : 350;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchAndSortEvents = async () => {
            try {
                setLoading(true);
                // La respuesta del backend ya viene ordenada por prioridad (asc)
                const response = await axios.get(`${BACKEND_BASE_URL}/api/events`);
                
                // Aplicamos una lógica de ordenamiento secundaria (y defensiva) en el frontend:
                const sortedEvents = response.data.sort((a, b) => {
                    
                    // 1. Usamos la propiedad correcta: 'priority_order'
                    const priorityA = a.priority_order || 999; 
                    const priorityB = b.priority_order || 999;
                    
                    // a) ORDENAR POR PRIORIDAD (Debe coincidir con el backend: menor número primero)
                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    } 
                    
                    // b) EN CASO DE EMPATE, ORDENAR POR FECHA (descendente: más nuevo primero)
                    else {
                        // Date(b) - Date(a) ordena de forma descendente (más nuevo -> más viejo)
                        return new Date(b.date) - new Date(a.date);
                    }
                });

                setEvents(sortedEvents);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError(t('events_error_message'));
            } finally {
                setLoading(false);
            }
        };
        fetchAndSortEvents();
    }, [t]);

    if (loading) {
        return <div className="loading-message">{t('events_loading_message')}</div>;
    }
    
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!events || events.length === 0) {
        return <div className="no-events-message">{t('no_events_message')}</div>;
    }

    return (
        <div className="all-events-carousel-section">
            <h2 className="section-title">{t('all_events_title')}</h2>
            <div className="carousel-wrapper">
                <button className="carousel-arrow left" onClick={() => scrollCarousel('left')}>&#9664;</button>
                <div className="events-grid" ref={carouselRef}>
                    {events.map(event => (
                        <EventCard key={event.id} event={event} isHero={false} />
                    ))}
                </div>
                <button className="carousel-arrow right" onClick={() => scrollCarousel('right')}>&#9654;</button>
            </div>
            
            <div className="toevents view-all-events-container">
                <Link to="/events" className="btn btn-orange">
                    {t('view_all_events_button')}
                </Link>
            </div>
        </div>
    );
};