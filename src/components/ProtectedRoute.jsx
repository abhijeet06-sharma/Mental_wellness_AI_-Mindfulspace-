// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check for the authentication token in localStorage
  const token = localStorage.getItem('token');

  // If a token exists, allow access to the nested routes (e.g., Dashboard)
  // The <Outlet /> component renders the child route element.
  if (token) {
    return <Outlet />;
  }

  // If no token exists, redirect the user to the /login page
  // The 'replace' prop prevents the user from going back to the protected page
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;