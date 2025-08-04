// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Landing } from "./pages/Landing";
import { Success } from "./pages/Success";
import { Cancel } from "./pages/Cancel";
import { ContactForm } from "./pages/ContactForm";
import { CommunityHome } from "./pages/CommunityHome";
import { Cookies } from "./pages/Cookies.jsx";
import { PrivacyPolicy } from "./components/PrivacyPolicy.jsx";
import { EventRegistration } from "./pages/EventRegistration.jsx";
import { AdminLogin } from "./components/AdminLoging.jsx";
import { LeadMagnetLanding } from "./pages/LeadMagnetLanding.jsx";
import { UpcomingEvents } from "./components/UpcomingEvents.jsx";
import { EventDetails } from "./components/EventDetails.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

    // Root Route: All navigation will start from here.
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="/demo" element={<Demo />} />
      <Route path="/eBook" element={<Landing />} />
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
      <Route path="/community" element={<CommunityHome />} />
      <Route path="/contact" element={<ContactForm />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/eventregistration" element={<EventRegistration />} />
      <Route path="/adminlogin" element={<AdminLogin />} />
      <Route path="/quickguide" element={<LeadMagnetLanding />} />
      <Route path="/upcomingevents" element={<UpcomingEvents />} />
      <Route path="/events/:id" element={<EventDetails />} />
    </Route>
  )
);