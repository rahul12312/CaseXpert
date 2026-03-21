import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Video, Clock, Check, X, Bell } from 'lucide-react';

const LawyerDashboard = () => {
    const { user, isLawyer } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [pendingMeetings, setPendingMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Redirect if not a lawyer
        if (!isLawyer()) {
            navigate('/assistant');
            return;
        }

        fetchDashboardStats();
        fetchPendingMeetings();

        // Polling for new meetings every 30 seconds
        const interval = setInterval(fetchPendingMeetings, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const { data } = await api.get('/lawyer-dashboard/dashboard/stats');
            setStats(data.stats);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingMeetings = async () => {
        try {
            const { data } = await api.get('/bookings/lawyer');
            if (data.success) {
                // Filter for pending video calls
                const videoPending = data.bookings.filter(b => b.status === 'pending' && b.booking_type === 'video_call');
                setPendingMeetings(videoPending);
            }
        } catch (error) {
            console.error('Error fetching pending meetings:', error);
        }
    };

    const handleAcceptMeeting = async (id) => {
        try {
            const { data } = await api.put(`/bookings/${id}/accept`);
            if (data.success) {
                // Navigate to meeting room directly
                navigate(`/consultation/${id}`);
            }
        } catch (error) {
            alert('Failed to accept meeting');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchDashboardStats}
                        className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back, {user?.name}
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Here's what's happening with your cases today
                    </p>
                </div>

                {/* Live Meeting Requests */}
                {pendingMeetings.length > 0 && (
                    <div className="mb-8 p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Video size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                                    <Bell size={20} />
                                </div>
                                <h2 className="text-xl font-bold">Incoming Video Consultation Requests</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pendingMeetings.map(meeting => (
                                    <div key={meeting.id} className="bg-white text-slate-900 p-4 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                                    {meeting.user_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{meeting.user_name}</div>
                                                    <div className="text-xs text-slate-500">Video Call Requested</div>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-xl text-xs mb-3 flex items-center gap-2">
                                                <Clock size={14} className="text-blue-500" />
                                                <span>{new Date(meeting.booking_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAcceptMeeting(meeting.id)}
                                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} /> Accept & Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Verification Status Banner */}
                {stats?.verification_status === 'PENDING_VERIFICATION' && (
                    <div className="mb-8 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-yellow-400 text-xl">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Your profile is under verification</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        You cannot accept new clients or appear in search results until an admin verifies your profile.
                                        Please ensure your profile details are complete.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {stats?.verification_status === 'REJECTED' && (
                    <div className="mb-8 rounded-lg bg-red-50 p-4 border border-red-200">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400 text-xl">❌</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Profile Verification Failed</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>Your profile was rejected by the administrator. Please contact support.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Active Cases"
                        value={stats?.activeCases || 0}
                        icon="📁"
                        color="blue"
                    />
                    <StatCard
                        title="Completed Cases"
                        value={stats?.completedCases || 0}
                        icon="✅"
                        color="green"
                    />
                    <StatCard
                        title="Pending Requests"
                        value={stats?.pendingRequests || 0}
                        icon="⏳"
                        color="yellow"
                    />
                    <StatCard
                        title="Today's Consultations"
                        value={stats?.todayConsultations || 0}
                        icon="📅"
                        color="purple"
                    />
                </div>

                {/* Rating & Performance */}
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="text-sm font-medium text-slate-600">Your Rating</h3>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-3xl font-bold text-slate-900">
                                {Number(stats?.rating || 0).toFixed(1)}
                            </span>
                            <span className="text-yellow-500">⭐</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Based on {stats?.totalReviews || 0} reviews
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="text-sm font-medium text-slate-600">Total Cases</h3>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-900">
                                {stats?.totalCasesHandled || 0}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Cases handled</p>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h3 className="text-sm font-medium text-slate-600">Success Rate</h3>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-900">
                                {Number(stats?.successRate || 0).toFixed(0)}%
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Case success rate</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-slate-900">Quick Actions</h2>
                    <div className="grid gap-4 md:grid-cols-4">
                        <ActionButton
                            title="Manage Consultations"
                            description="View and manage bookings"
                            icon="📅"
                            onClick={() => navigate('/lawyer/consultations')}
                        />
                        <ActionButton
                            title="View Client Queries"
                            description="Manage assigned cases"
                            icon="👥"
                            onClick={() => navigate('/lawyer/client-queries')}
                        />
                        <ActionButton
                            title="Case Requests"
                            description="Review new case requests"
                            icon="📋"
                            onClick={() => navigate('/lawyer/case-requests')}
                        />
                        <ActionButton
                            title="My Profile"
                            description="Update your information"
                            icon="⚙️"
                            onClick={() => navigate('/profile')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[color]}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
        </div>
    );
};

// Action Button Component
const ActionButton = ({ title, description, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-start gap-4 rounded-lg bg-white p-6 text-left shadow-md transition-all hover:shadow-lg hover:scale-105"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-2xl">
                {icon}
            </div>
            <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
        </button>
    );
};

export default LawyerDashboard;
