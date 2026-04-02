import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, CheckCircle2, ShieldCheck,
  Calendar, MessageSquare, ArrowLeft, Share2, Award,
  Clock, Briefcase, GraduationCap, UserCircle, X, Send, Check, ThumbsUp, Lock
} from 'lucide-react';
import axios from 'axios';
import { submitReview, getProfessionalReviews } from './services/reviewService';

// Button Component
const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'font-bold rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer border-0';

  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95',
    outline: 'border-2 border-slate-200 text-slate-900 hover:border-teal-600 hover:text-teal-600 active:scale-95',
    ghost: 'text-slate-600 hover:text-teal-600 hover:bg-slate-50 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
    icon: 'p-3',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [requestTime, setRequestTime] = useState('');
  const [requestLocation, setRequestLocation] = useState('');

  // Review States
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);


  const userId = localStorage.getItem('userId');
  const isSelf = profile?.userId === userId || profile?._id === userId;


  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProfessionalProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/professionals/${id}`);
        if (response.data.success) {
          setProfile(response.data.data);
          setImageLoaded(false);
        } else {
          setError('Professional not found');
        }
      } catch (err) {
        console.error('Error fetching professional:', err);
        setError(err.response?.data?.message || 'Failed to fetch professional profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await getProfessionalReviews(id);
        if (data.success) {
          setReviews(data.data || []);
          const userId = localStorage.getItem('userId');
          if (userId) {
            const already = (data.data || []).some(r => String(r.userId) === String(userId) || String(r.userId?._id) === String(userId));
            setAlreadyReviewed(already);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    const checkEligibility = async () => {
      const userId = localStorage.getItem('userId');
      if (userId && id) {
        try {
          const { checkUserBookingStatus } = await import('./bookingService');
          const res = await checkUserBookingStatus(userId, id);
          setCanReview(res.hasBooking);
        } catch (err) {
          console.error('Error checking review eligibility:', err);
        }
      }
    };

    if (id) {
      fetchProfessionalProfile();
      fetchReviews();
      checkEligibility();
    }
  }, [id]);

  const formatServiceArea = (area) => {
    if (!area) return 'Not specified';
    return area
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatServiceCategory = (category) => {
    if (!category) return 'Service';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const handleHire = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    try {
      // Fetch latest profile to get the most accurate saved address
      const response = await axios.get(`/api/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.user) {
        const user = response.data.user;
        const savedLocation = user.formattedAddress || user.address || (typeof user.location === 'string' ? user.location : "");
        setRequestLocation(savedLocation);
      } else {
        // Fallback to localStorage
        setRequestLocation(localStorage.getItem('userLocation') || "");
      }
    } catch (err) {
      console.error("Error fetching user location for booking:", err);
      // Fallback to localStorage on error
      setRequestLocation(localStorage.getItem('userLocation') || "");
    }

    setIsRequestModalOpen(true);
  };

  const handleChat = () => {
    const isLoggedIn = localStorage.getItem('token');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    // Navigate to messages and pass recipient info in state
    navigate('/messages', { 
      state: { 
        composeTo: profile?.userId || profile?._id, // Prefer userId if available (linked user doc)
        recipientEmail: profile?.email,
        subject: `Inquiry about ${formatServiceCategory(profile?.serviceCategory)}`
      } 
    });
  };

  const handleRequestService = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/login');
      return;
    }

    if (!requestDate || !requestTime || !requestText || !requestLocation) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Import bookingService functions dynamically or at top (I'll add import at top next)
      const { createBooking } = await import('./bookingService');

      const bookingData = {
        userId,
        professionalId: id,
        serviceTitle: profile?.serviceCategory || 'Service',
        serviceProvider: `${profile?.firstName} ${profile?.lastName}`,
        fullName: localStorage.getItem('userName') || 'User',
        workDescription: requestText,
        timeSchedule: requestTime,
        bookingDate: requestDate,
        location: requestLocation,
        hourlyRate: profile?.hourlyWage ? `रू ${profile.hourlyWage}` : "रू 0.00",
        totalCost: profile?.hourlyWage ? `रू ${profile.hourlyWage}` : "रू 0.00", // Initial cost estimation
        status: 'Pending'
      };

      const result = await createBooking(bookingData);

      if (result) {
        setIsSubmitted(true);
        // Reset after some time and close
        setTimeout(() => {
          setIsRequestModalOpen(false);
          setIsSubmitted(false);
          setRequestText('');
          setRequestDate('');
          setRequestTime('');
          setRequestLocation('');
        }, 3000);
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      alert(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.firstName} ${profile?.lastName} - ${formatServiceCategory(profile?.serviceCategory)}`,
        text: `Check out this professional on Kamau Nepal!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) { navigate('/login'); return; }
    if (reviewRating === 0) { alert('Please select a star rating'); return; }

    setReviewSubmitting(true);
    try {
      const userName = localStorage.getItem('userName') || 'Anonymous';
      await submitReview({ professionalId: id, userId, userName, rating: reviewRating, comment: reviewComment });
      setReviewSubmitted(true);
      setAlreadyReviewed(true);
      const data = await getProfessionalReviews(id);
      if (data.success) setReviews(data.data || []);
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSubmitted(false);
        setReviewRating(0);
        setReviewComment('');
      }, 2500);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to submit review';
      alert(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, size = 20) => {
    return [1,2,3,4,5].map(star => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && setReviewRating(star)}
        onMouseEnter={() => interactive && setReviewHover(star)}
        onMouseLeave={() => interactive && setReviewHover(0)}
        className={interactive ? 'transition-transform hover:scale-110 focus:outline-none' : 'cursor-default'}
      >
        <Star
          size={size}
          className={`transition-colors ${
            star <= (interactive ? (reviewHover || reviewRating) : rating)
              ? 'fill-orange-400 text-orange-400'
              : 'text-slate-200 fill-slate-100'
          }`}
        />
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Briefcase className="text-teal-600" size={32} />
          </div>
          <p className="text-slate-500 font-bold">Loading expert profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-[40px] shadow-xl border border-slate-100 max-w-md">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Profile Not Found</h2>
          <p className="text-slate-500 mb-8 font-medium">{error || 'Sorry, we couldn\'t find the professional you\'re looking for. They might have updated their listing.'}</p>
          <Button onClick={() => navigate('/')} className="w-full">Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 pb-24">
      <style>
        {`
          @keyframes blink-orange-shadow {
            0%, 100% { 
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              border-color: white;
            }
            50% { 
              box-shadow: 0 0 25px 8px rgba(249, 115, 22, 0.5);
              border-color: rgba(249, 115, 22, 0.2);
            }
          }
          .animate-blink-orange {
            animation: blink-orange-shadow 2s infinite ease-in-out;
          }
        `}
      </style>

      {/* Header / Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-teal-600 to-teal-800 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end">
          <div className="translate-y-1/2 flex flex-col md:flex-row items-center md:items-end gap-6 w-full pb-0 md:pb-6">
            <div className="relative group transition-all duration-300">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[8px] border-white overflow-hidden bg-slate-100 flex items-center justify-center transition-all duration-300 cursor-pointer animate-blink-orange">
                {profile?.profileImage ? (
                  <>
                    <img
                      src={
                        profile.profileImage.startsWith('http') || profile.profileImage.startsWith('data:')
                          ? profile.profileImage
                          : `/${profile.profileImage.replace(/\\/g, '/')}`
                      }
                      alt={profile?.firstName || 'Professional'}
                      className={`w-full h-full object-cover relative z-10 group-hover:brightness-110 transition-all duration-300 ${imageLoaded ? 'block' : 'hidden'}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(false)}
                    />
                    {!imageLoaded && (
                      <UserCircle size={80} className="text-slate-300 relative z-10" />
                    )}
                  </>
                ) : (
                  <UserCircle size={80} className="text-slate-300 relative z-10 group-hover:text-teal-400 transition-all duration-300" />
                )}
              </div>
              {profile?.isVerified && (
                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-teal-600 text-white p-1.5 md:p-2.5 rounded-full shadow-2xl z-30 border-4 border-white flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
                  <Check size={24} strokeWidth={4} className="w-5 h-5 md:w-7 md:h-7" />
                </div>
              )}
            </div>
            <div className="flex-grow text-center md:text-left mb-0 md:mb-4">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl inline-block mb-2">
                {profile?.firstName || 'Professional'} {profile?.lastName || 'Name'}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2">
                <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-black text-teal-700 uppercase tracking-widest border border-white">
                  {formatServiceCategory(profile?.serviceCategory)}
                </span>
                <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white">
                  <Star className="fill-orange-400 text-orange-400" size={16} />
                  <span className="font-black text-slate-900">{profile?.rating || 0}</span>
                  <span className="text-slate-400 text-sm font-medium">({profile?.totalReviews || 0} Reviews)</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex gap-3 mb-6">
              <Button variant="outline" size="icon" className="bg-white" onClick={handleShare}><Share2 size={20} /></Button>
              {!isSelf && (
                <Button variant="primary" className="gap-2 px-8" onClick={handleHire}>Hire {profile?.firstName || 'Professional'}</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-12">
            {/* Action buttons for mobile */}
            <div className="flex md:hidden gap-3 w-full">
              {!isSelf ? (
                <Button variant="primary" className="flex-grow gap-2" onClick={handleHire}>Hire {profile?.firstName || 'Professional'}</Button>
              ) : (
                <Button variant="outline" className="flex-grow" onClick={() => navigate('/professional-dashboard')}>Go to Dashboard</Button>
              )}
              <Button variant="outline" size="icon" onClick={handleShare}><Share2 size={20} /></Button>
            </div>

            {/* Bio Section */}
            <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <UserCircle className="text-teal-600" /> About
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {profile?.bio || "This professional hasn't added a bio yet. They have been verified by the Kamau Nepal team for their excellence in service."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Rate</p>
                  <p className="text-xl font-black text-slate-900">रू {profile?.hourlyWage || 'TBD'}/hr</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Experience</p>
                  <p className="text-xl font-black text-slate-900">5+ Years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Response</p>
                  <p className="text-xl font-black text-slate-900">&lt; 1 hour</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Completed</p>
                  <p className="text-xl font-black text-slate-900">{profile?.completedJobs || 0} Jobs</p>
                </div>
              </div>
            </section>

            {/* Skills & Tools */}
            <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Award className="text-teal-600" /> Skills & Expertise
              </h2>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  {(profile?.skills && profile.skills.length > 0 ? profile.skills : ["Professional Service", "Quality Work", "Reliable", "Verified"]).map((skill) => (
                    <span key={skill} className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 hover:border-teal-200 hover:text-teal-600 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
                
                {profile?.tools && profile.tools.length > 0 && (
                  <div className="pt-6 border-t border-slate-50">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Tools & Technologies</p>
                    <div className="flex flex-wrap gap-3">
                      {profile.tools.map((tool) => (
                        <span key={tool} className="px-4 py-2 rounded-xl bg-teal-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-teal-100 italic transition-transform hover:scale-105">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ===== REVIEWS SECTION ===== */}
            <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Star className="text-orange-400 fill-orange-400" /> Reviews
                  <span className="text-base font-bold text-slate-400 ml-1">({reviews.length})</span>
                </h2>
                {localStorage.getItem('token') && (
                  alreadyReviewed ? (
                    <span className="flex items-center gap-2 text-sm font-bold text-teal-600 bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
                      <Check size={16} /> You Reviewed
                    </span>
                  ) : canReview ? (
                    <button
                      onClick={() => setShowReviewForm(v => !v)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition text-sm shadow-md"
                    >
                      <Star size={16} /> Write a Review
                    </button>
                  ) : (
                    <div className="group relative">
                      <button
                        disabled
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-400 font-bold rounded-2xl transition text-sm cursor-not-allowed border border-slate-200"
                      >
                        <Lock size={16} /> Write a Review
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-xl z-10">
                        You can only review after your service is approved/completed by the professional.
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && !alreadyReviewed && (
                <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  {reviewSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3 animate-bounce">
                        <Check size={32} />
                      </div>
                      <p className="font-black text-slate-900 text-lg">Thank you for your review!</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Your Rating</label>
                        <div className="flex items-center gap-1">
                          {renderStars(reviewRating, true, 32)}
                          <span className="ml-3 text-sm font-bold text-slate-500">
                            {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very Good' : reviewRating === 5 ? 'Excellent!' : ''}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Your Comment</label>
                        <textarea
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder={`Share your experience with ${profile?.firstName}...`}
                          className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-slate-800 font-medium resize-none"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={reviewSubmitting || reviewRating === 0}
                          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black rounded-2xl transition"
                        >
                          {reviewSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Submitting...</> : <><Send size={16}/>Submit Review</>}
                        </button>
                        <button type="button" onClick={() => setShowReviewForm(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="text-center py-8 text-slate-400 font-bold animate-pulse">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <ThumbsUp size={40} className="mx-auto text-slate-200 mb-3" />
                  <p className="font-bold text-slate-400">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-black text-sm">
                            {(review.userName || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{review.userName || 'Anonymous'}</p>
                            <p className="text-xs text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">{renderStars(review.rating, false, 14)}</div>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Education & Certificates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <GraduationCap className="text-teal-600" /> Education
                </h2>
                <div className="space-y-6">
                  <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-1 before:bg-teal-100 before:rounded-full">
                    <p className="font-black text-slate-900">{profile?.education || "Professional Training"}</p>
                    <p className="text-sm text-slate-500 font-medium">Certified Professional</p>
                  </div>
                </div>
              </section>
              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <ShieldCheck className="text-teal-600" /> Certifications
                </h2>
                <div className="space-y-6">
                  <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-1 before:bg-orange-100 before:rounded-full">
                    <p className="font-black text-slate-900">Verified Professional</p>
                    <p className="text-sm text-slate-500 font-medium">Kamau Nepal Certified</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24">
              <section className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6">Booking Details</h3>

                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Availability</p>
                      <p className="font-black text-slate-900">Mon - Sat, 9AM - 6PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Working Area</p>
                      <p className="font-black text-slate-900">{formatServiceArea(profile?.serviceArea)}, Nepal</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {!isSelf ? (
                    <>
                      <Button
                        className="w-full gap-2 py-4"
                        variant="primary"
                        onClick={() => handleHire()}
                      >
                        <Calendar size={20} /> Request Service
                      </Button>
                      <Button className="w-full gap-2 py-4" variant="secondary" onClick={handleChat}>
                        <MessageSquare size={20} /> Chat with {profile?.firstName || 'Professional'}
                      </Button>
                    </>
                  ) : (
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-center">
                       <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mx-auto mb-4">
                         <ShieldCheck size={32} />
                       </div>
                       <p className="text-base font-black text-slate-900 uppercase tracking-tight">Your Expert Profile</p>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Personal Management View</p>
                       <Button 
                         variant="outline" 
                         className="w-full mt-6 py-4 text-xs tracking-widest uppercase font-black" 
                         onClick={() => navigate('/professional-dashboard')}
                       >
                         Manage Availability
                       </Button>
                    </div>
                  )}
                </div>

                <p className="mt-6 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Secure Payment with Khalti & eSewa
                </p>
              </section>


              {/* Reviews Preview (Sidebar) */}
              <section className="mt-8 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-black text-slate-900">Top Review</h3>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < Math.floor(profile?.rating || 0) ? "fill-orange-400 text-orange-400" : "text-slate-200"} />)}
                  </div>
                </div>
                {reviews.length > 0 ? (
                  <>
                    <p className="text-slate-500 italic font-medium mb-4 text-sm leading-relaxed">"{reviews[0].comment}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-black text-xs">
                        {(reviews[0].userName || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900">{reviews[0].userName}</span>
                        <div className="flex gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < reviews[0].rating ? "fill-orange-400 text-orange-400" : "text-slate-200"} />)}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm font-medium">No reviews yet. Be the first!</p>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed bottom-8 left-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2 px-6"
      >
        <ArrowLeft size={20} />
        <span className="font-bold">Go Back</span>
      </button>

      {/* Request Service Modal */}
      {
        isRequestModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
              onClick={() => !isSubmitting && setIsRequestModalOpen(false)}
            />

            <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              {isSubmitted ? (
                <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-6 animate-bounce">
                    <Check size={48} strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4">Request Sent!</h2>
                  <p className="text-slate-500 font-medium text-lg max-w-xs mx-auto">
                    {profile?.firstName} will review your request and get back to you shortly.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Modal Header */}
                  <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Request Service</h2>
                      <p className="text-slate-400 font-semibold">Booking {profile?.firstName} {profile?.lastName}</p>
                    </div>
                    <button
                      onClick={() => setIsRequestModalOpen(false)}
                      className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    <form onSubmit={handleRequestService} className="p-8 space-y-6">
                      <div>
                        <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-3">
                          Job Description
                        </label>
                        <textarea
                          required
                          placeholder="Describe the task you need help with..."
                          className="w-full min-h-[120px] p-5 rounded-3xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 font-medium resize-none"
                          value={requestText}
                          onChange={(e) => setRequestText(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-3">
                            Preferred Date
                          </label>
                          <input
                            required
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 font-medium"
                            value={requestDate}
                            onChange={(e) => setRequestDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-3">
                            Location (Place of Work)
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="Enter work location..."
                            className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 font-medium"
                            value={requestLocation}
                            onChange={(e) => setRequestLocation(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-3">
                            Preferred Time
                          </label>
                          <input
                            required
                            type="time"
                            className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 font-medium"
                            value={requestTime}
                            onChange={(e) => setRequestTime(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="p-5 rounded-3xl bg-teal-50 border border-teal-100">
                          <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Estimated Cost</p>
                          <p className="text-xl font-black text-teal-700">रू {profile?.hourlyWage || 'TBD'} / hr</p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          disabled={isSubmitting}
                          className="w-full py-5 rounded-[20px] text-lg gap-3"
                          variant="primary"
                          type="submit"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Send size={20} /> Send Service Request
                            </>
                          )}
                        </Button>
                        <p className="text-center text-xs text-slate-400 mt-4 font-bold uppercase tracking-wider">
                          No payment required until job is completed
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }
    </div>
  );
};

export default ProfessionalProfile;