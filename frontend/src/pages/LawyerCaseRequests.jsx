import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const LawyerCaseRequests = () => {
    const { isLawyer } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [accepting, setAccepting] = useState(null);
    const [declining, setDeclining] = useState(null);

    useEffect(() => {
        if (!isLawyer()) {
            navigate('/assistant');
            return;
        }
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/lawyer-dashboard/case-requests');
            setRequests(data.requests || []);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load case requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptCase = async (caseId) => {
        setAccepting(caseId);
        try {
            await api.post(`/lawyer-dashboard/case-requests/${caseId}/accept`);

            // Remove from list after accepting
            setRequests(prev => prev.filter(r => r.id !== caseId));

            // Show success message
            alert('Case accepted successfully! You can now view it in Client Queries.');
        } catch (err) {
            console.error('Error accepting case:', err);
            alert(err.response?.data?.message || 'Failed to accept case. Please try again.');
        } finally {
            setAccepting(null);
        }
    };

    const handleDeclineCase = async (caseId) => {
        if (!window.confirm('Are you sure you want to decline this case request?')) return;
        
        setDeclining(caseId);
        try {
            await api.post(`/lawyer-dashboard/case-requests/${caseId}/decline`);
            setRequests(prev => prev.filter(r => r.id !== caseId));
            alert('Case declined successfully.');
        } catch (err) {
            console.error('Error declining case:', err);
            alert(err.response?.data?.message || 'Failed to decline case.');
        } finally {
            setDeclining(null);
        }
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            urgent: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800',
        };
        return badges[priority] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pt-28">
            <div className="mx-auto max-w-7xl">
                {/* Back to Dashboard */}
                <button
                    onClick={() => navigate('/lawyer/dashboard')}
                    className="group flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-all mb-6 text-xs font-black uppercase tracking-widest"
                >
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Case Requests</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
                        Review and accept new case requests from clients
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Requests List */}
                {requests.length === 0 ? (
                    <div className="rounded-lg bg-white dark:bg-slate-900 p-12 text-center shadow-md">
                        <div className="text-6xl">✅</div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No pending requests
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            All case requests have been processed. Check back later for new cases.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(request => (
                            <div
                                key={request.id}
                                className="rounded-lg bg-white dark:bg-slate-900 p-6 shadow-md transition-shadow hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {request.title}
                                            </h3>
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityBadge(request.priority)}`}>
                                                {request.priority} priority
                                            </span>
                                        </div>
                                        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                                            {request.description}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                            <div>
                                                <span className="font-medium">Case #:</span> {request.case_number}
                                            </div>
                                            <div>
                                                <span className="font-medium">Type:</span> {request.case_type || 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Client:</span> {request.client_name}
                                            </div>
                                            <div>
                                                <span className="font-medium">Email:</span> {request.client_email}
                                            </div>
                                            <div>
                                                <span className="font-medium">Filed:</span>{' '}
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => handleAcceptCase(request.id)}
                                            disabled={accepting === request.id || declining === request.id}
                                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {accepting === request.id ? 'Accepting...' : 'Accept Case'}
                                        </button>
                                        <button
                                            onClick={() => handleDeclineCase(request.id)}
                                            disabled={accepting === request.id || declining === request.id}
                                            className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:bg-gray-100 dark:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed border border-red-200 transition-colors"
                                        >
                                            {declining === request.id ? 'Declining...' : 'Decline Case'}
                                        </button>
                                        <button
                                            onClick={() => navigate(`/cases/${request.id}`)}
                                            className="rounded-md bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                {requests.length > 0 && (
                    <div className="mt-6 rounded-lg bg-white dark:bg-slate-900 p-4 shadow-md">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-semibold">{requests.length}</span> pending case request{requests.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LawyerCaseRequests;
