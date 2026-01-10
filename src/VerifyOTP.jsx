import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Email from signup

  useEffect(() => {
    if (timer > 0 && !isVerified) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isVerified]);

  const handleChange = (index, value) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Confirm button submits OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (!email) {
      alert('Email not found. Please signup again.');
      navigate('/signup');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/users/verify-otp', {
        email,
        otp: otpCode,
      });

      if (response.data.success) {
        setIsVerified(true);
        navigate('/dashboard'); // Navigate to dashboard immediately
      } else {
        alert(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      alert('Error verifying OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return alert('Email not found.');
    setTimer(60);
    try {
      await axios.post('http://localhost:5000/api/users/resend-otp', { email });
      alert('New OTP sent to your email!');
    } catch (err) {
      alert('Failed to resend OTP. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 mb-6"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-teal-600 text-white font-bold">≡</div>
            <span className="text-xl font-bold text-teal-900">Kamau Nepal</span>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 mb-4">
              <div className="text-2xl font-bold text-teal-600">🔒</div>
            </div>
            <h1 className="text-2xl font-bold text-teal-900">Verify OTP</h1>
            <p className="mt-2 text-gray-600">Enter the 6-digit code sent to your email</p>
          </div>

          {!isVerified ? (
            <>
              {/* OTP Inputs */}
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Timer and Resend */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock size={16} />
                  <span>Resend code in: {timer}s</span>
                </div>
                <button
                  onClick={handleResend}
                  disabled={timer > 0 || loading}
                  className={`text-sm font-medium ${
                    timer > 0 || loading ? 'text-gray-400' : 'text-teal-600 hover:text-teal-700'
                  }`}
                >
                  Didn't receive code? Resend
                </button>
              </div>

              {/* Confirm Button */}
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Confirm'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Verified Successfully!</h2>
              <p className="mt-2 text-gray-600">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
