import React, { useState, useEffect, useCallback } from 'react';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Card from '../ui/Card';

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [certificateNo, setCertificateNo] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const filterApplications = useCallback(() => {
    let filtered = applications;
    
    switch (filter) {
      case 'pending':
        filtered = applications.filter(app => app.status === 'PENDING');
        break;
      case 'approved':
        filtered = applications.filter(app => app.status === 'APPROVED');
        break;
      case 'rejected':
        filtered = applications.filter(app => app.status === 'REJECTED');
        break;
      case 'all':
      default:
        filtered = applications;
        break;
    }
    
    setFilteredApplications(filtered);
  }, [applications, filter]);

  useEffect(() => {
    filterApplications();
  }, [filterApplications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getAllApplications();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status, certificateNumber = null) => {
    try {
      // Update application status
      await applicationService.updateApplicationStatus(applicationId, status);
      
      // If approving and certificate number provided, assign it
      if (status === 'APPROVED' && certificateNumber) {
        await applicationService.assignCertificateNumber(applicationId, certificateNumber);
      }
      
      setSuccess('Application updated successfully!');
      fetchApplications(); // Refresh the list
      setIsDetailModalOpen(false);
      setIsActionModalOpen(false);
      setCertificateNo('');
      setRejectionReason('');
    } catch (err) {
      setError(err.message);
    }
  };

  const openApplicationDetails = (application) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const openActionModal = (application, type) => {
    setSelectedApplication(application);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };

    return (
      <span 
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getFilterButtonClass = (filterName) => {
    return filter === filterName
      ? 'bg-blue-600 text-white'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  };

  // 🔹 View caste certificate (SC / ST only)
  const handleViewCasteCertificate = async (application) => {
    try {
      if (!application.casteCertificate) {
        alert('Caste certificate not uploaded');
        return;
      }

      const fileUrl = `http://localhost:8181/${application.casteCertificate}`;
      window.open(fileUrl, '_blank');

    } catch (err) {
      alert(err.message || 'Unable to open caste certificate');
    }
  };

  // 🔹 View Aadhaar card
  const handleViewAadharCard = (application) => {
    try {
      if (!application.aadharCard) {
        alert('Aadhaar card not uploaded');
        return;
      }

      const fileUrl = `http://localhost:8181/${application.aadharCard}`;
      window.open(fileUrl, '_blank');

    } catch {
      alert('Unable to open Aadhaar card');
    }
  };

  if (loading) return <LoadingSpinner text="Loading applications..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Applications Management</h2>
        <Button onClick={fetchApplications} variant="outline">
          Refresh
        </Button>
      </div>

      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* Filter Buttons */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getFilterButtonClass('all')}`}
          >
            All Applications ({applications.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getFilterButtonClass('pending')}`}
          >
            Pending ({applications.filter(app => app.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getFilterButtonClass('approved')}`}
          >
            Approved ({applications.filter(app => app.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${getFilterButtonClass('rejected')}`}
          >
            Rejected ({applications.filter(app => app.status === 'REJECTED').length})
          </button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.appId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{application.appId}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer hover:underline"
                    onClick={() => openApplicationDetails(application)}
                  >
                    {application.studentName || 'N/A'}
                    <br />
                    <span className="text-xs text-gray-500">{application.student?.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.routeFrom} – {application.routeTo}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      onClick={() => openActionModal(application, 'APPROVED')}
                      disabled={application.status === 'APPROVED'}
                    >
                      ✅ Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openActionModal(application, 'REJECTED')}
                      disabled={application.status === 'REJECTED'}
                    >
                      ❌ Reject
                    </Button>
                    {(application.category === 'SC' || application.category === 'ST') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCasteCertificate(application)}
                      >
                        📄 View Certificate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewAadharCard(application)}
                    >
                      🆔 View Aadhaar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No {filter !== 'all' ? filter : ''} applications found.
          </div>
        )}
      </Card>

      {/* Application Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Application Details - #${selectedApplication?.appId}`}
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <p className="text-sm text-gray-900">{selectedApplication.studentName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <p className="text-sm text-gray-900">{selectedApplication.student?.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedApplication.studentDob).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-sm text-gray-900">{selectedApplication.category}</p>
              </div>
            </div>

            {/* 🔹 FIXED: Added Aadhaar Card viewing option */}
            {selectedApplication.aadharCard && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Card
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewAadharCard(selectedApplication)}
                >
                  🆔 View Uploaded Aadhaar Card
                </Button>
              </div>
            )}

            {(selectedApplication.category === 'SC' || selectedApplication.category === 'ST') &&
              selectedApplication.casteCertificate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caste Certificate
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewCasteCertificate(selectedApplication)}
                  >
                    📄 View Uploaded Caste Certificate
                  </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Station</label>
                <p className="text-sm text-gray-900">{selectedApplication.routeFrom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Station</label>
                <p className="text-sm text-gray-900">{selectedApplication.routeTo}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedApplication.applicationDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="text-sm">{getStatusBadge(selectedApplication.status)}</div>
              </div>
            </div>

            {selectedApplication.currentCertificateNo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                <p className="text-sm text-gray-900">{selectedApplication.currentCertificateNo}</p>
              </div>
            )}

            <div className="flex space-x-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              {selectedApplication.status === 'PENDING' && (
                <>
                  <Button onClick={() => openActionModal(selectedApplication, 'APPROVED')}>
                    Approve Application
                  </Button>
                  <Button variant="danger" onClick={() => openActionModal(selectedApplication, 'REJECTED')}>
                    Reject Application
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setCertificateNo('');
          setRejectionReason('');
        }}
        title={
          actionType === 'APPROVED' ? 'Approve Application' : 'Reject Application'
        }
      >
        {selectedApplication && (
          <div className="space-y-4">
            <p className="text-gray-600">
              {actionType === 'APPROVED' 
                ? `Approve application #${selectedApplication.appId} for ${selectedApplication.studentName}?`
                : `Reject application #${selectedApplication.appId} for ${selectedApplication.studentName}?`
              }
            </p>

            {actionType === 'APPROVED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Number *
                </label>
                <input
                  type="text"
                  value={certificateNo}
                  onChange={(e) => setCertificateNo(e.target.value)}
                  placeholder="Enter certificate number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {actionType === 'REJECTED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex space-x-3 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsActionModalOpen(false);
                  setCertificateNo('');
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'APPROVED' ? 'success' : 'danger'}
                onClick={() => handleStatusUpdate(
                  selectedApplication.appId, 
                  actionType,
                  actionType === 'APPROVED' ? certificateNo : null
                )}
                disabled={
                  (actionType === 'APPROVED' && !certificateNo.trim()) ||
                  (actionType === 'REJECTED' && !rejectionReason.trim())
                }
              >
                Confirm {actionType === 'APPROVED' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsManagement;