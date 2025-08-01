import React, { useState, useRef } from "react";
import "../styles/landingStyle.css";
import ebookimgEs from "../images/booksNBG-es.png";
import ebookimgEn from "../images/booksNBG-en.png";
import logo from "../images/logo.png";
import tesoroImage from "../images/tesoro.png"; // <-- IMPORTACIÓN DE LA IMAGEN
import { NavbarLanding } from "../components/NavbarLanding";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Landing = () => {

    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const { t, i18n } = useTranslation();
    const currentEbookImage = i18n.language === 'en' ? ebookimgEn : ebookimgEs;

    const STRIPE_PRICE_ID_ES = 'price_1RXrctCdOcKHFOeVgQHbd1Lb';
    const STRIPE_PRICE_ID_EN = 'price_1RXrdaCdOcKHFOeV2PJwznvr';

    const testimonialsRef = useRef(null);
    const formRef = useRef(null); 

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handlePurchaseClick = () => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            alert("Por favor, introduce tu dirección de correo electrónico.");
            return;
        }

        try {
            const priceIdToSend = i18n.language === 'en' ? STRIPE_PRICE_ID_EN : STRIPE_PRICE_ID_ES;

            const response = await axios.post(`${BACKEND_BASE_URL}/api/create-checkout-session`, {
                price_id: priceIdToSend,
                customer_email: formData.email,
                customer_name: `${formData.firstName} ${formData.lastName}`
            });

            const { checkout_url } = response.data;
            if (checkout_url) {
                window.location.href = checkout_url;
            } else {
                console.error("No se recibió una URL de checkout de Stripe.");
                alert("Hubo un problema al iniciar el pago. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            console.error("Error al crear la sesión de checkout:", error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(`Error: ${error.response.data.error}`);
            } else {
                alert("Ocurrió un error inesperado al procesar tu solicitud de pago.");
            }
        }
    };

    const scrollTestimonials = (direction) => {
        if (testimonialsRef.current) {
            const scrollAmount = testimonials.current.offsetWidth * 0.8;
            if (direction === 'left') {
                testimonialsRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                testimonialsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return(
        <>
            <NavbarLanding />
            <div className="landing-page-wrapper">

                {/* --- Sección Principal/Hero --- */}
                <header className="landing-section hero">
                    <div className="row headerRow">
                        <div className="leftheader col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                            <h1>{t('landing_ebook_1')}</h1>
                            <h2>{t('landing_ebook_2')}</h2>
                            <h4 className="subtitle">{t('landing_ebook_3')}</h4>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                            <img src={currentEbookImage} alt={t('landing_ebook_1')} className=""/>
                        </div>
                    </div>
                    <div className="cta-header">
                        <span className="pack-title">{t('landing_ebook_4')}</span>
                        <div className="price-box">
                            <span className="original-price">20€</span>
                            <span className="current-price">15€</span>
                        </div>
                    </div>
                    <button className="btn btn-orange"
                        onClick={handlePurchaseClick}
                    >{t('landing_ebook_5')}</button>
                </header>

                {/* --- Sección de Descripción Libros --- */}
                <section className="landing-section features-section">
                    <div className="container">
                        <p className="intro">{t('landing_ebook_6')} <br />
                        <br />{t('landing_ebook_7')} <span className="bold">{t('landing_ebook_8')}</span> {t('landing_ebook_9')} <span className="bold">{t('landing_ebook_10')}</span> {t('landing_ebook_11')}</p>
                        <h3>{t('landing_ebook_12')}</h3>
                        <div className="feature-grid">
                            <div className="feature-item">
                                <h4>{t('landing_ebook_13')}</h4>
                                <p>
                                    <br />
                                    {t('landing_ebook_14')}
                                    <br />
                                    <br />
                                    <ul>
                                        <li><span className="bold">{t('landing_ebook_15')}</span> {t('landing_ebook_16')}</li>
                                        <br />
                                        <li><span className="bold">{t('landing_ebook_17')}</span> {t('landing_ebook_18')}</li>
                                        <br />
                                        <li><span className="bold">{t('landing_ebook_19')}</span> {t('landing_ebook_20')}</li>
                                        <br />
                                        <li><span className="bold">{t('landing_ebook_21')}</span> {t('landing_ebook_22')}</li>
                                    </ul>
                                </p>
                            </div>
                            <div className="feature-item">
                                <h4>{t('landing_ebook_23')}</h4>
                                <br />
                                <p>
                                    <br />{t('landing_ebook_25')} <span className="bold">{t('landing_ebook_26')}</span> {t('landing_ebook_27')}
                                    <br /><br />{t('landing_ebook_28')} <span className="bold">{t('landing_ebook_29')}</span>{t('landing_ebook_30')}
                                    <br /> <br />{t('landing_ebook_31')} <br />
                                    <br /><span className="bold">{t('landing_ebook_32')}</span></p>

                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Sección Sobre la Autora/Comunidad --- */}
                <section className="landing-section about-author-section">
                    <div className="container row">
                        <h3>{t('landing_ebook_33')}</h3>
                        <img src={logo} alt="logo" className="logo col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12"/>
                        <div className="author-content col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                            <div>
                                <p>{t('landing_ebook_34')} <br />
                                <br /> {t('landing_ebook_35')} <br />
                                <br />{t('landing_ebook_36')}</p>
                                <Link to="/community" className="btn btn-secondary"> {t('landing_ebook_37')}</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Testimonials --- */}
                <section className="landing-section testimonial-section">
                    <h3>{t('landing_ebook_38')}</h3>
                    <div className="testimonial-carousel-wrapper">
                        <button className="carousel-arrow left" onClick={() => scrollTestimonials('left')}>&#9664;</button>
                        <div className="testimonial-container" ref={testimonialsRef}>
                            <div className="testimonial-item">
                                <h5>{t('landing_ebook_38')}</h5>
                                <p>
                                    <br />
                                    {t('landing_ebook_39')}
                                    <br /><br />{t('landing_ebook_40')}
                                    {t('landing_ebook_41')}
                                    <br /><br /> {t('landing_ebook_42')}
                                </p>
                            </div>
                            <div className="testimonial-item">
                                <h5>{t('landing_ebook_43')}</h5>
                                <p>
                                    <br />
                                    {t('landing_ebook_44')}
                                    <br /><br />{t('landing_ebook_45')}
                                    <br /><br /> {t('landing_ebook_46')}
                                </p>
                            </div>
                            <div className="testimonial-item">
                                <h5>{t('landing_ebook_47')}</h5>
                                <p>
                                    <br />
                                    {t('landing_ebook_48')}
                                    <br /><br />{t('landing_ebook_49')}
                                    <br /><br /> {t('landing_ebook_50')}
                                </p>
                            </div>
                        </div>
                        <button className="carousel-arrow right" onClick={() => scrollTestimonials('right')}>&#9654;</button>
                    </div>
                </section>

                {/* --- Última llamada a la acción con formulario --- */}
                <section id="buy-section" className="landing-section cta-section" ref={formRef}>
                    <div className="form-layout-container">
                        <div className="image-column">
                            <img src={tesoroImage} alt="Páginas del libro" className="tesoro-image"/>
                        </div>
                        <div className="form-column">
                            <h3>{t('landing_ebook_51')} </h3>
                            <p>{t('landing_ebook_52')}</p>
                            <form onSubmit={handleFormSubmit}>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder={t('form_placeholder_firstName')}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder={t('form_placeholder_lastName')}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder={t('form_placeholder_email')}
                                        required
                                    />
                                </div>
                                <div className="cta-final-group">
                                    <div className="price-box">
                                        <span className="original-price">20€</span>
                                        <span className="current-price">15€</span>
                                    </div>
                                    <button type="submit" className="btn btn-orange">
                                        {t('landing_ebook_5')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
};