import React from 'react';
import { Link } from 'react-router-dom';

export const Cancel = () => {
    return (
        <div className="container mt-5 text-center">
            <h1>Compra Cancelada</h1>
            <p className="lead">Tu pago no se completó.</p>
            <p>Puedes intentarlo de nuevo o explorar otros productos.</p>
            <Link to="/" className="btn btn-primary btn-lg mt-4">Volver al Inicio</Link>
        </div>
    );
};