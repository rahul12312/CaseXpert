import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Bot, Briefcase, Gavel, Video, FileText, 
  BarChart2, BookOpen, Clock, Check, Bell, 
  User, Settings, LogOut, LayoutDashboard, 
  Calendar, MessageSquare, Shield, Zap, TrendingUp, Search
} from 'lucide-react';

const ClientDashboard = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [recentCases, setRecentCases] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeCases: 0,
        upcomingMeetings: 0,
        pendingReports: 0
    });

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

    const sidebarLinks = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'AI Counsel', path: '/assistant', icon: Bot, badge: 'Smart' },
        { name: 'Litigation Hub', path: '/cases', icon: Briefcase },
        { name: 'Legal Market', path: '/lawyers', icon: Gavel },
        { name: 'Drafting Room', path: '/documents', icon: FileText },
        { name: 'Consultations', path: '/video-hub', icon: Video },
        { name: 'Knowledge Center', path: '/news', icon: BookOpen },
        { name: 'Analytics', path: '/reports', icon: BarChart2 },
        { name: 'Calendar', path: '/bookings', icon: Calendar },
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020617]">
                <div className="relative">
                    <div className="h-20 w-20 animate-spin rounded-full border-b-4 border-indigo-500" />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-xs">AI</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#020617] text-slate-300 overflow-hidden font-sans">
            {/* Sidebar with Glassmorphism */}
            <aside className="relative z-50 hidden h-screen w-80 lg:flex flex-col border-r border-slate-800/50 bg-[#020617]/50 backdrop-blur-3xl">
                <div className="p-8 pb-10">
                    <div className="flex items-center gap-4 px-2">
                        <div className="relative h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                            <span className="text-2xl">⚖️</span>
                            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#020617]"></div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white tracking-tight">CaseXpert</span>
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Legal Ecosystem</div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 px-6 overflow-y-auto custom-scrollbar">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-300 group ${
                                location.pathname === link.path
                                    ? 'bg-indigo-600 shadow-[0_4px_20px_rgba(79,70,229,0.3)] text-white'
                                    : 'hover:bg-slate-800/50 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <link.icon className={`h-5 w-5 ${
                                    location.pathname === link.path ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400 shadow-glow'
                                }`} />
                                <span className="font-bold text-sm tracking-wide">{link.name}</span>
                            </div>
                            {link.badge && (
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                    location.pathname === link.path ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                                }`}>
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-8 mt-auto">
                    <button 
                        onClick={() => logout()}
                        className="mt-8 flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group"
                    >
                        <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-500 group-hover:scale-110 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,0.3),rgba(2,6,23,1))] relative">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Top Nav */}
                <header className="sticky top-0 z-40 px-10 pt-8 pb-4 flex items-center justify-between backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search everything..." 
                                className="w-96 pl-12 pr-6 py-3 bg-[#0f172a] border border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4 text-right">
                           <div className="hidden sm:block">
                                <div className="text-sm font-black text-white">{user?.name}</div>
                                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Online Security
                                </div>
                           </div>
                           <Link to="/profile" className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                                <div className="h-full w-full rounded-[14px] bg-[#020617] flex items-center justify-center overflow-hidden">
                                     <span className="text-sm font-black text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                                </div>
                           </Link>
                        </div>
                        <button className="h-12 w-12 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <div className="px-10 py-8 space-y-12">
                    {/* Welcome Text */}
                    <div className="relative">
                        <h2 className="text-4xl font-black text-white tracking-tight">Intelligence Dashboard</h2>
                        <p className="text-slate-500 mt-2 font-medium">Hello, {user?.name.split(' ')[0]}. Here is what's monitored on your legal ecosystem.</p>
                    </div>

                    {/* Futuristic Stats Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <InsightCard 
                            title="Active Litigation" 
                            count={stats.activeCases} 
                            icon={Briefcase} 
                            color="indigo" 
                            trend="+2 Pending"
                        />
                        <InsightCard 
                            title="Scheduled Calls" 
                            count={stats.upcomingMeetings} 
                            icon={Calendar} 
                            color="purple" 
                            trend="Next: Today 5 PM"
                        />
                        <InsightCard 
                            title="Audit Reports" 
                            count={stats.pendingReports} 
                            icon={Shield} 
                            color="emerald" 
                            trend="Systems Secure"
                        />
                    </div>

                    {/* Middle Section: Records & History */}
                    <div className="grid gap-8 xl:grid-cols-3">
                        <div className="xl:col-span-2 space-y-8">
                            <div className="rounded-[2.5rem] bg-[#0f172a]/50 border border-slate-800/50 p-8 shadow-2xl backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,1)]"></div>
                                        Repository Records
                                    </h3>
                                    <Link to="/cases" className="text-xs font-black text-indigo-400 hover:underline uppercase tracking-widest">Global Scan</Link>
                                </div>

                                <div className="space-y-4">
                                    {recentCases.length > 0 ? (
                                        recentCases.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl bg-[#020617]/40 border border-slate-800/30 hover:border-indigo-500/30 transition-all group">
                                               <div className="flex items-center gap-5">
                                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                                        <FileText className="h-6 w-6 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-100">{item.title}</h4>
                                                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">REF ID: {item.case_number}</p>
                                                    </div>
                                               </div>
                                               <div className="flex items-center gap-10">
                                                    <div className="hidden md:block text-right">
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Updated</div>
                                                        <div className="text-xs font-bold text-slate-300">Today</div>
                                                    </div>
                                                    <StatusPill status={item.status} />
                                               </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center opacity-50">No cases currently indexed.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Consultations Panel */}
                        <div className="rounded-[2.5rem] bg-indigo-900/10 border border-indigo-500/10 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp size={150} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                                    Recent Interactions
                                </h3>
                                
                                <div className="space-y-6 flex-1">
                                    {recentBookings.length > 0 ? (
                                        recentBookings.map((b) => (
                                            <div key={b.id} className="flex gap-4 group/item">
                                                <div className="relative flex-shrink-0">
                                                    <img 
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(b.lawyer_name)}&background=random`} 
                                                        alt={b.lawyer_name} 
                                                        className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/20 shadow-lg"
                                                    />
                                                    {b.status === 'confirmed' && <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-indigo-500 rounded-full border-2 border-[#020617] animate-pulse"></div>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-black text-white truncate">{b.lawyer_name}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 mt-0.5 truncate uppercase tracking-tighter">
                                                        {new Date(b.booking_time).toLocaleDateString()} at {new Date(b.booking_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                    {b.status === 'confirmed' && (
                                                        <Link to={`/consultation/B${b.id}`} className="inline-block mt-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300">
                                                            Connect Securely →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center opacity-50">Consultation logs empty.</div>
                                    )}
                                </div>
                                
                                <button className="mt-10 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">
                                    Request New Counsel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Quick Tools */}
                    <section>
                         <h3 className="text-lg font-black text-white uppercase tracking-tight mb-8">Accelerator Tools</h3>
                         <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            <ToolBox 
                                title="AI Assistant" 
                                desc="LLM Legal Research" 
                                icon={Bot}
                                link="/assistant"
                                color="bg-blue-500"
                            />
                            <ToolBox 
                                title="Legal Market" 
                                desc="Expert Matchmaking" 
                                icon={Gavel}
                                link="/lawyers"
                                color="bg-purple-500"
                            />
                            <ToolBox 
                                title="Drafting Engine" 
                                desc="Contract Automations" 
                                icon={FileText}
                                link="/documents"
                                color="bg-emerald-500"
                            />
                            <ToolBox 
                                title="Insights Portal" 
                                desc="Outcome Probability" 
                                icon={Zap}
                                link="/reports"
                                color="bg-amber-500"
                            />
                         </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

const InsightCard = ({ title, count, icon: Icon, color, trend }) => {
    const colors = {
        indigo: 'border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-500/50',
        purple: 'border-purple-500/20 shadow-purple-500/5 hover:border-purple-500/50',
        emerald: 'border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/50',
    };
    
    const iconColors = {
        indigo: 'text-indigo-400 bg-indigo-500/10',
        purple: 'text-purple-400 bg-purple-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10',
    };

    return (
        <div className={`p-8 rounded-[2.5rem] bg-[#0f172a]/50 border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 shadow-2xl group ${colors[color]}`}>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${iconColors[color]}`}>
                <Icon size={24} />
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{title}</h4>
                    <div className="text-5xl font-black text-white">{count}</div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    {trend}
                </div>
            </div>
        </div>
    );
};

const ToolBox = ({ title, desc, icon: Icon, link, color }) => (
    <Link to={link} className="p-8 rounded-[2rem] bg-[#0f172a]/40 border border-slate-800/50 hover:bg-slate-800/50 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
        <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${color}`}></div>
        <Icon className="h-8 w-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
        <h4 className="text-sm font-black text-white">{title}</h4>
        <p className="text-[11px] font-bold text-slate-500 mt-1">{desc}</p>
    </Link>
);

const StatusPill = ({ status }) => {
    const s = String(status).toLowerCase();
    const map = {
        open: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        assigned: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        closed: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        in_progress: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    };
    return (
        <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${map[s] || map.pending}`}>
            {s.replace('_', ' ')}
        </span>
    );
}

export default ClientDashboard;
