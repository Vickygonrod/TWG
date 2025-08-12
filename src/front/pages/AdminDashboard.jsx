import React from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const AdminDashboard = () => {
    const navigate = useNavigate();

    // Puedes añadir aquí una función para cerrar sesión si lo deseas
    const handleLogout = () => {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user_data');
        navigate('/admin-login'); // Redirige al login después de cerrar sesión
    };

    return (
        <div className="admin-dashboard-container">
            <header className="dashboard-header">
                <h1>Bienvenido al Panel de Administración</h1>
                <button 
                    onClick={handleLogout} 
                    className="logout-button"
                >
                    Cerrar Sesión
                </button>
            </header>
            <main className="dashboard-main">
                <p>
                    Desde aquí puedes gestionar todas las funciones de tu sitio web.
                </p>
                <div className="dashboard-links">
                    {/* Este es el enlace clave para acceder al backend */}
                    <a 
                        href={`${BACKEND_BASE_URL}/admin`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="backend-link-button"
                    >
                        Ir al Panel de Flask-Admin
                    </a>
                </div>
            </main>
        </div>
    );
};