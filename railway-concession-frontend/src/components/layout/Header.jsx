import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Header = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const staffMenuItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/staff/applications', label: 'Applications', icon: '📝' },
    { path: '/staff/students', label: 'Students', icon: '👥' },
    { path: '/staff/reports', label: 'Reports', icon: '📊' },
    { path: '/staff/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Railway Concession System
              </h1>
            </Link>
          </div>

          {/* User Info and Actions */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              {/* Staff Dashboard Dropdown */}
              {role === 'staff' && (
                <div className="relative">
                  <Button
                    onClick={toggleDropdown}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span>Dashboard</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      {staffMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-3">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* User Info */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {role}
                </p>
              </div>
              
              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;