import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import authService from '../../services/authService';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentForm = ({ onSuccess, editData, isRegistration = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    dob: '',
    category: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id || '',
        name: editData.name || '',
        email: editData.email || '',
        dob: editData.dob ? new Date(editData.dob).toISOString().split('T')[0] : '',
        category: editData.category || ''
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      
      if (isRegistration) {
        // For registration
        response = await authService.studentRegister(formData);
      } else if (editData) {
        // For updating existing student
        response = await studentService.updateStudent(formData.id, formData);
      }

      setSuccess(isRegistration ? 'Registration successful!' : 'Student updated successfully!');
      
      if (onSuccess) {
        onSuccess(response);
      }

      // Clear form if it's registration
      if (isRegistration) {
        setFormData({
          id: '',
          name: '',
          email: '',
          dob: '',
          category: ''
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isRegistration ? 'Student Registration' : editData ? 'Edit Student' : 'Add New Student'}
        </h2>

        {error && (
          <ErrorMessage message={error} className="mb-4" />
        )}
        {success && (
          <SuccessMessage message={success} className="mb-4" />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID *
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="e.g., TU4F2222016"
              required
              disabled={!!editData} // Disable editing ID for existing students
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner size="sm" text={isRegistration ? 'Registering...' : 'Saving...'} />
            ) : (
              isRegistration ? 'Register' : 'Save Changes'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;