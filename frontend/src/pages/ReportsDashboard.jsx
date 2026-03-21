import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import reportsService from '../services/reportsService.js';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_COLORS = {
  open: '#0f766e',
  in_progress: '#2563eb',
  hearing_scheduled: '#d97706',
  closed: '#16a34a',
};

const ReportsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [overview, setOverview] = useState(null);
  const [statusSummary, setStatusSummary] = useState(null);
  const [caseHistory, setCaseHistory] = useState([]);
  const [lawyerPerformance, setLawyerPerformance] = useState([]);
  const [topLawyers, setTopLawyers] = useState([]);
  const [userActivity, setUserActivity] = useState([]);

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    lawyer_id: '',
    case_type: '',
    priority: '',
  });
  const [customReport, setCustomReport] = useState([]);
  const [runningReport, setRunningReport] = useState(false);

  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);
  const [loadingCaseDetails, setLoadingCaseDetails] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.user_type === 'admin';

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [overviewRes, statusRes, historyRes, activityRes, lawyerPerfRes, topLawyersRes] = await Promise.all([
          reportsService.getOverview().catch(() => null),
          reportsService.getCasesByStatus().catch(() => null),
          reportsService.getCaseHistory().catch(() => null),
          user ? reportsService.getUserActivity(user.id).catch(() => null) : Promise.resolve(null),
          isAdmin ? reportsService.getLawyerPerformance().catch(() => null) : Promise.resolve(null),
          isAdmin ? reportsService.getTopLawyers().catch(() => null) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        setOverview(overviewRes?.data || null);
        setStatusSummary(statusRes?.data || null);
        setCaseHistory(historyRes?.data || []);
        setUserActivity(activityRes?.data || []);
        setLawyerPerformance(lawyerPerfRes?.data || []);
        setTopLawyers(topLawyersRes?.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load reports data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, isAdmin]);

  const statusChartData = useMemo(() => {
    if (!statusSummary) return [];
    return [
      { status: 'Open', key: 'open', value: statusSummary.open || 0 },
      { status: 'In progress', key: 'in_progress', value: statusSummary.in_progress || 0 },
      { status: 'Hearing scheduled', key: 'hearing_scheduled', value: statusSummary.hearing_scheduled || 0 },
      { status: 'Closed', key: 'closed', value: statusSummary.closed || 0 },
    ];
  }, [statusSummary]);

  const monthlyCasesData = useMemo(() => {
    if (!Array.isArray(caseHistory) || caseHistory.length === 0) return [];
    const byMonth = {};
    caseHistory.forEach(c => {
      if (!c.created_at) return;
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, count]) => ({ month, count }));
  }, [caseHistory]);

  const activityChartData = useMemo(() => {
    if (!userActivity || userActivity.length === 0) return [];

    // Generate last 30 days keys
    const dataMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dataMap[key] = 0;
    }

    userActivity.forEach(a => {
      if (a.timestamp) {
        const day = a.timestamp.split('T')[0];
        if (dataMap[day] !== undefined) {
          dataMap[day]++;
        }
      }
    });

    return Object.entries(dataMap).map(([date, count]) => ({
      date: date.substring(5), // Remove Year for display
      count
    }));
  }, [userActivity]);

  const activeTableRows = customReport.length ? customReport : caseHistory;

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRunReport = async e => {
    e.preventDefault();
    setRunningReport(true);
    try {
      const res = await reportsService.runCustomReport(filters);
      setCustomReport(res.data || []);
    } catch (err) {
      setCustomReport([]);
    } finally {
      setRunningReport(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ date_from: '', date_to: '', status: '', lawyer_id: '', case_type: '', priority: '' });
    setCustomReport([]);
  };

  const handleSelectCase = async row => {
    if (!row?.id) return;
    setSelectedCaseId(row.id);
    setLoadingCaseDetails(true);
    setSelectedCaseDetails(null);
    try {
      const [progressRes, docsRes] = await Promise.all([
        reportsService.getCaseProgress(row.id),
        reportsService.getDocumentsReport(row.id),
      ]);
      setSelectedCaseDetails({
        case: progressRes?.data?.case,
        metrics: progressRes?.data?.metrics,
        timeline: progressRes?.data?.timeline || [],
        updates: progressRes?.data?.updates || [],
        activities: progressRes?.data?.activities || [],
        documents: docsRes?.data?.documents || [],
      });
    } catch (err) {
      setSelectedCaseDetails(null);
    } finally {
      setLoadingCaseDetails(false);
    }
  };

  const handleDownloadCaseReport = async row => {
    if (!row?.id) return;
    try {
      const res = await reportsService.downloadCaseReport(row.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `case-report-${row.case_number || row.id}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Ignore for now; toast system not wired here
    }
  };

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="mt-2 max-w-md text-xs text-slate-500">
          Sign in to access advanced reports and analytics.
        </p>
      </div>
    );
  }

  if (user.role === 'user') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center p-8 bg-slate-50 m-4 rounded-3xl border border-dotted border-slate-300">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-3xl">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          The Advanced Reports feature is available only for Lawyers and Administrators.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          If you believe this is an error, please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">Advanced reports</h1>
        <p className="text-xs text-slate-500">
          Explore case trends, lawyer performance, user activity, and detailed case timelines. Global
          analytics are restricted to administrators; individual users see only data for their own
          matters.
        </p>
      </header>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
          Loading report data…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Overview cards */}
      {overview && (
        <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Total cases</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{overview.total_cases}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Active</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">{overview.active_cases}</p>
            <p className="mt-1 text-[11px] text-slate-500">Pending & in-progress matters</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Closed</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{overview.closed_cases}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">New this month</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{overview.new_cases_this_month}</p>
          </div>
        </section>
      )}

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Cases by status</h2>
          <p className="text-[11px] text-slate-500">Snapshot of caseload grouped by current status.</p>
          <div className="mt-2 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" fontSize={10} />
                <YAxis allowDecimals={false} fontSize={10} />
                <Tooltip formatter={value => [value, 'Cases']} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="value" name="Cases">
                  {statusChartData.map((entry, index) => (
                    <Cell
                      // eslint-disable-next-line react/no-array-index-key
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.key] || '#4b5563'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Cases opened over time</h2>
          <p className="text-[11px] text-slate-500">Based on case creation date for recent matters.</p>
          <div className="mt-2 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyCasesData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={10} />
                <YAxis allowDecimals={false} fontSize={10} />
                <Tooltip formatter={value => [value, 'Cases']} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="count" name="Cases" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Case reports table & filters */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Case reports</h2>
              <p className="text-[11px] text-slate-500">
                Filter cases by status, lawyer, date range, and priority. Select a row to view a detailed
                timeline and metrics.
              </p>
            </div>
          </div>
          <form
            onSubmit={handleRunReport}
            className="grid gap-2 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 md:grid-cols-3"
          >
            <div className="space-y-1">
              <label className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Date from
              </label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Date to
              </label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In progress</option>
                <option value="on_hold">On hold</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Lawyer ID
              </label>
              <input
                type="number"
                name="lawyer_id"
                value={filters.lawyer_id}
                onChange={handleFilterChange}
                placeholder="Optional"
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Case type
              </label>
              <input
                type="text"
                name="case_type"
                value={filters.case_type}
                onChange={handleFilterChange}
                placeholder="Civil, criminal…"
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Priority
              </label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex items-end gap-2 md:col-span-3 md:justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={runningReport}
                className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {runningReport ? 'Running…' : 'Run report'}
              </button>
            </div>
          </form>

          <div className="max-h-80 overflow-auto rounded-lg border border-slate-100">
            <table className="min-w-full border-separate border-spacing-0 text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="sticky top-0 border-b border-slate-200 px-3 py-2 font-medium">Case</th>
                  <th className="sticky top-0 border-b border-slate-200 px-3 py-2 font-medium">Status</th>
                  <th className="sticky top-0 border-b border-slate-200 px-3 py-2 font-medium">Priority</th>
                  <th className="sticky top-0 border-b border-slate-200 px-3 py-2 font-medium">Created</th>
                  <th className="sticky top-0 border-b border-slate-200 px-3 py-2 font-medium">Updates</th>
                  <th className="sticky top-0 border-b border-slate-200 px-3 py-2 font-medium">Documents</th>
                  <th className="sticky top-0 border-b border-slate-200 px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {activeTableRows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-center text-[11px] text-slate-400" colSpan={7}>
                      No cases found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  activeTableRows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium text-slate-800">{row.title}</div>
                        <div className="text-[10px] text-slate-400">{row.case_number}</div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top text-[11px] capitalize text-slate-700">{row.priority}</td>
                      <td className="px-3 py-2 align-top text-[11px] text-slate-500">
                        {row.created_at && new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                        {row.total_updates ?? row.update_count ?? 0}
                      </td>
                      <td className="px-3 py-2 align-top text-[11px] text-slate-700">
                        {row.total_documents ?? row.document_count ?? 0}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleSelectCase(row)}
                            className="inline-flex items-center rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-800"
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadCaseReport(row)}
                            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Download PDF
                          </button>
                          <Link
                            to={`/reports/intelligence/${row.id}`}
                            className="inline-flex items-center justify-center rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-[10px] font-semibold text-purple-700 hover:bg-purple-100"
                          >
                            ✨ AI Report
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Case detailed report</h2>
          {!selectedCaseId && (
            <p className="text-xs text-slate-500">
              Select a case from the table to view its timeline, documents, and activity summary.
            </p>
          )}
          {selectedCaseId && loadingCaseDetails && (
            <p className="text-xs text-slate-500">Loading case details…</p>
          )}
          {selectedCaseId && !loadingCaseDetails && selectedCaseDetails && (
            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <p className="text-[11px] font-semibold text-slate-600">Overview</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {selectedCaseDetails.case?.title} · {selectedCaseDetails.case?.case_number} ·{' '}
                  {selectedCaseDetails.case?.status}
                </p>
              </div>
              {selectedCaseDetails.metrics && (
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      Activity summary
                    </p>
                    <p className="mt-1 text-[11px] text-slate-700">
                      Updates: {selectedCaseDetails.metrics.total_updates} · Documents:{' '}
                      {selectedCaseDetails.metrics.total_documents} · Timeline events:{' '}
                      {selectedCaseDetails.metrics.total_timeline_events}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      Pace & responsiveness
                    </p>
                    <p className="mt-1 text-[11px] text-slate-700">
                      Last update:{' '}
                      {selectedCaseDetails.metrics.last_update_time
                        ? new Date(selectedCaseDetails.metrics.last_update_time).toLocaleString()
                        : 'N/A'}
                    </p>
                    {selectedCaseDetails.metrics.avg_lawyer_response_minutes != null && (
                      <p className="mt-1 text-[11px] text-slate-700">
                        Avg. lawyer response: ~
                        {selectedCaseDetails.metrics.avg_lawyer_response_minutes} minutes
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Timeline
                  </p>
                  <div className="max-h-40 space-y-1 overflow-auto rounded-md bg-slate-50 p-2">
                    {selectedCaseDetails.timeline.length === 0 ? (
                      <p className="text-[11px] text-slate-400">No timeline events recorded.</p>
                    ) : (
                      selectedCaseDetails.timeline.map(t => (
                        <div key={t.id} className="text-[11px] text-slate-700">
                          <span className="font-medium">
                            {t.event_date && new Date(t.event_date).toLocaleDateString()} · {t.event_title}
                          </span>
                          {t.event_description && (
                            <span className="text-slate-500"> — {t.event_description}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Documents
                  </p>
                  <div className="max-h-40 space-y-1 overflow-auto rounded-md bg-slate-50 p-2">
                    {selectedCaseDetails.documents.length === 0 ? (
                      <p className="text-[11px] text-slate-400">No documents uploaded.</p>
                    ) : (
                      selectedCaseDetails.documents.map(d => (
                        <div key={d.id} className="text-[11px] text-slate-700">
                          <span className="font-medium">{d.original_name || d.file_name}</span>
                          <span className="text-slate-500">
                            {' '}
                            · {d.file_type || 'file'} ·{' '}
                            {d.uploaded_at && new Date(d.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Recent activity
                </p>
                <div className="max-h-32 space-y-1 overflow-auto rounded-md bg-slate-50 p-2">
                  {selectedCaseDetails.activities.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No activity logs.</p>
                  ) : (
                    selectedCaseDetails.activities.map(a => (
                      <div key={a.id} className="text-[11px] text-slate-700">
                        <span className="font-medium">{a.actor_name}</span>
                        <span className="text-slate-500">
                          {' '}
                          · {a.actor_role} ·{' '}
                          {a.timestamp && new Date(a.timestamp).toLocaleString()}
                        </span>
                        <div className="text-slate-700">{a.activity}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCaseId(null)}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lawyer performance & user activity */}
      <section className="grid gap-4 lg:grid-cols-2">
        {isAdmin && (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Lawyer performance</h2>
            <p className="text-[11px] text-slate-500">
              Ranked by success rate, caseload, and rating. Useful for network quality monitoring.
            </p>
            <div className="max-h-72 space-y-1 overflow-auto rounded-md bg-slate-50 p-2 text-[11px] text-slate-700">
              {lawyerPerformance.length === 0 ? (
                <p className="text-[11px] text-slate-400">No lawyer statistics available yet.</p>
              ) : (
                lawyerPerformance.map(l => (
                  <div
                    key={l.lawyer_id}
                    className="flex items-center justify-between rounded-md bg-white px-2 py-1 shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{l.lawyer_name}</p>
                      <p className="text-[10px] text-slate-500">{l.specialization}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-600">
                      <div>
                        Cases: {l.total_cases} · Closed: {l.closed_cases}
                      </div>
                      <div>Success: {l.success_rate}% · Rating: {l.rating}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">My activity (last 30 days)</h2>
          <p className="text-[11px] text-slate-500">
            Personal activity timeline across cases, messages, and consultations.
          </p>

          {activityChartData && activityChartData.length > 0 && userActivity.length > 0 && (
            <div className="h-40 w-full mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityChartData}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip labelStyle={{ fontSize: 12 }} contentStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorActivity)" strokeWidth={2} />
                  <XAxis dataKey="date" hide />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="max-h-72 space-y-1 overflow-auto rounded-md bg-slate-50 p-2 text-[11px] text-slate-700">
            {userActivity.length === 0 ? (
              <p className="text-[11px] text-slate-400">No recent activity recorded.</p>
            ) : (
              userActivity.map((a, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={idx} className="flex items-start gap-2 border-b border-slate-100 pb-2 last:border-0">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-600" />
                  <div>
                    <p className="font-medium capitalize">{a.activity_type?.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-slate-600">{a.description}</p>
                    <p className="text-[10px] text-slate-400">
                      {a.timestamp && new Date(a.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportsDashboard;
