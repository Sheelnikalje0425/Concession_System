import React, { useState, useEffect } from 'react';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ReportsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [certificateRange, setCertificateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const appsData = await applicationService.getAllApplications();
      setApplications(appsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      let url;
      let queryParams = '';
      
      // Add certificate range filter if provided
      if (certificateRange.start || certificateRange.end) {
        const params = new URLSearchParams();
        if (certificateRange.start) params.append('certificateStart', certificateRange.start);
        if (certificateRange.end) params.append('certificateEnd', certificateRange.end);
        queryParams = `?${params.toString()}`;
        
        // Use the new filtered endpoint when certificate range is specified
        url = `/api/applications/reports/applications/csv-filtered${queryParams}`;
      } else {
        // Use the original endpoint when no filter is applied
        url = `/api/reports/applications/csv`;
      }
      
      window.open(url, '_blank');
      setSuccessMessage('Report generated successfully!');
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
    }
  };

  const handleCertificateRangeChange = (e) => {
    setCertificateRange({
      ...certificateRange,
      [e.target.name]: e.target.value
    });
  };

  // Get applications within certificate range
  const getApplicationsInCertificateRange = () => {
    if (!certificateRange.start && !certificateRange.end) {
      return applications;
    }

    return applications.filter(app => {
      if (!app.currentCertificateNo) return false;
      
      const certNo = app.currentCertificateNo.toUpperCase();
      const startCert = certificateRange.start.toUpperCase();
      const endCert = certificateRange.end.toUpperCase();
      
      // If only start is provided, return certificates >= start
      if (certificateRange.start && !certificateRange.end) {
        return certNo >= startCert;
      }
      
      // If only end is provided, return certificates <= end
      if (!certificateRange.start && certificateRange.end) {
        return certNo <= endCert;
      }
      
      // If both are provided, return certificates in range
      return certNo >= startCert && certNo <= endCert;
    });
  };

  if (loading) return <LoadingSpinner text="Loading reports..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6 p-6">
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

      {successMessage && <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage('')} />}
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generator */}
        <Card title="Generate Reports" className="h-fit">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Number Range
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Generate report for certificates within a specific range
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Certificate</label>
                  <input
                    type="text"
                    name="start"
                    value={certificateRange.start}
                    onChange={handleCertificateRangeChange}
                    placeholder="e.g., CERT2024001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Certificate</label>
                  <input
                    type="text"
                    name="end"
                    value={certificateRange.end}
                    onChange={handleCertificateRangeChange}
                    placeholder="e.g., CERT2024050"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Leave blank for all certificates. Range is inclusive.
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleGenerateReport}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                📄 Export Applications CSV
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {certificateRange.start || certificateRange.end ? 
                    `Will export ${getApplicationsInCertificateRange().length} applications` : 
                    'Will export all applications'
                  }
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card title="Quick Statistics" className="h-fit">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Applications</span>
              <span className="font-bold text-blue-600">{applications.length}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved Applications</span>
              <span className="font-bold text-green-600">
                {applications.filter(app => app.status === 'APPROVED').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Applications</span>
              <span className="font-bold text-yellow-600">
                {applications.filter(app => app.status === 'PENDING').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Certificates Issued</span>
              <span className="font-bold text-purple-600">
                {applications.filter(app => app.currentCertificateNo).length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Certificate Range Preview */}
      {(certificateRange.start || certificateRange.end) && (
        <Card title="Certificate Range Preview" subtitle="Applications within selected certificate range">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">App ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Certificate No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getApplicationsInCertificateRange().slice(0, 10).map((app) => (
                  <tr key={app.appId}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">#{app.appId}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{app.studentName}</td>
                    <td className="px-4 py-2 text-sm font-medium text-blue-600">
                      {app.currentCertificateNo || 'Not assigned'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{app.routeFrom} → {app.routeTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {getApplicationsInCertificateRange().length > 10 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing 10 of {getApplicationsInCertificateRange().length} applications
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;