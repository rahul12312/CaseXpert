import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const LawyerAcceptedCases = () => {
    const { user } = useAuth();
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
            'closed': 'bg-slate-100 text-slate-700 border-slate-200',
            'on-hold': 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[status?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'urgent': 'bg-red-100 text-red-700 border-red-200',
            'high': 'bg-orange-100 text-orange-700 border-orange-200',
            'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'low': 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[priority?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                    <p className="mt-4 text-slate-600 dark:text-slate-400">Loading accepted cases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pt-24">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        📁 My Accepted Cases
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
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
                    <div className="rounded-lg bg-white dark:bg-slate-800 p-12 text-center shadow-md">
                        <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                            <span className="text-4xl">📁</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            No Accepted Cases Yet
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
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
                            <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow-md">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cases</div>
                                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{cases.length}</div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow-md">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Active</div>
                                <div className="mt-1 text-2xl font-bold text-blue-600">
                                    {cases.filter(c => c.status === 'active' || c.status === 'in-progress').length}
                                </div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow-md">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Resolved</div>
                                <div className="mt-1 text-2xl font-bold text-green-600">
                                    {cases.filter(c => c.status === 'resolved' || c.status === 'closed').length}
                                </div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow-md">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Urgent</div>
                                <div className="mt-1 text-2xl font-bold text-red-600">
                                    {cases.filter(c => c.priority === 'urgent').length}
                                </div>
                            </div>
                        </div>

                        {/* Cases Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {cases.map((caseItem) => (
                                <Link
                                    key={caseItem.id}
                                    to={`/case/details/${caseItem.id}`}
                                    className="group rounded-lg bg-white dark:bg-slate-800 p-6 shadow-md hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700"
                                >
                                    {/* Header */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
                                                {caseItem.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                #{caseItem.case_number}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status & Priority Badges */}
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(caseItem.status)}`}>
                                            {caseItem.status?.toUpperCase()}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium border ${getPriorityColor(caseItem.priority)}`}>
                                            {caseItem.priority?.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Client Info */}
                                    <div className="mb-4 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <span>👤</span>
                                            <span className="font-medium">Client:</span>
                                            <span className="text-slate-600 dark:text-slate-400">{caseItem.user_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <span>⚖️</span>
                                            <span className="font-medium">Type:</span>
                                            <span className="text-slate-600 dark:text-slate-400">{caseItem.case_type}</span>
                                        </div>
                                        {caseItem.court_name && (
                                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                <span>🏛️</span>
                                                <span className="font-medium">Court:</span>
                                                <span className="text-slate-600 dark:text-slate-400 line-clamp-1">{caseItem.court_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-4">
                                        <span className="flex items-center gap-1">
                                            📄 {caseItem.document_count || 0} docs
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📝 {caseItem.update_count || 0} updates
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LawyerAcceptedCases;
