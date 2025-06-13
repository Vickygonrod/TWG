// src/front/components/Footer.jsx
import React from "react"; // Necesario para usar JSX y hooks
import { Link } from "react-router-dom"; // Importa Link para los enlaces internos
import { useTranslation } from 'react-i18next'; // Importa useTranslation para las traducciones
import "../styles/footer.css"

export const Footer = () => {
	const { t } = useTranslation(); // Inicializa el hook de traducción

	return (
		<footer className="footer bg-white mt-auto py-3 text-center">
			<p className="text">
				© 2025 The Women's Ground - {" "}
				{/* Enlace a la política de privacidad usando la traducción */}
				<Link to="/privacy" className="footer-link text">
					{t('footer_privacy_policy')} -
				</Link>
				<Link to="/contact" className="text" >
					{t('navbar_contact')}
				</Link>
			</p>
		</footer>
	);
};