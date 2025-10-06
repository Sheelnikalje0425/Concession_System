import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import studentService from '../../services/studentService';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getStudentById(user.id);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      setUpdating(true);
      setError('');
      const response = await studentService.updateStudent(user.id, updatedData);
      setProfile(response);
      setSuccess('Profile updated successfully!');
      setIsEditModalOpen(false);
      
      // Update auth context with new data
      login(response, 'student');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <Button onClick={() => setIsEditModalOpen(true)}>
          ✏️ Edit Profile
        </Button>
      </div>

      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card title="Personal Information" className="h-fit">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-medium text-gray-900">{profile?.id}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{profile?.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium text-gray-900">{profile?.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium text-gray-900">{formatDate(profile?.dob)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium text-gray-900">{profile?.category || 'Not specified'}</p>
            </div>
          </div>
        </Card>

        {/* Quick Statistics */}
        <Card title="Application Statistics" className="h-fit">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{profile?.applications?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">
                  {profile?.applications?.filter(app => app.status === 'APPROVED').length || 0}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {profile?.applications?.filter(app => app.status === 'PENDING').length || 0}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">
                  {profile?.applications?.filter(app => app.status === 'REJECTED').length || 0}
                </p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Applications Preview */}
      {profile?.applications && profile.applications.length > 0 && (
        <Card title="Recent Applications">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profile.applications.slice(0, 5).map((app) => (
                  <tr key={app.appId}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">#{app.appId}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{app.routeFrom} → {app.routeTo}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {profile.applications.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => window.location.href = '/student/applications'}>
                View All Applications
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="md"
      >
        <EditProfileForm
          profile={profile}
          onUpdate={handleUpdateProfile}
          onCancel={() => setIsEditModalOpen(false)}
          loading={updating}
        />
      </Modal>
    </div>
  );
};

// Edit Profile Form Component
const EditProfileForm = ({ profile, onUpdate, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    category: profile?.category || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const categories = ['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex space-x-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </form>
  );
};

export default ProfilePage;