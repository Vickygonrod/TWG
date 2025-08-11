import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { EventCard } from './EventCard';
import "../styles/EventsGrid.css";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const PastEventsCarousel = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BACKEND_BASE_URL}/api/events`);
                
                const today = new Date();
                const pastEvents = response.data.filter(event => new Date(event.date) <= today);
                
                setEvents(pastEvents);
            } catch (err) {
                console.error("Error fetching past events:", err);
                setError(t('past_events_error_message'));
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return <div className="loading-message">{t('past_events_loading_message')}</div>;
    }
    
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!events || events.length === 0) {
        return <div className="no-events-message">{t('past_events_no_events_message')}</div>;
    }

    return (
        <div className="past-events-carousel-section">
            <h2 className="section-title">{t('past_events_title')}</h2>
            <div className="events-grid">
                {events.map(event => (
                    <EventCard key={event.id} event={event} isHero={false} />
                ))}
            </div>
        </div>
    );
};