import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContactFormPopup } from "./ContactFormPopup.jsx";

export const RetreatContact = ({
    source = "Retiro creativo - Landing"
}) => {

    const { t } = useTranslation();
    const [showContactPopup, setShowContactPopup] = useState(false);

    const whatsapp = "+34685138853";

    const whatsappMessage = encodeURIComponent(
        t(
            "retreat_whatsapp_message",
            "¡Hola! Me interesa el retiro creativo de Gran Canaria y me gustaría resolver algunas dudas."
        )
    );

    return (
        <>
            <section className="retreat-section retreat-contact">

                <div className="container retreat-container">

                    <div className="retreat-contact-content">

                        <span className="retreat-eyebrow">
                            {t("retreat_contact_label", "Estamos para ti")}
                        </span>

                        <h2>
                            {t(
                                "retreat_contact_title",
                                "¿Te vienes, pero aún tienes dudas?"
                            )}
                        </h2>

                        <p>
                            {t(
                                "retreat_contact_description",
                                "Nos encantará hablar contigo, contarte un poquito más sobre el retiro y ayudarte a resolver cualquier duda antes de reservar."
                            )}
                        </p>

                        <div className="retreat-contact-buttons">

                            <button
                                type="button"
                                className="retreat-button"
                                onClick={() => setShowContactPopup(true)}
                            >
                                <i
                                    className="far fa-envelope"
                                    aria-hidden="true"
                                ></i>

                                {t(
                                    "retreat_contact_email",
                                    "Envíanos un mensaje"
                                )}
                            </button>

                            <a
                                href={`https://wa.me/${whatsapp}?text=${whatsappMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="retreat-button retreat-whatsapp-button"
                            >
                                <i
                                    className="fab fa-whatsapp"
                                    aria-hidden="true"
                                ></i>

                                {t(
                                    "retreat_contact_whatsapp",
                                    "Hablemos por WhatsApp"
                                )}
                            </a>

                        </div>

                        <p className="retreat-contact-note">
                            {t(
                                "retreat_contact_note",
                                "¡Nos encantará conocerte!"
                            )}
                        </p>

                    </div>

                </div>

            </section>

            {showContactPopup && (
                <ContactFormPopup
                    source={source}
                    onClose={() => setShowContactPopup(false)}
                />
            )}

        </>
    );
};