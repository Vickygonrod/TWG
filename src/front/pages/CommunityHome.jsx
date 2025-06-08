import React, { useState } from 'react'; // ¡Importa useState!
import '../styles/communityHome.css';
import { Link } from 'react-router-dom';
import logo from "../images/logo.png";
import NewsletterSignUpPopup from '../components/NewsletterSignUpPopup.jsx'; // ¡Importa el pop-up!

export const CommunityHome = () => {
    // Estado para controlar la visibilidad del pop-up
    const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);

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
                <h1>¡Bienvenida a la Comunidad de <br />The Women Ground!</h1>
                    <p className="header-description">
                        Esta es tu nueva casa para reconectar con tu creatividad y construir conexiones significativas con otras mujeres. <br />
                        Seas artista, escritora, bailarina, creadora, soñadora o simplemente tengas curiosidad por explorar tu lado creativo, estás en el lugar correcto. <br /> <br />
                        Aquí en The Women's Ground, creemos en crear, jugar y florecer juntas sin juicios ni presiones. Esta comunidad está diseñada para ser un espacio de apoyo, flexible e inspirador.
                        
                    </p>
                <img src={logo} alt="logo" className="logo col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12"/>
            </header>

            <section className="community-cta">
                <h2>¿Quieres enterarte de los próximos eventos y noticias?</h2>
                <p>¡Únete a la comunidad para recibir noticias, información, invitaciones a eventos, recursos gratuitos e inspiración!</p>
                {/* Cambiamos el <Link> por un <button> o un <a> que llama a handleOpenPopup */}
                <button onClick={handleOpenPopup} className="btn btn-orange">
                    Únete ahora
                </button>
            </section>

            <footer className="community-footer">
                <p>&copy; 2025 The Women Ground. Todos los derechos reservados. | ¡Juega, Crea y Florece!</p>
            </footer>

            {/* Renderiza el pop-up condicionalmente */}
            <NewsletterSignUpPopup
                showPopup={showNewsletterPopup}
                onClose={handleClosePopup}
            />
        </div>
    );
};