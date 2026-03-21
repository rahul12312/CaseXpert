import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Video, Star, Search, Filter, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingModal from '../components/BookingModal';

const VideoHub = () => {
    const navigate = useNavigate();
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        fetchLawyers();
    }, []);

    const fetchLawyers = async () => {
        try {
            const { data } = await api.get('/lawyers');
            if (data.success) {
                // For demo purposes, we'll mark some as 'online'
                const lawyersWithStatus = data.lawyers.map(l => ({
                    ...l,
                    is_online: Math.random() > 0.3 // Simulate online status
                }));
                setLawyers(lawyersWithStatus);
            }
        } catch (error) {
            console.error('Failed to fetch lawyers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenBooking = (lawyer) => {
        setSelectedLawyer(lawyer);
        setIsBookingOpen(true);
    };

    const filteredLawyers = lawyers.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading lawyers...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 md:p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Instant Video Consultations</h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl mb-8">
                        Connect with expert legal professionals from the comfort of your home. 
                        Get secure, encrypted, and professional legal advice in minutes.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20">
                            <Shield className="w-5 h-5 text-blue-300" />
                            <span className="font-semibold text-sm">End-to-End Encrypted</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20">
                            <Clock className="w-5 h-5 text-blue-300" />
                            <span className="font-semibold text-sm">Available 24/7</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-12">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search by name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                    />
                </div>
                <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    <Filter className="w-5 h-5" />
                    Filters
                </button>
            </div>

            {/* Step Selection Header */}
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-black text-slate-900 mb-2">1. Choose Your Legal Expert</h2>
                <p className="text-slate-500 font-medium">Select a lawyer to create your private consultation room</p>
            </div>

            {/* Online Now Section */}
            <div className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredLawyers.filter(l => l.is_online).map(lawyer => (
                        <div key={lawyer.id} className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 hover:border-blue-500 hover:shadow-2xl transition-all group hover:-translate-y-2 relative">
                            <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">Online Now</span>
                            </div>

                            <div className="flex gap-5 mb-8">
                                <div className="relative">
                                    <img 
                                        src={lawyer.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=random`} 
                                        alt={lawyer.name}
                                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50"
                                    />
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="font-black text-slate-900 text-xl group-hover:text-blue-600 transition-colors leading-tight">{lawyer.name}</h3>
                                    <p className="text-sm text-slate-500 font-bold mt-1">{lawyer.specialization}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`w-3 h-3 ${i <= (lawyer.rating || 5) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'}`} />
                                        ))}
                                        <span className="text-xs font-black text-slate-400 ml-1">{lawyer.rating || '5.0'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fee</div>
                                    <div className="font-black text-slate-900 text-lg">₹{lawyer.consultation_fee}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</div>
                                    <div className="font-black text-slate-900 text-lg">30 Min</div>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleOpenBooking(lawyer)}
                                className="w-full py-5 bg-blue-600 text-white rounded-[1.25rem] font-black flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 group/btn"
                            >
                                <Video className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                                Create Video Room
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Offline/Other Lawyers */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900">Recommended Experts</h2>
                    <div className="h-px flex-1 bg-slate-100 mx-6"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredLawyers.filter(l => !l.is_online).map(lawyer => (
                        <div key={lawyer.id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl transition-all opacity-90 hover:opacity-100 group">
                            <div className="flex items-center gap-4 mb-6">
                                <img 
                                    src={lawyer.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=random`} 
                                    alt={lawyer.name}
                                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-50"
                                />
                                <div className="overflow-hidden">
                                    <h3 className="font-black text-slate-900 truncate">{lawyer.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{lawyer.specialization}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleOpenBooking(lawyer)}
                                className="w-full py-3.5 border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-xs hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            >
                                Request Room
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {selectedLawyer && (
                <BookingModal 
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                    lawyerId={selectedLawyer.id}
                    lawyerName={selectedLawyer.name}
                    consultationFee={selectedLawyer.consultation_fee}
                    initialType="video_call"
                />
            )}
        </div>
    );
};

export default VideoHub;
