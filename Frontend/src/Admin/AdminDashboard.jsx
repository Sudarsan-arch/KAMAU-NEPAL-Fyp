import React, { useState, useMemo } from 'react';
import Badge from './Badge';
import RequestDetailModal from './RequestDetailModal';

const RequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED'
};

const MOCK_REQUESTS = [
  {
    id: '1',
    fullName: 'Alexander Wright',
    email: 'alex.wright@example.com',
    serviceCategory: 'Interior Design',
    yearsOfExperience: 8,
    hourlyRate: 85,
    locationAddress: 'San Francisco, CA',
    lat: 37.7749,
    lng: -122.4194,
    bio: 'Award-winning designer with a focus on sustainable residential spaces. I have worked on over 50 large-scale renovation projects in the last 5 years.',
    portfolioUrl: 'https://portfolio.com/alexwright',
    status: RequestStatus.PENDING,
    appliedDate: '2024-05-10',
    avatarUrl: 'https://picsum.photos/seed/alex/200'
  },
  {
    id: '2',
    fullName: 'Elena Rodriguez',
    email: 'elena.rod@example.com',
    serviceCategory: 'Plumbing Expert',
    yearsOfExperience: 12,
    hourlyRate: 65,
    locationAddress: 'Austin, TX',
    lat: 30.2672,
    lng: -97.7431,
    bio: 'Master plumber with extensive commercial experience. Certified for high-pressure systems and emergency repairs.',
    portfolioUrl: 'https://portfolio.com/elena',
    status: RequestStatus.PENDING,
    appliedDate: '2024-05-11',
    avatarUrl: 'https://picsum.photos/seed/elena/200'
  },
  {
    id: '3',
    fullName: 'Marcus Thorne',
    email: 'm.thorne@example.com',
    serviceCategory: 'HVAC Specialist',
    yearsOfExperience: 4,
    hourlyRate: 50,
    locationAddress: 'Seattle, WA',
    lat: 47.6062,
    lng: -122.3321,
    bio: 'Dedicated HVAC technician specializing in smart home integration and energy-efficient systems.',
    portfolioUrl: 'https://portfolio.com/marcus',
    status: RequestStatus.PENDING,
    appliedDate: '2024-05-12',
    avatarUrl: 'https://picsum.photos/seed/marcus/200'
  }
];

const AdminDashboard = () => {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [activeTab, setActiveTab] = useState(RequestStatus.PENDING);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const stats = useMemo(() => ({
    pending: requests.filter(r => r.status === RequestStatus.PENDING).length,
    approved: requests.filter(r => r.status === RequestStatus.APPROVED).length,
    declined: requests.filter(r => r.status === RequestStatus.DECLINED).length,
  }), [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesTab = activeTab === 'ALL' || req.status === activeTab;
      const matchesSearch = req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           req.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [requests, activeTab, searchTerm]);

  const handleStatusUpdate = (id, newStatus) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
    setSelectedRequest(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
      {/* Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Incoming Requests</p>
            <p className="text-4xl font-black text-black">{stats.pending}</p>
          </div>
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Approved Providers</p>
            <p className="text-4xl font-black text-black">{stats.approved}</p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>

        <div className="bg-black p-8 rounded-[2rem] shadow-xl text-white flex justify-between items-center group">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Network</p>
            <p className="text-4xl font-black">{requests.length}</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <nav className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
            {['PENDING', 'APPROVED', 'DECLINED', 'ALL'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="relative w-full md:w-80">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Filter by name or service..." 
              className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-black transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Request Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRequests.map(req => (
            <div 
              key={req.id}
              className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col relative overflow-hidden"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[4rem] -z-10 group-hover:bg-indigo-50 transition-colors"></div>

              <div className="flex justify-between items-start mb-6">
                <img src={req.avatarUrl} alt={req.fullName} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md" />
                <Badge status={req.status} />
              </div>

              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-black text-gray-900 leading-tight truncate">{req.fullName}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-indigo-600 font-bold text-sm">{req.serviceCategory}</p>
                  <p className="text-emerald-600 font-black text-lg">${req.hourlyRate}/hr</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-xs text-gray-500 font-medium line-clamp-2">
                "{req.bio}"
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Base</span>
                  <span className="text-xs font-bold text-gray-700">{req.locationAddress}</span>
                </div>
                <button 
                  onClick={() => setSelectedRequest(req)}
                  className="px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
          
          {filteredRequests.length === 0 && (
            <div className="col-span-full py-40 flex flex-col items-center justify-center text-gray-300">
              <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p className="text-lg font-black uppercase tracking-[0.2em]">Void: No matching records</p>
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <RequestDetailModal 
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAction={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default AdminDashboard;