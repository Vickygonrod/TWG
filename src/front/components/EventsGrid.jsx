import React from 'react';
import { EventCard } from './EventCard';
import '../styles/EventsGrid.css'; 

export const EventsGrid = ({ events }) => {
  if (!events || events.length === 0) {
    return null; // No renderizar nada si no hay eventos
  }
  return (
    <div className="events-grid">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};