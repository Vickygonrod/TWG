import React from 'react';
import { useTranslation } from 'react-i18next'; // Importamos el hook
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale'; // Importamos los locales
import '../styles/EventCard.css'; 

export const EventCard = ({ event, isHero }) => {
  const { t, i18n } = useTranslation(); // Obtenemos la función de traducción y el objeto i18n

  // Función para obtener el locale correcto para date-fns
  const getLocale = () => {
    return i18n.language === 'en' ? enUS : es;
  };

  const formattedDate = event.date
    ? format(new Date(event.date), 'd MMMM yyyy', { locale: getLocale() })
    : t('event_card_date_not_available');

  return (
    <div className={`event-card ${isHero ? 'hero-event-card' : ''}`}>
      <img
        src={event.image_url || 'https://via.placeholder.com/400x300'}
        alt={event.name}
        className="event-card-image"
      />
      <div className="event-card-content">
        <h3 className="event-card-title">{event.name}</h3>
        <p className="event-card-date">{t('event_card_date_label')}: {formattedDate}</p>
        <p className="event-card-description">{event.short_description}</p>
        <a href={`/events/${event.id}`} className="event-card-link">
          {t('event_card_view_more')}
        </a>
      </div>
    </div>
  );
};