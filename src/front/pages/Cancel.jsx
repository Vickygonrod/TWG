import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Cancel = () => {
    const { t } = useTranslation();

    return (
        <div className="container mt-5 text-center">
            <h1>{t('cancel_1')}</h1>
            <p className="lead">{t('cancel_2')}</p>
            <p>{t('cancel_3')}</p>
            <Link to="/ebook" className="btn btn-orange btn-lg mt-4">{t('cancel_4')}</Link>
        </div>
    );
};