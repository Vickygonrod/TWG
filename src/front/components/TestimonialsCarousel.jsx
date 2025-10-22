import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/testimonials.css';

export const TestimonialsCarousel = () => {
  const { t } = useTranslation();
  const testimonialsRef = useRef(null);
  const [expandedTestimonials, setExpandedTestimonials] = useState({});
  const [showReadMore, setShowReadMore] = useState({});
  const testimonialRefs = useRef([]);

  useEffect(() => {
    const newShowReadMore = {};
    testimonialRefs.current.forEach((ref, index) => {
      if (ref && ref.scrollHeight > ref.clientHeight) {
        newShowReadMore[index] = true;
      }
    });
    setShowReadMore(newShowReadMore);
  }, []);

  const toggleReadMore = (index) => {
    setExpandedTestimonials(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const scrollTestimonials = (direction) => {
    if (testimonialsRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      testimonialsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const testimonials = [
    { title: 'testimonial_event_1_title', p1: 'testimonial_event_1_p1', p2: 'testimonial_event_1_p2', p3: 'testimonial_event_1_p3', p4: 'testimonial_event_1_p4' },
    { title: 'testimonial_event_2_title', p1: 'testimonial_event_2_p1', p2: 'testimonial_event_2_p2', p3: 'testimonial_event_2_p3', p4: 'testimonial_event_2_p4' },
    { title: 'testimonial_event_3_title', p1: 'testimonial_event_3_p1', p2: 'testimonial_event_3_p2', p3: 'testimonial_event_3_p3', p4: 'testimonial_event_3_p4' },
    { title: 'testimonial_event_4_title', p1: 'testimonial_event_4_p1', p2: 'testimonial_event_4_p2', p3: 'testimonial_event_4_p3', p4: 'testimonial_event_4_p4' },
    { title: 'testimonial_event_5_title', p1: 'testimonial_event_5_p1', p2: 'testimonial_event_5_p2', p3: 'testimonial_event_5_p3', p4: 'testimonial_event_5_p4' },
  ];

  return (
    <section className="testimonial-section landing-section">
      <h3>{t('testimonial_event_title')}</h3>
      <div className="testimonial-carousel-wrapper">
        <button className="carousel-arrow left" onClick={() => scrollTestimonials('left')}>&#9664;</button>
        <div className="testimonial-container" ref={testimonialsRef}>
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-item" key={index}>
              <h5>{t(testimonial.title)}</h5>
              <div
                className="testimonial-text-content"
                ref={el => testimonialRefs.current[index] = el}
                style={{ height: expandedTestimonials[index] ? 'auto' : '500px' }} // Altura fija
              >
                <p>
                  <br />
                  {t(testimonial.p1)}
                  <br /><br />{t(testimonial.p2)}
                  <br /><br />{t(testimonial.p3)}
                  <br /><br /> {t(testimonial.p4)}
                </p>
              </div>
              {showReadMore[index] && (
                <button
                  className="read-more-btn"
                  onClick={() => toggleReadMore(index)}
                >
                  {expandedTestimonials[index] ? 'Leer menos' : 'Leer más'}
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="carousel-arrow right" onClick={() => scrollTestimonials('right')}>&#9654;</button>
      </div>
    </section>
  );
};