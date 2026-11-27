import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { RetreatHouse } from "../components/RetreatHouse.jsx";
import { normalizeRoom, formatRetreatDates } from "../data/retreatRooms.js";
import { useRetreat } from "../hooks/useRetreat.js";

import "../styles/retreatStyle.css";
import "../styles/retreatRoomStyle.css";
import { RetreatContact } from "../components/RetreatContact.jsx";

export const RetreatRoom = () => {

    const { roomId } = useParams();
    const { t, i18n } = useTranslation();

    const { retreat, loading, error } = useRetreat();
    const rawRoom = retreat?.rooms.find(item => item.slug === roomId);
    const room = rawRoom ? normalizeRoom(rawRoom) : null;

    const [gallery, setGallery] = useState([]);
    const [activePhoto, setActivePhoto] = useState(null);

    const dialogRef = useRef(null);



    const openGallery = (photos, index) => {
        setGallery(photos);
        setActivePhoto(index);
    };

    const closeGallery = () => {
        setActivePhoto(null);
    };

    const nextPhoto = () => {
        setActivePhoto(previous =>
            (previous + 1) % gallery.length
        );
    };

    const previousPhoto = () => {
        setActivePhoto(previous =>
            (previous - 1 + gallery.length) % gallery.length
        );
    };

    useEffect(() => {
        const dialog = dialogRef.current;

        if (activePhoto !== null && dialog && !dialog.open) {
            dialog.showModal();
        }

        if (activePhoto === null && dialog?.open) {
            dialog.close();
        }
    }, [activePhoto]);

    useEffect(() => {
        closeGallery();
        window.scrollTo(0, 0);
    }, [roomId]);

    const formatPrice = (cents, currency) => new Intl.NumberFormat(i18n.language || "es-ES", { style: "currency", currency }).format(cents / 100);

    if (loading || error) return <main className="retreat-page retreat-room-page"><section><p role="status">{loading ? t("retreat_loading", "Cargando retiro…") : error}</p><Link to="/retiro">Volver al retiro</Link></section></main>;

    if (!room) {
        return (
            <main className="retreat-page retreat-room-page">
                <section>
                    <h1>Habitación no encontrada</h1>

                    <Link to="/retiro" className="retreat-button">
                        Volver al retiro
                    </Link>
                </section>
            </main>
        );
    }

    const paymentOptions = [...(room.payment_options || [])].filter(option => option.is_active).sort((a, b) => a.installments - b.installments);
    const features = [room.bed_type, room.private_bathroom === true ? t("retreat_private_bathroom", "Baño privado") : room.private_bathroom === false ? t("retreat_shared_bathroom", "Baño no privado") : null].filter(Boolean);

    return (
        <main className="retreat-page retreat-room-page">

            {/* BASIC INFORMATION */}

            <header className="retreat-hero room-hero">

                <div className="container retreat-container">

                    <Link
                        to="/retiro"
                        className="room-back-link"
                    >
                        ← {t("retreat_back", "Volver al retiro")}
                    </Link>

                    <div className="row align-items-center gy-4">

                        <div className="col-12 col-md-6 retreat-hero-content">

                            <span className="retreat-eyebrow">
                                {retreat.location} · {t("retreat_label", "Retiro creativo")}
                            </span>

                            <h1>{room.name}.</h1>

                            <h3>
                                {room.subtitle}
                            </h3>

                            <p>
                                {room.description}
                            </p>

                            <div className="room-basic-info">

                                <span>
                                    {retreat.duration_days ?? "—"} días
                                </span>

                                <span>
                                    {retreat.nights ?? "—"} noches
                                </span>

                                <span>
                                    {room.capacity} {room.capacity === 1
                                        ? "persona"
                                        : "personas"}
                                </span>

                            </div>

                            {formatRetreatDates(retreat, i18n.language) && (
                                <p>{formatRetreatDates(retreat, i18n.language)}</p>
                            )}

                            <a
                                href="#room-prices"
                                className="retreat-button"
                            >
                                {t("retreat_view_prices", "Ver precios y reservar")}
                            </a>

                        </div>

                        <div className="col-12 col-md-6 retreat-hero-image">

                            {room.image && <button
                                type="button"
                                className="room-photo-trigger"
                                onClick={() => openGallery(room.gallery, 0)}
                            >
                                <img
                                    src={room.image}
                                    alt={room.name}
                                />
                            </button>}

                        </div>

                    </div>

                </div>

            </header>


            {/* THE HOUSE */}

            <RetreatHouse retreat={retreat} onImageClick={openGallery} />


            {/* ROOM INFORMATION */}

            <section className="retreat-section room-details">

                <div className="container retreat-container">

                    <div className="retreat-section-heading">

                        <span className="retreat-eyebrow">
                            02 — {t("retreat_rooms_label", "Tu espacio")}
                        </span>

                        <h2>
                            {t("retreat_room_details", "Tu rincón para desconectar.")}
                        </h2>

                    </div>

                    <div className="row align-items-center gy-4">

                        <div className="col-12 col-md-6">

                            <div className="row gy-3">

                                {room.gallery.map((photo, index) => (

                                    <div
                                        className={room.gallery.length === 1
                                            ? "col-12"
                                            : "col-6"}
                                        key={index}
                                    >

                                        <button
                                            type="button"
                                            className="room-photo-trigger"
                                            onClick={() => openGallery(room.gallery, index)}
                                        >
                                            <img
                                                src={photo.src}
                                                alt={photo.caption}
                                                loading="lazy"
                                            />
                                        </button>

                                    </div>

                                ))}

                            </div>

                        </div>

                        <div className="col-12 col-md-6 room-details-content">

                            <h3>
                                {room.name}
                            </h3>

                            <p>
                                {room.description}
                            </p>

                            <ul className="room-features">

                                {features.map((feature, index) => (
                                    <li key={index}>
                                        {feature}
                                    </li>
                                ))}

                            </ul>

                        </div>

                    </div>

                </div>

            </section>


            {/* PRICES AND PAYMENT OPTIONS */}

            <section
                id="room-prices"
                className="retreat-section room-prices"
            >

                <div className="container retreat-container">

                    <div className="retreat-section-heading">

                        <span className="retreat-eyebrow">
                            03 — {t("retreat_reservation", "Reserva tu experiencia")}
                        </span>

                        <h2>
                            {t("retreat_payment_title", "Elige cómo pagar.")}
                        </h2>

                        <p>
                            {t("retreat_payment_description",
                                "Escoge la opción de pago que mejor se adapte a ti.")}
                        </p>

                    </div>

                    <div className="row justify-content-center gy-4 room-payment-grid">

                        {paymentOptions.map(option => (
                            <div className="col-12 col-md-5" key={option.id}>
                                <article className={`room-payment-card ${option.installments > 1 ? "room-installment-card" : ""}`}>
                                    <h3>{option.name}</h3>
                                    <div className="room-price">
                                        {option.installments === 1 ? formatPrice(option.total_price, option.currency) : formatPrice(option.installment_amounts[0], option.currency)}
                                    </div>
                                    {option.installments > 1 ? <>
                                        <p>{option.installments} {t("retreat_installments_label", "cuotas")}</p>
                                        {option.installment_amounts.map((amount, index) => <p key={index}>{index + 1}. {formatPrice(amount, option.currency)}</p>)}
                                        <p className="room-payment-total">Total: {formatPrice(option.total_price, option.currency)}</p>
                                    </> : <p>{t("retreat_one_payment", "Un solo pago")}</p>}
                                    <button type="button" className="retreat-button" disabled>{t("retreat_booking_soon", "Próximamente")}</button>
                                </article>
                            </div>
                        ))}
                        {!paymentOptions.length && <p>{t("retreat_booking_soon", "Próximamente")}</p>}

                    </div>

                </div>

            </section>
            <RetreatContact source={`Retiro creativo - ${room.name}`} />

            {/* PHOTO GALLERY */}

            <dialog
                ref={dialogRef}
                className="room-gallery-dialog"
                onCancel={closeGallery}
                onClick={event => {
                    if (event.target === event.currentTarget) {
                        closeGallery();
                    }
                }}
                onKeyDown={event => {
                    if (event.key === "ArrowRight") nextPhoto();
                    if (event.key === "ArrowLeft") previousPhoto();
                }}
                aria-label="Galería de fotografías"
            >

                {activePhoto !== null && gallery[activePhoto] && (

                    <div className="room-gallery-content">

                        <button
                            type="button"
                            className="room-gallery-close"
                            onClick={closeGallery}
                            aria-label="Cerrar"
                        >
                            ×
                        </button>

                        {gallery.length > 1 && (
                            <button
                                type="button"
                                className="room-gallery-prev"
                                onClick={previousPhoto}
                                aria-label="Foto anterior"
                            >
                                ‹
                            </button>
                        )}

                        <img
                            src={gallery[activePhoto].src}
                            alt={gallery[activePhoto].caption}
                        />

                        {gallery.length > 1 && (
                            <button
                                type="button"
                                className="room-gallery-next"
                                onClick={nextPhoto}
                                aria-label="Siguiente foto"
                            >
                                ›
                            </button>
                        )}

                        <p>
                            {gallery[activePhoto].caption}
                        </p>

                        <span>
                            {activePhoto + 1} / {gallery.length}
                        </span>

                    </div>

                )}

            </dialog>

        </main>
    );
};