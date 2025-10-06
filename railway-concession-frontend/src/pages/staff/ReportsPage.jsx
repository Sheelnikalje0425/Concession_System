import React, { useState, useEffect } from 'react';
import applicationService from '../../services/applicationService';
import studentService from '../../services/studentService';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ReportsPage = () => {
  const [stats, setStats] = useState({});
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportType, setReportType] = useState('applications');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [appsData, statsData, studentsData] = await Promise.all([
        applicationService.getAllApplications(),
        applicationService.getApplicationStats(),
        studentService.getAllStudents()
      ]);

      setApplications(appsData);
      setStats(statsData);
      setStudents(studentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (type) => {
    try {
      let url;
      switch (type) {
        case 'applications-csv':
          url = '/api/reports/applications/csv';
          break;
        default:
          return;
      }
      
      window.open(url, '_blank');
      setSuccess('Report generated successfully!');
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
    }
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const getStatusDistribution = () => {
    return {
      pending: stats.pending || 0,
      approved: stats.approved || 0,
      rejected: stats.rejected || 0
    };
  };

  const getCategoryDistribution = () => {
    const categories = {};
    students.forEach(student => {
      const category = student.category || 'UNKNOWN';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  };

  const getMonthlyApplications = () => {
    const monthlyData = {};
    applications.forEach(app => {
      const month = new Date(app.applicationDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return monthlyData;
  };

  if (loading) return <LoadingSpinner text="Loading reports..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate reports and view system analytics</p>
        </div>
        <Button onClick={fetchReportData} variant="outline" className="mt-4 sm:mt-0">
          ↻ Refresh Data
        </Button>
      </div>

      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-2xl font-bold">{stats.total || 0}</div>
          <div className="text-sm">Total Applications</div>
        </Card>
        
        <Card className="text-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-2xl font-bold">{stats.approved || 0}</div>
          <div className="text-sm">Approved</div>
        </Card>
        
        <Card className="text-center p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="text-2xl font-bold">{stats.pending || 0}</div>
          <div className="text-sm">Pending</div>
        </Card>
        
        <Card className="text-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="text-2xl font-bold">{stats.rejected || 0}</div>
          <div className="text-sm">Rejected</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generator */}
        <Card title="Generate Reports" className="h-fit">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="applications">Applications Report</option>
                <option value="students">Students Report</option>
                <option value="status">Status Report</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateRangeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateRangeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => handleGenerateReport('applications-csv')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                📄 Export Applications CSV
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                disabled
                title="Coming soon"
              >
                📊 Generate Detailed Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card title="Application Status Distribution" className="h-fit">
          <div className="space-y-3">
            {Object.entries(getStatusDistribution()).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <span className="text-xs text-gray-400">
                    ({Math.round((count / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card title="Student Category Distribution">
          <div className="space-y-3">
            {Object.entries(getCategoryDistribution()).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <span className="text-xs text-gray-400">
                    ({Math.round((count / students.length) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Trends */}
        <Card title="Monthly Application Trends">
          <div className="space-y-3">
            {Object.entries(getMonthlyApplications()).map(([month, count]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month}</span>
                <span className="text-sm text-gray-600">{count} applications</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card title="Quick Insights">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {students.filter(s => s.applications && s.applications.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Active Applicants</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((stats.approved / stats.total) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Approval Rate</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {applications.filter(app => app.currentCertificateNo).length}
            </div>
            <div className="text-sm text-gray-600">Certificates Issued</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;