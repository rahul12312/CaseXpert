import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import CaseDocuments from '../components/CaseDocuments';
import { useAuth } from '../context/AuthContext';
import { sendCaseUpdateEmail } from '../services/emailService';
import toast from 'react-hot-toast';
import { Video } from 'lucide-react';

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLawyer, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Hearing Form State
    const [showHearingModal, setShowHearingModal] = useState(false);
    const [hearingForm, setHearingForm] = useState({
        hearing_date: '',
        purpose: 'Other',
        courtroom: '',
        judge_name: '',
        notes: ''
    });

    // AI State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState('');

    // Assign Lawyer State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [consultedLawyers, setConsultedLawyers] = useState([]);
    const [assigningLoading, setAssigningLoading] = useState(false);
    const [selectedLawyerId, setSelectedLawyerId] = useState('');

    const fetchCase = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/case/details/${id}`);
            setCaseData(data.data);
        } catch (error) {
            console.error("Failed to load case", error);
            alert("Failed to load case details.");
            navigate('/cases');
        } finally {
            setLoading(false);
        }
    };

    const fetchConsultedLawyers = async () => {
        try {
            const { data } = await api.get('/bookings/user');
            if (data.success) {
                // Filter for completed bookings and extract unique lawyers
                const uniqueLawyers = [];
                const seenLawyerIds = new Set();

                data.bookings.forEach(b => {
                    if ((b.status === 'completed' || b.status === 'confirmed') && !seenLawyerIds.has(b.lawyer_id)) {
                        uniqueLawyers.push({
                            id: b.lawyer_id,
                            name: b.lawyer_name,
                            specialization: b.specialization
                        });
                        seenLawyerIds.add(b.lawyer_id);
                    }
                });
                setConsultedLawyers(uniqueLawyers);
            }
        } catch (error) {
            console.error("Failed to fetch consulted lawyers", error);
        }
    };

    useEffect(() => {
        fetchCase();
        if (!isLawyer() && !isAdmin()) {
            fetchConsultedLawyers();
        }
    }, [id]);

    const handleAddHearing = async (e) => {
        e.preventDefault();
        try {
            await api.post('/case/add-hearing', {
                case_id: id,
                ...hearingForm
            });
            setShowHearingModal(false);
            setHearingForm({
                hearing_date: '', purpose: 'Other', courtroom: '', judge_name: '', notes: ''
            });
            fetchCase(); // Refresh data
        } catch (error) {
            alert('Failed to add hearing');
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        setUpdatingStatus(true);
        try {
            // 1. Update status in backend
            await api.put(`/case/status/${id}`, { status: newStatus });

            // 2. Refresh local data
            await fetchCase();

            // 3. Send EmailJS notification
            if (caseData.user_email) {
                const message = `The status of your case "${caseData.title}" has been updated to ${newStatus.toUpperCase()} by the legal team.`;
                await sendCaseUpdateEmail(
                    caseData.user_email,
                    caseData.user_name || 'User',
                    id,
                    caseData.title,
                    newStatus,
                    message
                );
            }

            toast.success('Status updated and notification sent!');
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update case status.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAnalyzeCase = async () => {
        setShowAiModal(true);
        setAiLoading(true);
        setAiAnalysis('');
        try {
            // Construct a prompt based on case data
            const prompt = `
          Analyze the following legal case and provide a summary of status, potential next steps, and risk assessment:
          Title: ${caseData.title}
          Type: ${caseData.case_type}
          Description: ${caseData.description}
          Status: ${caseData.status}
          Timeline Events: ${caseData.timeline.map(t => t.event_title).join(', ')}
          Hearings: ${caseData.hearings.map(h => `${h.date}: ${h.purpose}`).join(', ')}
          `;

            const { data } = await api.post('/chat/send', {
                message: prompt,
                task: 'CASE_ANALYSIS'
            });

            setAiAnalysis(data.aiResponse);
        } catch (error) {
            setAiAnalysis("Failed to analyze case. Please try again later.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleAcceptCase = async () => {
        setUpdatingStatus(true);
        try {
            await api.post(`/lawyer-dashboard/case-requests/${id}/accept`);
            toast.success('Case accepted successfully!');
            fetchCase(); // Refresh to show the full case view
        } catch (error) {
            console.error('Error accepting case:', error);
            toast.error(error.response?.data?.message || 'Failed to accept case.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDeclineCase = async () => {
        if (!window.confirm('Are you sure you want to decline this case?')) return;
        setUpdatingStatus(true);
        try {
            await api.post(`/lawyer-dashboard/case-requests/${id}/decline`);
            toast.success('Case request declined.');
            navigate('/lawyer/dashboard'); // Redirect since they no longer have access
        } catch (error) {
            console.error('Error declining case:', error);
            toast.error(error.response?.data?.message || 'Failed to decline case.');
        } finally {
            setUpdatingStatus(false);
        }
    };


    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!caseData) return null;

    return (
        <div className="flex flex-col gap-6">
            {/* Lawyer Request Banner */}
            {isLawyer() && caseData.assignment_status === 'REQUESTED' && (
                <div className="rounded-xl bg-blue-600 p-6 shadow-md text-white flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold">New Case Request</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            A client has specifically requested you to handle this case. Review the details below.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={handleAcceptCase}
                            disabled={updatingStatus}
                            className="flex-1 md:flex-none px-6 py-2 bg-white dark:bg-slate-900 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                            {updatingStatus ? 'Processing...' : 'Accept Case'}
                        </button>
                        <button
                            onClick={handleDeclineCase}
                            disabled={updatingStatus}
                            className="flex-1 md:flex-none px-6 py-2 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 border border-blue-500"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="rounded-xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="w-full md:w-auto">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white break-all">{caseData.title}</h1>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium uppercase ${caseData.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {caseData.priority}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{caseData.case_number} • {caseData.court_name}</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-3 transition-all">
                        {/* Assign Lawyer Button (Visible only to client if case is unassigned) */}
                        {!isLawyer() && !isAdmin() && !caseData.lawyer_id && (
                            <button
                                onClick={() => setShowAssignModal(true)}
                                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm flex justify-center items-center gap-2"
                            >
                                🤝 Assign to Lawyer
                            </button>
                        )}

                        <button
                            onClick={() => navigate(`/reports/intelligence/${id}`)}
                            className="w-full md:w-auto px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 border border-purple-200 flex justify-center md:justify-start items-center gap-2"
                        >
                            <span>📊</span> View Intelligence Report
                        </button>

                        {(caseData.lawyer_id || isLawyer()) && (
                            <Link
                                to={`/consultation/C${id}`}
                                className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md flex justify-center items-center gap-2 transition-all hover:scale-[1.02]"
                            >
                                <Video size={16} />
                                Join Video Consultation
                            </Link>
                        )}
                        <div className="flex items-center gap-2 md:block text-left md:text-right">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                            {(isLawyer() || isAdmin()) ? (
                                <select
                                    disabled={updatingStatus}
                                    value={caseData.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 py-1 pl-3 pr-10 text-sm font-semibold focus:border-primary-500 focus:outline-none focus:ring-primary-500 capitalize bg-white dark:bg-slate-900 cursor-pointer"
                                >
                                    <option value="Filed">Filed</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Hearing Scheduled">Hearing Scheduled</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            ) : (
                                <p className="font-semibold capitalize text-slate-900 dark:text-white">{caseData.status.replace('-', ' ')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <nav className="-mb-px flex space-x-8 min-w-max px-2">
                    {['overview', 'timeline', 'hearings', 'documents'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="grid gap-6">
                {activeTab === 'overview' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Case Information</h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <dt className="text-slate-500 dark:text-slate-400">Case Type</dt>
                                    <dd className="font-medium text-slate-900 dark:text-white capitalize">{caseData.case_type}</dd>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <dt className="text-slate-500 dark:text-slate-400">Assigned Lawyer</dt>
                                    <dd className="font-semibold text-blue-600">
                                        {caseData.lawyer_name || (caseData.lawyer_id ? 'Loading...' : 'Not Assigned')}
                                        {caseData.assignment_status === 'REQUESTED' && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase">Pending Response</span>}
                                    </dd>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <dt className="text-slate-500 dark:text-slate-400">Filing Date</dt>
                                    <dd className="font-medium text-slate-900 dark:text-white">
                                        {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : 'N/A'}
                                    </dd>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <dt className="text-slate-500 dark:text-slate-400">Opponent</dt>
                                    <dd className="font-medium text-slate-900 dark:text-white">{caseData.opponent_name || '-'}</dd>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <dt className="text-slate-500 dark:text-slate-400">Opponent Lawyer</dt>
                                    <dd className="font-medium text-slate-900 dark:text-white">{caseData.opponent_lawyer || '-'}</dd>
                                </div>
                            </dl>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Description</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {caseData.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Case Timeline</h3>
                        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 space-y-8 ml-3 pl-8">
                            {caseData.timeline.map((event, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[41px] bg-white dark:bg-slate-900 border-2 border-primary-500 rounded-full w-5 h-5"></div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white">{event.event_title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.event_description}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded mt-2 sm:mt-0">
                                            {new Date(event.event_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'hearings' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Hearings</h3>
                            <button
                                onClick={() => setShowHearingModal(true)}
                                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                            >
                                + Add Hearing
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            {/* Mobile View (Cards) */}
                            <div className="block md:hidden divide-y divide-slate-200">
                                {caseData.hearings.map(hearing => (
                                    <div key={hearing.id} className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {new Date(hearing.hearing_date).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {new Date(hearing.hearing_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                                                {hearing.purpose}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Courtroom</span>
                                                <span className="text-slate-900 dark:text-white">{hearing.courtroom || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Judge</span>
                                                <span className="text-slate-900 dark:text-white">{hearing.judge_name || '-'}</span>
                                            </div>
                                        </div>

                                        {(hearing.outcome || hearing.notes) && (
                                            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase">Notes/Outcome</span>
                                                {hearing.outcome || hearing.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {caseData.hearings.length === 0 && (
                                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        No hearings recorded.
                                    </div>
                                )}
                            </div>

                            {/* Desktop View (Table) */}
                            <table className="hidden md:table w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Purpose</th>
                                        <th className="px-6 py-3">Courtroom</th>
                                        <th className="px-6 py-3">Judge</th>
                                        <th className="px-6 py-3">Outcome/Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {caseData.hearings.map(hearing => (
                                        <tr key={hearing.id}>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                {new Date(hearing.hearing_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 capitalize">{hearing.purpose}</td>
                                            <td className="px-6 py-4">{hearing.courtroom}</td>
                                            <td className="px-6 py-4">{hearing.judge_name}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                {hearing.outcome || hearing.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {caseData.hearings.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                No hearings recorded.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <CaseDocuments
                        caseId={id}
                        initialDocuments={caseData.documents || []}
                        onRefresh={fetchCase}
                    />
                )}
            </div>

            {/* AI Analysis Floating Button */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-end">
                <button
                    onClick={() => handleAnalyzeCase()}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-white shadow-lg hover:shadow-xl transition-all"
                >
                    <span className="text-xl">✨</span>
                    <span className="font-medium">Analyze Case</span>
                </button>
            </div>

            {/* AI Modal */}
            {showAiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>✨</span> AI Case Analysis
                            </h3>
                            <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400">
                                ✕
                            </button>
                        </div>

                        {aiLoading ? (
                            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                                <div className="animate-spin text-3xl mb-4">🌀</div>
                                <p>Analyzing case details, timeline, and hearings...</p>
                            </div>
                        ) : (
                            <div className="prose prose-sm prose-slate max-w-none">
                                <div className="whitespace-pre-wrap">{aiAnalysis}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Hearing Modal */}
            {showHearingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Schedule Hearing</h3>
                        <form onSubmit={handleAddHearing} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={hearingForm.hearing_date}
                                        onChange={e => setHearingForm({ ...hearingForm, hearing_date: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Purpose</label>
                                    <select
                                        value={hearingForm.purpose}
                                        onChange={e => setHearingForm({ ...hearingForm, purpose: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    >
                                        <option>Admission</option>
                                        <option>Evidence</option>
                                        <option>Argument</option>
                                        <option>Order</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Courtroom</label>
                                    <input
                                        type="text"
                                        value={hearingForm.courtroom}
                                        onChange={e => setHearingForm({ ...hearingForm, courtroom: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Judge Name</label>
                                    <input
                                        type="text"
                                        value={hearingForm.judge_name}
                                        onChange={e => setHearingForm({ ...hearingForm, judge_name: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                                <textarea
                                    rows="3"
                                    value={hearingForm.notes}
                                    onChange={e => setHearingForm({ ...hearingForm, notes: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowHearingModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 border border-slate-300 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                                >
                                    Schedule Hearing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Assign Lawyer Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assign to Lawyer</h3>
                            <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors">
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                            Select a lawyer you have consulted with to manage this case. They will receive a request to accept the assignment.
                        </p>

                        {consultedLawyers.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium">No completed consultations found.</p>
                                <button
                                    onClick={() => navigate('/lawyers')}
                                    className="text-primary-600 text-sm font-bold hover:underline"
                                >
                                    Browse Lawyers & Book Consultation
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Choose Lawyer</label>
                                    <select
                                        value={selectedLawyerId}
                                        onChange={(e) => setSelectedLawyerId(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                    >
                                        <option value="">Select a lawyer...</option>
                                        {consultedLawyers.map(l => (
                                            <option key={l.id} value={l.id}>{l.name} ({l.specialization})</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    disabled={assigningLoading || !selectedLawyerId}
                                    onClick={async () => {
                                        setAssigningLoading(true);
                                        try {
                                            await api.put(`/case/${id}/assign`, { lawyer_id: selectedLawyerId });
                                            toast.success('Assignment request sent successfully!');
                                            setShowAssignModal(false);
                                            fetchCase();
                                        } catch (error) {
                                            toast.error(error.response?.data?.message || 'Failed to assign lawyer');
                                        } finally {
                                            setAssigningLoading(false);
                                        }
                                    }}
                                    className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    {assigningLoading ? 'Assigning...' : '🤝 Confirm Assignment'}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setShowAssignModal(false)}
                            className="w-full mt-4 text-slate-400 text-sm font-medium hover:text-slate-600 dark:text-slate-400 transition-colors"
                        >
                            Nevermind, keep it private
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseDetails;

