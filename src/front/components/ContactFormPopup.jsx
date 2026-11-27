import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ContactForm } from "../pages/ContactForm.jsx";

export const ContactFormPopup = ({
    onClose,
    source = ""
}) => {

    const { t } = useTranslation();
    const dialogRef = useRef(null);

    useEffect(() => {

        const dialog = dialogRef.current;
        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement;

        dialog.showModal();
        document.body.style.overflow = "hidden";

        return () => {
            if (dialog.open) {
                dialog.close();
            }

            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };

    }, []);

    return (
        <dialog
            ref={dialogRef}
            className="retreat-contact-dialog"
            aria-labelledby="contact-popup-title"
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >

            <div className="retreat-contact-popup-panel">

                <button
                    type="button"
                    className="retreat-contact-close"
                    onClick={onClose}
                    aria-label={t("retreat_gallery_close", "Cerrar")}
                >
                    ×
                </button>

                <div className="retreat-contact-popup-heading">

                    <span className="retreat-eyebrow">
                        {t("retreat_contact_label", "Estamos para ti")}
                    </span>

                    <h2 id="contact-popup-title">
                        {t("retreat_contact_popup_title", "¡Hablemos!")}
                    </h2>

                    <p>
                        {t(
                            "retreat_contact_popup_description",
                            "Cuéntanos qué te gustaría saber sobre nuestro retiro creativo."
                        )}
                    </p>

                </div>

                <ContactForm
                    isPopup={true}
                    source={source}
                />

            </div>

        </dialog>
    );
};