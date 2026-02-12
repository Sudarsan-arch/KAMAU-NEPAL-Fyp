import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SignupForm from './authentication/SignupForm';
import Login from './authentication/Login';
import ForgotPassword from './authentication/ForgotPassword';
import VerifyOTP from './authentication/VerifyOTP';
import ProfessionalRegistration from './serviceprovider/ProfessionalRegistration';
import Dashboard from './Dashboard';
import UserProfile from './user-profile';
import PrivateRoute from './PrivateRoute'; // Import PrivateRoute

import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/professional-registration" element={<ProfessionalRegistration />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
