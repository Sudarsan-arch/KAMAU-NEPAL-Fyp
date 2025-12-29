"use client"

import { useState } from "react"
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
} from "lucide-react"

const Dashboard = ({ onProfileClick }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedJob, setSelectedJob] = useState(null)
  const [showHireForm, setShowHireForm] = useState(false)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [messageFormData, setMessageFormData] = useState({
    subject: "",
    message: "",
  })
  const [messageFormErrors, setMessageFormErrors] = useState({})
  const [hireFormData, setHireFormData] = useState({
    fullName: "",
    workDescription: "",
    timeSchedule: "",
    location: "",
  })
  const [hireFormErrors, setHireFormErrors] = useState({})

  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "👨‍💼",
    role: "Premium User",
    joinDate: "Jan 2024",
  }

  const stats = [
    {
      label: "Jobs Applied",
      value: "24",
      change: "+12%",
      icon: Briefcase,
      color: "bg-blue-500",
    },
    { label: "Connections", value: "156", change: "+8%", icon: Users, color: "bg-green-500" },
    {
      label: "Interviews",
      value: "8",
      change: "+3%",
      icon: Calendar,
      color: "bg-purple-500",
    },
    { label: "Rating", value: "4.8", change: "+0.2", icon: Star, color: "bg-yellow-500" },
  ]

  const recentJobs = [
    {
      title: "Senior React Developer",
      company: "Tech Corp",
      date: "2 days ago",
      status: "Applied",
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Frontend Engineer",
      company: "Design Studio",
      date: "1 week ago",
      status: "Interview",
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Full Stack Developer",
      company: "Startup XYZ",
      date: "2 weeks ago",
      status: "Rejected",
      color: "bg-red-100 text-red-800",
    },
    {
      title: "UI/UX Designer",
      company: "Creative Inc",
      date: "3 weeks ago",
      status: "Offer",
      color: "bg-purple-100 text-purple-800",
    },
  ]

  const recommendations = [
    {
      title: "Backend Developer",
      company: "Cloud Systems",
      salary: "$90k-$120k",
      type: "Remote",
      hourlyRate: "$75/hr",
      experience: "5+ years",
      rating: 4.9,
      location: "New York, NY",
      schedule: "Full-time",
      avatar: "👨‍💻",
    },
    {
      title: "DevOps Engineer",
      company: "Data Solutions",
      salary: "$100k-$130k",
      type: "Hybrid",
      hourlyRate: "$85/hr",
      experience: "7+ years",
      rating: 4.7,
      location: "San Francisco, CA",
      schedule: "Full-time",
      avatar: "👩‍💼",
    },
    {
      title: "Mobile Developer",
      company: "App Masters",
      salary: "$85k-$110k",
      type: "On-site",
      hourlyRate: "$70/hr",
      experience: "4+ years",
      rating: 4.8,
      location: "Austin, TX",
      schedule: "Flexible",
      avatar: "👨‍🔧",
    },
  ]

  const handleLogout = () => {
    console.log("[v0] Logging out user")
    const confirmLogout = window.confirm("Are you sure you want to log out?")

    if (confirmLogout) {
      setActiveTab("overview")
      setSelectedJob(null)
      setShowHireForm(false)
      setShowMessageForm(false)
      setSidebarOpen(false)

      alert(`Goodbye ${user.name}! You have been successfully logged out.`)
      console.log("[v0] Redirecting to login page...")
    }
  }

  const handleLogoClick = () => {
    console.log("[v0] Logo clicked - returning to dashboard overview")
    setActiveTab("overview")
    setSelectedJob(null)
    setShowHireForm(false)
    setShowMessageForm(false)
    setSidebarOpen(false)
  }

  const handleJobSelect = (job) => {
    console.log("[v0] Job selected:", job)
    setSelectedJob(job)
  }

  const handleBack = () => {
    console.log("[v0] Going back to dashboard")
    setSelectedJob(null)
  }

  const handleHireNowClick = () => {
    setShowHireForm(true)
    setHireFormErrors({})
  }

  const handleHireFormChange = (e) => {
    const { name, value } = e.target
    setHireFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (hireFormErrors[name]) {
      setHireFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateHireForm = () => {
    const errors = {}
    if (!hireFormData.fullName.trim()) errors.fullName = "Full name is required"
    if (!hireFormData.workDescription.trim()) errors.workDescription = "Work description is required"
    if (!hireFormData.timeSchedule.trim()) errors.timeSchedule = "Time schedule is required"
    if (!hireFormData.location.trim()) errors.location = "Location is required"
    return errors
  }

  const handleHireFormSubmit = (e) => {
    e.preventDefault()
    const errors = validateHireForm()

    if (Object.keys(errors).length > 0) {
      setHireFormErrors(errors)
      return
    }

    console.log("[v0] Hire form submitted:", hireFormData)
    alert(
      `Hire request sent to ${selectedJob.title} at ${selectedJob.company}!\n\nYour details:\n- Name: ${hireFormData.fullName}\n- Work: ${hireFormData.workDescription}\n- Schedule: ${hireFormData.timeSchedule}\n- Location: ${hireFormData.location}`,
    )

    setShowHireForm(false)
    setHireFormData({
      fullName: "",
      workDescription: "",
      timeSchedule: "",
      location: "",
    })
  }

  const handleCloseForm = () => {
    setShowHireForm(false)
    setHireFormData({
      fullName: "",
      workDescription: "",
      timeSchedule: "",
      location: "",
    })
    setHireFormErrors({})
  }

  const handleMessageClick = () => {
    console.log("[v0] Message button clicked")
    setShowMessageForm(true)
    setMessageFormErrors({})
  }

  const handleMessageFormChange = (e) => {
    const { name, value } = e.target
    setMessageFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (messageFormErrors[name]) {
      setMessageFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateMessageForm = () => {
    const errors = {}
    if (!messageFormData.subject.trim()) errors.subject = "Subject is required"
    if (!messageFormData.message.trim()) errors.message = "Message is required"
    return errors
  }

  const handleMessageFormSubmit = (e) => {
    e.preventDefault()
    const errors = validateMessageForm()

    if (Object.keys(errors).length > 0) {
      setMessageFormErrors(errors)
      return
    }

    console.log("[v0] Message form submitted:", messageFormData)
    alert(
      `Message sent to ${selectedJob.title} at ${selectedJob.company}!\n\nSubject: ${messageFormData.subject}\n\nYour message:\n${messageFormData.message}`,
    )

    setShowMessageForm(false)
    setMessageFormData({
      subject: "",
      message: "",
    })
  }

  const handleCloseMessageForm = () => {
    setShowMessageForm(false)
    setMessageFormData({
      subject: "",
      message: "",
    })
    setMessageFormErrors({})
  }

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
          <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h1>
                <p className="text-sm text-gray-500">{selectedJob.company}</p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-4xl">
                        {selectedJob.avatar}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Profile</h2>
                      <p className="text-gray-600 mb-4">
                        Experienced {selectedJob.title} at {selectedJob.company}
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
                        <DollarSign size={20} className="text-teal-600" />
                        <h3 className="font-semibold text-gray-900">Per Hour Rate</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedJob.hourlyRate}</p>
                      <p className="text-xs text-gray-500 mt-1">Flexible negotiation available</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={20} className="text-teal-600" />
                        <h3 className="font-semibold text-gray-900">Location</h3>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{selectedJob.location}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedJob.type} position</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Clock size={24} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Schedule</h3>
                        <p className="text-xl font-bold text-gray-900 mb-1">{selectedJob.schedule}</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>• Available immediately</p>
                          <p>• {selectedJob.type} arrangement</p>
                          <p>• Flexible hours available</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Role</h3>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      Join our growing team and work on exciting projects that make a real impact. We're looking for
                      talented professionals who are passionate about their craft.
                    </p>
                    <p>
                      This position offers competitive compensation, flexible working arrangements, and opportunities
                      for professional growth and development.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Salary Range</span>
                      <span className="font-semibold text-gray-900">{selectedJob.salary}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Work Type</span>
                      <span className="font-semibold text-gray-900">{selectedJob.type}</span>
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
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition"
                    >
                      Hire Now
                    </button>
                    <button
                      onClick={handleMessageClick}
                      className="w-full py-3 border border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      Message
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Response Time</p>
                      <p className="text-lg font-bold text-gray-900">&lt; 2 hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                      <p className="text-lg font-bold text-gray-900">98%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
                      <p className="text-lg font-bold text-gray-900">45+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showHireForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-6 text-white flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Hire {selectedJob.title}</h2>
                  <button onClick={handleCloseForm} className="text-white hover:bg-teal-700 rounded-lg p-1 transition">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleHireFormSubmit} className="p-6 space-y-4">
                  <p className="text-gray-600 text-sm">
                    Please fill in your details so the professional can understand your requirements.
                  </p>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Your Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={hireFormData.fullName}
                      onChange={handleHireFormChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                        hireFormErrors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {hireFormErrors.fullName && <p className="text-red-500 text-sm mt-1">{hireFormErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Work Description</label>
                    <textarea
                      name="workDescription"
                      value={hireFormData.workDescription}
                      onChange={handleHireFormChange}
                      placeholder="Describe the work/project details..."
                      rows={4}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition resize-none ${
                        hireFormErrors.workDescription ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {hireFormErrors.workDescription && (
                      <p className="text-red-500 text-sm mt-1">{hireFormErrors.workDescription}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Time Schedule</label>
                    <select
                      name="timeSchedule"
                      value={hireFormData.timeSchedule}
                      onChange={handleHireFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                        hireFormErrors.timeSchedule ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select a schedule...</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Flexible">Flexible</option>
                      <option value="Project-based">Project-based</option>
                      <option value="Hourly">Hourly</option>
                    </select>
                    {hireFormErrors.timeSchedule && (
                      <p className="text-red-500 text-sm mt-1">{hireFormErrors.timeSchedule}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={hireFormData.location}
                      onChange={handleHireFormChange}
                      placeholder="City, State or Remote"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                        hireFormErrors.location ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {hireFormErrors.location && <p className="text-red-500 text-sm mt-1">{hireFormErrors.location}</p>}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="flex-1 py-2 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition"
                    >
                      Send Hire Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showMessageForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-6 text-white flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Message {selectedJob.title}</h2>
                  <button
                    onClick={handleCloseMessageForm}
                    className="text-white hover:bg-teal-700 rounded-lg p-1 transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleMessageFormSubmit} className="p-6 space-y-4">
                  <p className="text-gray-600 text-sm">
                    Send a message to {selectedJob.company}. They typically respond within 2 hours.
                  </p>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={messageFormData.subject}
                      onChange={handleMessageFormChange}
                      placeholder="Inquiry about the position"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                        messageFormErrors.subject ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {messageFormErrors.subject && (
                      <p className="text-red-500 text-sm mt-1">{messageFormErrors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Your Message</label>
                    <textarea
                      name="message"
                      value={messageFormData.message}
                      onChange={handleMessageFormChange}
                      placeholder="Hi, I'm interested in learning more about this position..."
                      rows={6}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition resize-none ${
                        messageFormErrors.message ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {messageFormErrors.message && (
                      <p className="text-red-500 text-sm mt-1">{messageFormErrors.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseMessageForm}
                      className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded bg-teal-600 text-white text-sm font-bold">
                  ≡
                </div>
                <span className="text-lg font-bold text-teal-900 hidden sm:inline">Kamau Nepal</span>
              </button>
            </div>

            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div
                className="hidden md:flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
                onClick={onProfileClick}
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
                  {user.avatar}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)}></div>
          </div>
        )}

        <div
          className={`fixed lg:sticky top-0 h-screen bg-white border-r border-gray-200 w-64 z-50 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <button
            onClick={handleLogoClick}
            className="p-4 border-b border-gray-200 w-full text-left hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-teal-600 text-white text-sm font-bold">
                ≡
              </div>
              <span className="text-lg font-bold text-teal-900">Kamau Nepal</span>
            </div>
          </button>

          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === "overview" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Home size={20} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("interviews")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === "interviews" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Calendar size={20} />
              <span>Interviews</span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === "messages" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <MessageSquare size={20} />
              <span>Messages</span>
              <span className="ml-auto text-xs bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === "analytics" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <TrendingUp size={20} />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === "payments" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <CreditCard size={20} />
              <span>Payments</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === "settings" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setActiveTab("help")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === "help" ? "bg-teal-50 text-teal-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <HelpCircle size={20} />
              <span>Help</span>
            </button>
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h2>
                <div className="space-y-3">
                  {recentJobs.map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">
                          {job.company} • {job.date}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.color}`}>{job.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Activity</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase size={18} className="text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">New job application submitted</p>
                      <p className="text-sm text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Calendar size={18} className="text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Interview scheduled with Tech Corp</p>
                      <p className="text-sm text-gray-600">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users size={18} className="text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">3 new connection requests</p>
                      <p className="text-sm text-gray-600">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:opacity-80 transition"
                onClick={onProfileClick}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Views</span>
                    <span className="font-semibold text-gray-900">342</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Search Appearances</span>
                    <span className="font-semibold text-gray-900">125</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">{user.joinDate}</span>
                  </div>
                </div>
                <button
                  className="w-full mt-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                  onClick={onProfileClick}
                >
                  View Full Profile
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recommended Jobs</h2>
                <div className="space-y-4">
                  {recommendations.map((job, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 transition cursor-pointer"
                      onClick={() => handleJobSelect(job)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white">
                          {job.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                          <p className="text-xs text-gray-600">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{job.salary}</span>
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded">{job.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
