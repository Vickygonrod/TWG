// src/components/LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

// Asegúrate de que estas rutas sean correctas según donde tengas tus imágenes
import banderaEsp from '../images/bandera-esp.png'; // Reemplaza con la ruta real de tu imagen de bandera española
import banderaIng from '../images/bandera-ing.png'; // Reemplaza con la ruta real de tu imagen de bandera inglesa

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2 p-2"> {/* Flex para alinear y espacio entre ellas */}
      {/* Bandera Española */}
      <a href="#"
         onClick={() => changeLanguage('es')}
         className="inline-block rounded-full overflow-hidden shadow-md transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
         title="Cambiar a Español"
      >
        <img src={banderaEsp} alt="Bandera de España" className="w-8 h-8 object-cover rounded-full" /> {/* Tamaño de la imagen y estilo redondo */}
      </a>

      {/* Bandera Inglesa */}
      <a href="#"
         onClick={() => changeLanguage('en')}
         className="inline-block rounded-full overflow-hidden shadow-md transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
         title="Cambiar a Inglés"
      >
        <img src={banderaIng} alt="Bandera de Reino Unido" className="w-8 h-8 object-cover rounded-full" /> {/* Tamaño de la imagen y estilo redondo */}
      </a>
    </div>
  );
};

export default LanguageSwitcher;