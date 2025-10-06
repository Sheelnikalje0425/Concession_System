import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import studentService from '../../services/studentService';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const StaffDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appsData, statsData, studentsData] = await Promise.all([
        applicationService.getAllApplications(),
        applicationService.getApplicationStats(),
        studentService.getAllStudents()
      ]);

      setRecentApplications(appsData.slice(0, 5));
      setStats(statsData);
      setStudentCount(studentsData.length);
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

  const getTodaysApplicationsCount = () => {
    const today = new Date().toDateString();
    return recentApplications.filter(app => 
      new Date(app.applicationDate).toDateString() === today
    ).length;
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Staff Dashboard</h1>
        <p className="text-purple-100">Manage concession applications and student records</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center p-6 bg-white">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total || 0}</div>
          <div className="text-gray-600">Total Applications</div>
        </Card>
        
        <Card className="text-center p-6 bg-white">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending || 0}</div>
          <div className="text-gray-600">Pending Review</div>
        </Card>
        
        <Card className="text-center p-6 bg-white">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.approved || 0}</div>
          <div className="text-gray-600">Approved</div>
        </Card>
        
        <Card className="text-center p-6 bg-white">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.rejected || 0}</div>
          <div className="text-gray-600">Rejected</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card title="Quick Actions" className="h-fit">
          <div className="space-y-4">
            <Link to="/staff/applications">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                📝 Process Applications
              </Button>
            </Link>
            
            <Link to="/staff/students">
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                👥 Manage Students
              </Button>
            </Link>
            
            <Link to="/staff/reports">
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white">
                📊 Generate Reports
              </Button>
            </Link>
          </div>
        </Card>

        {/* System Status */}
        <Card title="System Status" className="h-fit">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Applications Processed Today</span>
              <span className="font-bold text-blue-600">{getTodaysApplicationsCount()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Students</span>
              <span className="font-bold text-green-600">{studentCount}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">System Uptime</span>
              <span className="font-bold text-purple-600">99.9%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card title="Recent Applications" subtitle="Latest concession applications submitted">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentApplications.map((application) => (
                <tr key={application.appId}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">#{application.appId}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {application.student?.name || 'N/A'}
                    <br />
                    <span className="text-xs text-gray-500">{application.student?.id}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {application.routeFrom} → {application.routeTo}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {getStatusBadge(application.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentApplications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No applications found.
          </div>
        )}

        {recentApplications.length > 0 && (
          <div className="mt-4 text-center">
            <Link to="/staff/applications">
              <Button variant="outline">
                View All Applications
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Recent Activity Feed */}
      <Card title="Recent Activity" subtitle="Latest system activities">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">New application submitted</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Application approved</p>
              <p className="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Student profile updated</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StaffDashboard;