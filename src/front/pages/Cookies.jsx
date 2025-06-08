import React from "react";
import { useTranslation } from 'react-i18next'; // Importa el hook de traducción

export const Cookies = () => {
   const { t } = useTranslation();


    return (
        <>
        <div className="bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto px-5 py-5 shadow-lg rounded-lg p-6 sm:p-8 lg:p-10">
        {/* Título principal */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4 rounded-md">
          {t('cookies_main_title')}</h1>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-8">
            {t('last_update_cookies')}
        </p>

        <p className="mb-6 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_1')}
          <a href="[Tu URL de la Landing Page]" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer"> www.thewomensground.com</a>. {t('cookies_translation_2')}
        </p>

        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          {t('cookies_translation_3')}
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed"> {t('cookies_translation_4')}
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">{t('cookies_translation_5')}</strong> {t('cookies_translation_6')}</li>
          <li><strong className="font-medium"> {t('cookies_translation_7')}</strong> {t('cookies_translation_8')}</li>
          <li><strong className="font-medium">{t('cookies_translation_9')}</strong> {t('cookies_translation_10')}</li>
          <li><strong className="font-medium">{t('cookies_translation_11')}</strong> {t('cookies_translation_12')}</li>
        </ul>

        {/* Sección: ¿Cómo y Por Qué Utilizamos las Cookies? */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          {t('cookies_translation_13')}
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_14')}
        </p>

        {/* Subsección: Cookies Necesarias o Técnicas */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          {t('cookies_translation_15')}
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">{t('cookies_translation_16')}</strong> {t('cookies_translation_17')}</li>
          <li><strong className="font-medium">{t('cookies_translation_18')}</strong> {t('cookies_translation_19')}</li>
          <li><strong className="font-medium">{t('cookies_translation_20')}</strong> {t('cookies_translation_21')}</li>
        </ul>

        {/* Subsección: Cookies de Rendimiento o Analíticas */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          {t('cookies_translation_22')}
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">{t('cookies_translation_23')}</strong> {t('cookies_translation_24')}</li>
          <li><strong className="font-medium">{t('cookies_translation_25')}</strong> {t('cookies_translation_26')}</li>
          <li><strong className="font-medium">{t('cookies_translation_27')}</strong> {t('cookies_translation_28')}</li>
          <li><strong className="font-medium">{t('cookies_translation_29')}</strong> {t('cookies_translation_30')}</li>
        </ul>

        {/* Subsección: Cookies de Funcionalidad o Personalización */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          {t('cookies_translation_31')}
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">{t('cookies_translation_32')}</strong> {t('cookies_translation_33')}</li>
          <li><strong className="font-medium">{t('cookies_translation_34')}</strong> {t('cookies_translation_35')}</li>
          <li><strong className="font-medium">{t('cookies_translation_36')}</strong> {t('cookies_translation_37')}</li>
        </ul>

        {/* Subsección: Cookies de Publicidad o Marketing */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          {t('cookies_translation_38')}
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">{t('cookies_translation_39')}</strong> {t('cookies_translation_40')}</li>
          <li><strong className="font-medium">{t('cookies_translation_41')}</strong> {t('cookies_translation_42')}</li>
          <li><strong className="font-medium">{t('cookies_translation_43')}</strong> {t('cookies_translation_44')}</li>
          <li><strong className="font-medium">{t('cookies_translation_45')}</strong> {t('cookies_translation_46')}</li>
        </ul>

        {/* Subsección: Cookies de Redes Sociales */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          {t('cookies_translation_47')}
        </h3>
        <ul className="list-disc list-inside space-y-1 mb-4 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">{t('cookies_translation_48')}</strong> {t('cookies_translation_49')}</li>
          <li><strong className="font-medium">{t('cookies_translation_50')}</strong> {t('cookies_translation_51')}</li>
          <li><strong className="font-medium">{t('cookies_translation_52')}</strong> {t('cookies_translation_53')}</li>
          <li><strong className="font-medium">{t('cookies_translation_54')}</strong> {t('cookies_translation_55')}</li>
        </ul>

        {/* Subsección: Cookies de Terceros Específicos */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          {t('cookies_translation_56')}
        </h3>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_57')}
        </p>
        <ul className="list-disc list-inside space-y-1 mb-6 text-sm sm:text-base leading-relaxed pl-4">
          <li><strong className="font-medium">{t('cookies_translation_58')}</strong> {t('cookies_translation_59')}</li>
          <li><strong className="font-medium">{t('cookies_translation_60')}</strong> {t('cookies_translation_61')}</li>
        </ul>

        {/* Sección: ¿Qué Datos Recopilan las Cookies? */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          {t('cookies_translation_62')}
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_63')}
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-sm sm:text-base leading-relaxed pl-4">
          <li>{t('cookies_translation_64')}</li>
          <li>{t('cookies_translation_65')}</li>
          <li>{t('cookies_translation_66')}</li>
          <li>{t('cookies_translation_67')}</li>
          <li>{t('cookies_translation_68')}</li>
        </ul>

        {/* Sección: Tu Consentimiento y Gestión de Cookies */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          {t('cookies_translation_69')}
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_70')} <strong className="font-medium">{t('cookies_translation_71')}</strong> {t('cookies_translation_72')}
        </p>
        <p className="mb-6 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_73')}
        </p>

        {/* Subsección: ¿Cómo puedes gestionar o desactivar las cookies? */}
        <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-3 rounded-md">
          {t('cookies_translation_74')}
        </h3>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_75')}
        </p>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_76')}
        </p>
        <p className="mb-3 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_77')}
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-sm sm:text-base leading-relaxed pl-4">
          <li><a href="https://support.google.com/chrome/answer/95647?hl=es" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer">{t('cookies_translation_78')}</a></li>
          <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-que-los-sitios-web" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer">{t('cookies_translation_79')}</a></li>
          <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63944794-2506-446a-becd-adc5611d713a" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer">{t('cookies_translation_80')}</a></li>
          <li><a href="https://support.apple.com/es-es/HT201265" className="font-medium hover:text-blue-700" target="_blank" rel="noopener noreferrer">{t('cookies_translation_81')}</a></li>
        </ul>

        {/* Sección: Cambios en esta Política de Cookies */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          {t('cookies_translation_82')}
        </h2>
        <p className="mb-6 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_83')}
        </p>

        {/* Sección: Contacto */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 rounded-md">
          {t('cookies_translation_84')}
        </h2>
        <p className="mb-4 text-sm sm:text-base leading-relaxed">
          {t('cookies_translation_85')}
        </p>
        <p className="text-sm sm:text-base font-medium">
          {t('cookies_translation_86')}
        </p>
      </div>
    </div>
        </>
    )
}