import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Menu,
    X,
    Search,
    Bell,
    Settings,
    LogOut,
    MapPin,
    Clock,
    DollarSign,
    Star,
    Phone,
    Mail,
    Trash2,
    Edit2,
    CheckCircle,
    AlertCircle,
    Calendar,
    ChevronDown,
    MessageSquare,
    Home,
    TrendingUp,
    CreditCard,
    HelpCircle,
    Briefcase,
} from 'lucide-react';
import Logo from '../Logo';

export default function MyBookings() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const userName = localStorage.getItem('userName') || 'Professional User';
    const userProfileImage = localStorage.getItem('userProfileImage');

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/login');
                return;
            }

            const { getUserBookings } = await import('../bookingService');
            const data = await getUserBookings(userId);

            if (data) {
                // Ensure data is an array or handle appropriately
                setBookings(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to log out?');
        if (confirmLogout) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            navigate('/');
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'UN';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-blue-100 text-blue-800';
            case 'Confirmed':
                return 'bg-teal-100 text-teal-800';
            case 'In Progress':
                return 'bg-orange-100 text-orange-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle size={16} />;
            case 'Cancelled':
                return <AlertCircle size={16} />;
            case 'Pending':
                return <Clock size={16} />;
            default:
                return <Calendar size={16} />;
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (activeTab === 'all') return true;
        return booking.status === (activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
    });

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        try {
            const { updateBookingStatus } = await import('../bookingService');
            await updateBookingStatus(selectedBooking._id, 'Cancelled', cancelReason);

            alert('Booking cancelled successfully.');
            setShowCancelForm(false);
            setCancelReason('');
            setSelectedBooking(null);
            fetchBookings(); // Refresh list
        } catch (err) {
            console.error('Error cancelling booking:', err);
            alert(err.message || 'Failed to cancel booking');
        }
    };

    const handleCompleteBooking = async (bookingId) => {
        const confirmComplete = window.confirm('Are you sure you want to mark this service as completed?');
        if (confirmComplete) {
            try {
                const { updateBookingStatus } = await import('../bookingService');
                await updateBookingStatus(bookingId, 'Completed', '');
                alert('Booking marked as completed successfully.');
                fetchBookings(); // Refresh list
                setSelectedBooking(null);
            } catch (err) {
                console.error('Error completing booking:', err);
                alert(err.message || 'Failed to complete booking');
            }
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this booking?');
        if (confirmDelete) {
            try {
                const { deleteBooking } = await import('../bookingService');
                await deleteBooking(bookingId);
                alert('Booking deleted successfully');
                fetchBookings(); // Refresh list
            } catch (err) {
                console.error('Error deleting booking:', err);
                alert(err.message || 'Failed to delete booking');
            }
        }
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
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
                            <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
                            {selectedBooking && (
                                <>
                                    <div className="h-6 w-[1px] bg-gray-200"></div>
                                    <p className="text-sm font-medium text-gray-500">{selectedBooking.serviceTitle}</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button onClick={handleLogoClick} className="hover:opacity-80 transition cursor-pointer">
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

                {/* Main Content */}
                <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 overflow-y-auto">
                    {selectedBooking ? (
                        <div className="max-w-4xl mx-auto">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="mb-6 flex items-center gap-2 text-gray-700 hover:text-orange-600 transition p-2 hover:bg-orange-50 rounded-lg"
                            >
                                ← <span className="text-sm font-medium">Back to All Bookings</span>
                            </button>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                <div className="flex items-start gap-6 mb-8">
                                    <div className="flex-shrink-0">
                                        <div className="h-24 w-24 rounded-full bg-white border-4 border-orange-100 overflow-hidden flex items-center justify-center text-4xl shadow-md shrink-0">
                                            {selectedBooking.professionalId?.profileImage ? (
                                                <img
                                                    src={selectedBooking.professionalId.profileImage.startsWith('http') || selectedBooking.professionalId.profileImage.startsWith('data:')
                                                        ? selectedBooking.professionalId.profileImage
                                                        : `/${selectedBooking.professionalId.profileImage.replace(/\\/g, '/')}`
                                                    }
                                                    alt={selectedBooking.serviceProvider}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = document.createElement('span');
                                                        fallback.className = 'text-orange-600';
                                                        fallback.innerText = getInitials(selectedBooking.serviceProvider);
                                                        e.target.parentElement.appendChild(fallback);
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-orange-600">{getInitials(selectedBooking.serviceProvider)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedBooking.serviceTitle}</h2>
                                        <p className="text-gray-600 mb-4 font-medium">{selectedBooking.serviceProvider}</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedBooking.status)}`}>
                                                {getStatusIcon(selectedBooking.status)}
                                                {selectedBooking.status === 'Confirmed' ? 'Ongoing' : selectedBooking.status}
                                            </span>
                                            {selectedBooking.rating && (
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={16}
                                                            className={`${i < Math.floor(selectedBooking.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                    <span className="font-semibold text-gray-900 ml-1">{selectedBooking.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Service Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={18} className="text-orange-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Date</p>
                                                    <p className="font-semibold text-gray-900">{selectedBooking.bookingDate}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Clock size={18} className="text-orange-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Time</p>
                                                    <p className="font-semibold text-gray-900">{selectedBooking.timeSchedule}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <DollarSign size={18} className="text-orange-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Rate</p>
                                                    <p className="font-semibold text-gray-900">{selectedBooking.hourlyRate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Provider Info</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Provider Name</p>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedBooking.professionalId 
                                                        ? `${selectedBooking.professionalId.firstName} ${selectedBooking.professionalId.lastName}` 
                                                        : selectedBooking.serviceProvider}
                                                </p>
                                            </div>
                                            {selectedBooking.professionalId?.serviceArea && (
                                                <div className="flex items-center gap-3">
                                                    <MapPin size={18} className="text-teal-600" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Coming from</p>
                                                        <p className="font-semibold text-gray-900">{selectedBooking.professionalId.serviceArea}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* (Keep any other provider contact info if available) */}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Booking Summary</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-600">Service</span>
                                            <span className="font-semibold text-gray-900">{selectedBooking.serviceTitle}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-600">Location</span>
                                            <span className="font-semibold text-gray-900">{selectedBooking.location}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                            <span className="text-gray-900 font-semibold">Total Cost</span>
                                            <span className="text-2xl font-bold text-orange-600">{selectedBooking.totalCost}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.notes && (
                                    <div className="mb-8">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notes</h3>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedBooking.notes}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    {(selectedBooking.status === 'Pending' || selectedBooking.status === 'Upcoming') && (
                                        <>
                                            <button className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition">
                                                Reschedule Booking
                                            </button>
                                            <button
                                                onClick={() => setShowCancelForm(true)}
                                                className="flex-1 py-3 border border-red-600 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition"
                                            >
                                                Cancel Booking
                                            </button>
                                        </>
                                    )}
                                    {selectedBooking.status === 'Confirmed' && (
                                        <button 
                                            onClick={() => handleCompleteBooking(selectedBooking._id)}
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg shadow-blue-200"
                                        >
                                            <CheckCircle size={18} className="inline mr-2" />
                                            Mark as Completed
                                        </button>
                                    )}
                                    {selectedBooking.status === 'Completed' && (
                                        <button className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition">
                                            Leave Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                                    <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-1">Upcoming</p>
                                    <p className="text-3xl font-bold text-blue-600">{bookings.filter((b) => b.status === 'Pending' || b.status === 'Confirmed').length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-1">Completed</p>
                                    <p className="text-3xl font-bold text-green-600">{bookings.filter((b) => b.status === 'Completed').length}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                    <p className="text-gray-600 text-sm mb-1">Active Requests</p>
                                    <p className="text-3xl font-bold text-orange-600">{bookings.filter((b) => b.status === 'In Progress').length}</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
                                {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${activeTab === tab
                                            ? 'bg-orange-600 text-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab === 'all' ? 'All Bookings' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Bookings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBookings.map((booking) => (
                                        <div key={booking._id} onClick={() => setSelectedBooking(booking)} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer transform hover:-translate-y-1">
                                            <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 text-white">
                                                <div className="flex items-start justify-between">
                                                    <div className="h-16 w-16 rounded-full bg-white border-2 border-white/50 overflow-hidden flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                                                        {booking.professionalId?.profileImage ? (
                                                            <img
                                                                src={booking.professionalId.profileImage.startsWith('http') || booking.professionalId.profileImage.startsWith('data:')
                                                                    ? booking.professionalId.profileImage
                                                                    : `/${booking.professionalId.profileImage.replace(/\\/g, '/')}`
                                                                }
                                                                alt={booking.serviceProvider}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const fallback = document.createElement('span');
                                                                    fallback.className = 'text-orange-600';
                                                                    fallback.innerText = getInitials(booking.serviceProvider);
                                                                    e.target.parentElement.appendChild(fallback);
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-orange-600">{getInitials(booking.serviceProvider)}</span>
                                                        )}
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                                        {getStatusIcon(booking.status)}
                                                        {booking.status === 'Confirmed' ? 'Ongoing' : booking.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 mb-1">{booking.serviceTitle}</h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {booking.professionalId 
                                                        ? `${booking.professionalId.firstName} ${booking.professionalId.lastName}` 
                                                        : booking.serviceProvider}
                                                </p>

                                                <div className="space-y-2 mb-4 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Calendar size={16} className="text-orange-600" />
                                                        <span className="font-semibold">{booking.bookingDate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Clock size={16} className="text-orange-600" />
                                                        <span className="font-semibold">{booking.timeSchedule}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <MapPin size={16} className="text-orange-600" />
                                                        <span><span className="text-gray-400">At:</span> {booking.location}</span>
                                                    </div>
                                                    {booking.professionalId?.serviceArea && (
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <MapPin size={16} className="text-teal-600" />
                                                            <span><span className="text-gray-400">Coming from:</span> {booking.professionalId.serviceArea}</span>
                                                        </div>
                                                    )}
                                                </div>

                                            <div className="pt-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-gray-600">Total Cost</span>
                                                    <span className="text-xl font-bold text-orange-600">{booking.totalCost}</span>
                                                </div>
                                                {booking.rating && (
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                className={`${i < Math.floor(booking.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                        <span className="text-xs text-gray-600 ml-1">{booking.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteBooking(booking._id);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-semibold"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBooking(booking);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition text-sm font-semibold"
                                            >
                                                <ChevronDown size={16} />
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredBookings.length === 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab === 'all' ? 'bookings' : activeTab} found</h3>
                                    <p className="text-gray-600">You don't have any {activeTab === 'all' ? 'bookings' : activeTab} at the moment.</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Cancel Form Modal */}
            {showCancelForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking</h3>
                        <p className="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-orange-600"
                            rows={4}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelForm(false)}
                                className="flex-1 py-2 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
