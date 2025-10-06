export const constants = {
  // Application statuses
  APPLICATION_STATUS: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
  },

  // User roles
  USER_ROLES: {
    STUDENT: 'student',
    STAFF: 'staff',
    ADMIN: 'admin'
  },

  // Student categories
  STUDENT_CATEGORIES: ['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'],

  // API endpoints
  API_ENDPOINTS: {
    AUTH: {
      STUDENT_LOGIN: '/auth/student/login',
      STAFF_LOGIN: '/auth/staff/login',
      STUDENT_REGISTER: '/auth/student/register'
    },
    APPLICATIONS: {
      BASE: '/applications',
      BY_STUDENT: '/applications/student',
      BY_STATUS: '/applications/status',
      STATS: '/applications/stats'
    },
    STUDENTS: {
      BASE: '/students',
      SEARCH: '/students/search'
    },
    STAFF: {
      BASE: '/staff'
    },
    REPORTS: {
      APPLICATIONS_CSV: '/reports/applications/csv'
    }
  },

  // Local storage keys
  STORAGE_KEYS: {
    USER: 'user',
    ROLE: 'role',
    TOKEN: 'token',
    THEME: 'theme'
  },

  // Route paths
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    STUDENT_DASHBOARD: '/student/dashboard',
    STUDENT_APPLICATIONS: '/student/applications',
    STUDENT_PROFILE: '/student/profile',
    STAFF_DASHBOARD: '/staff/dashboard',
    STAFF_APPLICATIONS: '/staff/applications',
    STAFF_STUDENTS: '/staff/students',
    STAFF_REPORTS: '/staff/reports',
    UNAUTHORIZED: '/unauthorized'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZES: [10, 25, 50, 100]
  },

  // Validation messages
  VALIDATION_MESSAGES: {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_STUDENT_ID: 'Please enter a valid student ID',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
    DATE_IN_FUTURE: 'Date cannot be in the future'
  },

  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.'
  }
};