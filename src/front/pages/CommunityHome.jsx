import React, { useState, useTransition } from 'react'; // ¡Importa useState!
import '../styles/communityHome.css';
import { Link } from 'react-router-dom';
import logo from "../images/logo.png";
import NewsletterSignUpPopup from '../components/NewsletterSignUpPopup.jsx'; // ¡Importa el pop-up!
import { useTranslation } from 'react-i18next';


export const CommunityHome = () => {
    // Estado para controlar la visibilidad del pop-up
    const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
    const { t } = useTranslation();

    // Función para abrir el pop-up
    const handleOpenPopup = (e) => {
        e.preventDefault(); // Previene la navegación si se usa un <Link>
        setShowNewsletterPopup(true);
    };

    // Función para cerrar el pop-up
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

            <section className="community-cta">
                <h2>{t('community_home_5')}</h2>
                <p>{t('community_home_6')}</p>
                {/* Cambiamos el <Link> por un <button> o un <a> que llama a handleOpenPopup */}
                <button onClick={handleOpenPopup} className="btn btn-orange">
                    {t('community_home_7')}
                </button>
            </section>

            <footer className="community-footer">
                <p>&copy; {t('community_home_8')}</p>
            </footer>

            {/* Renderiza el pop-up condicionalmente */}
            <NewsletterSignUpPopup
                showPopup={showNewsletterPopup}
                onClose={handleClosePopup}
            />
        </div>
    );
};