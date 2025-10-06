export const appConstants = {
  APP_NAME: 'Railway Concession System',
  APP_VERSION: '1.0.0',
  ORGANIZATION: 'Railway Department',
  SUPPORT_EMAIL: 'support@railway-concession.com',
  SUPPORT_PHONE: '+91-XXX-XXX-XXXX',

  // Features flags
  FEATURES: {
    STUDENT_REGISTRATION: true,
    APPLICATION_EDITING: true,
    REPORT_GENERATION: true,
    BULK_ACTIONS: false
  },

  // Configuration
  CONFIG: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_APPLICATIONS_PER_STUDENT: 5
  },

  // Design system
  DESIGN: {
    PRIMARY_COLOR: '#2563eb',
    SECONDARY_COLOR: '#64748b',
    SUCCESS_COLOR: '#16a34a',
    WARNING_COLOR: '#d97706',
    ERROR_COLOR: '#dc2626',
    BREAKPOINTS: {
      MOBILE: 640,
      TABLET: 768,
      DESKTOP: 1024,
      LARGE_DESKTOP: 1280
    }
  }
};