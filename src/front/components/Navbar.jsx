import { Link } from "react-router-dom";
import "../styles/navbar.css"
import logo from "../images/logo.png"

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container-fluid">
				<Link to= "/community">
				<img src={logo} alt="logo de The Women's Ground" className="navbar-logo"/>
				</Link>
				<Link to="/ebook">
					<span className="text px-4 mb-0">Shop</span>
				</Link>
				
			</div>
		</nav>
	);
};