import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Importa el hook de traducción
import { EventCard } from './EventCard';
import { EventsGrid } from './EventsGrid';
import "../styles/UpcomingEvents.css"; 

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const UpcomingEvents = () => {
  const { t } = useTranslation(); // Inicializa el hook de traducción
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BACKEND_BASE_URL}/api/events`);
        setEvents(response.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        if (err.response) {
            setError(t('upcoming_error_server'));
        } else if (err.request) {
            setError(t('upcoming_error_network'));
        } else {
            setError(t('upcoming_error_connection'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="loading-message">{t('upcoming_loading_message')}</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  const principalEvents = events.slice(0, 2);
  const otherEvents = events.slice(2);

  return (
    <>
    <div className="upcoming-events-container">
      <div className="principal-events-section">
        {principalEvents.length > 0 && (
          <>
            <h2 className="section-title">{t('upcoming_featured_title')}</h2>
            <div className="principal-events">
              {principalEvents.map(event => (
                <EventCard key={event.id} event={event} isHero={true} />
              ))}
            </div>
          </>
        )}
      </div>
      
      {events.length === 0 && (
        <div className="no-events-message">
          {t('upcoming_no_events_message')}
        </div>
      )}
    </div>
    </>
  );
}