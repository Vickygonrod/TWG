import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import "../styles/landingStyle.css"; 
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

export const EventSuccess = () => {
    const { t } = useTranslation();
    const location = useLocation();

    // Puedes usar el session_id para propósitos de seguimiento si es necesario, 
    // pero no lo usamos aquí para mostrar datos al usuario.
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const id = query.get('session_id');
        if (id) {
            console.log("Reserva de evento confirmada con session_id:", id);
            // Opcional: Podrías hacer una llamada a la API para verificar la sesión,
            // pero el webhook ya debería haber registrado la reserva.
        }
    }, [location]);

    return (
        <div className="container containersuccess mt-5 text-center row">
            <div className="col-md-8 col-lg-8 col-xl-8 col-sm-12 col-xs-12 allign-items-center justify-content-center mx-auto"> 
                <CheckCircle size={80} color="#28a745" />
                <h2 className="mt-3">{t('event_success_title')}</h2>
                <br />
                <h5>{t('event_success_message_part1')}</h5>
                <h5>{t('event_success_message_part2')}</h5>
                <br />
                <p>{t('event_success_email_info')}</p>
                <Link to="/" className="btn btn-orange btn-lg mt-4">
                    {t('back_to_home')}
                </Link>
                <p className="mt-5">{t('success_event_6')} <Link to="/contact">{t('success_event_7')}</Link>.</p>
            </div>
        </div>
    );
};