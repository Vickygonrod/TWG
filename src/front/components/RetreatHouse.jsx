import React from "react";
import { useTranslation } from "react-i18next";

import houseImage from "../images/terraza.png";
import terraceImage from "../images/azotea.png";
import livingRoomImage from "../images/livingroom.png";

export const RetreatHouse = ({ retreat, onImageClick }) => {
    const { t } = useTranslation();

    const photos = [
        {
            src: houseImage,
            caption: t("retreat_gallery_house", "La terraza de nuestra casa.")
        },
        {
            src: terraceImage,
            caption: t("retreat_gallery_terrace", "La azotea del alojamiento.")
        },
        {
            src: livingRoomImage,
            caption: t("retreat_gallery_living", "El salón y las zonas comunes.")
        }
    ];

    return (
        <section className="retreat-section retreat-house">
            <div className="container retreat-container">

                <div className="retreat-section-heading">

                    <span className="retreat-eyebrow">
                        01 — {t("retreat_house_label", "El lugar")}
                    </span>

                    <h2>
                        {retreat?.house_name || t(
                            "retreat_house_title_generic",
                            "Nuestra casa durante el retiro."
                        )}
                    </h2>

                    <p>
                        {retreat?.house_description || t(
                            "retreat_house_description",
                            "Un lugar para sentirnos en casa, disfrutar juntas y encontrar nuestros propios rincones de inspiración."
                        )}
                    </p>

                </div>

                <div className="row retreat-house-gallery">

                    {photos.map((photo, index) => (
                        <div className="col-4" key={index}>

                            <button
                                type="button"
                                className="room-photo-trigger"
                                onClick={() => onImageClick(photos, index)}
                                aria-label={photo.caption}
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
        </section>
    );
};