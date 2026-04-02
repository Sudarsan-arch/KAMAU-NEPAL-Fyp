import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle,
  Clock,
  X,
  Menu,
  Zap,
  Activity,
  Shield,
  Compass,
  Eye,
  Power,
  UserCheck,
  Bell,
  MessageSquare,
  Orbit,
  FileText,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Logo from '../Logo';
import { getStoredAdminUser, adminLogout } from './adminAuthService';
import * as adminService from './adminService';
import StatusBadge from './StatusBadge';
import MessageCenter from './Messagecentre';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser] = useState(getStoredAdminUser());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0
  });
  const [professionals, setProfessionals] = useState([]);
  const [error, setError] = useState(null);

  // Modal States
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDocId, setPreviewDocId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {}, 
    type: 'danger' 
  });

  const openConfirm = (config) => {
    setConfirmDialog({ ...config, isOpen: true });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'overview') {
        const [statsRes, recentRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentApplications({ limit: 5 })
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (recentRes.success) setProfessionals(recentRes.data);
      } else if (activeTab === 'requests') {
        const response = await adminService.getPendingApplications();
        if (response.success) setProfessionals(response.data);
      } else if (activeTab === 'professionals') {
        const response = await adminService.getAllProfessionalsForAdmin();
        if (response.success) setProfessionals(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (professional) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 118, 110); // Kamau Teal
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('KAMAU NEPAL', 15, 20);
    doc.setFontSize(10);
    doc.text('PROFESSIONAL REGISTRATION RECORD', 15, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 130, 20);

    // Add Profile Image if exists
    if (professional.profileImage) {
      try {
        const imgUrl = professional.profileImage.startsWith('http') 
          ? professional.profileImage 
          : `${window.location.origin}/${professional.profileImage.replace(/\\/g, '/')}`;
        
        // Asynchronously load the image to be added to PDF
        const img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.crossOrigin = 'Anonymous';
          i.onload = () => resolve(i);
          i.onerror = (e) => reject(e);
          i.src = imgUrl;
        });
        
        // Draw image frame
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(168, 5, 32, 32, 3, 3, 'F');
        // Add image
        doc.addImage(img, 'JPEG', 169, 6, 30, 30);
      } catch (err) {
        console.error('Failed to include image in PDF:', err);
      }
    }

    // Profile Section
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(14);
    doc.text('1. IDENTITY & CONTACT', 15, 55);
    
    const identityData = [
      ['Full Name', `${professional.firstName} ${professional.lastName}`],
      ['Username', `@${professional.username}`],
      ['Email Address', professional.email],
      ['Phone Number', professional.phone],
      ['Status', professional.verificationStatus.toUpperCase()]
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Field', 'Information']],
      body: identityData,
      theme: 'striped',
      headStyles: { fillColor: [20, 184, 166] },
      margin: { left: 15 }
    });

    // Service Section
    doc.setFontSize(14);
    doc.text('2. SERVICE PROPOSITION', 15, doc.lastAutoTable.finalY + 15);
    
    const serviceData = [
      ['Category', professional.serviceCategory],
      ['Hourly Wage', `रू ${professional.hourlyWage}`],
      ['Service Area', professional.serviceArea || professional.formattedAddress],
      ['Availability', professional.availability?.map(a => `${a.day}: ${a.startTime}-${a.endTime}`).join(', ') || 'Not specified']
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Field', 'Information']],
      body: serviceData,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] }, // Orange
      margin: { left: 15 }
    });

    // Geography Section
    doc.setFontSize(14);
    doc.text('3. GEOGRAPHIC PRECISION', 15, doc.lastAutoTable.finalY + 15);
    
    const geoData = [
      ['Latitude', professional.location?.coordinates?.[1] || 'N/A'],
      ['Longitude', professional.location?.coordinates?.[0] || 'N/A'],
      ['Full Address', professional.formattedAddress || 'N/A']
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Field', 'Coordinate Data']],
      body: geoData,
      theme: 'plain',
      headStyles: { fillColor: [15, 23, 42] },
      margin: { left: 15 }
    });

    // Bio Section
    doc.setFontSize(14);
    doc.text('4. PROFESSIONAL BIOGRAPHY', 15, doc.lastAutoTable.finalY + 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitBio = doc.splitTextToSize(professional.bio || 'No biography provided.', 180);
    doc.text(splitBio, 15, doc.lastAutoTable.finalY + 22);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} - Service Partner Verification Document`, 105, 285, { align: 'center' });
    }

    doc.save(`${professional.firstName}_${professional.lastName}_Application.pdf`);
  };

  const handleApprove = async (id) => {
    openConfirm({
      title: "Approve Professional",
      message: "This will grant the professional full platform access. Are you sure you want to proceed?",
      confirmText: "Approve Partner",
      onConfirm: async () => {
        try {
          const res = await adminService.approveProfessional(id);
          if (res.success) fetchDashboardData();
        } catch (err) {
          alert(err.message || 'Failed to approve');
        }
      },
      type: 'success'
    });
  };

  const handleReject = (id) => {
    const pro = professionals.find(p => p._id === id);
    setSelectedProfessional(pro);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const res = await adminService.rejectProfessional(selectedProfessional._id, rejectionReason);
      if (res.success) {
        setShowRejectionModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (pro) => {
    setSelectedProfessional(pro);
    setShowDetailsModal(true);
  };

  const handleLogout = () => {
    openConfirm({
      title: "Security Logout",
      message: "Are you sure you want to sign out of the administrative session?",
      confirmText: "Sign Out Now",
      onConfirm: () => {
        adminLogout();
        navigate('/');
      },
      type: 'danger'
    });
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Compass, badge: null },
    { id: 'requests', label: 'Verification', icon: UserCheck, badge: stats.totalPending || null },
    { id: 'professionals', label: 'Service Professionals', icon: Users, badge: null },
    { id: 'broadcast', label: 'Broadcast', icon: MessageSquare, badge: null },
  ];

  if (loading && activeTab === 'overview' && professionals.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin shadow-md"></div>
            <Zap className="w-8 h-8 text-teal-600 animate-pulse absolute top-6 left-6" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-slate-900 font-black text-sm tracking-[0.2em] uppercase">Kamau Admin</p>
            <p className="text-slate-500 text-xs font-mono animate-pulse">Synchronizing Data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden relative">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/80 backdrop-blur-2xl border-r border-slate-100 transform transition-all duration-500 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl`}>
        <div className="h-full flex flex-col p-8 relative">
          <div className="flex items-center justify-between mb-12 relative">
            <Logo className="h-10 w-auto" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"><X size={20} /></button>
          </div>

          <div className="mb-10 p-6 bg-slate-50 rounded-[32px] border border-slate-100 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 -mr-12 -mt-12 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-4 relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-100">
                {adminUser?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-slate-900 truncate leading-tight">{adminUser?.fullName || 'Super Admin'}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mt-1">Platform Manager</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 relative">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)} 
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative ${activeTab === item.id ? 'bg-white shadow-md border border-slate-100 text-teal-600' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
                >
                  <Icon size={20} className={activeTab === item.id ? 'text-teal-500 border-teal-500' : 'group-hover:text-teal-500 transition-colors'} />
                  <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                  {item.badge && <span className="ml-auto px-2 py-0.5 rounded-lg text-[10px] font-black bg-orange-100 text-orange-600 border border-orange-200">{item.badge}</span>}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-5 rounded-2xl text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 transition-all duration-300 group">
              <Power size={18} className="group-hover:scale-110 transition-transform" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-slate-100 px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-3 bg-slate-50 text-slate-600 rounded-2xl"><Menu size={22} /></button>
            <Logo className="h-8 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search professionals, requests, specific data..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400" 
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button className="relative p-3 text-slate-400 hover:text-teal-500 transition-colors bg-slate-50 rounded-2xl flex items-center justify-center">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Access Level</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">System Admin</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
                <Shield size={22} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 lg:p-14 max-w-[1600px] mx-auto space-y-12 relative">
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Platform Dashboard</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Real-time system health & analytics</p>
                  </div>
                  <div className="px-5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <Clock size={16} className="text-orange-500" />
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Total Registrations', value: stats.totalApplications, icon: Users, color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-100', tab: 'professionals' },
                    { label: 'Awaiting Verification', value: stats.totalPending, icon: Clock, color: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-100', tab: 'requests' },
                    { label: 'Verified Partners', value: stats.totalApproved, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-100', tab: 'professionals' },
                    { label: 'Declined Profiles', value: stats.totalRejected, icon: X, color: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-100', tab: 'requests' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div 
                        key={i} 
                        onClick={() => setActiveTab(stat.tab)}
                        className="relative bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:scale-[1.02] active:scale-95 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg ${stat.shadow} group-hover:rotate-6 transition-transform`}>
                            <Icon size={24} />
                          </div>
                          <div className="w-12 h-12 rounded-full border border-slate-50 bg-slate-50/50 flex items-center justify-center">
                            <Activity size={16} className="text-slate-300" />
                          </div>
                        </div>
                        <p className="text-4xl font-black text-slate-900 mb-2 relative z-10">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2">
                  <section className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/40 h-full">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                          <Activity size={24} className="text-teal-600" /> Recent Registrations
                        </h3>
                      </div>
                      <button onClick={() => setActiveTab('requests')} className="px-5 py-2.5 bg-slate-50 text-teal-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-50 transition-all">Explore All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="pb-6 pl-4">Professional</th>
                            <th className="pb-6">Specialization</th>
                            <th className="pb-6">Status</th>
                            <th className="pb-6 text-right pr-4">Profile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {professionals.length === 0 ? (
                            <tr><td colSpan={4} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No new entries detected</td></tr>
                          ) : (
                            professionals.map((p) => (
                              <tr 
                                key={p._id} 
                                onClick={() => handleViewDetails(p)}
                                className="hover:bg-teal-50/50 transition-all group cursor-pointer"
                              >
                                <td className="py-7 pl-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
                                      {p.profileImage ? (
                                        <img 
                                          src={p.profileImage.startsWith('http') ? p.profileImage : `/${p.profileImage.replace(/\\/g, '/')}`} 
                                          className="w-full h-full object-cover" 
                                          alt={p.firstName}
                                        />
                                      ) : (
                                        <Users size={24} className="text-teal-500" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-black text-slate-900 text-base">{p.firstName} {p.lastName}</p>
                                      <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mt-0.5">Partner ID: #{p._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-7">
                                  <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{p.serviceCategory}</span>
                                </td>
                                <td className="py-7"><StatusBadge status={p.verificationStatus} /></td>
                                <td className="py-7 pr-4 text-right">
                                  <button onClick={() => handleViewDetails(p)} className="p-3 text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"><Eye size={20} /></button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <div className="xl:col-span-1 space-y-8">
                  <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-8 rounded-[48px] text-white shadow-2xl shadow-teal-100 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full blur-3xl group-hover:scale-125 transition-transform"></div>
                    <div className="relative">
                      <Zap className="w-10 h-10 mb-6 text-orange-400" />
                      <h4 className="text-2xl font-black mb-3">Instant Messaging</h4>
                      <p className="text-teal-50/80 text-sm font-medium leading-relaxed mb-8">Send broadcast notifications to all registered professionals and clients in seconds.</p>
                      <button 
                        onClick={() => setActiveTab('broadcast')}
                        className="w-full py-4 bg-white text-teal-600 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1"
                      >
                        Open Message Center
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/40">
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-8 flex items-center gap-3">
                      <Compass size={16} className="text-orange-500" /> Platform Insights
                    </h4>
                    <div className="space-y-6">
                      {[
                        { label: 'Security Protocols', value: 'Optimized', icon: Shield, color: 'text-emerald-500 bg-emerald-50' },
                        { label: 'Cloud Sync', value: 'Active', icon: Orbit, color: 'text-teal-500 bg-teal-50' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className={`${item.color} p-3 rounded-2xl`}><item.icon size={18} /></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-900 uppercase">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'requests' || activeTab === 'professionals') && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-900">{activeTab === 'requests' ? 'Awaiting Verification' : 'Verified Professionals'}</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Filter and manage service partner records</p>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/40">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <th className="pb-6 pl-4">Full Identity</th>
                          <th className="pb-6">Sector</th>
                          <th className="pb-6">Status</th>
                          <th className="pb-6 text-right pr-4">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {professionals.length === 0 ? (
                           <tr><td colSpan={4} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records found for this sector</td></tr>
                        ) : (
                          professionals.map((p) => (
                            <tr 
                              key={p._id} 
                              onClick={() => handleViewDetails(p)}
                              className="hover:bg-teal-50/50 transition-all group cursor-pointer"
                            >
                              <td className="py-7 pl-4">
                                <div className="flex items-center gap-4 text-slate-900">
                                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
                                    {p.profileImage ? (
                                      <img 
                                        src={p.profileImage.startsWith('http') ? p.profileImage : `/${p.profileImage.replace(/\\/g, '/')}`} 
                                        className="w-full h-full object-cover" 
                                        alt={p.firstName} 
                                      />
                                    ) : (
                                      <Users size={24} className="text-teal-500" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-black text-base">{p.firstName} {p.lastName}</div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{p.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-7">
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{p.serviceCategory}</span>
                              </td>
                              <td className="py-7"><StatusBadge status={p.verificationStatus} /></td>
                              <td className="py-7 pr-4 text-right">
                                  {p.verificationStatus === 'pending' ? (
                                    <div className="flex justify-end gap-3">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleApprove(p._id); }} 
                                        className="p-4 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95"
                                        title="Verify Professional"
                                      >
                                        <CheckCircle size={20} />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleReject(p._id); }} 
                                        className="p-4 bg-rose-500 text-white hover:bg-rose-600 rounded-2xl transition-all shadow-lg shadow-rose-100 active:scale-95"
                                        title="Decline Profile"
                                      >
                                        <X size={20} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-end gap-3">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDownloadPDF(p); }} 
                                        className="p-4 bg-white text-slate-400 hover:text-orange-500 border border-slate-100 rounded-2xl transition-all hover:shadow-md"
                                        title="Download Application"
                                      >
                                        <Download size={20} />
                                      </button>
                                      <button onClick={() => handleViewDetails(p)} className="p-4 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-md rounded-2xl transition-all">
                                        <Eye size={20} />
                                      </button>
                                    </div>
                                  )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}
          
          {activeTab === 'broadcast' && (
            <div className="max-w-4xl mx-auto h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
               <MessageCenter />
            </div>
          )}
        </div>
      </main>

      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Professional Details Modal */}
      {showDetailsModal && selectedProfessional && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowDetailsModal(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
                  {selectedProfessional.profileImage ? (
                    <img 
                      src={selectedProfessional.profileImage.startsWith('http') ? selectedProfessional.profileImage : `/${selectedProfessional.profileImage.replace(/\\/g, '/')}`} 
                      className="w-full h-full object-cover" 
                      alt={`${selectedProfessional.firstName} ${selectedProfessional.lastName}`}
                    />
                  ) : <Users size={28} className="text-teal-500" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedProfessional.firstName} {selectedProfessional.lastName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedProfessional.verificationStatus} />
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">@{selectedProfessional.username}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownloadPDF(selectedProfessional)}
                  className="p-3 hover:bg-orange-50 rounded-2xl text-slate-400 hover:text-orange-500 transition-all border border-transparent hover:border-orange-100"
                  title="Export to PDF"
                >
                  <Download size={24} />
                </button>
                <button onClick={() => setShowDetailsModal(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-10 max-h-[70vh] overflow-y-auto space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Email</p>
                  <p className="font-bold text-slate-900">{selectedProfessional.email}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone Number</p>
                  <p className="font-bold text-slate-900">{selectedProfessional.phone}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Category</p>
                  <p className="font-bold text-slate-900 capitalize">{selectedProfessional.serviceCategory}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hourly Wage</p>
                  <p className="font-bold text-slate-900">रू {selectedProfessional.hourlyWage}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location Auditing</p>
                <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Formatted Address</p>
                    <p className="text-sm font-medium text-slate-700">{selectedProfessional.formattedAddress || selectedProfessional.serviceArea}</p>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="p-4 border-r border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Latitude</p>
                      <p className="text-sm font-mono font-bold text-teal-600">{selectedProfessional.location?.coordinates?.[1] || 'N/A'}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Longitude</p>
                      <p className="text-sm font-mono font-bold text-teal-600">{selectedProfessional.location?.coordinates?.[0] || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Professional Bio</p>
                <p className="text-slate-600 leading-relaxed text-sm italic bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  "{selectedProfessional.bio || 'No biography provided.'}"
                </p>
              </div>

              {selectedProfessional.availability && selectedProfessional.availability.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Availability</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProfessional.availability.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-orange-50/50 border border-orange-100 rounded-3xl group hover:border-orange-200 transition-all">
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-orange-100 group-hover:scale-110 transition-transform">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{slot.day}</p>
                          <p className="text-sm font-bold text-orange-600 tracking-tight">{slot.startTime} - {slot.endTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Credentials</p>
                <div className="space-y-3">
                  {selectedProfessional.verificationDocuments && selectedProfessional.verificationDocuments.length > 0 ? (
                    selectedProfessional.verificationDocuments.map((doc, idx) => {
                      const isPreviewing = previewDocId === doc._id;
                      const isImage = doc.mimetype?.startsWith('image/');
                      const docUrl = doc.path.startsWith('http') ? doc.path : `/${doc.path.replace(/\\/g, '/')}`;

                      return (
                        <div key={idx} className="space-y-2">
                          <div 
                            className={`flex items-center justify-between p-4 bg-white border ${isPreviewing ? 'border-teal-500 shadow-md' : 'border-slate-100'} rounded-2xl transition-all group`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${isPreviewing ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600'} rounded-xl flex items-center justify-center transition-colors`}>
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{doc.originalName || 'Credential Document'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.mimetype?.split('/')[1]?.toUpperCase()}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isImage && (
                                <button 
                                  onClick={() => setPreviewDocId(isPreviewing ? null : doc._id)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isPreviewing 
                                      ? 'bg-slate-900 text-white' 
                                      : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                                  }`}
                                >
                                  {isPreviewing ? 'Hide Preview' : 'View Image'}
                                </button>
                              )}
                              <a 
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                title="Open in new tab"
                              >
                                <Orbit size={16} />
                              </a>
                            </div>
                          </div>

                          {isPreviewing && isImage && (
                            <div className="relative rounded-3xl overflow-hidden border-2 border-teal-500/20 bg-slate-900 group animate-in slide-in-from-top-2 duration-300">
                              <img 
                                src={docUrl} 
                                className="w-full h-auto max-h-[500px] object-contain mx-auto" 
                                alt="Document Preview" 
                              />
                              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setPreviewDocId(null)}
                                  className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-rose-500 hover:bg-white transition-all"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No documents uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedProfessional.verificationStatus === 'pending' && (
                <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => { setShowDetailsModal(false); handleApprove(selectedProfessional._id); }}
                    className="flex-1 py-4 bg-teal-500 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all"
                  >
                    Approve Application
                  </button>
                  <button 
                    onClick={() => { setShowDetailsModal(false); handleReject(selectedProfessional._id); }}
                    className="flex-1 py-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-100 transition-all"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !isSubmitting && setShowRejectionModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Decline Registration</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Professional: {selectedProfessional?.firstName}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason for Rejection</label>
                <textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Incomplete documentation, service area not supported..."
                  className="w-full h-32 bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmRejection}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="w-full py-4 bg-rose-500 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-rose-100 hover:bg-rose-600 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
                </button>
                <button 
                  onClick={() => setShowRejectionModal(false)}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-50 text-slate-600 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 font-medium">This reason will be sent to the user's notifications.</p>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default AdminDashboard;