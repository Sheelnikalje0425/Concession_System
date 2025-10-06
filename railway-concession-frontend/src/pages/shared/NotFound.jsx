import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="text-6xl mb-4">🔍</div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="space-y-3">
          <Link to="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              ← Go Back Home
            </Button>
          </Link>
          
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Sign In Again
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            Need help? Contact support at{' '}
            <a href="mailto:support@railway-concession.com" className="text-blue-600 hover:underline">
              support@railway-concession.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;