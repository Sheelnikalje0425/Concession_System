import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const ApplicationForm = ({ onSuccess, editData }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    routeFrom: '',
    routeTo: '',
    category: '',
    previousCertificateNo: ''
  });

  // 🔹 NEW: caste certificate file state
  const [casteCertificate, setCasteCertificate] = useState(null);

  // 🔹 NEW: Aadhaar card file state
  const [aadharCard, setAadharCard] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        routeFrom: editData.routeFrom || '',
        routeTo: editData.routeTo || '',
        category: editData.category || '',
        previousCertificateNo: editData.previousCertificateNo || ''
      });
    }
  }, [editData]);

  // 🔹 Helper: SC / ST check
  const isCasteCertRequired =
    formData.category === 'SC' || formData.category === 'ST';

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // 🔹 If category changes to non SC/ST → clear file
    if (name === 'category' && value !== 'SC' && value !== 'ST') {
      setCasteCertificate(null);
    }
  };

  // 🔹 NEW: file change handler
  const handleFileChange = (e) => {
    setCasteCertificate(e.target.files[0]);
  };

  // 🔹 NEW: Aadhaar file handler
  const handleAadharChange = (e) => {
    setAadharCard(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // 🔹 Frontend validation
    if (isCasteCertRequired && !casteCertificate) {
      setError('Caste certificate is mandatory for SC/ST students.');
      setLoading(false);
      return;
    }

    if (!aadharCard) {
      setError('Aadhaar card is required for address verification.');
      setLoading(false);
      return;
    }

    try {
      // 🔹 IMPORTANT: use FormData instead of JSON
      const data = new FormData();

      data.append('studentId', user.id);
      data.append('studentName', user.name);
      data.append('studentDob', user.dob);

      data.append('routeFrom', formData.routeFrom);
      data.append('routeTo', formData.routeTo);
      data.append('category', formData.category);
      data.append('previousCertificateNo', formData.previousCertificateNo);

      if (isCasteCertRequired) {
        data.append('casteCertificate', casteCertificate);
      }

      // 🔹 NEW: Aadhaar card
      data.append('aadharCard', aadharCard);

      const response = await applicationService.createApplication(data);

      setSuccess('Application submitted successfully!');
      setFormData({
        routeFrom: '',
        routeTo: '',
        category: '',
        previousCertificateNo: ''
      });
      setCasteCertificate(null);
      setAadharCard(null);

      if (onSuccess) {
        onSuccess(response);
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
          {editData ? 'Edit Application' : 'New Concession Application'}
        </h2>

        {error && <ErrorMessage message={error} className="mb-4" />}
        {success && <SuccessMessage message={success} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="text"
                value={user?.dob ? new Date(user.dob).toLocaleDateString() : ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
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

          {/* 🔹 NEW: Caste Certificate Upload */}
          {isCasteCertRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Caste Certificate (SC / ST only) *
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Allowed formats: JPG, JPEG, PNG
              </p>
            </div>
          )}

          {/* 🔹 NEW: Aadhaar Card Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Aadhaar Card (Address Proof) *
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              onChange={handleAadharChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Allowed formats: JPG, JPEG, PNG, PDF
            </p>
          </div>

          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From (Station) *
              </label>
              <input
                type="text"
                name="routeFrom"
                value={formData.routeFrom}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To (Station) *
              </label>
              <input
                type="text"
                name="routeTo"
                value={formData.routeTo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Previous Certificate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Previous Certificate Number (if any)
            </label>
            <input
              type="text"
              name="previousCertificateNo"
              value={formData.previousCertificateNo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner size="sm" text="Submitting..." />
            ) : (
              editData ? 'Update Application' : 'Submit Application'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;