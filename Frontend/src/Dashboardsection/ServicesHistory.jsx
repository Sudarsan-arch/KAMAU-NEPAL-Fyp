import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  MoreVertical,
  Trash2,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Sparkles
} from 'lucide-react';
import Logo from '../components/Logo';
import { getTakenServices, clearServicesHistory } from '../services/storage';
import { ServiceRecord } from '../types';

const ServicesHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    setHistory(getTakenServices());
  }, []);

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your service history? This action cannot be undone.')) {
      clearServicesHistory();
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-6 w-[1px] bg-gray-200"></div>
            <h1 className="text-xl font-bold text-gray-900">Services Taken</h1>
          </div>
          <button onClick={() => navigate('/')} className="hover:opacity-80 transition">
            <Logo />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Your History</h2>
            <p className="text-gray-500 font-medium">Review and manage the services you've completed.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleClearHistory}
              className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2"
            >
              <Trash2 size={16} />
              Clear History
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search your records..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={18} />
              <select 
                className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Tech">Technology</option>
                <option value="Creative">Creative</option>
                <option value="Home">Home Service</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-gray-50">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Service & Provider</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Date Taken</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Cost/Rate</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Provider Rating</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-orange-600 transition">{item.title}</p>
                            <p className="text-xs text-gray-500 font-medium">{item.provider}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(item.dateTaken)}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-gray-900 text-sm">
                        {item.cost}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-gray-700">{item.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-orange-600 border border-transparent hover:border-orange-100">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                          <Briefcase size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No records found</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                          You haven't marked any services as taken yet or your search query didn't match any records.
                        </p>
                        <button 
                          onClick={() => navigate('/')}
                          className="mt-4 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-100"
                        >
                          Find Services
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-100">
            <Sparkles className="mb-4 opacity-80" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Savings</p>
            <h3 className="text-3xl font-black">$450.00</h3>
            <p className="text-sm mt-2 opacity-90 font-medium">Estimated value from taken services</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-3xl text-white shadow-lg shadow-orange-100">
            <CheckCircle className="mb-4 opacity-80" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Verified Jobs</p>
            <h3 className="text-3xl font-black">{history.length}</h3>
            <p className="text-sm mt-2 opacity-90 font-medium">All services completed successfully</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <Star className="text-yellow-400 mb-4" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. Provider Quality</p>
              <h3 className="text-3xl font-black text-gray-900">4.8</h3>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-4">Based on your service provider selections</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesHistory;