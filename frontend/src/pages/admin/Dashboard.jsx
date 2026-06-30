import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { 
  Users, Scale, FileText, CheckCircle, Clock, Ban,
  TrendingUp, Calendar as CalendarIcon, DollarSign, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const AdminDashboardNew = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetching from the actual backend
      const res = await api.get('/admin/dashboard-stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Use real monthly data from backend, default to empty array if missing
  const monthlyData = stats?.monthlyData || [];

  const caseStatusData = [
    { name: 'Active', value: stats?.cases?.active || 0, color: '#3b82f6' },
    { name: 'Pending', value: stats?.cases?.pending || 0, color: '#eab308' },
    { name: 'Closed', value: stats?.cases?.closed || 0, color: '#10b981' },
  ].filter(d => d.value > 0);

  const recentActivities = [
    { id: 1, action: "New Lawyer Registration", user: "Rahul Sharma", time: "2 hours ago", type: "lawyer" },
    { id: 2, action: "Case Assigned", user: "Case #1024 to Priya Patel", time: "4 hours ago", type: "case" },
    { id: 3, action: "Payment Received", user: "₹5,000 from Client ID 843", time: "5 hours ago", type: "payment" },
    { id: 4, action: "Document Uploaded", user: "Evidence_A.pdf by Rahul", time: "1 day ago", type: "document" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
          Refresh Data
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Lawyers" 
          value={stats?.lawyers?.total || 0}
          icon={Scale} 
          trend="" 
          color="bg-blue-500" 
        />
        <DashboardCard 
          title="Total Clients" 
          value={stats?.consultations?.total || 0} // Using consultations as proxy for clients if needed, or real clients if available
          icon={Users} 
          trend="" 
          color="bg-teal-500" 
        />
        <DashboardCard 
          title="Total Cases" 
          value={stats?.cases?.total || 0}
          icon={FileText} 
          trend="" 
          color="bg-indigo-500" 
        />
        <DashboardCard 
          title="Active Cases" 
          value={stats?.cases?.active || 0}
          icon={Activity} 
          trend="" 
          color="bg-emerald-500" 
        />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Monthly Cases & Revenue</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="cases" name="Cases Filed" fill="#1E3A8A" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Case Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caseStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {caseStatusData.length > 0 ? caseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  )) : (
                    <Cell fill="#cbd5e1" />
                  )}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                {caseStatusData.length > 0 && <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITIES TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activities</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  activity.type === 'lawyer' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'case' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.user}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:shadow-md transition-all duration-300">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <div className="flex items-end gap-3 mt-2">
        <h4 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h4>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-md mb-1">{trend}</span>
        )}
      </div>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default AdminDashboardNew;
