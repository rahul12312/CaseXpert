import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';


const CaseTracker = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingCaseId, setDeletingCaseId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming_hearings: 0,
    pending_actions: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCases = async () => {
      setLoading(true);
      try {
        console.log("Loading cases from database...");
        let response = await api.get('/case');
        let caseList = response.data.data || response.data.cases || [];

        // Automate seeding if samples missing (Requirement 2 & 6)
        // We check < 20 because we expect 20 sample cases in the portal
        if (caseList.length < 20) {
          console.log("Portal incomplete. Syncing sample cases...");
          const seedResponse = await api.post('/case/seed');
          if (seedResponse.data.success) {
            // Re-fetch after seeding
            response = await api.get('/case');
            caseList = response.data.data || response.data.cases || [];
          }
        }

        setCases(caseList);

        // Stats calculation
        const total = caseList.length;
        const active = caseList.filter(c =>
          ['open', 'pending', 'assigned', 'in-progress', 'in_progress', 'hearing-scheduled'].includes(String(c.status).toLowerCase())
        ).length;
        const hearings = caseList.filter(c => c.next_hearing).length;

        setStats({ total, active, upcoming_hearings: hearings, pending_actions: 0 });
      } catch (error) {
        console.error("Error loading cases:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, [isAuthenticated]);

  const handleDeleteCase = async (caseId, caseTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${caseTitle}"? This cannot be undone.`)) {
      return;
    }

    setDeletingCaseId(caseId);
    try {
      // Call permanent delete API (Requirement 2 & 5)
      await api.delete(`/case/${caseId}`);

      // Update UI
      setCases(prevCases => prevCases.filter(c => c.id !== caseId));
      setStats(prev => ({
        ...prev,
        total: prev.total - 1
      }));

      // toast or alert
      alert('Case deleted permanently from database');
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Failed to delete case');
    } finally {
      setDeletingCaseId(null);
    }
  };

  // Filter Logic
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || c.case_type?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Case Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Single source of truth for your legal proceedings.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/cases/create"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-700 hover:scale-[1.02] transition-all"
          >
            + New Case
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Repository" value={stats.total} color="bg-white dark:bg-slate-900 border-l-4 border-blue-500 shadow-sm" textColor="text-blue-600" />
        <StatsCard title="Active Files" value={stats.active} color="bg-white dark:bg-slate-900 border-l-4 border-emerald-500 shadow-sm" textColor="text-emerald-600" />
        <StatsCard title="Upcoming Hearings" value={stats.upcoming_hearings} color="bg-white dark:bg-slate-900 border-l-4 border-amber-500 shadow-sm" textColor="text-amber-600" />
        <StatsCard title="Security" value="Encrypted" color="bg-white dark:bg-slate-900 border-l-4 border-violet-500 shadow-sm" textColor="text-violet-600" isText />
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="md:col-span-2 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="hearing-scheduled">Hearing Scheduled</option>
          <option value="in-progress">In Progress</option>
        </select>
        <select 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="all">All Types</option>
          <option value="property">Property</option>
          <option value="family">Family</option>
          <option value="criminal">Criminal</option>
          <option value="civil">Civil</option>
          <option value="corporate">Corporate</option>
        </select>
      </div>

      {/* Case List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Litigation Records</h2>
          <span className="bg-slate-200 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            DB Synced
          </span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Synchronizing with legal vault...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-slate-300 mb-4">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No cases found matching your criteria.</p>
              <button onClick={() => {setSearchQuery(''); setStatusFilter('all'); setTypeFilter('all');}} className="text-primary-600 font-bold mt-2 hover:underline">Clear all filters</button>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-4">Case Info</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Parties involved</th>
                  <th className="px-6 py-4">Next Hearing</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-primary-700 transition-colors">{item.title}</div>
                      <div className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">REF: {item.case_number}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="capitalize font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.case_type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase">Client</span>
                           <span className="font-semibold text-slate-700 dark:text-slate-300">{item.user_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Opponent</span>
                           <span className="font-semibold text-slate-700 dark:text-slate-300">{item.opponent_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">Opp. Lawyer</span>
                           <span className="text-slate-500 dark:text-slate-400">{item.opponent_lawyer || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {item.next_hearing ? (
                        <div className="flex items-center gap-2 text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full w-fit border border-amber-100">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(item.next_hearing).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No scheduled date</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/cases/${item.id}`}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteCase(item.id, item.title)}
                          disabled={deletingCaseId === item.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Permanent Delete"
                        >
                          {deletingCaseId === item.id ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, color, textColor, isText }) => (
  <div className={`rounded-xl p-5 ${color} transition-transform hover:scale-[1.02]`}>
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
    <p className={`mt-2 ${isText ? 'text-xl' : 'text-3xl'} font-black ${textColor}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const s = String(status).toLowerCase();
  const styles = {
    open: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    closed: 'bg-red-50 text-red-700 border-red-200',
    archived: 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300',
    'in-progress': 'bg-primary-50 text-primary-700 border-primary-200',
    'in_progress': 'bg-primary-50 text-primary-700 border-primary-200',
    'hearing-scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
    'hearing scheduled': 'bg-amber-50 text-amber-700 border-amber-200'
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-tight ${styles[s] || styles.open}`}>
      {s.replace('-', ' ')}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    low: 'text-slate-600 dark:text-slate-400',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600 font-bold'
  };
  return (
    <span className={`capitalize ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  );
};

export default CaseTracker;
