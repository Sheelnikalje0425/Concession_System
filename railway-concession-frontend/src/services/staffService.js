import api from './api';

export const staffService = {
  // Get all staff members
  getAllStaff: async () => {
    try {
      const response = await api.get('/staff');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch staff members');
    }
  },

  // Get staff by ID
  getStaffById: async (id) => {
    try {
      const response = await api.get(`/staff/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch staff member');
    }
  },

  // Create new staff member
  createStaff: async (staffData) => {
    try {
      const response = await api.post('/staff', staffData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create staff member');
    }
  },

  // Update staff member
  updateStaff: async (id, staffData) => {
    try {
      const response = await api.put(`/staff/${id}`, staffData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update staff member');
    }
  },

  // Delete staff member
  deleteStaff: async (id) => {
    try {
      const response = await api.delete(`/staff/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete staff member');
    }
  }
};

export default staffService;