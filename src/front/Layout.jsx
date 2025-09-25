import { Outlet, useLocation } from "react-router-dom/dist"
import ScrollToTop from "./components/ScrollToTop"
import { Navbar } from "./components/Navbar"
import { Footer } from "./components/Footer"
import { CookieConsentBanner } from "./components/CookieConsentBanner"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    const location = useLocation();


    return (
        <ScrollToTop>
            <Navbar />
            <Outlet />
            <Footer />
            <CookieConsentBanner />
        </ScrollToTop>
    )
}