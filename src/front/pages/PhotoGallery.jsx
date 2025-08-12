import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PhotoGallery = ({ photos }) => {
  // Estado para controlar la foto seleccionada en la vista modal
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Si no hay fotos, no renderizamos nada
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="photo-gallery-container">
      <div className="photo-grid">
        {photos.map(photo => (
          <div 
            key={photo.id} 
            className="photo-thumbnail"
            onClick={() => setSelectedPhoto(photo.url)}
          >
            <img src={photo.url} alt={`Gallery photo ${photo.id}`} />
          </div>
        ))}
      </div>
      
      {/* Modal para ver la foto en grande */}
      {selectedPhoto && (
        <div className="photo-modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal-content">
            <img src={selectedPhoto} alt="Full size gallery photo" />
          </div>
        </div>
      )}
    </div>
  );
};

PhotoGallery.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default PhotoGallery;