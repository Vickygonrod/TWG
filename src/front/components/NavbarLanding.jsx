import { Link } from "react-router-dom";
import "../styles/navbar.css"
import logo from "../images/logo.png"
import LanguageSwitcher from "./LanguageSwitcher";

export const NavbarLanding = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="row">
				<div className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-sm-6">
					<Link to= "/community">
					<img src={logo} alt="logo de The Women's Ground" className="navbar-logo"/>
					</Link>
				</div>
				<div className="rightcontainer col-xl-9 col-lg-9 col-md-9 col-sm-6 col-sm-6">
				<div className="languageSwitcher">
				<LanguageSwitcher />
				</div>
				</div>
			</div>
		</nav>
	);
};