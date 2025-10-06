import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Check if user data exists in localStorage on app load
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const value = {
    user,
    role,
    login,
    logout,
    isAuthenticated: !!user,
    isStudent: role === 'student',
    isStaff: role === 'staff'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;