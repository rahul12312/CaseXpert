import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Video, 
    Clock, 
    Check, 
    X, 
    Bell, 
    Briefcase, 
    CheckCircle, 
    Hourglass, 
    Calendar, 
    TrendingUp, 
    Award,
    ChevronRight,
    Users,
    ClipboardList,
    Settings,
    Star,
    ExternalLink,
    Loader2
} from 'lucide-react';

const LawyerDashboard = () => {
    const { user, isLawyer } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [pendingMeetings, setPendingMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLawyer()) {
            navigate('/assistant');
            return;
        }

        fetchDashboardStats();
        fetchPendingMeetings();

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
                navigate(`/consultation/B${id}`);
            }
        } catch (error) {
            alert('Failed to accept meeting');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-ping" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 sm:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="relative mb-12 p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-2xl shadow-blue-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase">
                                    {stats?.verification_status === 'VERIFIED' ? 'Verified Partner' : 'Standard Account'}
                                </span>
                                <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                                Welcome back, <span className="text-blue-100">
                                    {user?.name?.startsWith('Adv.') ? user?.name : user?.name?.split(' ')[0]}
                                </span>
                            </h1>
                            <p className="text-blue-100/80 font-medium max-w-lg">
                                You have {pendingMeetings.length} pending consultation requests and {stats?.todayConsultations || 0} meetings scheduled for today.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex flex-col items-end">
                                <div className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Performance</div>
                                <div className="flex items-center gap-1 text-2xl font-black">
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                    <span>+{stats?.successPercentage || stats?.successRate || 0}%</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/profile')}
                                className="p-4 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-2xl transition-all border border-white/10 group shadow-lg"
                            >
                                <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications Panel */}
                {pendingMeetings.length > 0 && (
                    <div className="mb-12 text-black dark:text-white">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                <Bell className="w-5 h-5 animate-bounce" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white">Active Requests</h2>
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-black">
                                LIVE
                            </span>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {pendingMeetings.map(meeting => (
                                <div key={meeting.id} className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-500/50 transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/30">
                                                {meeting.user_name?.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center p-1 border-2 border-slate-50 dark:border-slate-900">
                                                <Video className="w-3 h-3 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white leading-tight">{meeting.user_name}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Video Consultation</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Scheduled At</p>
                                            <p className="text-sm font-black text-slate-700 dark:text-white">
                                                {new Date(meeting.booking_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleAcceptMeeting(meeting.id)}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 group-hover:translate-y-[-2px]"
                                    >
                                        <CheckCircle className="w-5 h-5" /> Accept & Start
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Stats Grid */}
                <div className="mb-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Active Cases"
                        value={stats?.activeCases || 0}
                        icon={Briefcase}
                        color="blue"
                        trend="+2 New"
                    />
                    <StatCard
                        title="Success Rate"
                        value={`${Number(stats?.successPercentage || stats?.successRate || 0).toFixed(0)}%`}
                        icon={TrendingUp}
                        color="green"
                        trend="Top 5%"
                    />
                    <StatCard
                        title="Consultations"
                        value={stats?.totalConsultations || 0}
                        icon={Users}
                        color="indigo"
                        trend="Lifetime"
                    />
                    <StatCard
                        title="Rating"
                        value={Number(stats?.rating || 4.8).toFixed(1)}
                        icon={Star}
                        color="amber"
                        trend={`${stats?.totalReviews || 0} reviews`}
                    />
                </div>

                {/* Sub Stats & Quick Actions */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Account Summary</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-600 dark:text-slate-400">Completed Cases</span>
                                    </div>
                                    <span className="text-xl font-black text-slate-900 dark:text-white">{stats?.completedCases || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl text-yellow-600">
                                            <Hourglass className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-600 dark:text-slate-400">Pending Requests</span>
                                    </div>
                                    <span className="text-xl font-black text-slate-900 dark:text-white">{stats?.pendingRequests || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-600 dark:text-slate-400">Pro Bono</span>
                                    </div>
                                    <span className="text-xl font-black text-slate-900 dark:text-white">5</span>
                                </div>
                            </div>
                        </div>

                        {/* Verification Card */}
                        <div className={`p-8 rounded-[2rem] border overflow-hidden relative ${
                            stats?.verification_status === 'VERIFIED' 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-900/10 dark:border-amber-900/20'
                        }`}>
                            <div className="relative z-10">
                                <h3 className={`font-black uppercase tracking-widest text-xs mb-2 ${
                                    stats?.verification_status === 'VERIFIED' ? 'text-blue-100' : 'text-amber-600'
                                }`}>
                                    Verification
                                </h3>
                                <p className="text-xl font-black mb-1">
                                    {stats?.verification_status === 'VERIFIED' ? 'Account Verified' : 'Pending Review'}
                                </p>
                                <p className={`text-xs font-bold leading-relaxed ${
                                    stats?.verification_status === 'VERIFIED' ? 'text-blue-100/70' : 'text-amber-800/70 dark:text-amber-300/50'
                                }`}>
                                    {stats?.verification_status === 'VERIFIED' 
                                        ? 'Your account is fully verified and appearing in marketplace search results.'
                                        : 'Our team is reviewing your credentials. This usually takes 24-48 hours.'}
                                </p>
                            </div>
                            <CheckCircle className={`absolute top-0 right-0 w-32 h-32 -translate-y-4 translate-x-4 opacity-10 ${
                                stats?.verification_status === 'VERIFIED' ? 'text-white' : 'text-amber-600'
                            }`} />
                        </div>
                    </div>

                    {/* Right Quick Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <ActionButton
                                title="Consultations"
                                description="Manage your video bookings"
                                icon={Calendar}
                                color="blue"
                                onClick={() => navigate('/lawyer/consultations')}
                            />
                            <ActionButton
                                title="Client Queries"
                                description="View and respond to queries"
                                icon={Users}
                                color="indigo"
                                onClick={() => navigate('/lawyer/client-queries')}
                            />
                            <ActionButton
                                title="Case Requests"
                                description="Check new assignment requests"
                                icon={ClipboardList}
                                color="amber"
                                onClick={() => navigate('/lawyer/case-requests')}
                            />
                            <ActionButton
                                title="Edit Profile"
                                description="Update your professional biography"
                                icon={Settings}
                                color="slate"
                                onClick={() => navigate('/profile')}
                            />
                        </div>

                        {/* Recent Activity Mock */}
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                                <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                            </div>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1 border-b border-slate-50 dark:border-slate-800 pb-4">
                                            <p className="text-sm font-bold text-slate-700 dark:text-white">Successfully completed consultation with Client #{i}204</p>
                                            <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modern Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const colorStyles = {
        blue: 'bg-blue-500 shadow-blue-500/20',
        green: 'bg-green-500 shadow-green-500/20',
        amber: 'bg-amber-500 shadow-amber-500/20',
        indigo: 'bg-indigo-500 shadow-indigo-500/20',
        slate: 'bg-slate-500 shadow-slate-500/20',
    };

    return (
        <div className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:shadow-2xl hover:translate-y-[-4px]">
            <div className={`w-14 h-14 rounded-2xl ${colorStyles[color]} flex items-center justify-center text-white mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                    <span className="text-[10px] font-black text-green-500 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-full">{trend}</span>
                </div>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
            </div>
        </div>
    );
};

// Premium Action Button Component
const ActionButton = ({ title, description, icon: Icon, color, onClick }) => {
    const colorStyles = {
        blue: 'from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900 border-blue-100 dark:border-blue-900/30 text-blue-600',
        indigo: 'from-indigo-50 to-white dark:from-indigo-900/10 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/30 text-indigo-600',
        amber: 'from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-900 border-amber-100 dark:border-amber-900/30 text-amber-600',
        slate: 'from-slate-50 to-white dark:from-slate-900/10 dark:to-slate-900 border-slate-100 dark:border-slate-800 text-slate-600',
    };

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-start p-8 rounded-[2rem] text-left border bg-gradient-to-br ${colorStyles[color]} transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 dark:hover:shadow-none group relative overflow-hidden`}
        >
            <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-700">
                <Icon size={120} />
            </div>
            <div className={`p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md mb-6 transition-transform group-hover:scale-110`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="relative z-10">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    {title}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">{description}</p>
            </div>
        </button>
    );
};

export default LawyerDashboard;
