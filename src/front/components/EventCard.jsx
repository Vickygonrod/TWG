import React from 'react';
import '../styles/EventCard.css'; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Para el idioma español

export const EventCard = ({ event, isHero }) => {
  const formattedDate = format(new Date(event.date), 'd MMMM yyyy', { locale: es });

  return (
    // Agregamos condicionalmente la clase 'hero-event-card' si `isHero` es true
    <div className={`event-card ${isHero ? 'hero-event-card' : ''}`}>
      <img
        src={event.image_url || 'https://via.placeholder.com/400x300'}
        alt={event.name}
        className="event-card-image"
      />
      <div className="event-card-content">
        <h3 className="event-card-title">{event.name}</h3>
        <p className="event-card-date">Fecha: {formattedDate}</p>
        <p className="event-card-description">{event.short_description}</p>
        <a href={`/events/${event.id}`} className="event-card-link">
          Ver más
        </a>
      </div>
    </div>
  );
};