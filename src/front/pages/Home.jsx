import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import logo from "../images/logo.png";
import NewsletterSignUpPopup from '../components/NewsletterSignUpPopup.jsx';
import { EventsCarousel } from '../components/EventsCarousel.jsx';
import '../styles/communityHome.css';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const Home = () => {
    const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BACKEND_BASE_URL}/api/events`);
                
                // Sort events by priority (1, 2, 3...) and then by date
                const sortedEvents = response.data.sort((a, b) => {
                    const priorityA = a.priority || 99;
                    const priorityB = b.priority || 99;
                    
                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    } else {
                        // For events with the same priority, sort by date
                        return new Date(a.date) - new Date(b.date);
                    }
                });

                setAllEvents(sortedEvents);
            } catch (err) {
                console.error("Error fetching all events:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllEvents();
    }, []);

    const handleOpenPopup = (e) => {
        e.preventDefault();
        setShowNewsletterPopup(true);
    };

    const handleClosePopup = () => {
        setShowNewsletterPopup(false);
    };

    return (
        <div className="community-home-container">
            <header className="community-header">
                <h1>{t('community_home_1')} <br />The Women's Ground!</h1>
                <p className="header-description">
                    {t('community_home_2')} <br />
                    {t('community_home_3')} <br /> <br />
                    {t('community_home_4')}
                </p>
                <img src={logo} alt="logo" className="logo col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12"/>
            </header>

            {loading ? (
                <div className="loading-message">{t('events_loading_message')}</div>
            ) : (
                <EventsCarousel
                    events={allEvents}
                    title="upcoming_events_title"
                    showLink={true}
                />
            )}

            <section className="community-cta">
                <h2>{t('community_home_5')}</h2>
                <p>{t('community_home_6')}</p>
                <button onClick={handleOpenPopup} className="toeventshub btn btn-orange">
                    {t('community_home_7')}
                </button>
            </section>

            <footer className="community-footer">
                <p>&copy; {t('community_home_8')}</p>
            </footer>

            <NewsletterSignUpPopup
                showPopup={showNewsletterPopup}
                onClose={handleClosePopup}
            />
        </div>
    );
};