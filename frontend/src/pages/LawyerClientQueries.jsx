import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const LawyerClientQueries = () => {
    const { isLawyer } = useAuth();
    const navigate = useNavigate();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!isLawyer()) {
            navigate('/assistant');
            return;
        }
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const { data } = await api.get('/lawyer-dashboard/client-queries');
            setQueries(data.queries || []);
        } catch (err) {
            console.error('Error fetching queries:', err);
            setError('Failed to load client queries');
        } finally {
            setLoading(false);
        }
    };

    const filteredQueries = queries.filter(q => {
        if (filter === 'all') return true;
        return q.status === filter;
    });

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            assigned: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-purple-100 text-purple-800',
            on_hold: 'bg-gray-100 text-gray-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-slate-100 text-slate-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            urgent: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800',
        };
        return badges[priority] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Client Queries</h1>
                        <p className="mt-2 text-slate-600">
                            Manage all your assigned cases and client queries
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/lawyer/dashboard')}
                        className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {['all', 'assigned', 'in_progress', 'on_hold', 'resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === status
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {status === 'all' ? 'All Cases' : status.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Cases List */}
                {filteredQueries.length === 0 ? (
                    <div className="rounded-lg bg-white p-12 text-center shadow-md">
                        <div className="text-6xl">📭</div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">
                            No cases found
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                            {filter === 'all'
                                ? 'You have no assigned cases yet.'
                                : `No cases with status: ${filter}`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredQueries.map(query => (
                            <div
                                key={query.id}
                                className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {query.title}
                                            </h3>
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(query.status)}`}>
                                                {query.status}
                                            </span>
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityBadge(query.priority)}`}>
                                                {query.priority}
                                            </span>
                                        </div>
                                        <p className="mb-3 text-sm text-slate-600 line-clamp-2">
                                            {query.description}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div>
                                                <span className="font-medium">Case #:</span> {query.case_number}
                                            </div>
                                            <div>
                                                <span className="font-medium">Type:</span> {query.case_type || 'N/A'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Client:</span> {query.client_name}
                                            </div>
                                            <div>
                                                <span className="font-medium">Email:</span> {query.client_email}
                                            </div>
                                            {query.client_phone && (
                                                <div>
                                                    <span className="font-medium">Phone:</span> {query.client_phone}
                                                </div>
                                            )}
                                            {query.next_hearing_date && (
                                                <div>
                                                    <span className="font-medium">Next Hearing:</span>{' '}
                                                    {new Date(query.next_hearing_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => navigate(`/cases/${query.id}`)}
                                            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                                        >
                                            View Details
                                        </button>
                                        <a
                                            href={`mailto:${query.client_email}`}
                                            className="rounded-md bg-slate-100 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-200"
                                        >
                                            Contact Client
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                {filteredQueries.length > 0 && (
                    <div className="mt-6 rounded-lg bg-white p-4 shadow-md">
                        <p className="text-sm text-slate-600">
                            Showing <span className="font-semibold">{filteredQueries.length}</span> of{' '}
                            <span className="font-semibold">{queries.length}</span> total cases
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LawyerClientQueries;
