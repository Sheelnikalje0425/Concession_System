import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const appsData = await applicationService.getApplicationsByStudentId(user.id);
      setApplications(appsData);
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

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-blue-100">Track your concession applications and status here.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="New Application" subtitle="Apply for railway concession">
          <p className="text-gray-600 mb-4">Create a new concession application for your travel needs.</p>
          <Link to="/student/applications?new=true">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Apply Now
            </Button>
          </Link>
        </Card>

        <Card title="My Applications" subtitle="View your application status">
          <p className="text-gray-600 mb-4">Check the status of your existing applications.</p>
          <Link to="/student/applications">
            <Button variant="outline" className="w-full">
              View Applications
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card title="Recent Applications" subtitle="Your most recent concession applications">
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.appId}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">#{app.appId}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{app.routeFrom} → {app.routeTo}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{getStatusBadge(app.status)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {app.currentCertificateNo || 'Not assigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first concession application</p>
            <Link to="/student/applications?new=true">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create First Application
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Profile Quick Access */}
      <Card title="Profile" subtitle="Manage your account information">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Keep your profile information up to date.</p>
          </div>
          <Link to="/student/profile">
            <Button variant="outline">
              Edit Profile
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;