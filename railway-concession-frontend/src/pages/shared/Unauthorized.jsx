import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const Unauthorized = () => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Warning Icon */}
        <div className="text-6xl mb-4">🚫</div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Denied</h2>
        
        <p className="text-gray-600 mb-6">
          Sorry, you don't have permission to access this page. 
          {role && ` Your current role is: ${role.toUpperCase()}`}
        </p>

        <div className="space-y-3 mb-6">
          <Button onClick={handleGoBack} variant="outline" className="w-full">
            ← Go Back
          </Button>
          
          <Link to={role === 'student' ? '/student/dashboard' : '/staff/dashboard'}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Go to {role === 'student' ? 'Student' : 'Staff'} Dashboard
            </Button>
          </Link>

          <Button onClick={handleLogout} variant="danger" className="w-full">
            Sign Out
          </Button>
        </div>

        {/* Role Information */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Role Information</h3>
          <p className="text-xs text-yellow-700">
            {role === 'student' 
              ? 'Students can only access their own dashboard, applications, and profile.'
              : 'Staff members have access to manage all applications, students, and generate reports.'
            }
          </p>
        </div>

        {/* Contact Support */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600">
            If you believe this is an error, please contact{' '}
            <a href="mailto:admin@railway-concession.com" className="text-blue-600 hover:underline">
              system administration
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;