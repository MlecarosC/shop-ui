// Development Environment Configuration
// IMPORTANT: DO NOT commit real API keys to version control
export const environment = {
  production: false,

  // WordPress Base URL
  apiUrl: 'https://reblives.com/wp-json',

  // WooCommerce API Configuration
  // WARNING: Consumer keys should NEVER be exposed in frontend code
  // These are placeholders - real keys should be provided by a backend middleware
  woocommerce: {
    url: 'https://reblives.com/wp-json/wc/v3',
    // PLACEHOLDER - Replace with your actual consumer key from WooCommerce > Settings > Advanced > REST API
    consumerKey: 'ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    // PLACEHOLDER - Replace with your actual consumer secret from WooCommerce > Settings > Advanced > REST API
    consumerSecret: 'cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  },

  // CoCart API for Cart Management
  cocart: {
    url: 'https://reblives.com/wp-json/cocart/v2'
  },

  // JWT Authentication
  jwt: {
    url: 'https://reblives.com/wp-json/jwt-auth/v1'
  },

  // Contact Form 7
  contactForm: {
    url: 'https://reblives.com/wp-json/contact-form-7/v1',
    formId: 3589
  },

  // Password Reset Plugin (BetterDPWR)
  passwordReset: {
    url: 'https://reblives.com/wp-json/bdpwr/v1'
  },

  // Custom Endpoints (Secure Order Creation)
  custom: {
    url: 'https://reblives.com/wp-json/custom/v1'
  },

  // Payment Gateways
  // Note: These are configured in WordPress plugins
  // Frontend only receives payment URLs from backend
  payment: {
    mercadopago: {
      // Public key only - never include private key
      publicKey: 'APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    },
    transbank: {
      // Transbank integration handled by WordPress plugin
      enabled: true
    }
  }
};
