import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from 'axios';
import {
  X, Menu, Search, Bell, Zap, Compass, Target, Orbit, Eye,
  Power, SwitchCamera, Cpu, Activity, ChevronRight,
  MessageSquare, DollarSign, User, Mail, Phone, MapPin, UserCircle, ShieldCheck, HelpCircle
} from 'lucide-react';
import OptimizedImage from '../components/OptimizedImage';
import { useTranslation } from '../utils/LanguageContext';

// Components
import Logo from '../Logo';
import NotificationsMenu from '../components/NotificationsMenu';
import StatsCards from './components/StatsCards';
import RequestsList from './components/RequestsList';
import ProfessionalMessages from './components/ProfessionalMessages';
import CustomerMap from './components/CustomerMap';
import EditProfileModal from './components/EditProfileModal';

const ProfessionalDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [professionalData, setProfessionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

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

  const handleImageUpdate = async (type, file) => {
    if (!file || !professionalData?._id) return;
    
    setIsUpdatingImage(true);
    const formData = new FormData();
    formData.append(type, file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/professionals/${professionalData._id}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfessionalData(response.data.data);
        alert(`${type === 'profileImage' ? 'Profile' : 'Cover'} photo updated successfully!`);
      }
    } catch (err) {
      console.error(`Error updating ${type}:`, err);
      alert(`Failed to update ${type}`);
    } finally {
      setIsUpdatingImage(false);
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
    { id: 'overview', label: t('overview'), icon: Compass, badge: null },
    { id: 'requests', label: t('service_requests'), icon: Target, badge: stats.pendingRequests || null },
    { id: 'map', label: t('service_map'), icon: Orbit, badge: allRequests.filter(r => ['Pending', 'Confirmed', 'In Progress'].includes(r.status)).length || null },
    { id: 'messages', label: t('messages'), icon: MessageSquare, badge: 3 },
    { id: 'earnings', label: t('earnings'), icon: Orbit, badge: null },
    { id: 'profile', label: t('public_profile'), icon: Eye, badge: null },
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

  const renderMap = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CustomerMap 
        bookings={allRequests.filter(r => ['Pending', 'Confirmed', 'In Progress'].includes(r.status))} 
        professionalLocation={professionalData?.location}
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
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{t('monthly_revenue')}</p>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">रू {stats.totalEarnings.toLocaleString()}</h3>
          </div>
          <div className="flex gap-2">
            {[t('weekly'), t('monthly'), t('annual')].map(p => (
              <button key={p} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${p === t('monthly') ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>{p}</button>
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
      <div className="bg-white p-0 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Cover Image Section */}
        <div className="h-48 relative bg-slate-100 group">
          {professionalData?.coverImage ? (
            <OptimizedImage 
              src={professionalData.coverImage} 
              className="w-full h-full" 
              alt="Cover" 
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-teal-600/20 to-orange-600/20 flex items-center justify-center">
              <Compass className="text-teal-600/30 w-12 h-12" />
            </div>
          )}
          <button 
            onClick={() => document.getElementById('cover-upload').click()}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl text-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white"
            disabled={isUpdatingImage}
          >
            <SwitchCamera size={14} className="text-teal-600" /> {isUpdatingImage ? t('loading') : t('change_cover')}
          </button>
          <input 
            type="file" 
            id="cover-upload" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => handleImageUpdate('coverImage', e.target.files[0])}
          />
        </div>

        <div className="p-10 -mt-16 relative">
          <div className="flex items-end gap-8 mb-12">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-white border-4 border-white shadow-2xl overflow-hidden">
                {professionalData?.profileImage ? (
                  <OptimizedImage 
                    src={professionalData.profileImage} 
                    className="w-full h-full" 
                    alt="Profile" 
                    fallbackIcon={UserCircle}
                  />
                ) : <div className="w-full h-full flex items-center justify-center text-4xl text-teal-600 font-black">{professionalData?.firstName?.charAt(0)}</div>}
              </div>
              <button 
                onClick={() => document.getElementById('profile-upload').click()}
                className="absolute bottom-2 right-2 p-2 bg-teal-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                disabled={isUpdatingImage}
              >
                <Cpu size={16} />
              </button>
              <input 
                type="file" 
                id="profile-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageUpdate('profileImage', e.target.files[0])}
              />
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
              { label: 'Base Priority', value: (professionalData?.hourlyWage || 0) + ' / hr', icon: DollarSign },
            ].map((field, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-teal-200 transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <field.icon size={12} className="text-teal-600" /> {field.label}
                </p>
                <p className="text-sm font-black text-slate-900">{field.value}</p>
              </div>
            ))}
          </div>

          {professionalData?.verificationStatus === 'verified' ? (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="mt-12 w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-teal-600 shadow-xl transition-all active:scale-[0.98]"
            >
              {t('modify_records')}
            </button>
          ) : (
            <div className="mt-12 p-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
              <ShieldCheck size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {t('profile_editing_locked')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                {t('status')}: {professionalData?.verificationStatus || t('pending_app')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-hidden relative">
      {/* Visual background details */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-slate-200 px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"><Menu size={22} /></button>
          <Logo className="opacity-90 hover:opacity-100 transition-opacity" />
        </div>

        <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
            <input type="text" placeholder="Access  records..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/40 transition-all placeholder:text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <Bell size={24} />
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
                <OptimizedImage
                  src={professionalData.profileImage}
                  className="w-full h-full"
                  alt="Profile"
                  fallbackIcon={UserCircle}
                />
              ) : (
                professionalData?.firstName?.charAt(0) || 'P'
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/90 backdrop-blur-2xl border-r border-slate-200 transform transition-all duration-500 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl pt-16 lg:pt-0`}>
          <div className="h-full flex flex-col p-6 relative">
            <div className="flex items-center justify-between mb-10 relative lg:hidden">
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
                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{t('user_mode')}</span>
              </button>
              <button onClick={() => navigate('/help')} className="w-full flex items-center gap-4 p-4 rounded-xl text-slate-500 hover:bg-slate-50 transition-all group">
                <HelpCircle size={18} className="group-hover:text-teal-600 transition-colors" />
                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{t('help')}</span>
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 hover:bg-red-50 transition-all">
                <Power size={18} />
                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{t('disconnect_session')}</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto h-full relative scroll-smooth overflow-x-hidden">
          <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
            <header className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">
                {activeTab === 'overview' ? t('pro_overview') : menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                Kamau   &bull; Session Active
              </p>
            </header>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'map' && renderMap()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'earnings' && renderEarnings()}
            {activeTab === 'profile' && renderProfile()}
          </div>
          
          <EditProfileModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            professionalData={professionalData}
            onUpdate={(newData) => {
              setProfessionalData(newData);
              setRefetchTrigger(prev => prev + 1);
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
