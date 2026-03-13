'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Search, MapPin, Briefcase, Clock, DollarSign,
    Filter, X, BookmarkPlus, Share2, ChevronLeft,
    ChevronRight, Star, CheckCircle2
} from 'lucide-react';

// --- Internal Helper: Button ---
const Button = ({
    children, variant = 'primary', size = 'md', className = '', ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl';
    const variants = {
        primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
        secondary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
        outline: 'border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-400',
        ghost: 'bg-transparent text-teal-600 hover:bg-teal-50 focus:ring-teal-200',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md'
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg',
        icon: 'p-2'
    };
    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const LOCATIONS = ['All Locations', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Remote'];
const JOB_TYPES = ['All Types', 'Full-time', 'Part-time', 'Contract'];
const LEVELS = ['All Levels', 'Entry-level', 'Mid-level', 'Senior'];
const JOBS_PER_PAGE = 5;

export default function ExploreJobs() {
    const navigate = useNavigate();
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');

    // Initialize location filter from saved user location
    const [selectedLocation, setSelectedLocation] = useState(() => {
        const savedLoc = localStorage.getItem("userLocation")?.toLowerCase() || "";
        if (savedLoc.includes("kathmandu")) return "Kathmandu";
        if (savedLoc.includes("lalitpur") || savedLoc.includes("patan")) return "Lalitpur";
        if (savedLoc.includes("bhaktapur")) return "Bhaktapur";
        return "All Locations";
    });

    const [selectedType, setSelectedType] = useState('All Types');
    const [selectedLevel, setSelectedLevel] = useState('All Levels');
    const [showFilters, setShowFilters] = useState(false);
    const [savedJobs, setSavedJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch verified professionals
    useEffect(() => {
        const fetchProfessionals = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/professionals/', {
                    params: { isVerified: true }
                });

                if (response.data.success) {
                    // Map backend professionals to the job card format
                    const mapped = response.data.data.map(p => ({
                        id: p._id,
                        title: p.serviceCategory ? p.serviceCategory.charAt(0).toUpperCase() + p.serviceCategory.slice(1) : 'Professional',
                        company: `${p.firstName} ${p.lastName}`,
                        location: p.serviceArea ? p.serviceArea.charAt(0).toUpperCase() + p.serviceArea.slice(1) : 'Nepal',
                        salary: `रू ${p.hourlyWage}/hr`,
                        type: 'Full-time', // Defaulting for now
                        level: p.completedJobs > 10 ? 'Senior' : (p.completedJobs > 3 ? 'Mid-level' : 'Entry-level'),
                        skills: [p.serviceCategory, 'Reliable'],
                        posted: 'Recent',
                        description: p.bio || `Expert professional in ${p.serviceCategory} services available for hire.`,
                        profileImage: p.profileImage,
                        rating: p.rating || 0,
                        reviews: p.totalReviews || 0
                    }));
                    setProfessionals(mapped);
                }
            } catch (err) {
                console.error('Error fetching professionals:', err);
                setError('Failed to load professionals. Please try again later.');
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
            const matchesType = selectedType === 'All Types' || job.type === selectedType;
            const matchesLevel = selectedLevel === 'All Levels' || job.level === selectedLevel;

            return matchesSearch && matchesLocation && matchesType && matchesLevel;
        });
    }, [searchQuery, selectedLocation, selectedType, selectedLevel, professionals]);

    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
    }, [filteredJobs, currentPage]);

    const toggleSaveJob = (jobId) => {
        setSavedJobs(prev =>
            prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
        );
    };

    const isJobSaved = (jobId) => savedJobs.includes(jobId);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Finding Professionals...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Professionals</h1>
                        <p className="text-slate-500 font-medium text-sm">Find top-rated local experts in Nepal</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/')}>Back Home</Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className={`w-full md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block transition-all`}>
                        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 sticky top-28">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-black text-lg text-slate-900 uppercase tracking-widest text-xs">Filter By</h2>
                                <button onClick={() => setShowFilters(false)} className="md:hidden text-slate-400"><X size={20} /></button>
                            </div>

                            {/* Location Filter */}
                            <div className="mb-8">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Location</label>
                                <div className="space-y-3">
                                    {LOCATIONS.map(location => (
                                        <label key={location} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="location"
                                                value={location}
                                                checked={selectedLocation === location}
                                                onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1); }}
                                                className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-slate-300"
                                            />
                                            <span className={`text-sm font-bold transition-colors ${selectedLocation === location ? 'text-orange-600' : 'text-slate-500 group-hover:text-slate-900'}`}>{location}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Level Filter */}
                            <div className="mb-8">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Experience</label>
                                <div className="space-y-3">
                                    {LEVELS.map(level => (
                                        <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="level"
                                                value={level}
                                                checked={selectedLevel === level}
                                                onChange={(e) => { setSelectedLevel(e.target.value); setCurrentPage(1); }}
                                                className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-slate-300"
                                            />
                                            <span className={`text-sm font-bold transition-colors ${selectedLevel === level ? 'text-orange-600' : 'text-slate-500 group-hover:text-slate-900'}`}>{level}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Search Bar */}
                        <div className="mb-8 relative group">
                            <div className="absolute inset-0 bg-orange-500/5 rounded-3xl blur-xl group-focus-within:bg-orange-500/10 transition-all" />
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or category..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[28px] focus:border-orange-500 focus:outline-none shadow-sm transition-all text-sm font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Found <span className="text-orange-500">{filteredJobs.length}</span> verified professionals
                            </div>
                            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-widest">
                                <Filter size={14} /> {showFilters ? 'Hide' : 'Show'} Filters
                            </button>
                        </div>

                        {/* Professional Listings */}
                        <div className="space-y-6">
                            {paginatedJobs.length > 0 ? (
                                paginatedJobs.map(job => (
                                    <div key={job.id} className="group bg-white rounded-[32px] border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/5 transition-all p-8 flex flex-col sm:flex-row gap-8 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Avatar Column */}
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-50 flex-shrink-0 border border-slate-100 overflow-hidden shadow-inner">
                                            {job.profileImage ? (
                                                <img
                                                    src={job.profileImage.startsWith('http') ? job.profileImage : `/${job.profileImage}`}
                                                    alt={job.company}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">👨‍💼</div>
                                            )}
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{job.company}</h3>
                                                        <CheckCircle2 size={16} className="text-teal-500 fill-teal-50" />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{job.title}</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleSaveJob(job.id)}
                                                    className={`p-3 rounded-2xl transition-all ${isJobSaved(job.id) ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                                                >
                                                    <BookmarkPlus size={20} className={isJobSaved(job.id) ? 'fill-orange-600' : ''} />
                                                </button>
                                            </div>

                                            <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium line-clamp-2">
                                                {job.description}
                                            </p>

                                            <div className="flex flex-wrap gap-4 mb-8">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-black text-slate-600">
                                                    <MapPin size={14} className="text-orange-500" /> {job.location}
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-black text-slate-600">
                                                    <DollarSign size={14} className="text-orange-500" /> {job.salary}
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-black text-slate-600">
                                                    <Star size={14} className="text-orange-500 fill-orange-500" /> {job.rating} ({job.reviews})
                                                </div>
                                            </div>

                                            <div className="flex gap-4 items-center">
                                                <Button
                                                    variant="secondary"
                                                    className="flex-1 sm:flex-none sm:px-12 rounded-2xl"
                                                    onClick={() => navigate(`/professional/${job.id}`)}
                                                >
                                                    Book Now
                                                </Button>
                                                <Button variant="outline" className="flex-1 sm:flex-none rounded-2xl">
                                                    <Share2 size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Briefcase size={32} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">No Professionals Found</h3>
                                    <p className="text-slate-500 font-medium max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                                    <Button variant="outline" className="mt-8 rounded-2xl" onClick={() => { setSearchQuery(''); setSelectedLocation('All Locations'); setSelectedLevel('All Levels'); }}>
                                        Clear All Filters
                                    </Button>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 pt-12 pb-20">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-2xl border border-slate-200 hover:bg-white disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-12 h-12 rounded-2xl font-black transition-all ${currentPage === i + 1 ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 scale-110' : 'text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-2xl border border-slate-200 hover:bg-white disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
