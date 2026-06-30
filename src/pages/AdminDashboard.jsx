import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  Eye, X, CheckCircle, XCircle, FileText,
  MapPin, User, Mail, Phone, Shield,
  Award, BookOpen, Calendar, Download
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [lawyers, setLawyers] = useState([]);
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('LAWYERS'); // LAWYERS, CASES, REPORT
  const [filter, setFilter] = useState('ALL');

  // Modal State
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [lawyerRes, statsRes, casesRes] = await Promise.all([
        api.get('/admin/lawyers'),
        api.get('/admin/dashboard-stats'),
        api.get('/admin/cases')
      ]);

      setLawyers(lawyerRes.data.lawyers);
      setStats(statsRes.data.stats);
      setCases(casesRes.data.cases);
    } catch (err) {
      console.error('Admin load error:', err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchLawyerDetails = async (id) => {
    try {
      setError(null);
      setViewLoading(true);
      const response = await api.get(`/admin/lawyers/${id}`);
      if (response.data.success) {
        setSelectedLawyer(response.data.lawyer);
      }
    } catch (error) {
      console.error("Failed to fetch lawyer details", error);
      setError("Failed to load lawyer details. Server might be busy.");
      // Auto-clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setViewLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm('Are you sure you want to verify and approve this lawyer?')) return;
    try {
      await api.put(`/admin/lawyers/${id}/approve`);
      alert("Lawyer verified successfully!");
      setSelectedLawyer(null); // Close modal
      loadDashboardData(); // Reload all
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this lawyer account?')) return;
    try {
      await api.put(`/admin/lawyers/${id}/reject`);
      alert("Lawyer rejected.");
      setSelectedLawyer(null); // Close modal
      loadDashboardData();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );

  const filteredLawyers = lawyers.filter(l =>
    filter === 'ALL' ? true : l.verification_status === filter
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 relative">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-24 right-6 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg shadow-red-100 max-w-md flex items-center gap-3 animate-fade-in-down">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 text-sm font-semibold">{error}</div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* View Loading Overlay */}
      {viewLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-full shadow-xl shadow-primary-200/50">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary-600" />
          Admin Dashboard
        </h1>

        {/* STATS GRID */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Total Lawyers</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.lawyers.total}</p>
              <div className="mt-2 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md inline-block">
                {stats.lawyers.verified} Verified • {stats.lawyers.pending} Pending
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-green-500">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Active Cases</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.cases.active}</p>
              <div className="mt-2 text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md inline-block">
                Currently in progress
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.lawyers.pending}</p>
              <div className="mt-2 text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-md inline-block">
                Action Required
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Platform Health</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.cases.total}</p>
              <div className="mt-2 text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-md inline-block">
                Total Cases Managed
              </div>
            </div>
          </div>
        )}

        {/* TABS */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          <button
            onClick={() => setTab('LAWYERS')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${tab === 'LAWYERS' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-300'}`}
          >
            <User className="w-4 h-4" /> Lawyer Management
          </button>
          <button
            onClick={() => setTab('CASES')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${tab === 'CASES' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-300'}`}
          >
            <BookOpen className="w-4 h-4" /> Case Oversight
          </button>
          <button
            onClick={() => setTab('REPORT')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${tab === 'REPORT' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-300'}`}
          >
            <Award className="w-4 h-4" /> Workload Report
          </button>
        </div>

        {/* LAWYERS TAB */}
        {tab === 'LAWYERS' && (
          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2 items-center justify-between bg-gray-50/50">
              <div className="flex gap-2">
                {['ALL', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs rounded-full font-semibold transition-all shadow-sm ${filter === f
                      ? 'bg-primary-600 text-white shadow-primary-200'
                      : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Showing {filteredLawyers.length} lawyers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lawyer Profile</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200">
                  {filteredLawyers.map(l => (
                    <tr
                      key={l.id}
                      onClick={() => fetchLawyerDetails(l.id)}
                      className="hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold">
                            {l.profile_image ? (
                              <img src={l.profile_image} alt={l.name} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              l.name?.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{l.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{l.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-none font-semibold rounded-full border ${l.verification_status === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                          l.verification_status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                          }`}>
                          {l.verification_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{l.experience} Years</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{l.specialization}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchLawyerDetails(l.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors border border-blue-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLawyers.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium">No lawyers found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your status filter.</p>
              </div>
            )}
          </div>
        )}

        {/* CASES TAB */}
        {tab === 'CASES' && (
          <div className="bg-white dark:bg-slate-900 shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Case Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Assigned Lawyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200">
                {cases.map(c => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{c.client_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{c.lawyer_name || <span className="text-orange-500 italic">Unassigned</span>}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cases.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No cases found in the system.</div>
            )}
          </div>
        )}

        {/* REPORT TAB */}
        {tab === 'REPORT' && (
          <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Top Lawyers by Caseload</h3>
            <div className="space-y-4">
              {stats?.topLawyers?.map((tl, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{tl.lawyer_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tl.specialization}</p>
                  </div>
                  <div className="text-xl font-bold text-primary-600">
                    {tl.case_count} <span className="text-xs text-gray-400 font-normal">cases</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DETAILED LAWYER PROFILE MODAL */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
                  {selectedLawyer.profile_image ? (
                    <img src={selectedLawyer.profile_image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  ) : selectedLawyer.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLawyer.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wide border ${selectedLawyer.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800' :
                      selectedLawyer.verification_status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                      {selectedLawyer.verification_status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">• Joined {new Date(selectedLawyer.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLawyer(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: Personal Info */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary-600" /> Personal Details
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLawyer.email}</p>
                        </div>
                      </div>
                      <div className="h-px bg-gray-200"></div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLawyer.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary-600" /> Professional Info
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Specialization</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedLawyer.specialization?.split(',').map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-xs font-semibold rounded-lg border border-blue-100">
                              {tag.trim()}
                            </span>
                          )) || <span className="text-gray-400 italic">None listed</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedLawyer.experience} Years</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Fees</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">₹{selectedLawyer.consultation_fee || '0'} /hr</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Languages</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLawyer.languages || 'Not specified'}</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Documents & Actions */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-600" /> Verification Documents
                    </h3>

                    {selectedLawyer.documents && selectedLawyer.documents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedLawyer.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 text-red-500">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title || doc.document_type || 'Document'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{doc.file_type?.toUpperCase()} • {(doc.file_size / 1024).toFixed(0)} KB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => window.open(doc.url || doc.s3_key || '#', '_blank')}
                              className="p-2 text-gray-400 hover:text-primary-600 bg-gray-50 dark:bg-gray-900 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300">
                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No documents uploaded</p>
                        <p className="text-xs text-gray-400">This lawyer hasn't uploaded verification proofs yet.</p>
                      </div>
                    )}
                  </section>

                  {selectedLawyer.bio && (
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">About</h3>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"{selectedLawyer.bio}"</p>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col sm:flex-row justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setSelectedLawyer(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 bg-white dark:bg-slate-900 border border-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>

              {selectedLawyer.verification_status === 'PENDING_VERIFICATION' && (
                <>
                  <button
                    onClick={() => handleReject(selectedLawyer.id)}
                    className="px-5 py-2.5 text-sm font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-200 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject Application
                  </button>
                  <button
                    onClick={() => handleVerify(selectedLawyer.id)}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 rounded-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Verify & Approve
                  </button>
                </>
              )}

              {selectedLawyer.verification_status === 'VERIFIED' && (
                <button
                  onClick={() => handleReject(selectedLawyer.id)}
                  className="px-5 py-2.5 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Revoke Verification
                </button>
              )}

              {selectedLawyer.verification_status === 'REJECTED' && (
                <button
                  onClick={() => handleVerify(selectedLawyer.id)}
                  className="px-5 py-2.5 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Re-Approve Lawyer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
