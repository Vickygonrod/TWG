import { Link } from "react-router-dom";
import "../styles/navbar.css"
import logo from "../images/logo.png"
import { useTranslation } from 'react-i18next'; // Importa el hook de traducción
import LanguageSwitcher from "./LanguageSwitcher.jsx";



export const Navbar = () => {
	const { t, i18n } = useTranslation();
	const changeLanguage = (lng) => {
		startTransition(() => {
			i18n.changeLanguage(lng);
		});
	};

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="row">
				<div className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-sm-6">
				<Link to= "/community">
				<img src={logo} alt="logo de The Women's Ground" className="navbar-logo"/>
				</Link>
			</div>
				<div className="rightcontainer col-xl-9 col-lg-9 col-md-9 col-sm-6 col-sm-6">
				<Link to="/ebook">
					<span className="text px-4 mb-0">{t('navbar')}</span>
				</Link>
				<Link to="/contact">
					<span className="text px-4 mb-0">{t('navbar_contact')}</span>
				</Link>
				<div className="languageSwitcher">
				<LanguageSwitcher />
				</div>
				</div>
			</div>
		</nav>
	);
};