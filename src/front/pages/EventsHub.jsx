// src/front/EventsHub.jsx

import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UpcomingEvents } from "../components/UpcomingEvents.jsx";
import { PastEventsCarousel } from "../components/PastEventsCarousel.jsx";
import { UpcomingEventsCarousel } from "../components/UpcomingEventsCarousel.jsx";
import { TrustpilotWidget } from "../components/TrustpilotWidget.jsx";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel.jsx"; // ¡Importa el nuevo componente!
import "../styles/UpcomingEvents.css";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventsHub = () => {
    const { t } = useTranslation();
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BACKEND_BASE_URL}/api/events`);
                setAllEvents(response.data);
            } catch (err) {
                console.error('Error fetching all events:', err);
                setError(t('eventshub_fetch_error'));
            } finally {
                setLoading(false);
            }
        };
        fetchAllEvents();
    }, []);

    // Carga el script de Trustpilot cuando el componente se monta
    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const today = new Date();
    const upcomingEvents = allEvents.filter(event => new Date(event.date) > today);
    const pastEvents = allEvents.filter(event => new Date(event.date) <= today);

    if (loading) {
        return <div className="loading-message">{t('eventshub_loading_message')}</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const featuredEvents = upcomingEvents.slice(0, 2);
    const otherUpcomingEvents = upcomingEvents.slice(2);

    return (
        <div className="events-page-wrapper">
            <UpcomingEvents events={featuredEvents} />
            
            {otherUpcomingEvents.length > 0 && <UpcomingEventsCarousel events={otherUpcomingEvents} />}
            
            <PastEventsCarousel events={pastEvents} />

            <div className="testimonials-style">
            
            <TestimonialsCarousel />
            </div>

            <div className="trustpilot flex justify-center my-8 px-4">
                <TrustpilotWidget />
            </div>
        </div>
    );
};