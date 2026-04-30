import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Video, ChevronLeft } from 'lucide-react';

const LawyerAcceptedCases = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAcceptedCases();
    }, []);

    const fetchAcceptedCases = async () => {
        try {
            console.log('\n📁 Fetching accepted cases...');
            // Use the regular case list endpoint which now filters by role
            const { data } = await api.get('/case/list');
            console.log('Accepted cases:', data);
            setCases(data.cases || data.data || []);
        } catch (err) {
            console.error('Error fetching accepted cases:', err);
            setError('Failed to load accepted cases');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-700border-yellow-200',
            'active': 'bg-blue-100 text-blue-700 border-blue-200',
            'in-progress': 'bg-purple-100 text-purple-700 border-purple-200',
            'resolved': 'bg-green-100 text-green-700 border-green-200',
            'closed': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
            'on-hold': 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[status?.toLowerCase()] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'urgent': 'bg-red-100 text-red-700 border-red-200',
            'high': 'bg-orange-100 text-orange-700 border-orange-200',
            'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'low': 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[priority?.toLowerCase()] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 dark:bg-slate-900">
                <div className="text-center">
                    <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                    <p className="mt-4 text-slate-600 dark:text-slate-400 dark:text-slate-400">Loading accepted cases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:bg-slate-900 p-6 pt-28">
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
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white dark:text-white tracking-tight">
                        📁 My Accepted Cases
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 dark:text-slate-400 font-medium">
                        Professional cases you've accepted to work on
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                        <p className="text-red-800 dark:text-red-400">{error}</p>
                        <button
                            onClick={fetchAcceptedCases}
                            className="mt-2 text-sm text-red-700 dark:text-red-400 underline hover:no-underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {cases.length === 0 ? (
                    <div className="rounded-lg bg-white dark:bg-slate-900 dark:bg-slate-800 p-12 text-center shadow-md">
                        <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 dark:bg-slate-700 flex items-center justify-center mb-4">
                            <span className="text-4xl">📁</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white dark:text-white mb-2">
                            No Accepted Cases Yet
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 dark:text-slate-400 mb-6 max-w-md mx-auto">
                            You haven't accepted any cases yet. Review pending case requests to start working with clients.
                        </p>
                        <Link
                            to="/lawyer/case-requests"
                            className="inline-block rounded-lg bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 transition-colors"
                        >
                            View Case Requests
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="mb-6 grid gap-4 md:grid-cols-4">
                            <div className="rounded-lg bg-white dark:bg-slate-900 dark:bg-slate-800 p-4 shadow-md">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400">Total Cases</div>
                                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white dark:text-white">{cases.length}</div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 dark:bg-slate-800 p-4 shadow-md">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400">Active</div>
                                <div className="mt-1 text-2xl font-bold text-blue-600">
                                    {cases.filter(c => c.status === 'active' || c.status === 'in-progress').length}
                                </div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 dark:bg-slate-800 p-4 shadow-md">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400">Resolved</div>
                                <div className="mt-1 text-2xl font-bold text-green-600">
                                    {cases.filter(c => c.status === 'resolved' || c.status === 'closed').length}
                                </div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-900 dark:bg-slate-800 p-4 shadow-md">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400">Urgent</div>
                                <div className="mt-1 text-2xl font-bold text-red-600">
                                    {cases.filter(c => c.priority === 'urgent').length}
                                </div>
                            </div>
                        </div>

                        {/* Cases Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {cases.map((caseItem) => (
                                <div
                                    key={caseItem.id}
                                    className="group rounded-xl bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 shadow-md hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 dark:border-slate-700 flex flex-col"
                                >
                                    {/* Header */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white dark:text-white line-clamp-2">
                                                {caseItem.title}
                                            </h3>
                                            <p className="mt-1 text-sm font-mono text-slate-500 dark:text-slate-400">
                                                #{caseItem.case_number}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status & Priority Badges */}
                                    <div className="mb-6 flex flex-wrap gap-2">
                                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold border uppercase transition-colors ${getStatusColor(caseItem.status)}`}>
                                            {caseItem.status}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold border uppercase transition-colors ${getPriorityColor(caseItem.priority)}`}>
                                            {caseItem.priority}
                                        </span>
                                    </div>

                                    {/* Client Info */}
                                    <div className="mb-6 space-y-3 text-sm flex-grow">
                                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 dark:text-slate-300">
                                            <span className="text-lg">👤</span>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Client</p>
                                                <p className="font-semibold">{caseItem.user_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 dark:text-slate-300">
                                            <span className="text-lg">⚖️</span>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Type</p>
                                                <p className="font-semibold">{caseItem.case_type}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 dark:border-slate-700">
                                        <Link
                                            to={`/cases/${caseItem.id}`}
                                            className="flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-700 text-slate-700 dark:text-slate-300 dark:text-slate-200 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                                        >
                                            Details
                                        </Link>
                                        <Link
                                            to={`/consultation/C${caseItem.id}`}
                                            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all gap-2 shadow-md shadow-indigo-200 dark:shadow-none"
                                        >
                                            <Video size={16} />
                                            Video Call
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LawyerAcceptedCases;
