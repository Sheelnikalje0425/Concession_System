export const routes = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',

  // Student routes
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    APPLICATIONS: '/student/applications',
    PROFILE: '/student/profile'
  },

  // Staff routes
  STAFF: {
    DASHBOARD: '/staff/dashboard',
    APPLICATIONS: '/staff/applications',
    STUDENTS: '/staff/students',
    REPORTS: '/staff/reports'
  },

  // API routes
  API: {
    BASE: '/api',
    AUTH: '/api/auth',
    APPLICATIONS: '/api/applications',
    STUDENTS: '/api/students',
    STAFF: '/api/staff',
    REPORTS: '/api/reports'
  }
};