import api from './api';

export const studentService = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await api.get('/students');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch students');
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch student');
    }
  },

  // Get student with applications
  getStudentWithApplications: async (id) => {
    try {
      const response = await api.get(`/students/${id}/with-applications`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch student with applications');
    }
  },

  // Update student profile
  updateStudent: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update student');
    }
  },

  // Delete student
  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete student');
    }
  },

  // Search students by name or email
  searchStudents: async (query) => {
    try {
      const response = await api.get(`/students/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search students');
    }
  }
};

export default studentService;