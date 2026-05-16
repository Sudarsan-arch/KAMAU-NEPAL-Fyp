import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './Homepage/HomePage';
import SignupForm from './authentication/SignupForm';
import Login from './authentication/Login';
import ForgotPassword from './authentication/ForgotPassword';
import VerifyOTP from './authentication/VerifyOTP';
import ProfessionalRegistration from './serviceprovider/ProfessionalRegistration';
import Dashboard from './Dashboardsection/Dashboard';
import ServicesHistory from './Dashboardsection/ServicesHistory';
import UserProfile from './user-profile';
import ProfessionalProfile from './ProfessionalProfile';
import PrivateRoute from './PrivateRoute';
import ExploreJobs from './Homepage/ExploreJobs';
import Mybookings from './Dashboardsection/Mybookings';
import MessagePage from './Dashboardsection/message';
import PaymentPage from './Dashboardsection/PaymentPage';
import KhaltiVerify from './Dashboardsection/KhaltiVerify';
import Admindashboard from './Adminside/Admindashboard';
import AdminPrivateRoute from './Adminside/AdminPrivateRoute';
import ProfessionalDashboard from './serviceprovider/ProfessionalDashboard';
import CompaniesPage from './Homepage/CompaniesPage';
import PeoplePage from './Homepage/PeoplePage';
import ServicesPage from './Homepage/ServicesPage';
import HelpCentre from './HelpCentre/HelpCentre';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import TrustAndSafety from './pages/TrustAndSafety';

import { Toaster } from 'react-hot-toast';

import './index.css';
import './Homepage/global.css';

const RedirectIfAdmin = ({ children }) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
    const userRole = localStorage.getItem('userRole');
    
    // Only redirect if they actually have a token (prevent loop with stale role)
    const isAdmin = !!adminToken || (!!token && (adminUser?.role === 'admin' || adminUser?.role === 'super_admin' || userRole === 'admin'));
    
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  } catch (e) {
    console.error("Auth check error:", e);
  }
  
  return children;
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE"}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<RedirectIfAdmin><SignupForm /></RedirectIfAdmin>} />
          <Route path="/login" element={<RedirectIfAdmin><Login /></RedirectIfAdmin>} />
          <Route path="/forgot-password" element={<RedirectIfAdmin><ForgotPassword /></RedirectIfAdmin>} />
          <Route path="/verify-otp" element={<RedirectIfAdmin><VerifyOTP /></RedirectIfAdmin>} />
          <Route path="/professional-registration" element={<ProfessionalRegistration />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/explore-jobs" element={<ExploreJobs />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/help" element={<HelpCentre />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/trust-and-safety" element={<TrustAndSafety />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminPrivateRoute>
                <Admindashboard />
              </AdminPrivateRoute>
            }
          />

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
            path="/services-history"
            element={
              <PrivateRoute>
                <ServicesHistory />
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
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <Mybookings />
              </PrivateRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessagePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/payment/verify"
            element={
              <PrivateRoute>
                <KhaltiVerify />
              </PrivateRoute>
            }
          />

          <Route
            path="/payment/:bookingId"
            element={
              <PrivateRoute>
                <PaymentPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/professional-dashboard"
            element={
              <PrivateRoute>
                <ProfessionalDashboard />
              </PrivateRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
