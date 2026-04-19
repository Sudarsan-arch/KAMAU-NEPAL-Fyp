import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    agreeToTerms: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!formData.agreeToTerms) {
      alert('You must agree to Terms and Privacy Policy!');
      return;
    }

    try {
      // Prepare payload
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        address: formData.address,
      };

      // Send POST request to backend
      const response = await axios.post(
        '/api/users/signup',
        payload
      );

      console.log('Signup response:', response.data);

      // Save user data for profile
      const fullName = `${formData.firstName} ${formData.lastName}`;
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userLocation', formData.address);

      // Navigate to OTP verification page
      navigate('/verify-otp');
    } catch (err) {
      if (err.response && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Error connecting to backend');
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log('Google login success, exchanging token...');
        const res = await axios.post('/api/users/google-login', {
          token: tokenResponse.access_token,
        });

        const { token, userId, name, role } = res.data;
        
        // Save session data
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', name);
        localStorage.setItem('userRole', role);

        alert('Google Login successful!');
        navigate('/dashboard');
      } catch (err) {
        console.error('Google exchange error:', err);
        alert('Failed to complete Google Login: ' + (err.response?.data?.message || err.message));
      }
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      console.log('Starting Google Login flow...');
      googleLogin();
      return;
    }
    
    console.log(`Social provider not fully integrated: ${provider}`);
    alert(`${provider} login is coming soon!`);
  };

  return (
    <div className="min-h-screen bg-cyan-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <div className="lg:w-1/2 p-8 md:p-12">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-teal-600 text-white font-bold">
                  ≡
                </div>
                <span className="text-xl font-bold text-teal-900">Kamau Nepal</span>
              </div>
              <h1 className="text-3xl font-bold text-teal-900">Create Your Account</h1>
              <p className="mt-2 text-gray-600">
                Join our community and start your professional journey today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  required
                  className="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                />
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 mt-1 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-teal-600 font-medium hover:text-teal-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-teal-600 font-medium hover:text-teal-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98]"
              >
                Create Account
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Social Login Section */}
            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-4 text-sm text-gray-500 absolute">Or continue with</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => handleSocialLogin('Apple')}
                  className="flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M17.05 20.28c-.98.95-2.05 1.78-3.19 1.76-1.11-.02-1.47-.7-2.74-.7-1.27 0-1.68.68-2.74.72-1.11.04-2.23-.87-3.23-1.82-2.04-1.94-3.59-5.48-1.5-9.1 1.04-1.8 2.89-2.94 4.58-2.97 1.29-.02 2.5.87 3.29.87.79 0 2.26-1.07 3.81-.91 1.65.07 2.9.66 3.74 1.89-3.34 2.01-2.81 6.13.55 7.51-.73 1.83-1.74 3.61-3.57 5.75zM12.03 7.25c-.02-2.23 1.84-4.13 4.04-4.25.02 2.23-1.84 4.13-4.04 4.25z"
                    />
                  </svg>
                  Apple
                </button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">
                Sign in
              </Link>
            </div>
          </div>

          {/* Right Side Hero */}
          <div className="lg:w-1/2 relative overflow-hidden hidden lg:flex items-center justify-center">
            <img 
              src="https://picsum.photos/seed/professional/1200/1600" 
              alt="Professional Growth" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-teal-900/40 backdrop-blur-[2px]"></div>
            <div className="relative z-10 text-center text-white p-12">
              <h2 className="text-4xl font-bold mb-6 drop-shadow-lg">Launch Your Career</h2>
              <p className="text-xl opacity-95 mb-8 max-w-md mx-auto drop-shadow-md">
                Join thousands of professionals who found their dream jobs through our platform
              </p>
              <div className="flex justify-center gap-4 mt-12">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/30">10k+ Jobs</div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/30">5k+ Companies</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;