// Production Environment Configuration
// CRITICAL: NEVER expose real API keys in frontend code
// Consider using a backend middleware to proxy API requests
export const environment = {
  production: true,

  // WordPress Base URL
  apiUrl: 'https://reblives.com/wp-json',

  // WooCommerce API Configuration
  // SECURITY WARNING: These keys grant full access to your WooCommerce store
  // They should be stored securely on a backend server, not in frontend code
  woocommerce: {
    url: 'https://reblives.com/wp-json/wc/v3',
    // PLACEHOLDER - DO NOT use real keys here
    consumerKey: 'ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    // PLACEHOLDER - DO NOT use real keys here
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
  payment: {
    mercadopago: {
      // Public key only - safe to expose
      publicKey: 'APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    },
    transbank: {
      // Transbank integration handled securely by WordPress plugin
      enabled: true
    }
  }
};
