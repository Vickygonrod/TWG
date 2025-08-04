import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importamos axios
import { EventCard } from './EventCard';
import { EventsGrid } from './EventsGrid';
import "../styles/UpcomingEvents.css"; // Asegúrate de tener un archivo CSS para estilos

// Importa la URL del backend desde tus variables de entorno
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // La función asíncrona que hará la llamada
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        // Usamos axios para hacer la llamada GET a tu endpoint público
        const response = await axios.get(`${BACKEND_BASE_URL}/api/events`);
        
        // axios maneja las respuestas 2xx como exitosas por defecto,
        // así que no necesitamos el `if (!response.ok)`
        setEvents(response.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        if (err.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            setError(err.response.data.msg || 'Error al cargar los eventos del servidor.');
        } else if (err.request) {
            // La solicitud fue hecha pero no se recibió respuesta
            setError('Error de red. Asegúrate de que tu backend está funcionando.');
        } else {
            // Algo más causó el error
            setError('Hubo un problema de conexión. Por favor, inténtalo más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // El array vacío asegura que se ejecute solo una vez

  // Lógica de renderizado basada en los estados
  if (loading) {
    return <div className="loading-message">Cargando eventos...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  const principalEvents = events.slice(0, 2);
  const otherEvents = events.slice(2);

  return (
    <div className="upcoming-events-container">
      <div className="principal-events-section">
        {principalEvents.length > 0 && (
          <>
            <h2 className="section-title">Eventos Destacados</h2>
            <div className="principal-events">
              {principalEvents.map(event => (
                // Aquí pasamos la prop isHero={true}
                <EventCard key={event.id} event={event} isHero={true} />
              ))}
            </div>
          </>
        )}
      </div>
      
      {otherEvents.length > 0 && (
        <div className="other-events-section">
          <h2 className="section-title">Todos los Eventos</h2>
          {/* Aquí no pasamos la prop isHero */}
          <EventsGrid events={otherEvents} />
        </div>
      )}
      
      {events.length === 0 && (
        <div className="no-events-message">
          No hay eventos disponibles.
        </div>
      )}
    </div>
  );
}