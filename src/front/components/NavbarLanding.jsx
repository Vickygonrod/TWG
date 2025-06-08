import { Link } from "react-router-dom";
import "../styles/navbar.css"
import logo from "../images/logo.png"

export const NavbarLanding = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container-fluid">
				 <a href="/community" target="_blank" rel="noopener noreferrer">
					<img
						src={logo}
						alt="logo de The Women's Ground"
						className="navbar-logo"
					/>
				</a>
			</div>
		</nav>
	);
};