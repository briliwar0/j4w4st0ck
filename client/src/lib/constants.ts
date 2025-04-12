// Konstanta untuk aplikasi

// Base URL untuk API
export const API_BASE_URL = 
  import.meta.env.PROD 
    ? '/api' 
    : '/api';

// Versi API
export const API_VERSION = 'v1';

// Konfigurasi umum
export const APP_CONFIG = {
  name: 'JawaStock',
  description: 'Premium marketplace for stock photos, videos, and digital assets',
  url: 'https://jawastock.netlify.app',
  social: {
    twitter: 'https://twitter.com/jawastock',
    facebook: 'https://facebook.com/jawastock',
    instagram: 'https://instagram.com/jawastock'
  }
};