import React, { useState } from 'react';
import PropTypes from 'prop-types';

const UploadPhotoForm = ({ eventId, jwtToken }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Por favor, selecciona un archivo.');
      return;
    }

    setLoading(true);


    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/admin/events/${eventId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
       
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Error al subir la foto');
      }

      setMessage('¡Foto subida con éxito!');
      setFile(null); // Limpiamos el estado del archivo después de subirlo
      // Aquí podrías añadir una lógica para actualizar la lista de fotos en el frontend
      // (por ejemplo, llamando a una función pasada por props).

    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Subir Foto al Álbum</h3>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subiendo...' : 'Subir Foto'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

// Validamos las props para asegurar que se pasan los datos correctos
UploadPhotoForm.propTypes = {
  eventId: PropTypes.number.isRequired,
  jwtToken: PropTypes.string.isRequired,
};

export default UploadPhotoForm;