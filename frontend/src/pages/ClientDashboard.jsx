import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import {
    Bell, Search, Briefcase, Calendar, Shield,
    FileText, TrendingUp, Bot, Gavel, Zap
} from 'lucide-react';

const ClientDashboard = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [recentCases, setRecentCases] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationRef = React.useRef(null);
    const [stats, setStats] = useState({
        activeCases: 0,
        upcomingMeetings: 0,
        pendingReports: 0
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const caseRes = await api.get('/case');
                const cases = caseRes.data.data || caseRes.data.cases || [];
                setRecentCases(cases.slice(0, 4));
                setNotifications(cases.slice(0, 4));

                const bookingRes = await api.get('/bookings/user');
                const bookings = bookingRes.data.bookings || [];
                setRecentBookings(bookings.slice(0, 4));

                const active = cases.filter(c => ['open', 'pending', 'assigned', 'in_progress'].includes(String(c.status).toLowerCase())).length;
                const upcoming = bookings.filter(b => b.status === 'confirmed').length;

                setStats({
                    activeCases: active,
                    upcomingMeetings: upcoming,
                    pendingReports: 3
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, navigate]);



    const handleClearNotifications = () => {
        setNotifications([]);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#020617]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-20 w-20 animate-spin rounded-full border-b-4 border-indigo-500" />
                        <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                            <Gavel className="h-7 w-7" />
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen pt-16 bg-slate-50 dark:bg-[#020617] text-slate-700 dark:text-slate-300 overflow-hidden font-sans">

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(241,245,249,1),rgba(248,250,252,1))] dark:bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,0.3),rgba(2,6,23,1))] relative min-w-0">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Top Nav */}
                <header className="sticky top-0 z-40 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 flex items-center gap-3 backdrop-blur-sm">

                    {/* Search Bar */}
                    <div className="relative group flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search cases, documents..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner text-slate-700 dark:text-slate-300 placeholder-slate-400"
                        />
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* User Avatar (hidden on very small, shown sm+) */}
                        <Link to="/profile" className="hidden sm:flex h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                            <div className="h-full w-full rounded-[10px] bg-slate-50 dark:bg-[#020617] flex items-center justify-center overflow-hidden">
                                <span className="text-xs font-black text-slate-900 dark:text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="h-10 w-10 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className={`h-10 w-10 rounded-xl bg-white dark:bg-[#0f172a] border ${notificationsOpen ? 'border-indigo-400 dark:border-indigo-500' : 'border-slate-200 dark:border-slate-800'} flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors relative`}
                                aria-label="Notifications"
                            >
                                <Bell className="h-4 w-4" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2 h-2 w-2 bg-indigo-500 rounded-full border-2 border-white dark:border-[#0f172a]" />
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-[100] overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
                                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-xs">Notifications</h3>
                                        {notifications.length > 0 && (
                                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black">
                                                {notifications.length} NEW
                                            </span>
                                        )}
                                    </div>
                                    <div className="max-h-[280px] overflow-y-auto p-3 space-y-2">
                                        {notifications.length > 0 ? (
                                            notifications.map((c, idx) => (
                                                <div key={idx} className="group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                                    <div className="flex gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                                            <Briefcase className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{c.title}</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Status: <span className="text-indigo-500 font-bold uppercase">{c.status}</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700 mb-3" />
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No new updates</p>
                                            </div>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                onClick={handleClearNotifications}
                                                className="w-full py-2.5 text-xs font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-colors"
                                            >
                                                Clear all notifications
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-8">
                    {/* Welcome Text */}
                    <div className="relative">
                        <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Dashboard</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                            Hello, {user?.name?.startsWith('Adv.') ? user?.name : user?.name?.split(' ')[0]}. Here's your legal ecosystem overview.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <InsightCard
                            title="Active Litigation"
                            count={stats.activeCases}
                            icon={Briefcase}
                            color="indigo"
                            trend="+2 Pending"
                            onClick={() => navigate('/cases')}
                        />
                        <InsightCard
                            title="Scheduled Calls"
                            count={stats.upcomingMeetings}
                            icon={Calendar}
                            color="purple"
                            trend="Next: Today 5 PM"
                            onClick={() => navigate('/bookings')}
                        />
                        <InsightCard
                            title="Audit Reports"
                            count={stats.pendingReports}
                            icon={Shield}
                            color="emerald"
                            trend="Systems Secure"
                            onClick={() => navigate('/reports')}
                        />
                    </div>

                    {/* Middle Section: Records & History */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Repository Records */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-800/50 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,1)]"></div>
                                        Repository Records
                                    </h3>
                                    <Link to="/cases" className="text-[10px] sm:text-xs font-black text-indigo-400 hover:underline uppercase tracking-widest">Global Scan</Link>
                                </div>

                                <div className="space-y-3">
                                    {recentCases.length > 0 ? (
                                        recentCases.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#020617]/40 border border-slate-200 dark:border-slate-800/30 hover:border-indigo-500/30 transition-all group">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-indigo-100/50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">{item.title}</h4>
                                                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider truncate">REF: {item.case_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-4 ml-2 shrink-0">
                                                    <div className="hidden md:block text-right">
                                                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Updated</div>
                                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Today</div>
                                                    </div>
                                                    <StatusPill status={item.status} />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-16 text-center opacity-50 text-sm">No cases currently indexed.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Consultations Panel */}
                        <div className="rounded-2xl sm:rounded-3xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-500/10 p-4 sm:p-6 shadow-xl backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp size={120} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-5">
                                    Recent Interactions
                                </h3>

                                <div className="space-y-4 flex-1">
                                    {recentBookings.length > 0 ? (
                                        recentBookings.map((b) => (
                                            <div key={b.id} className="flex gap-3 group/item">
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(b.lawyer_name)}&background=random`}
                                                        alt={b.lawyer_name}
                                                        className="h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-500/20 shadow-lg"
                                                    />
                                                    {b.status === 'confirmed' && <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-[#020617] animate-pulse"></div>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">{b.lawyer_name}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate uppercase tracking-tighter">
                                                        {new Date(b.booking_time).toLocaleDateString()} at {new Date(b.booking_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    {b.status === 'confirmed' && (
                                                        <Link to={`/consultation/B${b.id}`} className="inline-block mt-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300">
                                                            Connect →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-16 text-center opacity-50 text-sm">Consultation logs empty.</div>
                                    )}
                                </div>

                                <button className="mt-6 w-full py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-white/10 transition-all">
                                    Request New Counsel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Accelerator Tools */}
                    <section>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 sm:mb-5">Accelerator Tools</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <ToolBox title="AI Assistant" desc="LLM Legal Research" icon={Bot} link="/assistant" color="bg-blue-500" />
                            <ToolBox title="Legal Market" desc="Expert Matchmaking" icon={Gavel} link="/lawyers" color="bg-purple-500" />
                            <ToolBox title="Drafting Engine" desc="Contract Automations" icon={FileText} link="/documents" color="bg-emerald-500" />
                            <ToolBox title="Insights Portal" desc="Outcome Probability" icon={Zap} link="/reports" color="bg-amber-500" />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

const InsightCard = ({ title, count, icon: Icon, color, trend, onClick }) => {
    const colors = {
        indigo: 'border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-500/50',
        purple: 'border-purple-500/20 shadow-purple-500/5 hover:border-purple-500/50',
        emerald: 'border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/50',
    };

    const iconColors = {
        indigo: 'text-indigo-400 bg-indigo-100/50 dark:bg-indigo-500/10',
        purple: 'text-purple-400 bg-purple-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10',
    };

    return (
        <div 
            onClick={onClick}
            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0f172a]/50 border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 shadow-xl group ${colors[color]} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
        >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${iconColors[color]}`}>
                <Icon size={18} />
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-1">{title}</h4>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{count}</div>
                </div>
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right max-w-[80px]">
                    {trend}
                </div>
            </div>
        </div>
    );
};

const ToolBox = ({ title, desc, icon: Icon, link, color }) => (
    <Link to={link} className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
        <div className={`absolute -right-4 -bottom-4 h-20 w-20 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${color}`}></div>
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{title}</h4>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
    </Link>
);

const StatusPill = ({ status }) => {
    const s = String(status).toLowerCase();
    const map = {
        open: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        assigned: 'text-indigo-400 bg-indigo-100/50 dark:bg-indigo-500/10 border-indigo-500/20',
        closed: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        in_progress: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    };
    return (
        <span className={`px-2.5 py-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${map[s] || map.pending}`}>
            {s.replace('_', ' ')}
        </span>
    );
};

export default ClientDashboard;
