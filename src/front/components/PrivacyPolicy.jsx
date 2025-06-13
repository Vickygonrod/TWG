// src/components/PrivacyPolicy.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // Importa el hook de traducción

export const PrivacyPolicy = () => {
    const { t } = useTranslation(); // Inicializa el hook de traducción

    return (
        // Usamos un className general para el contenedor si necesitas algún estilo de margen/ancho global
        <div className="content-container"> 
            <h1>{t('privacy_1')}</h1>
            <p className="text-center">{t('privacy_2')}</p> {/* Añadimos text-center si quieres que esta línea esté centrada, asumiendo Bootstrap */}

            <p>{t('privacy_3')}</p>

            <p>{t('privacy_4')}</p>

            {/* --- Sección 1 --- */}
            <h2>{t('privacy_5')}</h2>
            <p><strong>{t('privacy_6')}</strong> The Women's Ground</p>
            <p><strong>{t('privacy_7')}</strong> info@thewomensground.com</p>
            <p><strong>{t('privacy_8')}</strong> www.thewomensground.com</p>

            {/* --- Sección 2 --- */}
            <h2>{t('privacy_9')}</h2>
            <p>{t('privacy_10')}</p>

            <h3>{t('privacy_11')}</h3>
            <ul>
                <li><strong>{t('privacy_12')}</strong> {t('privacy_13')}</li>
                <li><strong>{t('privacy_14')}</strong> {t('privacy_15')}</li>
                <li><strong>{t('privacy_16')}</strong> {t('privacy_17')}</li>
            </ul>

            <h3>{t('privacy_18')}</h3>
            <ul>
                <li><strong>{t('privacy_12')}</strong> {t('privacy_19')}</li>
                <li><strong>{t('privacy_14')}</strong> {t('privacy_20')}</li>
                <li><strong>{t('privacy_16')}</strong> {t('privacy_17')}</li>
            </ul>

            <h3>{t('privacy_21')}</h3>
            <ul>
                <li><strong>{t('privacy_12')}</strong> {t('privacy_22')}</li>
                <li><strong>{t('privacy_14')}</strong> {t('privacy_23')}</li>
                <li><strong>{t('privacy_16')}</strong> {t('privacy_24')}</li>
            </ul>

            <h3>{t('privacy_25')}</h3>
            <ul>
                <li><strong>{t('privacy_12')}</strong> {t('privacy_26')} <a href="/politica-de-cookies"><strong>{t('privacy_27')}</strong></a></li>
                <li><strong>{t('privacy_14')}</strong> {t('privacy_28')}</li>
                <li><strong>{t('privacy_16')}</strong> {t('privacy_29')}</li>
            </ul>

            {/* --- Sección 3 --- */}
            <h2>{t('privacy_30')}</h2>
            <p>{t('privacy_31')}</p>
            <ul>
                <li><strong>{t('privacy_32')}</strong> {t('privacy_33')}</li>
                <li><strong>{t('privacy_34')}</strong> {t('privacy_35')}</li>
                <li><strong>{t('privacy_36')}</strong> {t('privacy_37')}</li>
                <li><strong>{t('privacy_38')}</strong> {t('privacy_39')}</li>
            </ul>

            {/* --- Sección 4 --- */}
            <h2>{t('privacy_40')}</h2>
            <p>{t('privacy_41')}</p>
            <ul>
                <li><strong>{t('privacy_42')}</strong> {t('privacy_43')}</li>
                <li><strong>{t('privacy_44')}</strong> {t('privacy_45')}</li>
                <li>{t('privacy_46')}</li>
            </ul>
            <p><strong>{t('privacy_47')}</strong> {t('privacy_48')}</p>

            {/* --- Sección 5 --- */}
            <h2>{t('privacy_49')}</h2>
            <p>{t('privacy_50')}</p>
            <ul>
                <li><strong>{t('privacy_51')}</strong> {t('privacy_52')}</li>
                <li><strong>{t('privacy_53')}</strong> {t('privacy_54')}</li>
                <li><strong>{t('privacy_55')}</strong> {t('privacy_56')}</li>
                <li><strong>{t('privacy_57')}</strong> {t('privacy_58')}</li>
                <li><strong>{t('privacy_59')}</strong> {t('privacy_60')}</li>
                <li><strong>{t('privacy_61')}</strong> {t('privacy_62')}</li>
                <li><strong>{t('privacy_63')}</strong> {t('privacy_64')}</li>
            </ul>
            <p>{t('privacy_65')}</p>
            <p>{t('privacy_66')} <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">{t('privacy_67')}</a>.</p>

            {/* --- Sección 6 --- */}
            <h2>{t('privacy_68')}</h2>
            <p>{t('privacy_69')}</p>

            {/* --- Sección 7 --- */}
            <h2>{t('privacy_70')}</h2>
            <p>{t('privacy_71')}</p>

            <p><strong>The Women's Ground</strong></p>
        </div>
    );
};