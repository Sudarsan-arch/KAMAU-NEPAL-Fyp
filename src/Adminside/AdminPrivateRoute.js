import React from 'react';
import { Navigate } from 'react-router-dom';
import * as adminAuthService from '../adminAuthService';

const AdminPrivateRoute = ({ children }) => {
  const isLoggedIn = adminAuthService.isAdminLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminPrivateRoute;
