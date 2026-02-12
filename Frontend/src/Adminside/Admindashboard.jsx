import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { SERVICE_CATEGORIES } from '../constants';
import StatusBadge from './StatusBadge';
import * as adminService from '../adminService';

const AdminDashboard = ({ onViewAll }) => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0
  });
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats and recent applications in parallel
      const [statsData, recentData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentApplications({ limit: 10 })
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (recentData.success) {
        setProfessionals(recentData.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  const pieData = [
    { name: 'Pending', value: stats.totalPending, color: '#f59e0b' },
    { name: 'Approved', value: stats.totalApproved, color: '#0d9488' },
    { name: 'Rejected', value: stats.totalRejected, color: '#e11d48' },
  ];

  const categoryDistribution = professionals.reduce((acc, p) => {
    const cat = SERVICE_CATEGORIES[p.serviceCategory] || p.serviceCategory;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(categoryDistribution).map(key => ({
    name: key.split(' ')[1] || key,
    count: categoryDistribution[key]
  }));

  const recentApps = professionals
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Applications', value: stats.totalApplications, icon: <Users />, color: 'bg-blue-500' },
          { label: 'Pending Review', value: stats.totalPending, icon: <Clock />, color: 'bg-amber-500' },
          { label: 'Approved Pros', value: stats.totalApproved, icon: <CheckCircle />, color: 'bg-teal-500' },
          { label: 'Rejected Cases', value: stats.totalRejected, icon: <XCircle />, color: 'bg-rose-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${item.color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-${item.color.split('-')[1]}-100`}>
                {item.icon}
              </div>
              <span className="text-xs font-black text-slate-300 group-hover:text-slate-400 transition-colors uppercase tracking-widest">Live</span>
            </div>
            <p className="text-2xl font-black text-slate-900 mb-1">{item.value}</p>
            <p className="text-sm font-bold text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm h-[400px]">
            <h3 className="text-lg font-black text-slate-900 mb-6">Application Trends by Category</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Distribution */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm h-[400px]">
          <h3 className="text-lg font-black text-slate-900 mb-6">Status Distribution</h3>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{((item.value / stats.totalApplications) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">Recent Submissions</h3>
            <p className="text-sm font-medium text-slate-500">The latest professionals waiting for your approval</p>
          </div>
          <button 
            onClick={onViewAll}
            className="flex items-center gap-2 text-orange-500 font-bold hover:underline transition-all"
          >
            View all applications <ArrowRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                <th className="pb-4 pl-4 font-black">Professional</th>
                <th className="pb-4 font-black">Category</th>
                <th className="pb-4 font-black">Wage</th>
                <th className="pb-4 font-black">Status</th>
                <th className="pb-4 text-right pr-4 font-black">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    Loading recent applications...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : professionals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No applications yet
                  </td>
                </tr>
              ) : (
                professionals.map((p) => (
                  <tr key={p._id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={onViewAll}>
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <img src={p.profileImage || ''} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt={p.firstName} />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-slate-400 font-medium">@{p.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-slate-600 text-sm">
                      {SERVICE_CATEGORIES?.[p.serviceCategory] || p.serviceCategory}
                    </td>
                    <td className="py-4 font-black text-slate-900 text-sm">रु {p.hourlyWage}/hr</td>
                    <td className="py-4">
                      <StatusBadge status={p.verificationStatus} />
                    </td>
                    <td className="py-4 text-right pr-4 font-medium text-slate-400 text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
