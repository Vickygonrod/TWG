import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { RetreatHouse } from "../components/RetreatHouse.jsx";
import {
    retreatRooms,
    retreatConfig
} from "../data/retreatRooms.js";

import "../styles/retreatStyle.css";
import "../styles/retreatRoomStyle.css";
import { RetreatContact } from "../components/RetreatContact.jsx";

export const RetreatRoom = () => {

    const { roomId } = useParams();
    const { t, i18n } = useTranslation();

    const room = retreatRooms[roomId];

    const [gallery, setGallery] = useState([]);
    const [activePhoto, setActivePhoto] = useState(null);

    const dialogRef = useRef(null);

    const installmentCount = retreatConfig.installmentCount;

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

    const formatPrice = (price) => {

        if (price === null || price === undefined) {
            return t("retreat_price_pending", "Próximamente");
        }

        return new Intl.NumberFormat(
            i18n.language || "es-ES",
            {
                style: "currency",
                currency: retreatConfig.currency
            }
        ).format(price);
    };

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

    const showFullPayment = room.paymentOptions.full.enabled;

    const showInstallments =
        room.paymentOptions.installments.enabled &&
        [2, 3].includes(installmentCount);

    const installmentUrl =
        room.paymentOptions.installments.checkoutUrls[
            installmentCount
        ];

    const totalCents = room.price === null
        ? null
        : Math.round(room.price * 100);

    const installmentPrice = totalCents !== null && showInstallments
        ? Math.floor(totalCents / installmentCount) / 100
        : null;

    const lastInstallment = installmentPrice !== null
        ? (totalCents -
            Math.round(installmentPrice * 100) *
            (installmentCount - 1)) / 100
        : null;

    const renderBookingButton = (url) => {

        if (!url || room.price === null) {
            return (
                <button
                    className="retreat-button"
                    disabled
                >
                    {t("retreat_booking_soon", "Próximamente")}
                </button>
            );
        }

        return (
            <a href={url} className="retreat-button">
                {t("retreat_book_room", "Reservar mi plaza")}
            </a>
        );
    };

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
                                Gran Canaria · Retiro creativo
                            </span>

                            <h1>{t(`room_${room.id}_name`, room.name)}.</h1>

                            <h3>
                                {t(`room_${room.id}_subtitle`, room.subtitle)}
                            </h3>

                            <p>
                                {t(`room_${room.id}_description`, room.description)}
                            </p>

                            <div className="room-basic-info">

                                <span>
                                    {retreatConfig.duration} días
                                </span>

                                <span>
                                    {retreatConfig.nights} noches
                                </span>

                                <span>
                                    {room.capacity} {room.capacity === 1
                                        ? "persona"
                                        : "personas"}
                                </span>

                            </div>

                            {retreatConfig.dates && (
                                <p>{retreatConfig.dates}</p>
                            )}

                            <a
                                href="#room-prices"
                                className="retreat-button"
                            >
                                {t("retreat_view_prices", "Ver precios y reservar")}
                            </a>

                        </div>

                        <div className="col-12 col-md-6 retreat-hero-image">

                            <button
                                type="button"
                                className="room-photo-trigger"
                                onClick={() => openGallery(room.gallery, 0)}
                            >
                                <img
                                    src={room.image}
                                    alt={room.name}
                                />
                            </button>

                        </div>

                    </div>

                </div>

            </header>


            {/* THE HOUSE */}

            <RetreatHouse onImageClick={openGallery} />


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
                                {t(`room_${room.id}_name`, room.name)}
                            </h3>

                            <p>
                                {t(`room_${room.id}_description`, room.description)}
                            </p>

                            <ul className="room-features">

                                {room.features.map((feature, index) => (
                                    <li key={index}>
                                        {t(`room_${room.id}_feature_${index}`, feature)}
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

                        {showFullPayment && (

                            <div className="col-12 col-md-5">

                                <article className="room-payment-card">

                                    <h3>
                                        {t("retreat_full_payment", "Pago único")}
                                    </h3>

                                    <div className="room-price">
                                        {formatPrice(room.price)}
                                    </div>

                                    <p>
                                        {t("retreat_one_payment", "Un solo pago")}
                                    </p>

                                    {renderBookingButton(
                                        room.paymentOptions.full.checkoutUrl
                                    )}

                                </article>

                            </div>

                        )}

                        {showInstallments && (

                            <div className="col-12 col-md-5">

                                <article className="room-payment-card room-installment-card">

                                    <h3>
                                        {t("retreat_installments", "Pago fraccionado")}
                                    </h3>

                                    <div className="room-price">

                                        {installmentPrice === null
                                            ? formatPrice(null)
                                            : `${installmentCount} × ${formatPrice(installmentPrice)}`
                                        }

                                    </div>

                                    <p>
                                        {installmentCount} cuotas
                                    </p>

                                    {lastInstallment !== installmentPrice && (
                                        <p>
                                            Última cuota: {formatPrice(lastInstallment)}
                                        </p>
                                    )}

                                    <p className="room-payment-total">
                                        Total: {formatPrice(room.price)}
                                    </p>

                                    {renderBookingButton(installmentUrl)}

                                </article>

                            </div>

                        )}

                        {!showFullPayment && !showInstallments && (
                            <p>
                                {t("retreat_booking_soon", "Próximamente")}
                            </p>
                        )}

                    </div>

                </div>

            </section>
            <RetreatContact />

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