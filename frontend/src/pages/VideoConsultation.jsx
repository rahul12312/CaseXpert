import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoRoom from '../components/video/VideoRoom';
import api from '../lib/api';
import { Video, ShieldAlert, Loader2, Home } from 'lucide-react';

const VideoConsultation = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joined, setJoined] = useState(false);

    const roomName = `consultation_${roomId}`;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!roomId) {
            setError('Missing consultation ID');
            setLoading(false);
            return;
        }

        // Pre-fetch token but don't join automatically to allow camera preview if needed
        const fetchToken = async () => {
            try {
                setLoading(true);
                const response = await api.post('/video/token', {
                    room: roomName,
                    username: user.name || user.email
                });
                setToken(response.data.token);
                setError(null);
            } catch (err) {
                console.error('Error fetching Twilio token:', err);
                setError(err.response?.data?.message || 'Failed to connect to video service. Please ensure you are authorized to join this room.');
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, [roomId, user, navigate, roomName]);

    const handleJoin = () => {
        setJoined(true);
    };

    const handleLeave = () => {
        setJoined(false);
        navigate(-1); // Go back
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-xl font-medium animate-pulse">Initializing Secure Connection...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center">
                <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 max-w-md">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <div className="flex flex-col space-y-3">
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                        >
                            Try Again
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
                        >
                            <Home size={18} />
                            <span>Return to Dashboard</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (joined && token) {
        return (
            <VideoRoom 
                token={token} 
                roomName={roomName} 
                username={user.name || user.email} 
                userRole={user.role || user.user_type}
                onLeave={handleLeave} 
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
            <div className="max-w-2xl w-full">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 md:p-12 text-center">
                        <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
                            <Video className="w-12 h-12 text-indigo-400" />
                        </div>
                        
                        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Ready to Join?</h1>
                        <p className="text-lg text-slate-400 mb-10 max-w-sm mx-auto">
                            You are about to enter a secure video consultation for <span className="text-indigo-400 font-semibold">REF #{roomId}</span>.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-left">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">Identity</span>
                                <p className="text-white font-semibold">{user.name || user.email}</p>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-left">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">Room</span>
                                <p className="text-white font-semibold">{roomName}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleJoin}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl shadow-indigo-500/20 flex items-center justify-center space-x-3 group"
                            >
                                <span>Join Consultation</span>
                                <div className="p-1.5 bg-indigo-400/30 rounded-lg group-hover:translate-x-1 transition-transform">
                                    <Video size={20} />
                                </div>
                            </button>
                            
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full py-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-2xl font-semibold transition-all"
                            >
                                Not now, go back
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 p-6 flex items-center justify-center space-x-6 border-t border-white/5">
                        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
                            <ShieldAlert size={14} className="text-green-500" />
                            <span>End-to-End Encrypted</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Twilio Secure API</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoConsultation;
