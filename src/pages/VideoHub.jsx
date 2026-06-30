import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
    Video, Star, Search, Filter, Shield, Clock, 
    Calendar, Layout, Users, ChevronRight, 
    Activity, History, ExternalLink, Play
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';

const VideoHub = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lawyers, setLawyers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isInstantBooking, setIsInstantBooking] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bookings', 'lawyers'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [lawyersRes, bookingsRes] = await Promise.all([
                api.get('/lawyers'),
                api.get('/bookings/user')
            ]);

            if (lawyersRes.data.success) {
                const lawyersWithStatus = (lawyersRes.data.data || lawyersRes.data.lawyers || []).map(l => ({
                    ...l,
                    name: l.name || l.user?.name || 'Unnamed Expert',
                    specialization: l.specialization || (Array.isArray(l.practice_areas) ? l.practice_areas[0] : l.practice_areas) || 'Legal Expert',
                    image: l.profile_image || l.user?.profile_image,
                    is_online: Math.random() > 0.3
                }));
                setLawyers(lawyersWithStatus);
            }

            if (bookingsRes.data.success) {
                setBookings(bookingsRes.data.bookings);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenBooking = (lawyer, isInstant = false) => {
        setSelectedLawyer(lawyer);
        setIsInstantBooking(isInstant);
        setIsBookingOpen(true);
    };

    const filteredLawyers = lawyers.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const now = new Date();
    const isExpired = (bookingTime) => (now - new Date(bookingTime)) > 3600000;

    const upcomingBookings = bookings.filter(b => (b.status === 'confirmed' || b.status === 'pending') && !isExpired(b.booking_time));
    const pastBookings = bookings.filter(b => 
        ['completed', 'cancelled', 'rejected'].includes(b.status) || 
        ((b.status === 'confirmed' || b.status === 'pending') && isExpired(b.booking_time))
    );

    const filteredBookings = activeTab === 'overview' ? upcomingBookings : 
                             activeTab === 'my-bookings' ? pastBookings : [];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Layout className="w-10 h-10 text-blue-600" />
                        Video Consult Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Welcome back, {user?.name}. Manage your consultations and find legal experts.
                    </p>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start md:self-center">
                    {[
                        { id: 'overview', label: 'Overview', icon: Layout },
                        { id: 'bookings', label: 'My Bookings', icon: Calendar },
                        { id: 'lawyers', label: 'Find Experts', icon: Users },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Active/Upcoming Consultation Highlight */}
                    {upcomingBookings.length > 0 ? (
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full w-fit mb-6 border border-white/20">
                                        <Activity className="w-4 h-4 text-blue-300 animate-pulse" />
                                        <span className="text-xs font-black uppercase tracking-widest">Next Consultation</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                        Meeting with <br/>
                                        <span className="text-blue-200">{upcomingBookings[0].lawyer_name}</span>
                                    </h2>
                                    <div className="flex flex-wrap gap-6 mb-10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white/10 rounded-2xl">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Date</p>
                                                <p className="font-bold">{new Date(upcomingBookings[0].booking_time).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white/10 rounded-2xl">
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Time</p>
                                                <p className="font-bold">{new Date(upcomingBookings[0].booking_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {upcomingBookings[0].status === 'confirmed' ? (
                                            <button 
                                                onClick={() => navigate(`/consultation/B${upcomingBookings[0].id}`)}
                                                className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                                            >
                                                <Play className="w-5 h-5 fill-current" />
                                                Join Now
                                            </button>
                                        ) : (
                                            <button className="px-8 py-4 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-black cursor-not-allowed">
                                                Awaiting Confirmation
                                            </button>
                                        )}
                                        <Link 
                                            to="/video-hub" 
                                            onClick={(e) => { e.preventDefault(); setActiveTab('bookings'); }}
                                            className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-2xl font-black hover:bg-white/5 transition-all"
                                        >
                                            View All Bookings
                                        </Link>
                                    </div>
                                </div>
                                <div className="hidden lg:block w-72 h-72 relative">
                                    <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping opacity-20"></div>
                                    <img 
                                        src={upcomingBookings[0].lawyer_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(upcomingBookings[0].lawyer_name)}&background=random`}
                                        alt="Lawyer"
                                        className="w-full h-full rounded-full object-cover ring-8 ring-white/10 shadow-2xl relative z-10"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Upcoming Consultations</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                You don't have any scheduled meetings. Book an instant consultation with one of our top legal experts now.
                            </p>
                            <button 
                                onClick={() => setActiveTab('lawyers')}
                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95"
                            >
                                Find a Lawyer
                            </button>
                        </div>
                    )}

                    {/* Quick Stats & Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Secure Consultations</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">All video rooms are end-to-end encrypted for your privacy.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Clock className="w-7 h-7 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">24/7 Availability</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Legal experts available round the clock for your urgent needs.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <History className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Detailed History</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Access logs and notes from all your past legal sessions.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Bookings History</h2>
                        <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {bookings.length} Total
                        </span>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 font-bold">No booking history found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {bookings.map(booking => (
                                <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-8 items-center hover:shadow-2xl transition-all group">
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-black uppercase text-slate-400 mb-1">
                                            {new Date(booking.booking_time).toLocaleDateString(undefined, { month: 'short' })}
                                        </span>
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                                            {new Date(booking.booking_time).getDate()}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {booking.status}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(booking.booking_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{booking.lawyer_name}</h3>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{booking.specialization}</p>
                                    </div>

                                    <div className="shrink-0 flex gap-2">
                                        {booking.status === 'confirmed' ? (
                                            <button 
                                                onClick={() => navigate(`/consultation/B${booking.id}`)}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 transition-all"
                                            >
                                                <Video className="w-4 h-4" />
                                                Join Meeting
                                            </button>
                                        ) : (
                                            <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-black text-sm cursor-not-allowed">
                                                Details
                                            </button>
                                        )}
                                        <Link 
                                            to={`/lawyer/${booking.lawyer._id || booking.lawyer}`}
                                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                        >
                                            <ExternalLink className="w-5 h-5 text-slate-400" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'lawyers' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                            <input 
                                type="text" 
                                placeholder="Search by name, specialization, or expertise..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium"
                            />
                        </div>
                        <button className="px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] flex items-center gap-3 font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group">
                            <Filter className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            Filters
                        </button>
                    </div>

                    {/* Lawyers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredLawyers.map(lawyer => (
                            <div key={lawyer.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 p-8 hover:border-blue-500 hover:shadow-2xl transition-all group relative overflow-hidden">
                                {lawyer.is_online && (
                                    <div className="absolute top-6 right-6 flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                        <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Available</span>
                                    </div>
                                )}

                                <div className="flex gap-6 mb-8">
                                    <img 
                                        src={lawyer.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=random`} 
                                        alt={lawyer.name}
                                        className="w-24 h-24 rounded-3xl object-cover ring-8 ring-slate-50 dark:ring-slate-800 group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="pt-2">
                                        <h3 className="font-black text-slate-900 dark:text-white text-2xl leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                            {lawyer.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">{lawyer.specialization}</p>
                                        <div className="flex items-center gap-1.5 mt-3">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-black text-slate-900 dark:text-white">{lawyer.rating || '5.0'}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">(24 Reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consultation</p>
                                        <p className="font-black text-slate-900 dark:text-white text-lg">₹{lawyer.consultation_fee}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                                         <p className="font-black text-slate-900 dark:text-white text-lg">{lawyer.experience || '10+'}+ Yrs</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleOpenBooking(lawyer, true)}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 group/btn"
                                >
                                    <Video className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                                    Instant Room
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedLawyer && (
                <BookingModal 
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                    lawyerId={selectedLawyer.id}
                    lawyerName={selectedLawyer.name}
                    consultationFee={selectedLawyer.consultation_fee}
                    initialType="video_call"
                    initialDescription={isInstantBooking ? "I would like an instant video consultation right now. I am online and ready to join." : ""}
                    initialTime={isInstantBooking ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : ""}
                    onSuccess={fetchData} // Refresh data after booking
                />
            )}
        </div>
    );
};

export default VideoHub;

