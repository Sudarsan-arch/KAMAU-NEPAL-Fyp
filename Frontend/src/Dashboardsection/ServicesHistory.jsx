import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Briefcase,
  Loader,
  Trash2,
  Menu,
  X,
  Bell
} from 'lucide-react';
import Logo from '../Logo';
import { getUserBookings, deleteBooking, updateBookingStatus } from '../bookingService';

const ServicesHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await getUserBookings(userId);

      if (response.success) {
        setBookings(response.data || []);
      } else {
        setError(response.message || "Failed to load bookings");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(item => {
    try {
      const matchesSearch =
        (item.serviceTitle?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.serviceProvider?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesFilter = filterStatus === 'All' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    } catch (e) {
      console.error('Error filtering bookings:', e);
      return false;
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-teal-100 text-teal-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle size={16} />;
      case 'In Progress':
        return <Clock size={16} />;
      case 'Completed':
        return <CheckCircle size={16} />;
      case 'Cancelled':
        return <AlertCircle size={16} />;
      case 'Pending':
      default:
        return <Clock size={16} />;
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await deleteBooking(bookingId);
        if (response.success) {
          setBookings(bookings.filter(b => b._id !== bookingId));
          alert('Booking deleted successfully');
        } else {
          alert('Error: ' + (response.message || 'Failed to delete booking'));
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Services History</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={() => navigate('/')} className="hover:opacity-80 transition cursor-pointer">
              <Logo />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Your Bookings</h2>
              <p className="text-gray-500 font-medium">View and manage your professional service bookings.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchBookings}
                className="px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition flex items-center gap-2"
              >
                <Loader size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <div>
                <p className="font-bold text-red-700">{error}</p>
                <p className="text-sm text-red-600">Please try refreshing the page or logging in again.</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin">
                <Loader size={48} className="text-orange-600" />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400" size={18} />
                  <select
                    className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-gray-50">
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Service & Provider</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Customer Name</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Booking Date</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Schedule</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Rate</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((item) => (
                        <tr key={item._id} className="hover:bg-orange-50/20 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                <Briefcase size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-orange-600 transition">{item.serviceTitle || 'Unknown Service'}</p>
                                <p className="text-xs text-gray-500 font-medium">{item.serviceProvider || 'Unknown Provider'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-medium text-gray-900 text-sm">{item.fullName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{item.location || ''}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                              <Calendar size={16} className="text-gray-400" />
                              {formatDate(item.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-700 font-medium">
                            {item.timeSchedule || 'N/A'}
                          </td>
                          <td className="px-6 py-5 font-bold text-gray-900 text-sm">
                            {item.hourlyRate || '$0.00'}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${getStatusBadgeColor(item.status)}`}>
                              {getStatusIcon(item.status)}
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => handleDeleteBooking(item._id)}
                              className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-red-600 border border-transparent hover:border-red-100"
                              title="Delete booking"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                              <Briefcase size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                              {searchQuery || filterStatus !== 'All'
                                ? "No bookings match your search or filter criteria."
                                : "You haven't made any bookings yet. Start by booking a professional service!"}
                            </p>
                            <button
                              onClick={() => navigate('/dashboard')}
                              className="mt-4 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-100"
                            >
                              Browse Services
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats cards can be added here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServicesHistory;