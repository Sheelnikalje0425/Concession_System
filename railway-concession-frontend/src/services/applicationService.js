import api from './api';

export const applicationService = {
  // Get all applications
  getAllApplications: async () => {
    try {
      const response = await api.get('/applications/staff/applications',{withCredentials: true});
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch applications');
    }
  },

  // Get application by ID
  getApplicationById: async (id) => {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch application');
    }
  },

  // Get application with student data
  getApplicationWithStudent: async (id) => {
    try {
      const response = await api.get(`/applications/${id}/with-student`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch application with student');
    }
  },

  // Create new application
  // Create new application (UPDATED for file upload)
createApplication: async (applicationData) => {
  try {
    const response = await api.post(
      '/applications',
      applicationData,
      {
        headers: {
          // IMPORTANT: multipart support
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Failed to create application'
    );
  }
},


  // Get caste certificate// Get caste certificate path (STAFF)
getCasteCertificate: async (applicationId) => {
  try {
    const response = await api.get(
      `/applications/${applicationId}/caste-certificate`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Failed to fetch caste certificate'
    );
  }
},



  // Update application status
   updateApplicationStatus: async (id, status) => {
    try {
      const response = await api.put(`/applications/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update application status');
    }
  },

  // Assign certificate number
  assignCertificateNumber: async (id, certificateNo) => {
    try {
      const response = await api.put(`/applications/${id}/certificate`, { certificateNo });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to assign certificate number');
    }
  },
  // Get applications by student ID
  getApplicationsByStudentId: async (studentId) => {
    try {
      const response = await api.get(`/applications/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch student applications');
    }
  },

  // Get applications by status
  getApplicationsByStatus: async (status) => {
    try {
      const response = await api.get(`/applications/status/${status}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch applications by status');
    }
  },

  // Get application statistics
  getApplicationStats: async () => {
    try {
      const response = await api.get('/applications/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch application statistics');
    }
  }
};

export default applicationService;