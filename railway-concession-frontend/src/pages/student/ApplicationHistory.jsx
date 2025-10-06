import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ApplicationForm from '../../components/forms/ApplicationForm';

const ApplicationHistory = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getApplicationsByStudentId(user.id);
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const handleNewApplication = () => {
    setSelectedApplication(null);
    setIsModalOpen(true);
  };

  const handleEditApplication = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    setIsModalOpen(false);
    fetchApplications(); // Refresh the list
  };

  const canEditApplication = (application) => {
    return application.status === 'PENDING';
  };

  if (loading) return <LoadingSpinner text="Loading applications..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <Button onClick={handleNewApplication} className="bg-blue-600 hover:bg-blue-700">
          + New Application
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.appId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{application.appId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.routeFrom} → {application.routeTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.currentCertificateNo || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditApplication(application)}
                      disabled={!canEditApplication(application)}
                      title={canEditApplication(application) ? 'Edit application' : 'Cannot edit approved/rejected applications'}
                    >
                      ✏️ Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first concession application</p>
            <Button onClick={handleNewApplication} className="bg-blue-600 hover:bg-blue-700">
              Create First Application
            </Button>
          </div>
        )}
      </Card>

      {/* Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedApplication ? 'Edit Application' : 'New Application'}
        size="lg"
      >
        <ApplicationForm
          editData={selectedApplication}
          onSuccess={handleApplicationSuccess}
        />
      </Modal>
    </div>
  );
};

export default ApplicationHistory;