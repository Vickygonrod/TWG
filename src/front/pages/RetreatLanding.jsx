import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import NewsletterSignUpPopup from "../components/NewsletterSignUpPopup.jsx";
import { RetreatContact } from "../components/RetreatContact.jsx";
import "../styles/retreatStyle.css";
import heroImage from "../images/eventoplaya.png";
import playImage from "../images/yogaplaya.jpg";
import moveImage from "../images/clasedeyogajuntoalmar.png";
import createImage from "../images/arte.jpg";
import dayImage from "../images/breatheflow.jpg";
import houseImage from "../images/terraza.png";
import terraceImage from "../images/azotea.png";
import livingRoomImage from "../images/livingroom.png";
import privateRoomImage from "../images/habIndi.png";
import doubleRoomImage  from "../images/hab2.png";
import sharedRoomImage from "../images/hab4.png";
import { Link } from "react-router-dom";




export const RetreatLanding = () => {
    const { t } = useTranslation();
    const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);

    // Sustituir por las imágenes reales del retiro.
   const images = {
    hero: heroImage,
    play: playImage,
    move: moveImage,
    create: createImage,
    day: dayImage,
    house: houseImage,
    terrace: terraceImage,
    livingRoom: livingRoomImage,
    roomPrivate: privateRoomImage,
    roomDouble: doubleRoomImage,
    roomShared: sharedRoomImage
};

    const activities = [
        {
            id: "play",
            title: "Relax.",
            image: images.play,
            description: t(
                "retreat_play_description",
                "Explora, experimenta y diviértete sin expectativas."
            )
        },
        {
            id: "move",
            title: "Move.",
            image: images.move,
            description: t(
                "retreat_move_description",
                "Disfruta del movimiento y conecta con tus sentidos."
            )
        },
        {
            id: "create",
            title: "Create.",
            image: images.create,
            description: t(
                "retreat_create_description",
                "Crea por el simple placer de crear."
            )
        }
    ];

    const dailySchedule = [
        {
            id: "morning",
            title: t("retreat_morning", "Por la mañana"),
            description: t(
                "retreat_morning_description",
                "Movimiento, desayuno y tiempo junto al mar."
            )
        },
        {
            id: "midday",
            title: t("retreat_midday", "A mediodía"),
            description: t(
                "retreat_midday_description",
                "Comida, conversaciones y tiempo libre."
            )
        },
        {
            id: "afternoon",
            title: t("retreat_afternoon", "Por la tarde"),
            description: t(
                "retreat_afternoon_description",
                "Talleres y exploración creativa."
            )
        },
        {
            id: "evening",
            title: t("retreat_evening", "Al atardecer"),
            description: t(
                "retreat_evening_description",
                "Compartir, disfrutar y descansar."
            )
        }
    ];

    // Habitaciones de ejemplo. Sustituir por las reales.
    const rooms = [
        {
            id: "private",
            name: t("retreat_room_private", "Habitación privada"),
            image: images.roomPrivate,
            description: t(
                "retreat_room_private_description",
                "Un espacio solo para ti."
            )
        },
        {
            id: "double",
            name: t("retreat_room_double", "Habitación doble"),
            image: images.roomDouble,
            description: t(
                "retreat_room_double_description",
                "Comparte la experiencia."
            )
        },
        {
            id: "shared",
            name: t("retreat_room_shared", "Habitación compartida"),
            image: images.roomShared,
            description: t(
                "retreat_room_shared_description",
                "Disfruta en compañía."
            )
        }
    ];

    const gallery = [
        { src: images.hero, caption: t("retreat_gallery_hero", "El espíritu de nuestro retiro creativo.") },
        ...activities.map(a => ({ src: a.image, caption: `${a.title} ${a.description}` })),
        { src: images.day, caption: t("retreat_gallery_day", "Un momento para respirar y disfrutar a tu ritmo.") },
        { src: images.house, caption: t("retreat_gallery_house", "La terraza de nuestra casa.") },
        { src: images.terrace, caption: t("retreat_gallery_terrace", "La azotea del alojamiento.") },
        { src: images.livingRoom, caption: t("retreat_gallery_living", "El salón y las zonas comunes.") },
        ...rooms.map(r => ({ src: r.image, caption: `${r.name}. ${r.description}` }))
    ];
    const [activePhoto, setActivePhoto] = useState(null);
    const dialogRef = useRef(null);
    const touchStart = useRef(null);
    const triggerRef = useRef(null);
    const isGalleryOpen = activePhoto !== null;
    const navigate = (direction) => setActivePhoto(i => i === null ? null : (i + direction + gallery.length) % gallery.length);
    const closeGallery = () => setActivePhoto(null);
    const photoProps = (src) => ({
        className: "retreat-clickable-photo",
        role: "button",
        tabIndex: 0,
        onClick: (e) => { triggerRef.current = e.currentTarget; setActivePhoto(gallery.findIndex(photo => photo.src === src)); },
        onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.currentTarget.click();
            }
        }
    });
    useEffect(() => {
        if (!isGalleryOpen) return;
        const dialog = dialogRef.current;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            triggerRef.current?.focus();
        };
    }, [isGalleryOpen]);

    return (
        <>
            <main className="retreat-page">

                {/* HERO */}
                <header className="retreat-hero">
                    <div className="container retreat-container">
                        <div className="row align-items-center gy-4">
                            <div className="col-12 col-md-6 retreat-hero-content">
                                <span className="retreat-eyebrow">{t("retreat_location", "Gran Canaria")} · {t("retreat_label", "Retiro creativo")}</span>
                                <h1>{t("retreat_hero_title", "Unos días para")}<em>{t("retreat_hero_accent", " volver a jugar.")}</em></h1>
                                <p>{t("retreat_hero_description", "Cinco días para crear, moverte, disfrutar del mar y compartir con otras mujeres.")}</p>
                                <a href="#retreat-experience" className="retreat-button">{t("retreat_hero_cta", "Descubre más sobre el retiro")}</a>
                            </div>
                            <div className="col-12 col-md-6 retreat-hero-image">
                                <img {...photoProps(images.hero)} src={images.hero} alt={t("retreat_hero_alt", "El lugar del retiro")} fetchPriority="high" />
                            </div>
                        </div>
                        <div className="row retreat-info-bar text-center">
                            <div className="col-4"><strong>5</strong><span>{t("retreat_days", "Días para ti")}</span></div>
                            <div className="col-4"><strong>Gran Canaria</strong><span>{t("retreat_seaside", "Junto al mar")}</span></div>
                            <div className="col-4"><strong>Play · Move · Create</strong><span>{t("retreat_philosophy", "Nuestra filosofía")}</span></div>
                        </div>
                    </div>
                </header>

                {/* EXPERIENCE */}
                <section
                    id="retreat-experience"
                    className="retreat-section retreat-experience"
                >
                    <div className="container retreat-container">
                        <div className="retreat-section-heading">
                            <span className="retreat-eyebrow">
                                01 — {t("retreat_experience", "La experiencia")}
                            </span>

                            <h2>
                                {t(
                                    "retreat_experience_title",
                                    "La vida también está para jugar."
                                )}
                            </h2>

                            <p>
                                {t(
                                    "retreat_experience_description",
                                    "Un espacio para explorar tu creatividad, descubrir nuevas formas de disfrutar y conectar con otras mujeres."
                                )}
                            </p>
                        </div>

                        <div className="row retreat-activity-grid">
                            {activities.map((activity) => (
                                <article
                                    className="col-4 retreat-activity"
                                    key={activity.id}
                                >
                                    <img {...photoProps(activity.image)} src={activity.image}
                                        alt={activity.title}
                                        loading="lazy"
                                    />

                                    <h3>{activity.title}</h3>
                                    <p>{activity.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TYPICAL DAY */}
                <section className="retreat-section retreat-day">
                    <div className="container retreat-container">
                        <div className="row align-items-center gy-4">
                    <div className="col-12 col-md-6 retreat-day-image">
                        <img {...photoProps(images.day)} src={images.day}
                            alt={t("retreat_day_alt", "Una mañana en el retiro")}
                            loading="lazy"
                        />
                    </div>

                    <div className="col-12 col-md-6 retreat-day-content">
                        <span className="retreat-eyebrow">
                            02 — {t("retreat_your_pace", "A tu ritmo")}
                        </span>

                        <h2>
                            {t("retreat_day_title", "Un día con nosotras.")}
                        </h2>

                        <div className="retreat-schedule">
                            {dailySchedule.map((item) => (
                                <div
                                    className="retreat-schedule-item"
                                    key={item.id}
                                >
                                    <h4>{item.title}</h4>
                                    <p>{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                    </div>
                </section>

                {/* BENEFITS */}
                <section className="retreat-section retreat-benefits">
                    <div className="container retreat-container">
                        <span className="retreat-eyebrow">
                          03 — {t("retreat_benefits_label", "Mucho más que un viaje")}
                        </span>

                        <h2>
                            {t(
                                "retreat_benefits_title",
                                "Lo que te llevas contigo."
                            )}
                        </h2>

                        <div className="row retreat-benefits-grid gy-4">
                            <div className="col-12 col-md-4">
                                <span>01</span>
                                <h3>{t("retreat_benefit_1", "Inspiración")}</h3>
                                <p>
                                    {t(
                                        "retreat_benefit_1_description",
                                        "Nuevas ideas y herramientas para incorporar la creatividad a tu día a día."
                                    )}
                                </p>
                            </div>

                            <div className="col-12 col-md-4">
                                <span>02</span>
                                <h3>{t("retreat_benefit_2", "Conexión")}</h3>
                                <p>
                                    {t(
                                        "retreat_benefit_2_description",
                                        "Experiencias compartidas con mujeres que también disfrutan creando."
                                    )}
                                </p>
                            </div>

                            <div className="col-12 col-md-4">
                                <span>03</span>
                                <h3>{t("retreat_benefit_3", "Ligereza")}</h3>
                                <p>
                                    {t(
                                        "retreat_benefit_3_description",
                                        "Tiempo para disfrutar, experimentar y hacer cosas simplemente porque te gustan."
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* THE HOUSE */}
                <section
                    id="retreat-house"
                    className="retreat-section retreat-house"
                >
                    <div className="container retreat-container">
                        <div className="retreat-section-heading">
                            <span className="retreat-eyebrow">
                                04 — {t("retreat_house_label", "El lugar")}
                            </span>

                            <h2>
                                {t(
                                    "retreat_house_title",
                                    "Nuestra casa durante cuatro días."
                                )}
                            </h2>

                            <p>
                                {t(
                                    "retreat_house_description",
                                    "Un lugar para sentirnos en casa, disfrutar juntas y encontrar nuestros propios rincones de inspiración."
                                )}
                            </p>
                        </div>

                        <div className="row retreat-house-gallery">
                            <div className="col-4"><img {...photoProps(images.house)} src={images.house} alt={t("retreat_house_alt", "La casa")} loading="lazy" /></div>
                            <div className="col-4"><img {...photoProps(images.terrace)} src={images.terrace} alt={t("retreat_terrace_alt", "La terraza")} loading="lazy" /></div>
                            <div className="col-4"><img {...photoProps(images.livingRoom)} src={images.livingRoom} alt={t("retreat_living_alt", "Zonas comunes")} loading="lazy" /></div>
                        </div>
                    </div>
                </section>

                {/* ROOMS */}
                <section
                    id="retreat-rooms"
                    className="retreat-section retreat-rooms"
                >
                    <div className="container retreat-container">
                        <div className="retreat-section-heading">
                            <span className="retreat-eyebrow">
                                05 — {t("retreat_rooms_label", "Tu espacio")}
                            </span>

                            <h2>
                                {t(
                                    "retreat_rooms_title",
                                    "Elige dónde despertar."
                                )}
                            </h2>
                        </div>

                        <div className="row retreat-room-grid gy-4">
                            {rooms.map((room) => (
                                <div className="col-12 col-md-4" key={room.id}>
                                <article className="retreat-room-card">
                                    <img {...photoProps(room.image)} src={room.image}
                                        alt={room.name}
                                        loading="lazy"
                                    />

                                    <div className="retreat-room-content">
                                        <h3>{room.name}</h3>
                                        <p>{room.description}</p>

                                       <Link
                                            to={`/retiro/room/${room.id}`}
                                            className="retreat-button retreat-room-button"
                                        >
                                            {t("retreat_view_room", "Ver detalles y reservar")}
                                        </Link>
                                    </div>
                                </article>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="retreat-final-cta">
                    <span>Play · Move · Create</span>

                    <h2>
                        {t(
                            "retreat_final_title",
                            "Nos merecemos unos días así."
                        )}
                    </h2>

                    <p>
                        {t(
                            "retreat_final_description",
                            "Sé de las primeras en enterarte de todas las novedades."
                        )}
                    </p>

                    <button
                        type="button"
                        className="retreat-button"
                        onClick={() => setShowNewsletterPopup(true)}
                    >
                        {t("retreat_final_cta", "Reservar mi plaza")}
                    </button>
                
                </section>
                <RetreatContact />

                <dialog ref={dialogRef} className="retreat-lightbox"
                    aria-label={t("retreat_gallery_label", "Galería de fotografías")}
                    onCancel={e => { e.preventDefault(); closeGallery(); }}
                    onClick={e => { if (e.target === e.currentTarget) closeGallery(); }}
                    onKeyDown={e => {
                        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                            e.preventDefault(); navigate(e.key === "ArrowLeft" ? -1 : 1);
                        }
                    }}>
                    {isGalleryOpen && (
                        <div className="retreat-lightbox-panel">
                            <div className="retreat-lightbox-top">
                                <span aria-live="polite">{activePhoto + 1} / {gallery.length}</span>
                                <button type="button" autoFocus onClick={closeGallery} aria-label={t("retreat_gallery_close", "Cerrar")}>×</button>
                            </div>
                            <div className="retreat-lightbox-stage"
                                onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
                                onTouchEnd={e => {
                                    if (touchStart.current === null) return;
                                    const delta = e.changedTouches[0].clientX - touchStart.current;
                                    if (Math.abs(delta) > 50) navigate(delta > 0 ? -1 : 1);
                                    touchStart.current = null;
                                }}>
                                <button type="button" onClick={() => navigate(-1)} aria-label={t("retreat_gallery_previous", "Anterior")}>‹</button>
                                <img src={gallery[activePhoto].src} alt={gallery[activePhoto].caption} />
                                <button type="button" onClick={() => navigate(1)} aria-label={t("retreat_gallery_next", "Siguiente")}>›</button>
                            </div>
                            <p aria-live="polite">{gallery[activePhoto].caption}</p>
                        </div>
                    )}
                </dialog>
            </main>

            {showNewsletterPopup && (
                <NewsletterSignUpPopup
                    onClose={() => setShowNewsletterPopup(false)}
                />
            )}
        </>
    );
};
