import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  ChevronLeft,
  Activity,
  Zap
} from 'lucide-react';
import { adminLogin } from './adminAuthService';
import Logo from '../Logo';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await adminLogin(formData.username, formData.password);
      
      if (response.success) {
        // Success! The adminAuthService already stored the token
        navigate('/admin/dashboard');
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 mb-8 group hover:scale-110 transition-all duration-500 cursor-pointer">
            <Logo isStatic={true} className="h-10 w-auto" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">
            Admin <span className="text-teal-400">Terminal</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Platform Management Access</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl p-10 md:p-12 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="space-y-6">
              {/* Username/Email */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Identifier</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail size={20} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username or admin email"
                    className="w-full bg-slate-800/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:bg-slate-800 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Key</label>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] font-black text-teal-500 uppercase tracking-widest hover:text-teal-400 transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:bg-slate-800 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-teal-900/20 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield size={20} className="group-hover:rotate-12 transition-transform" />
                  <span className="uppercase tracking-[0.2em] text-xs">Initialize Access</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 flex flex-col items-center gap-6">
            <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Standard User Portal
            </Link>
            
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-teal-500" /> System: Stable
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-orange-500" /> Encryption: Active
              </div>
            </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
          Authorized personnel only. All access attempts are logged and monitored.<br />
          © 2025 Kamau Nepal System Administration
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
