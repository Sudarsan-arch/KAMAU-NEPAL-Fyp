import React from 'react';
import { Navigate } from 'react-router-dom';
import * as adminAuthService from './adminAuthService';

const AdminPrivateRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const token = localStorage.getItem('token');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');

  const isLoggedIn = !!adminToken || (!!token && adminUser?.role === 'admin');
  console.log("AdminPrivateRoute: isLoggedIn =", isLoggedIn);

  if (!isLoggedIn) {
    console.warn("AdminPrivateRoute: Not logged in, redirecting to /admin/login");
    return <Navigate to="/admin/login" replace />;
  }

  console.log("AdminPrivateRoute: Access granted to protected admin route");
  return children;
};

export default AdminPrivateRoute;
