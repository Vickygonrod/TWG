import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Link } from 'react-router-dom'; // We need to import the Link component
import '../styles/EventCard.css';

export const EventCard = ({ event, isHero }) => {
  const { t, i18n } = useTranslation();

  const getLocale = () => {
    return i18n.language === 'en' ? enUS : es;
  };

  const formattedDate = event.date
    ? format(new Date(event.date), 'd MMMM yyyy', { locale: getLocale() })
    : t('event_card_date_not_available');

  return (
    <div className={`event-card ${isHero ? 'hero-event-card' : ''}`}>
      {/* We wrap the image in a Link component */}
      <Link to={`/events/${event.id}`}>
        <img
          src={event.image_url || 'https://via.placeholder.com/400x300'}
          alt={event.name}
          className="event-card-image"
        />
      </Link>
      <div className="event-card-content">
        <h3 className="event-card-title">{event.name}</h3>
        <p className="event-card-date">{t('event_card_date_label')}: {formattedDate}</p>
        <p className="event-card-description">{event.short_description}</p>
        {/* We use a Link component here too, which is better than an <a> tag */}
        <Link to={`/events/${event.id}`} className="event-card-link">
          {t('event_card_view_more')}
        </Link>
      </div>
    </div>
  );
};