import React, { useState, useEffect } from 'react';
import applicationService from '../../services/applicationService';
import ApplicationsManagement from '../../components/staff/ApplicationsManagement';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ApplicationsPage = () => {
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getApplicationStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getFilterButtonClass = (filterName) => {
    return filter === filterName
      ? 'bg-blue-600 text-white'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  };

  if (loading) return <LoadingSpinner text="Loading applications..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications Management</h1>
          <p className="text-gray-600">Manage and review all concession applications</p>
        </div>
        <Button onClick={fetchStats} variant="outline" className="mt-4 sm:mt-0">
          ↻ Refresh Stats
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-2xl font-bold">{stats.total || 0}</div>
          <div className="text-sm">Total Applications</div>
        </Card>
        
        <Card className="text-center p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="text-2xl font-bold">{stats.pending || 0}</div>
          <div className="text-sm">Pending</div>
        </Card>
        
        <Card className="text-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-2xl font-bold">{stats.approved || 0}</div>
          <div className="text-sm">Approved</div>
        </Card>
        
        <Card className="text-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="text-2xl font-bold">{stats.rejected || 0}</div>
          <div className="text-sm">Rejected</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${getFilterButtonClass('all')}`}
            >
              All Applications
            </button>
            <button
              onClick={() => handleFilterChange('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${getFilterButtonClass('pending')}`}
            >
              Pending
            </button>
            <button
              onClick={() => handleFilterChange('approved')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${getFilterButtonClass('approved')}`}
            >
              Approved
            </button>
            <button
              onClick={() => handleFilterChange('rejected')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${getFilterButtonClass('rejected')}`}
            >
              Rejected
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Applications Management Component */}
      <ApplicationsManagement />

      {/* Quick Actions Footer */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Quick Export</h3>
            <p className="text-sm text-gray-600">Download application data for reporting</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => window.open('/api/reports/applications/csv', '_blank')}>
              📄 Export CSV
            </Button>
            <Button variant="outline">
              📊 Generate Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApplicationsPage;
