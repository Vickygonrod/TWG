// src/pages/AdminLogin.jsx (o src/components/AdminLogin.jsx)
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Para redireccionar después del login
import '../styles/adminLoginForm.css'; // Asegúrate de que este CSS exista

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate(); // Hook para la navegación

  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!BACKEND_BASE_URL) {
      setError("Error: La URL del backend no está configurada.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/api/adminlogin`, {
        email,
        password,
      });

      // Si el login es exitoso
      if (response.status === 200) {
        const { access_token, data } = response.data;
        // Guarda el token en localStorage o sessionStorage
        localStorage.setItem('admin_access_token', access_token);
        
        // Guarda los datos del admin si los necesitas en el frontend
        localStorage.setItem('admin_user_data', JSON.stringify(data));
        
        console.log("Admin logueado con éxito:", data);
        
        // --- CAMBIO CLAVE AQUÍ ---
        // Redirige a una ruta interna de tu frontend de React (ej. '/admin-dashboard')
        navigate('/admin-dashboard'); // O la ruta que tengas para el panel de administración en React
      }
    } catch (err) {
      console.error("Error en el login del admin:", err);
      if (err.response) {
        setError(err.response.data.msg || "Error de credenciales. Inténtalo de nuevo.");
      } else if (err.request) {
        setError("Error de red: No se pudo conectar con el servidor.");
      } else {
        setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-lg w-full transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-6">
          Admin Login
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Accede al panel de administración.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};