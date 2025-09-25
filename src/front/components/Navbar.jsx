import React, { useState, startTransition } from "react"; // Importa useState y startTransition
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import logo from "../images/logo.png";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

export const Navbar = () => {
    const { t, i18n } = useTranslation();
    // Estado para controlar la apertura/cierre del menú de hamburguesa
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);

    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

    const changeLanguage = (lng) => {
        startTransition(() => {
            i18n.changeLanguage(lng);
        });
    };

    return (
        // Utiliza la estructura y clases de Navbar de Bootstrap
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid"> {/* container-fluid para ancho completo */}
                {/* Logo a la izquierda */}
                <Link to="/" className="navbar-brand">
                    <img src={logo} alt="logo de The Women's Ground" className="navbar-logo" />
                </Link>

                {/* Botón de Hamburguesa (Toggler) */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse" // Atributo de Bootstrap para el colapso
                    data-bs-target="#navbarNav" // ID del elemento a colapsar
                    aria-controls="navbarNav"
                    aria-expanded={!isNavCollapsed ? "true" : "false"} // Controla el estado del aria-expanded
                    aria-label="Toggle navigation"
                    onClick={handleNavCollapse} // Nuestro manejador de clic
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenido del menú colapsable */}
                <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse justify-content-end`} id="navbarNav">
                    <div className="navbar-nav"> {/* Usamos navbar-nav para agrupar los enlaces */}
                        <Link to="/ebook" className="nav-link"> {/* nav-link para estilos de Bootstrap */}
                            <span className="text">{t('navbar')}</span>
                        </Link>
                        <Link to="/eventshub" className="nav-link">
                            <span className="text">{t('navbar_events')}</span>
                        </Link>
                        <Link to="/contact" className="nav-link">
                            <span className="text">{t('navbar_contact')}</span>
                        </Link>
                        {/* El LanguageSwitcher lo incluimos directamente aquí */}
                        <div className="languageSwitcher d-flex align-items-center ms-lg-3"> {/* Agrega ms-lg-3 para un margen a la izquierda en pantallas grandes */}
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};