import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/landingStyle.css"; // Estilos de tu landing page
import eventoplaya from '../images/eventoplaya.jpeg';
import { UpcomingEvents } from "../components/UpcomingEvents";


export const EventsHub = () => {

    
    return (
        <>
        <>{UpcomingEvents}</>
        
        </>
    );
};