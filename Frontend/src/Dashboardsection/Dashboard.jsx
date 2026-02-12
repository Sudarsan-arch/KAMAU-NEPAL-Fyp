import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  LogOut,
  Briefcase,
  Users,
  Calendar,
  Star,
  TrendingUp,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Home,
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Sparkles,
  Wrench,
  CheckCircle,
} from "lucide-react";
import Logo from "../Logo";

const Dashboard = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showHireForm, setShowHireForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  
  const [messageFormData, setMessageFormData] = useState({
    subject: "",
    message: "",
  });
  const [messageFormErrors, setMessageFormErrors] = useState({});
  
  const [hireFormData, setHireFormData] = useState({
    fullName: "",
    workDescription: "",
    timeSchedule: "",
    location: "",
  });
  const [hireFormErrors, setHireFormErrors] = useState({});

  const userName = localStorage.getItem("userName") || "Professional User";

  const user = {
    name: userName,
    email: "user@kamaunepal.com",
    role: "",
    joinDate: "Jan 2024",
  };

  const userProfileImage = localStorage.getItem("userProfileImage");

  const getInitials = (name) => {
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "UN"
    );
  };

  const stats = [
    {
      label: "Services Taken",
      value: "12",
      change: "+2",
      icon: Briefcase,
      color: "bg-blue-500",
    },
    { label: "Providers Met", value: "48", change: "+5", icon: Users, color: "bg-green-500" },
    {
      label: "Scheduled",
      value: "3",
      change: "Active",
      icon: Calendar,
      color: "bg-purple-500",
    },
    { label: "Your Rating", value: "4.9", change: "+0.1", icon: Star, color: "bg-yellow-500" },
  ];

  const recentJobs = [
    {
      title: "Senior React Developer",
      company: "Tech Corp",
      date: "2 days ago",
      status: "In Progress",
      color: "bg-blue-100 text-blue-800",
      avatar: "💻",
      rating: 4.9,
      hourlyRate: "$45/hr",
      location: "Kathmandu, Nepal",
      type: "Remote",
      schedule: "Full-time",
      experience: "5+ Years",
      salary: "$60k - $90k"
    },
    {
      title: "Frontend Engineer",
      company: "Design Studio",
      date: "1 week ago",
      status: "Scheduled",
      color: "bg-green-100 text-green-800",
      avatar: "🎨",
      rating: 4.7,
      hourlyRate: "$35/hr",
      location: "Pokhara, Nepal",
      type: "Hybrid",
      schedule: "Contract",
      experience: "3+ Years",
      salary: "$40k - $55k"
    },
    {
      title: "Full Stack Developer",
      company: "Startup XYZ",
      date: "2 weeks ago",
      status: "Completed",
      color: "bg-gray-100 text-gray-800",
      avatar: "🚀",
      rating: 4.5,
      hourlyRate: "$40/hr",
      location: "Lalitpur, Nepal",
      type: "On-site",
      schedule: "Full-time",
      experience: "4+ Years",
      salary: "$50k - $70k"
    },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      navigate("/");
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleBack = () => {
    setSelectedJob(null);
  };

  const handleHireNowClick = () => {
    setShowHireForm(true);
    setHireFormErrors({});
  };

  const handleHireFormChange = (e) => {
    const { name, value } = e.target;
    setHireFormData((prev) => ({ ...prev, [name]: value }));
    if (hireFormErrors[name]) {
      setHireFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleHireFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!hireFormData.fullName.trim()) errors.fullName = "Full name is required";
    if (!hireFormData.workDescription.trim()) errors.workDescription = "Work description is required";
    if (!hireFormData.timeSchedule.trim()) errors.timeSchedule = "Time schedule is required";
    if (!hireFormData.location.trim()) errors.location = "Location is required";

    if (Object.keys(errors).length > 0) {
      setHireFormErrors(errors);
      return;
    }

    alert(`Service request sent to ${selectedJob.title} at ${selectedJob.company}!`);
    setShowHireForm(false);
    setHireFormData({ fullName: "", workDescription: "", timeSchedule: "", location: "" });
  };

  const handleMessageClick = () => {
    setShowMessageForm(true);
    setMessageFormErrors({});
  };

  const handleMessageFormChange = (e) => {
    const { name, value } = e.target;
    setMessageFormData((prev) => ({ ...prev, [name]: value }));
    if (messageFormErrors[name]) {
      setMessageFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMessageFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!messageFormData.subject.trim()) errors.subject = "Subject is required";
    if (!messageFormData.message.trim()) errors.message = "Message is required";

    if (Object.keys(errors).length > 0) {
      setMessageFormErrors(errors);
      return;
    }

    alert(`Message sent to ${selectedJob.title} at ${selectedJob.company}!`);
    setShowMessageForm(false);
    setMessageFormData({ subject: "", message: "" });
  };

  const handleServiceTaken = () => {
    const confirmService = window.confirm(
      `Mark service "${selectedJob.title}" as taken? This will update your services taken count.`
    );
    
    if (confirmService) {
      // Update the job status to "Service Taken"
      const updatedJob = { ...selectedJob, status: "Service Taken" };
      setSelectedJob(updatedJob);
      
      // Update the recentJobs array
      const jobIndex = recentJobs.findIndex(j => j.title === selectedJob.title && j.company === selectedJob.company);
      if (jobIndex !== -1) {
        recentJobs[jobIndex].status = "Service Taken";
        recentJobs[jobIndex].color = "bg-orange-100 text-orange-800";
      }
      
      // Increment the services taken count in stats
      stats[0].value = String(parseInt(stats[0].value) + 1);
      
      // Log the action
      console.log(`Service taken: ${selectedJob.title} from ${selectedJob.company}`);
      
      alert(`✅ Service marked as taken!\nService: ${selectedJob.title}\nProvider: ${selectedJob.company}\n\nThe service has been added to your services taken count.`);
      
      // Optional: Save to localStorage for persistence
      const serviceTakenList = JSON.parse(localStorage.getItem('servicesTaken') || '[]');
      serviceTakenList.push({
        title: selectedJob.title,
        company: selectedJob.company,
        date: new Date().toLocaleDateString(),
        rating: selectedJob.rating
      });
      localStorage.setItem('servicesTaken', JSON.stringify(serviceTakenList));
    }
  };

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100">
          <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition p-2 hover:bg-orange-50 rounded-lg"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-medium">Dashboard</span>
                </button>
                <div className="h-6 w-[1px] bg-gray-300"></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{selectedJob.title}</h1>
                  <p className="text-xs text-gray-500">{selectedJob.company}</p>
                </div>
              </div>
              <div className="hidden sm:block">
                 <button onClick={handleLogoClick} className="hover:opacity-80 transition cursor-pointer">
                   <Logo />
                 </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl shadow-md">
                        {selectedJob.avatar}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Service Provider Profile</h2>
                      <p className="text-gray-600 mb-4 font-medium">
                        Professional {selectedJob.title} with Top Rating
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${i < Math.floor(selectedJob.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">{selectedJob.rating}</span>
                        <span className="text-gray-500 text-sm">(120+ reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-200">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={20} className="text-orange-600" />
                        <h3 className="font-semibold text-gray-900">Per Hour Rate</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedJob.hourlyRate}</p>
                      <p className="text-xs text-gray-500 mt-1 italic">Flexible negotiation available</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={20} className="text-orange-600" />
                        <h3 className="font-semibold text-gray-900">Coverage Area</h3>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{selectedJob.location}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedJob.type} service</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition hover:border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Clock size={24} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
                        <p className="text-xl font-bold text-gray-900 mb-1">{selectedJob.schedule}</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>• Available immediately</p>
                          <p>• {selectedJob.type} arrangement</p>
                          <p>• Flexible hours available</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition hover:border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <Briefcase size={24} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                        <p className="text-xl font-bold text-gray-900 mb-1">{selectedJob.experience}</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>• Proven track record</p>
                          <p>• Industry expertise</p>
                          <p>• Specialized skills</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Service</h3>
                  <div className="space-y-3 text-gray-700 leading-relaxed">
                    <p>
                      Professional and reliable service provider in the {selectedJob.location} area. 
                      Specializing in high-quality {selectedJob.title} work for residential and commercial clients.
                    </p>
                    <p>
                      Committed to excellence and customer satisfaction. All work comes with a satisfaction guarantee
                      and transparent pricing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 sticky top-24">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Booking</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Est. Cost</span>
                      <span className="font-semibold text-gray-900">{selectedJob.hourlyRate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Travel Fee</span>
                      <span className="font-semibold text-gray-900">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{selectedJob.rating}</span>
                      </div>
                    </div>
                    <hr className="my-4" />
                    <button
                      onClick={handleHireNowClick}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition transform active:scale-95 shadow-lg shadow-orange-200"
                    >
                      Book Now
                    </button>
                    <button
                      onClick={handleMessageClick}
                      className="w-full py-3 border border-orange-600 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      Send Message
                    </button>
                    <button
                      onClick={handleServiceTaken}
                      className={`w-full py-3 font-bold rounded-lg transition transform active:scale-95 flex items-center justify-center gap-2 ${
                        selectedJob.status === "Service Taken"
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                          : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200"
                      }`}
                    >
                      <CheckCircle size={18} />
                      {selectedJob.status === "Service Taken" ? "Service Taken ✓" : "Mark Service Taken"}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Reliability Stats</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Response Time</p>
                      <p className="text-lg font-bold text-gray-900">&lt; 2 hours</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Success Rate</p>
                      <p className="text-lg font-bold text-gray-900">98%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Services Completed</p>
                      <p className="text-lg font-bold text-gray-900">45+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Modals */}
          {showHireForm && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-6 text-white flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold leading-tight">Hire {selectedJob.title}</h2>
                    <p className="text-orange-100 text-xs mt-1">Booking for {selectedJob.location}</p>
                  </div>
                  <button onClick={() => setShowHireForm(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleHireFormSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={hireFormData.fullName}
                      onChange={handleHireFormChange}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition ${
                        hireFormErrors.fullName ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {hireFormErrors.fullName && <p className="text-red-500 text-xs mt-1">{hireFormErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Work Details</label>
                    <textarea
                      name="workDescription"
                      value={hireFormData.workDescription}
                      onChange={handleHireFormChange}
                      placeholder="Tell us what needs to be done..."
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition resize-none ${
                        hireFormErrors.workDescription ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {hireFormErrors.workDescription && (
                      <p className="text-red-500 text-xs mt-1">{hireFormErrors.workDescription}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-[10px]">Preferred Time</label>
                      <select
                        name="timeSchedule"
                        value={hireFormData.timeSchedule}
                        onChange={handleHireFormChange}
                        className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white text-sm ${
                          hireFormErrors.timeSchedule ? "border-red-500" : "border-gray-200"
                        }`}
                      >
                        <option value="">Choose...</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-[10px]">Service Area</label>
                      <input
                        type="text"
                        name="location"
                        value={hireFormData.location}
                        onChange={handleHireFormChange}
                        placeholder="e.g. Kathmandu"
                        className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm ${
                          hireFormErrors.location ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowHireForm(false)}
                      className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition active:scale-95"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showMessageForm && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">{selectedJob.avatar}</div>
                     <div>
                       <h2 className="font-bold text-gray-900">Message {selectedJob.title}</h2>
                       <p className="text-xs text-gray-500">Usually replies in &lt; 2h</p>
                     </div>
                  </div>
                  <button onClick={() => setShowMessageForm(false)} className="text-gray-400 hover:text-gray-600 p-2 transition">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleMessageFormSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={messageFormData.subject}
                      onChange={handleMessageFormChange}
                      placeholder="Service Inquiry"
                      className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition ${
                        messageFormErrors.subject ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
                    <textarea
                      name="message"
                      value={messageFormData.message}
                      onChange={handleMessageFormChange}
                      placeholder="Hi, I need help with..."
                      rows={5}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none ${
                        messageFormErrors.message ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition"
                  >
                    Send Direct Message
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={handleLogoClick}
                className="hover:opacity-80 transition cursor-pointer"
              >
                <Logo />
              </button>
            </div>

            <div className="flex-1 max-w-xl mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Find services near you (cleaning, plumbing, etc.)..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

              <div
                className="flex items-center gap-3 cursor-pointer p-1 pr-3 hover:bg-gray-50 rounded-full transition group"
                onClick={() => navigate('/user-profile')}
              >
                <div className="h-9 w-9 rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition">
                  {userProfileImage ? (
                    <img src={userProfileImage} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold">
                      {getInitials(user.name)}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none mb-0.5">{user.name}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          </div>
        )}

        <aside
          className={`fixed lg:sticky top-[61px] h-[calc(100vh-61px)] bg-white border-r border-gray-200 w-64 z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <nav className="p-4 space-y-1 flex flex-col h-full">
            <div className="space-y-1">
              {[
                { id: "overview", label: "Dashboard", icon: Home },
                { id: "bookings", label: "My Bookings", icon: Calendar },
                { id: "messages", label: "Messages", icon: MessageSquare, badge: 3 },
                { id: "activity", label: "History", icon: TrendingUp },
                { id: "payments", label: "Payments", icon: CreditCard },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    activeTab === item.id 
                      ? "bg-orange-50 text-orange-600 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={20} className={activeTab === item.id ? "text-orange-600" : "text-gray-400"} />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] bg-red-500 text-white font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Support & Admin</p>
               {[
                 { id: "settings", label: "Settings", icon: Settings },
                 { id: "help", label: "Help Center", icon: HelpCircle },
               ].map((item) => (
                 <button
                   key={item.id}
                   onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                     activeTab === item.id ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-50"
                   }`}
                 >
                   <item.icon size={20} className="text-gray-400" />
                   <span className="text-sm">{item.label}</span>
                 </button>
               ))}
            </div>

            <div className="mt-auto pb-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-semibold"
              >
                <LogOut size={20} />
                <span className="text-sm">Log Out</span>
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <header className="mb-8">
             <h1 className="text-3xl font-bold text-gray-900">Namaste, {user.name}</h1>
             <p className="text-gray-500">Need a hand? Explore professional services in your area.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-2xl shadow-inner`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{stat.change}</span>
                      <span className="text-[10px] text-gray-400 mt-1">Status</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Ongoing Services</h2>
                  <button className="text-sm font-bold text-orange-600 hover:underline transition">Manage Bookings</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentJobs.map((job, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-6 hover:bg-orange-50/30 transition group cursor-pointer"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                          {job.avatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition">{job.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                             <span className="font-medium">{job.company}</span>
                             <span>•</span>
                             <span>{job.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.color}`}>
                          {job.status}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                           <Star size={12} className="fill-current" />
                           {job.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Live Activity</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 relative">
                      <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                        <Sparkles size={18} className="text-green-600" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Service Taken: House Cleaning</p>
                      <p className="text-sm text-gray-500">Service provided by <span className="text-orange-600 font-semibold">Nepal Cleaners Co.</span></p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">3 days ago</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 relative">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Wrench size={18} className="text-blue-600" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">New Booking Request Confirmed</p>
                      <p className="text-sm text-gray-500">Plumbing repair scheduled with <span className="text-orange-600 font-semibold">Expert Fixers</span>.</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 relative">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <CheckCircle size={18} className="text-orange-600" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-orange-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Payment Verified</p>
                      <p className="text-sm text-gray-500">Your payment for last week's gardening service was processed.</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Just Now</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Schedule</h3>
                 <div className="space-y-4">
                    <div className="p-4 border border-orange-100 bg-orange-50/30 rounded-2xl">
                       <p className="text-xs font-bold text-orange-600 uppercase mb-1">Today @ 4:00 PM</p>
                       <p className="font-bold text-gray-900">AC Maintenance</p>
                       <p className="text-xs text-gray-500">Technician: Samundra K.</p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-2xl">
                       <p className="text-xs font-bold text-gray-400 uppercase mb-1">Saturday @ 10:00 AM</p>
                       <p className="font-bold text-gray-900">Carpentry Works</p>
                       <p className="text-xs text-gray-500">Wardrobe Repair</p>
                    </div>
                 </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;