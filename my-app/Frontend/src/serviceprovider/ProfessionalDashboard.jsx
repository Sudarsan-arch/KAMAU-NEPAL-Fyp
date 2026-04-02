import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from 'axios';
import {
  X, Menu, Search, Bell, Zap, Compass, Target, Orbit, Eye,
  Power, SwitchCamera, Cpu, Activity, ChevronRight,
  MessageSquare, DollarSign, User, Mail, Phone, MapPin
} from 'lucide-react';

// Components
import Logo from '../Logo';
import NotificationsMenu from '../components/NotificationsMenu';
import StatsCards from './components/StatsCards';
import RequestsList from './components/RequestsList';
import ProfessionalMessages from './components/ProfessionalMessages';

const ProfessionalDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [professionalData, setProfessionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedJobs: 0,
    totalEarnings: 0,
    rating: 0,
    totalReviews: 0
  });
  const [allRequests, setAllRequests] = useState([]);

  // Memoized fetch function for real-time updates
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const profileResponse = await axios.get('/api/professionals/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.data.success) {
        const proData = profileResponse.data.data;
        setProfessionalData(proData);
        localStorage.setItem('professionalId', proData._id);

        const [statsRes, bookingsRes] = await Promise.all([
          axios.get(`/api/bookings/professional/${proData._id}/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/bookings/professional/${proData._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (bookingsRes.data.success) setAllRequests(bookingsRes.data.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refetchTrigger]);

  const handleBookingAction = async (bookingId, newStatus, notes = "") => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/bookings/${bookingId}`, {
        status: newStatus,
        notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Trigger instant refresh
        setRefetchTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const handleDownloadPDF = (request) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 118, 110); // Kamau Teal
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('KAMAU NEPAL', 15, 20);
    doc.setFontSize(10);
    doc.text('CUSTOMER SERVICE RECORD', 15, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 160, 28);

    // Customer Information Section
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(14);
    doc.text('1. CUSTOMER IDENTITY & CONTACT', 15, 55);
    
    const customerData = [
      ['Full Name', request.fullName || 'N/A'],
      ['Email Address', request.userId?.email || 'N/A'],
      ['Phone Number', request.userId?.phone || 'N/A'],
      ['Service Location', request.location || 'N/A'],
      ['Booking Status', request.status.toUpperCase()]
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Field', 'Information']],
      body: customerData,
      theme: 'striped',
      headStyles: { fillColor: [20, 184, 166] },
      margin: { left: 15 }
    });

    // Service Description Section
    doc.setFontSize(14);
    doc.text('2. SERVICE DETAILS', 15, doc.lastAutoTable.finalY + 15);
    
    const serviceData = [
      ['Service Category', request.serviceTitle || 'N/A'],
      ['Work Description', request.workDescription || 'N/A'],
      ['Scheduled Date', new Date(request.bookingDate).toLocaleDateString()],
      ['Time Slot', request.timeSchedule || 'N/A'],
      ['Service Fee', request.totalCost || 'N/A']
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Field', 'Information']],
      body: serviceData,
      theme: 'striped',
      headStyles: { fillColor: [45, 212, 191] },
      margin: { left: 15 },
      columnStyles: {
        1: { cellWidth: 120 } // Give more space to description
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Kamau Nepal Service Platform - Confidential Document - Page ${i} of ${pageCount}`,
        15,
        285
      );
    }

    doc.save(`Customer_Record_${request.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Compass, badge: null },
    { id: 'requests', label: 'Service Requests', icon: Target, badge: stats.pendingRequests || null },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
    { id: 'earnings', label: 'Earnings', icon: Orbit, badge: null },
    { id: 'profile', label: 'Public Profile', icon: Eye, badge: null },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin shadow-md"></div>
          <Zap className="w-8 h-8 text-teal-600 animate-pulse absolute top-6" />
          <p className="text-slate-500 text-xs font-mono animate-pulse">Synchronizing Data...</p>
        </div>
      </div>
    );
  }

  // --- Render Sections ---

  const renderOverview = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <StatsCards stats={stats} />

      <div>
        <RequestsList
          title="Recent Activity"
          requests={allRequests.filter(r => r.status === 'Pending').slice(0, 3)}
          onAction={handleBookingAction}
          onDownloadPDF={handleDownloadPDF}
          loading={false}
          error={null}
        />
        {allRequests.filter(r => r.status === 'Pending').length > 3 && (
          <button
            onClick={() => setActiveTab('requests')}
            className="mt-6 w-full py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-teal-600 hover:border-teal-100 hover:bg-teal-50/30 transition-all group"
          >
            View All Pending Missions <ChevronRight size={14} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <RequestsList
        title="Command Center: Service Requests"
        requests={allRequests}
        onAction={handleBookingAction}
        onDownloadPDF={handleDownloadPDF}
        loading={false}
        error={null}
      />
    </div>
  );

  const renderMessages = () => (
    <ProfessionalMessages />
  );

  const renderEarnings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Monthly Revenue</p>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">रू {stats.totalEarnings.toLocaleString()}</h3>
          </div>
          <div className="flex gap-2">
            {['Weekly', 'Monthly', 'Annual'].map(p => (
              <button key={p} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${p === 'Monthly' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Placeholder Chart */}
        <div className="h-64 flex items-end gap-3 px-4">
          {[40, 70, 45, 90, 65, 85, 100, 75, 55, 90, 110, 95].map((h, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-xl group relative cursor-pointer hover:scale-105 transition-transform" style={{ height: `${h}%` }}>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">रू {(h * 100).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Jan</span><span>Jul</span><span>Dec</span>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-8 mb-12">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[40px] bg-slate-50 border-4 border-white shadow-xl overflow-hidden">
              {professionalData?.profileImage ? (
                <img src={professionalData.profileImage.startsWith('data:') ? professionalData.profileImage : `/${professionalData.profileImage.replace(/\\/g, '/')}`} className="w-full h-full object-cover" alt="Profile" />
              ) : <div className="w-full h-full flex items-center justify-center text-4xl text-teal-600 font-black">{professionalData?.firstName?.charAt(0)}</div>}
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-teal-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><Cpu size={16} /></button>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900">{professionalData?.firstName} {professionalData?.lastName}</h3>
            <p className="text-teal-600 font-bold uppercase tracking-widest text-xs mt-1">{professionalData?.serviceCategory} Specialist</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><MapPin size={14} className="text-rose-500" /> {professionalData?.serviceArea}</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Activity size={14} className="text-emerald-500" /> {professionalData?.verificationStatus}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: 'Full Identity', value: `${professionalData?.firstName} ${professionalData?.lastName}`, icon: User },
            { label: 'Communication Link', value: 'Verified Secure Email', icon: Mail },
            { label: 'Contact Frequency', value: 'High Performance', icon: Phone },
            { label: 'Base Priority', value: professionalData?.hourlyWage + ' / hr', icon: DollarSign },
          ].map((field, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-teal-200 transition-all">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <field.icon size={12} className="text-teal-600" /> {field.label}
              </p>
              <p className="text-sm font-black text-slate-900">{field.value}</p>
            </div>
          ))}
        </div>

        <button className="mt-12 w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-teal-600 shadow-xl transition-all active:scale-[0.98]">
          Synchronize Neural Profile
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex overflow-hidden relative">
      {/* Visual background details */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/90 backdrop-blur-2xl border-r border-slate-200 transform transition-all duration-500 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl`}>
        <div className="h-full flex flex-col p-6 relative">
          <div className="flex items-center justify-between mb-10 relative">
            <Logo className="opacity-90 hover:opacity-100 transition-opacity" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
          </div>

          <nav className="flex-1 space-y-2 relative">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id ? 'text-teal-700 bg-teal-50 shadow-sm border border-teal-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                <item.icon size={20} className={activeTab === item.id ? 'text-teal-600' : 'group-hover:text-teal-600 transition-colors'} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                {item.badge && <span className="ml-auto px-2 py-0.5 rounded-lg text-[10px] font-black bg-teal-100 text-teal-700">{item.badge}</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-6 border-t border-slate-100 relative">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all border border-orange-100 group">
              <SwitchCamera size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Portal: User Mode</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 hover:bg-red-50 transition-all">
              <Power size={18} />
              <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Disconnect Session</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen relative scroll-smooth">
        <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"><Menu size={22} /></button>
            <Logo className="scale-75" />
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
              <input type="text" placeholder="Access neural records..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 transition-all placeholder:text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <Bell size={24} />
                {/* Visual red dot for any notifications can be added manually or calculated in the menu */}
              </button>
              <NotificationsMenu
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-black text-lg overflow-hidden shadow-sm shadow-teal-100">
                {professionalData?.profileImage ? (
                  <img
                    src={professionalData.profileImage.startsWith('data:') ? professionalData.profileImage : `/${professionalData.profileImage.replace(/\\/g, '/')}`}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  professionalData?.firstName?.charAt(0) || 'P'
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
          <header className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">
              {activeTab === 'overview' ? 'Interface Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Kamau Neural Network &bull; Session Active
            </p>
          </header>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'requests' && renderRequests()}
          {activeTab === 'messages' && renderMessages()}
          {activeTab === 'earnings' && renderEarnings()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
