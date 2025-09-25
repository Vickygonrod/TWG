module.exports = {
  plugins: {
    'postcss-purgecss': {
      content: ['./**/*.jsx', './**/*.html'],
      safelist: [
        'events-grid',
        'event-card',
        'event-card-image'
      ],
    },
  },
};
