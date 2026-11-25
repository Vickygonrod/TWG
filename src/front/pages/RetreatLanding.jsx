import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import NewsletterSignUpPopup from "../components/NewsletterSignUpPopup.jsx";
import "../styles/retreatStyle.css";
import heroImage from "../images/eventoplaya.jpeg";
import playImage from "../images/valencia.jpg";
import moveImage from "../images/breatheflow.jpg";
import createImage from "../images/ebook.png";
import dayImage from "../images/breatheflow.jpg";
import houseImage from "../images/terraza.png";
import terraceImage from "../images/azotea.png";
import livingRoomImage from "../images/livingroom.png";
import privateRoomImage from "../images/habIndi.png";
import doubleRoomImage  from "../images/hab2.png";
import sharedRoomImage from "../images/hab4.png";




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
            title: "Play.",
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
            image: "/retreat/room-private.jpg",
            description: t(
                "retreat_room_private_description",
                "Un espacio solo para ti."
            )
        },
        {
            id: "double",
            name: t("retreat_room_double", "Habitación doble"),
            image: "/retreat/room-double.jpg",
            description: t(
                "retreat_room_double_description",
                "Comparte la experiencia."
            )
        },
        {
            id: "shared",
            name: t("retreat_room_shared", "Habitación compartida"),
            image: "/retreat/room-shared.jpg",
            description: t(
                "retreat_room_shared_description",
                "Disfruta en compañía."
            )
        }
    ];

    return (
        <>
            <main className="retreat-page">

                {/* HERO */}
                <header className="retreat-hero">
                    <div className="retreat-hero-content">
                        <span className="retreat-eyebrow">
                            {t("retreat_location", "Gran Canaria")}
                            {" · "}
                            {t("retreat_label", "Retiro creativo")}
                        </span>

                        <h1>
                            {t("retreat_hero_title", "Unos días para")}
                            <em>
                                {t("retreat_hero_accent", "volver a jugar.")}
                            </em>
                        </h1>

                        <p>
                            {t(
                                "retreat_hero_description",
                                "Cuatro días para crear, moverte, disfrutar del mar y compartir con otras mujeres."
                            )}
                        </p>

                        <a
                            href="#retreat-experience"
                            className="retreat-button"
                        >
                            {t(
                                "retreat_hero_cta",
                                "Descubre la experiencia"
                            )}
                            <span aria-hidden="true">↗</span>
                        </a>
                    </div>

                    <div className="retreat-hero-image">
                        <img
                            src={images.hero}
                            alt={t("retreat_hero_alt", "El lugar del retiro")}
                            fetchPriority="high"
                        />
                    </div>
                </header>

                {/* QUICK INFO */}
                <div className="retreat-info-bar">
                    <div>
                        <strong>4</strong>
                        <span>{t("retreat_days", "Días para ti")}</span>
                    </div>

                    <div>
                        <strong>Gran Canaria</strong>
                        <span>
                            {t("retreat_seaside", "Junto al mar")}
                        </span>
                    </div>

                    <div>
                        <strong>Play · Move · Create</strong>
                        <span>
                            {t("retreat_philosophy", "Nuestra filosofía")}
                        </span>
                    </div>
                </div>

                {/* EXPERIENCE */}
                <section
                    id="retreat-experience"
                    className="retreat-section retreat-experience"
                >
                    <div className="retreat-container">
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

                        <div className="retreat-activity-grid">
                            {activities.map((activity) => (
                                <article
                                    className="retreat-activity"
                                    key={activity.id}
                                >
                                    <img
                                        src={activity.image}
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
                <section className="retreat-day">
                    <div className="retreat-day-image">
                        <img
                            src={images.day}
                            alt={t("retreat_day_alt", "Una mañana en el retiro")}
                            loading="lazy"
                        />
                    </div>

                    <div className="retreat-day-content">
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
                </section>

                {/* BENEFITS */}
                <section className="retreat-section retreat-benefits">
                    <div className="retreat-container">
                        <span className="retreat-eyebrow">
                            {t("retreat_benefits_label", "Mucho más que un viaje")}
                        </span>

                        <h2>
                            {t(
                                "retreat_benefits_title",
                                "Lo que te llevas contigo."
                            )}
                        </h2>

                        <div className="retreat-benefits-grid">
                            <div>
                                <span>01</span>
                                <h3>{t("retreat_benefit_1", "Inspiración")}</h3>
                                <p>
                                    {t(
                                        "retreat_benefit_1_description",
                                        "Nuevas ideas y herramientas para incorporar la creatividad a tu día a día."
                                    )}
                                </p>
                            </div>

                            <div>
                                <span>02</span>
                                <h3>{t("retreat_benefit_2", "Conexión")}</h3>
                                <p>
                                    {t(
                                        "retreat_benefit_2_description",
                                        "Experiencias compartidas con mujeres que también disfrutan creando."
                                    )}
                                </p>
                            </div>

                            <div>
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
                    <div className="retreat-container">
                        <div className="retreat-section-heading">
                            <span className="retreat-eyebrow">
                                03 — {t("retreat_house_label", "El lugar")}
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

                        <div className="retreat-house-gallery">
                            <img
                                className="retreat-house-main"
                                src={images.house}
                                alt={t("retreat_house_alt", "La casa")}
                                loading="lazy"
                            />

                            <img
                                src={images.terrace}
                                alt={t("retreat_terrace_alt", "La terraza")}
                                loading="lazy"
                            />

                            <img
                                src={images.livingRoom}
                                alt={t("retreat_living_alt", "Zonas comunes")}
                                loading="lazy"
                            />
                        </div>
                    </div>
                </section>

                {/* ROOMS */}
                <section
                    id="retreat-rooms"
                    className="retreat-section retreat-rooms"
                >
                    <div className="retreat-container">
                        <div className="retreat-section-heading">
                            <span className="retreat-eyebrow">
                                04 — {t("retreat_rooms_label", "Tu espacio")}
                            </span>

                            <h2>
                                {t(
                                    "retreat_rooms_title",
                                    "Elige dónde despertar."
                                )}
                            </h2>
                        </div>

                        <div className="retreat-room-grid">
                            {rooms.map((room) => (
                                <article
                                    className="retreat-room-card"
                                    key={room.id}
                                >
                                    <img
                                        src={room.image}
                                        alt={room.name}
                                        loading="lazy"
                                    />

                                    <div className="retreat-room-content">
                                        <h3>{room.name}</h3>
                                        <p>{room.description}</p>

                                        <span className="retreat-room-link">
                                            {t(
                                                "retreat_room_coming_soon",
                                                "Más detalles próximamente"
                                            )}
                                        </span>
                                    </div>
                                </article>
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
                        className="retreat-button retreat-button-light"
                        onClick={() => setShowNewsletterPopup(true)}
                    >
                        {t("retreat_final_cta", "Quiero saber más")}
                    </button>
                </section>

            </main>

            {showNewsletterPopup && (
                <NewsletterSignUpPopup
                    onClose={() => setShowNewsletterPopup(false)}
                />
            )}
        </>
    );
};
