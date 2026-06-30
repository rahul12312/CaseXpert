import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  BarChart as BarChartIcon, PieChart as PieChartIcon, 
  TrendingUp, Download, FileText, Scale
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard-stats');
      setStats(res.data.stats || null);
    } catch (error) {
      console.error("Failed to fetch report stats", error);
    } finally {
      setLoading(false);
    }
  };

  const performanceData = [
    { name: 'Jan', casesResolved: 12, revenue: 4000 },
    { name: 'Feb', casesResolved: 19, revenue: 6000 },
    { name: 'Mar', casesResolved: 15, revenue: 5000 },
    { name: 'Apr', casesResolved: 22, revenue: 8000 },
    { name: 'May', casesResolved: 28, revenue: 9500 },
    { name: 'Jun', casesResolved: 25, revenue: 8500 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Deep dive into platform metrics and performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Total Cases Overview</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.cases?.total || 0}</p>
          <p className="text-sm text-slate-500 mt-1">Lifetime platform cases</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Lawyer Network</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.lawyers?.total || 0}</p>
          <p className="text-sm text-slate-500 mt-1">Total registered legal professionals</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Total Revenue (YTD)</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">₹4,10,000</p>
          <p className="text-sm text-slate-500 mt-1">Platform commissions & fees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHARTS */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Lawyer Performance Metrics</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="casesResolved" stroke="#1E3A8A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP LAWYERS TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Lawyers by Caseload</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : stats?.topLawyers?.length > 0 ? (
              <div className="space-y-4">
                {stats.topLawyers.map((tl, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{tl.lawyer_name}</p>
                        <p className="text-xs text-slate-500">{tl.specialization || 'General Practice'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#1E3A8A] dark:text-blue-400">
                        {tl.case_count}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cases</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
