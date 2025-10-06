import api from './api';

export const authService = {
  // Student login with ID and DOB
  studentLogin: async (studentId, dob) => {
    try {
      const response = await api.post('/auth/student/login', {
        studentId,
        dob
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Student login failed');
    }
  },

  // Staff login with email and password
  staffLogin: async (email, password) => {
    try {
      const response = await api.post('/auth/staff/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Staff login failed');
    }
  },

  // Student registration
  studentRegister: async (studentData) => {
    try {
      const response = await api.post('/auth/student/register', studentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Student registration failed');
    }
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get current role from localStorage
  getCurrentRole: () => {
    return localStorage.getItem('role');
  }
};

export default authService;