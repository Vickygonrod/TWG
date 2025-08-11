import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Importamos el hook de traducción
import { EventCard } from './EventCard';
import "../styles/EventsGrid.css"; 

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const UpcomingEventsCarousel = () => {
    const { t } = useTranslation(); // Inicializamos el hook de traducción
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${BACKEND_BASE_URL}/api/events`);
                
                const today = new Date();
                const upcomingEvents = response.data.filter(event => new Date(event.date) > today);
                
                const otherUpcomingEvents = upcomingEvents.slice(2);

                setEvents(otherUpcomingEvents);
            } catch (err) {
                console.error('Error fetching upcoming events for carousel:', err);
                // Usamos las claves de traducción para los mensajes de error
                setError(t('carousel_error_message'));
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        // Usamos la clave de traducción para el mensaje de carga
        return <div className="loading-message">{t('carousel_loading_message')}</div>;
    }
    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (events.length === 0) {
        // Usamos la clave de traducción para el mensaje de "no hay eventos"
        return <div className="no-events-message">{t('carousel_no_events_message')}</div>;
    }

    return (
        <div className="other-events-carousel-section">
            <h2 className="section-title">{t('carousel_all_events_title')}</h2>
            <div className="events-grid">
                {events.map(event => (
                    <EventCard key={event.id} event={event} isHero={false} />
                ))}
            </div>
        </div>
    );
};