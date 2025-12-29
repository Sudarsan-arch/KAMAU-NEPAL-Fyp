import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Star, MapPin, Check } from 'lucide-react';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const services = [
    { name: "Plumber", icon: "🔧" },
    { name: "Dog Walker", icon: "🐕" },
    { name: "Cleaner", icon: "🧹" },
    { name: "Carpenter", icon: "🪵" },
    { name: "Robotics", icon: "🤖" },
    { name: "Gas Fitter", icon: "⛽" },
    { name: "Plumbing", icon: "🚰" },
    { name: "Carpentry", icon: "🛠️" },
    { name: "Car Repair", icon: "🚗" },
    { name: "Mechanic", icon: "⚙️" },
  ];

  const providers = [
    {
      name: "Dileep Sagar",
      title: "Talent Searcher",
      location: "California, USA",
      rating: 4.8,
      reviews: 127,
      verified: true,
      avatar: "🧑‍💼",
    },
    {
      name: "Aarav Patel",
      title: "Recruiter",
      location: "New York, USA",
      rating: 4.9,
      reviews: 98,
      verified: true,
      avatar: "👨‍💼",
    },
    {
      name: "Wellness",
      title: "Wellness Provider",
      location: "Texas, USA",
      rating: 4.7,
      reviews: 156,
      verified: true,
      avatar: "💪",
    },
    {
      name: "Carpenter",
      title: "Carpenter",
      location: "Florida, USA",
      rating: 4.6,
      reviews: 203,
      verified: true,
      avatar: "🪜",
    },
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handlePostJob = () => {
    console.log('Post Job clicked');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleStartHiring = () => {
    console.log('Start Hiring clicked');
  };

  // Custom Button component that matches V0
  const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-orange-400 text-white hover:bg-orange-500',
      secondary: 'bg-teal-600 text-white hover:bg-teal-700',
      ghost: 'bg-transparent text-teal-700 hover:bg-cyan-200',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    };
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3 text-xs',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-cyan-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-cyan-100 border-b border-cyan-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-teal-600 text-white text-sm font-bold">
              ≡
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/companies" className="text-xs font-medium text-teal-700 hover:text-teal-900">
              Companies
            </Link>
            <Link to="/services" className="text-xs font-medium text-teal-700 hover:text-teal-900">
              Services
            </Link>
            <Link to="/people" className="text-xs font-medium text-teal-700 hover:text-teal-900">
              People
            </Link>
            <Link to="/more" className="text-xs font-medium text-teal-700 hover:text-teal-900">
              More
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleLogin}>
              Login
            </Button>
            <Button variant="default" size="sm" onClick={handleSignUp}>
              Sign Up
            </Button>
            <Button variant="secondary" size="sm" onClick={handlePostJob}>
              Post Job
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-cyan-200 md:hidden bg-cyan-100">
            <div className="space-y-2 px-4 py-3">
              <Link to="/companies" className="block text-xs font-medium text-teal-700">
                Companies
              </Link>
              <Link to="/services" className="block text-xs font-medium text-teal-700">
                Services
              </Link>
              <Link to="/people" className="block text-xs font-medium text-teal-700">
                People
              </Link>
              <div className="flex gap-2 pt-3">
                <Button size="sm" className="flex-1" onClick={handleSignUp}>
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-cyan-100 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side - Content */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-900 mb-4 leading-tight">
                Find Employees And Service Providers Near Your City
              </h1>
              
              {/* Search Bar */}
              <div className="mt-6 mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Service Providers and Employees here"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border-2 border-white bg-white py-3 px-5 pr-12 text-sm text-gray-700 placeholder-gray-500 focus:border-teal-400 focus:outline-none"
                  />
                  <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
                </div>
              </div>

              {/* CTA Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-600">Explore Your Skills!!!</p>
                  <p className="text-xs text-gray-600 mt-1">Companies are Searching For You?</p>
                  <Button variant="secondary" className="mt-3 w-full" onClick={handleGetStarted}>
                    Get Started
                  </Button>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-teal-600">We Want To Hire You</p>
                  <p className="text-xs text-gray-600 mt-1">Find Skilled Professionals</p>
                  <Button variant="default" className="mt-3 w-full" onClick={handleStartHiring}>
                    Start Hiring
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side - Image placeholder */}
            <div className="hidden md:flex justify-center">
              <div className="w-64 h-80 rounded-lg bg-gradient-to-br from-cyan-200 to-blue-200 flex items-center justify-center text-6xl">
                👨‍🔧
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-teal-900 mb-8 text-center">Popular Services</h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {services.map((service, idx) => (
              <button
                key={idx}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-cyan-50 transition text-center"
                onClick={() => console.log(`Selected ${service.name}`)}
              >
                <div className="text-3xl sm:text-4xl">{service.icon}</div>
                <p className="text-xs sm:text-sm font-medium text-gray-700">{service.name}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="bg-cyan-100 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-teal-900 mb-8 text-center">Featured Professionals</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((provider, idx) => (
              <div key={idx} className="bg-teal-600 rounded-lg p-5 text-white shadow-md">
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    {provider.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{provider.name}</h3>
                    <p className="text-xs text-cyan-100">{provider.title}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(provider.rating) ? "fill-yellow-300 text-yellow-300" : "text-white/30"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold">{provider.rating}</span>
                  <span className="text-xs text-cyan-100">({provider.reviews})</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-xs mb-3">
                  <MapPin size={14} />
                  <span>{provider.location}</span>
                </div>

                {/* Verified Badge */}
                {provider.verified && (
                  <div className="flex items-center gap-1 text-xs mb-4 bg-white/20 rounded px-2 py-1 w-fit">
                    <Check size={12} />
                    Verified
                  </div>
                )}

                {/* Button */}
                <Button variant="default" className="w-full">
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-900 text-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs">
            <p>&copy; 2025 Kamau Nepal. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link to="/privacy" className="hover:text-cyan-300 transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-cyan-300 transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;