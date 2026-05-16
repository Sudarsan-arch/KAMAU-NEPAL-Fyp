'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Search, MapPin, Briefcase, DollarSign,
    Filter, X, Share2, ChevronLeft,
    ChevronRight, Star, CheckCircle2, MessageSquare,
    Eye, TrendingUp, Award, Menu, User
} from 'lucide-react';
import Logo from '../Logo';

const LOCATIONS = ['All Locations', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Remote'];
const LEVELS = ['All Levels', 'Entry-level', 'Mid-level', 'Senior'];
const JOBS_PER_PAGE = 9;

const CATEGORIES = [
    { name: 'Carpentry', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', icon: '🔨' },
    { name: 'Electrical', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400', icon: '⚡' },
    { name: 'Plumbing', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400', icon: '🔧' },
    { name: 'Painting', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400', icon: '🎨' },
    { name: 'Cleaning', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400', icon: '🧹' },
    { name: 'Gardening', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', icon: '🌱' },
];

export default function ExploreJobs() {
    const navigate = useNavigate();
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Initialize location filter from saved user location
    const [selectedLocation, setSelectedLocation] = useState(() => {
        const savedLoc = localStorage.getItem("userLocation")?.toLowerCase() || "";
        if (savedLoc.includes("kathmandu")) return "Kathmandu";
        if (savedLoc.includes("lalitpur") || savedLoc.includes("patan")) return "Lalitpur";
        if (savedLoc.includes("bhaktapur")) return "Bhaktapur";
        return "All Locations";
    });

    const [selectedLevel, setSelectedLevel] = useState('All Levels');
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch verified professionals
    useEffect(() => {
        const fetchProfessionals = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/professionals/', {
                    params: { verificationStatus: 'verified' }
                });

                if (response.data.success) {
                    // Map backend professionals to the job card format
                    const mapped = response.data.data.map(p => ({
                        id: p._id,
                        title: p.serviceCategory ? p.serviceCategory.charAt(0).toUpperCase() + p.serviceCategory.slice(1) : 'Professional',
                        company: `${p.firstName} ${p.lastName}`,
                        location: p.serviceArea ? p.serviceArea.charAt(0).toUpperCase() + p.serviceArea.slice(1) : 'Nepal',
                        salary: `रू ${p.hourlyWage}/hr`,
                        type: 'Full-time',
                        level: p.completedJobs > 10 ? 'Senior' : (p.completedJobs > 3 ? 'Mid-level' : 'Entry-level'),
                        skills: [p.serviceCategory, 'Reliable'],
                        posted: 'Recent',
                        description: p.bio || `Expert professional in ${p.serviceCategory} services available for hire.`,
                        profileImage: p.profileImage,
                        rating: p.rating || 0,
                        reviews: p.totalReviews || 0,
                        completedJobs: p.completedJobs || 0,
                        isVerified: p.isVerified
                    }));
                    setProfessionals(mapped);
                }
            } catch (err) {
                console.error('Error fetching professionals:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessionals();
    }, []);

    const filteredJobs = useMemo(() => {
        return professionals.filter(job => {
            const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLocation = selectedLocation === 'All Locations' || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
            const matchesLevel = selectedLevel === 'All Levels' || job.level === selectedLevel;

            return matchesSearch && matchesLocation && matchesLevel;
        });
    }, [searchQuery, selectedLocation, selectedLevel, professionals]);

    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
    }, [filteredJobs, currentPage]);

    // Handle share functionality
    const handleShare = async (job) => {
        const shareData = {
            title: `${job.company} - ${job.title}`,
            text: `Check out ${job.company}, a verified ${job.title} professional in ${job.location}. Rate: ${job.salary}`,
            url: `${window.location.origin}/professional/${job.id}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareData.url);
                alert('Profile link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // Handle message/chat functionality
    const handleMessage = (job) => {
        // Check if user is logged in
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Please login to send messages');
            navigate('/login');
            return;
        }
        
        // Navigate to messages page or open chat
        // For now, we'll show an alert - you can implement actual messaging later
        alert(`Opening chat with ${job.company}...`);
        // navigate('/messages', { state: { professionalId: job.id } });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600 font-semibold">Loading professionals...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            {/* Modern Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition">
                                <Logo />
                            </button>
                            
                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center gap-6">
                                <button onClick={() => navigate('/')} className="text-gray-700 hover:text-teal-600 font-medium transition">
                                    Services
                                </button>
                                <button className="text-teal-600 font-semibold">
                                    Find a Pro
                                </button>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    const userId = localStorage.getItem('userId');
                                    if (userId) navigate('/dashboard');
                                    else navigate('/login');
                                }}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <User size={20} className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Profile</span>
                            </button>
                            
                            {/* Mobile Menu Button */}
                            <button 
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                            >
                                <Menu size={24} className="text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-4 py-3 space-y-2">
                            <button onClick={() => navigate('/')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                                Services
                            </button>
                            <button className="block w-full text-left px-4 py-2 text-teal-600 font-semibold bg-teal-50 rounded-lg">
                                Find a Pro
                            </button>
                            <button 
                                onClick={() => {
                                    const userId = localStorage.getItem('userId');
                                    if (userId) navigate('/dashboard');
                                    else navigate('/login');
                                }}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                Profile
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-teal-50 via-white to-orange-50 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Explore Top-Rated Professionals in Nepal
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Find verified experts for all your service needs
                        </p>
                    </div>

                    {/* Large Search Bar */}
                    <div className="max-w-3xl mx-auto">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={24} />
                            <input
                                type="text"
                                placeholder="Search by pro name or service category..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-16 pr-6 py-5 bg-white border-2 border-gray-200 rounded-2xl focus:border-teal-500 focus:outline-none shadow-lg hover:shadow-xl transition-all text-base font-medium text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Categories Section */}
            <div className="bg-white py-12 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
                    
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => { setSearchQuery(category.name); setCurrentPage(1); }}
                                className="flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden relative group cursor-pointer"
                            >
                                <img 
                                    src={category.image} 
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                    <span className="text-3xl mb-2">{category.icon}</span>
                                    <span className="font-bold text-lg">{category.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    <Filter size={20} className="text-teal-600" />
                                    Filters
                                </h3>
                                <button 
                                    onClick={() => setShowFilters(false)} 
                                    className="lg:hidden text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Location Filter */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    <MapPin size={16} className="text-teal-600" />
                                    Location
                                </label>
                                <div className="space-y-2">
                                    {LOCATIONS.map(location => (
                                        <label key={location} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="location"
                                                value={location}
                                                checked={selectedLocation === location}
                                                onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                            />
                                            <span className={`text-sm transition-colors ${selectedLocation === location ? 'text-teal-600 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                {location}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Filter */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    <Award size={16} className="text-teal-600" />
                                    Experience
                                </label>
                                <div className="space-y-2">
                                    {LEVELS.map(level => (
                                        <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="level"
                                                value={level}
                                                checked={selectedLevel === level}
                                                onChange={(e) => { setSelectedLevel(e.target.value); setCurrentPage(1); }}
                                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                            />
                                            <span className={`text-sm transition-colors ${selectedLevel === level ? 'text-teal-600 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                {level}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedLocation('All Locations');
                                    setSelectedLevel('All Levels');
                                    setCurrentPage(1);
                                }}
                                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Professional Cards Grid */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">{filteredJobs.length}</span> professionals found
                            </div>
                            <button 
                                onClick={() => setShowFilters(!showFilters)} 
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Filter size={16} />
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </button>
                        </div>

                        {/* Professional Cards */}
                        {paginatedJobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                                {paginatedJobs.map(job => (
                                    <div 
                                        key={job.id} 
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                    >
                                        {/* Profile Image */}
                                        <div className="relative h-32 bg-gradient-to-br from-teal-100 to-orange-100 overflow-hidden">
                                            {job.profileImage ? (
                                                <img
                                                    src={job.profileImage.startsWith('http') ? job.profileImage : `/${job.profileImage}`}
                                                    alt={job.company}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                                    👨‍💼
                                                </div>
                                            )}
                                            {job.isVerified && (
                                                <div className="absolute top-2 right-2 bg-teal-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1 text-xs font-semibold">
                                                    <CheckCircle2 size={12} />
                                                    Verified
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-3">
                                            {/* Name & Title */}
                                            <div className="mb-2">
                                                <h3 className="font-bold text-base text-gray-900 mb-0.5 line-clamp-1">
                                                    {job.company}
                                                </h3>
                                                <p className="text-xs text-teal-600 font-medium">
                                                    {job.title}
                                                </p>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="flex items-center gap-3 mb-2 text-xs">
                                                {job.completedJobs > 0 ? (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <TrendingUp size={12} className="text-teal-600" />
                                                        <span className="font-medium">{job.completedJobs} jobs</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-orange-600">
                                                        <Award size={12} />
                                                        <span className="font-medium">New Pro</span>
                                                    </div>
                                                )}
                                                
                                                {job.rating > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                        <span className="font-semibold text-gray-900">{job.rating.toFixed(1)}</span>
                                                        {job.reviews > 0 && (
                                                            <span className="text-gray-500">({job.reviews})</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Location & Price */}
                                            <div className="space-y-1 mb-2">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <MapPin size={12} className="text-gray-400" />
                                                    <span className="line-clamp-1">{job.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                                                    <DollarSign size={12} className="text-teal-600" />
                                                    <span>{job.salary}</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            {job.completedJobs > 0 && (
                                                <div className="mb-2">
                                                    <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                                                        <span>Services Completed</span>
                                                        <span className="font-semibold">{Math.min(job.completedJobs, 50)}/50</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-gradient-to-r from-teal-500 to-teal-600 h-1.5 rounded-full transition-all"
                                                            style={{ width: `${Math.min((job.completedJobs / 50) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="space-y-1.5">
                                                <button
                                                    onClick={() => navigate(`/professional/${job.id}`)}
                                                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition shadow-sm hover:shadow-md"
                                                >
                                                    Book Now
                                                </button>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    <button
                                                        onClick={() => navigate(`/professional/${job.id}`)}
                                                        className="py-1.5 px-2 border border-gray-300 rounded-lg text-[10px] font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1"
                                                        title="View Portfolio"
                                                    >
                                                        <Eye size={12} />
                                                        <span className="hidden sm:inline">Portfolio</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleMessage(job)}
                                                        className="py-1.5 px-2 border border-gray-300 rounded-lg text-[10px] font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1"
                                                        title="Send Message"
                                                    >
                                                        <MessageSquare size={12} />
                                                        <span className="hidden sm:inline">Message</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleShare(job)}
                                                        className="py-1.5 px-2 border border-gray-300 rounded-lg text-[10px] font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1"
                                                        title="Share Profile"
                                                    >
                                                        <Share2 size={12} />
                                                        <span className="hidden sm:inline">Share</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Briefcase size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Professionals Found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedLocation('All Locations');
                                        setSelectedLevel('All Levels');
                                        setCurrentPage(1);
                                    }}
                                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-lg font-semibold transition ${
                                            currentPage === i + 1
                                                ? 'bg-teal-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-white border border-gray-200'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
