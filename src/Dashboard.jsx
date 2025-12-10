import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Search, Bell, User, Settings, LogOut, 
  Briefcase, Users, Calendar, Star, TrendingUp, 
  CreditCard, MessageSquare, HelpCircle, Home
} from 'lucide-react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '👨‍💼',
    role: 'Premium User',
    joinDate: 'Jan 2024',
  };

  const stats = [
    { label: 'Jobs Applied', value: '24', change: '+12%', icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Connections', value: '156', change: '+8%', icon: Users, color: 'bg-green-500' },
    { label: 'Interviews', value: '8', change: '+3%', icon: Calendar, color: 'bg-purple-500' },
    { label: 'Rating', value: '4.8', change: '+0.2', icon: Star, color: 'bg-yellow-500' },
  ];

  const recentJobs = [
    { title: 'Senior React Developer', company: 'Tech Corp', date: '2 days ago', status: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { title: 'Frontend Engineer', company: 'Design Studio', date: '1 week ago', status: 'Interview', color: 'bg-green-100 text-green-800' },
    { title: 'Full Stack Developer', company: 'Startup XYZ', date: '2 weeks ago', status: 'Rejected', color: 'bg-red-100 text-red-800' },
    { title: 'UI/UX Designer', company: 'Creative Inc', date: '3 weeks ago', status: 'Offer', color: 'bg-purple-100 text-purple-800' },
  ];

  const recommendations = [
    { title: 'Backend Developer', company: 'Cloud Systems', salary: '$90k-$120k', type: 'Remote' },
    { title: 'DevOps Engineer', company: 'Data Solutions', salary: '$100k-$130k', type: 'Hybrid' },
    { title: 'Mobile Developer', company: 'App Masters', salary: '$85k-$110k', type: 'On-site' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-teal-600 text-white text-sm font-bold">
                  ≡
                </div>
                <span className="text-lg font-bold text-teal-900 hidden sm:inline">Kamau Nepal</span>
              </div>
            </div>

            {/* Center: Search */}
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

            {/* Right: User Menu */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile Search */}
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
        {/* Sidebar - Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)}></div>
          </div>
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* User Profile */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-bold">
                {user.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'overview' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home size={20} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'jobs' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Briefcase size={20} />
              <span>My Jobs</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'messages' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MessageSquare size={20} />
              <span>Messages</span>
              <span className="ml-auto text-xs bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'billing' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CreditCard size={20} />
              <span>Billing</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'profile' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User size={20} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'settings' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === 'help' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HelpCircle size={20} />
              <span>Help & Support</span>
            </button>
          </nav>

          {/* Bottom Actions */}
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

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp size={16} />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentJobs.map((job, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-500">{job.company} • {job.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${job.color}`}>
                        {job.status}
                      </span>
                      <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Job Recommendations</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((job, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:border-teal-300 hover:shadow-sm transition">
                    <h4 className="font-medium text-gray-900 mb-2">{job.title}</h4>
                    <p className="text-sm text-gray-500 mb-3">{job.company}</p>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="font-medium text-gray-900">{job.salary}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {job.type}
                      </span>
                    </div>
                    <button className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition">
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;