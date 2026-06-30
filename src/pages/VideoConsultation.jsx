import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoRoom from '../components/video/VideoRoom';
import ZoomRoom from '../components/video/ZoomRoom';
import api from '../lib/api';
import { Video, ShieldAlert, Loader2, Home } from 'lucide-react';

const VideoConsultation = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [platform, setPlatform] = useState('twilio');
    const [zoomData, setZoomData] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joined, setJoined] = useState(false);

    const roomName = `consultation_${roomId}`;
    
    // Use a unique key for the main container to force re-render on roomId change
    const componentKey = `vc_${roomId}`;

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

        let pollInterval;

        // Pre-fetch token but don't join automatically to allow camera preview if needed
        const fetchToken = async (showLoading = true) => {
            try {
                if (showLoading) setLoading(true);
                const response = await api.post('/video/token', {
                    room: roomName,
                    username: user?.name || user?.email || 'Guest'
                });
                
                const data = response.data;
                setPlatform(data.platform || 'twilio');
                
                if (data.platform === 'zoom') {
                    setZoomData(data);
                    // If waiting for meeting, start polling
                    if (data.status === 'WAITING' && !pollInterval) {
                        pollInterval = setInterval(() => fetchToken(false), 5000);
                    } else if (data.status !== 'WAITING' && pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }
                } else {
                    setToken(data.token);
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }
                }
                
                setError(null);
            } catch (err) {
                console.error('Error fetching meeting credentials:', err);
                setError(err.response?.data?.message || 'Failed to connect to video service.');
                if (pollInterval) {
                    clearInterval(pollInterval);
                    pollInterval = null;
                }
            } finally {
                if (showLoading) setLoading(false);
            }
        };

        fetchToken();
        
        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [roomId, user, navigate]); // Removed roomName from dependencies as it's derived from roomId

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
                <p className="text-xl font-medium animate-pulse tracking-tight">Initializing Secure Hub Consultation...</p>
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

    if (joined) {
        if (platform === 'zoom' && zoomData) {
            return (
                <ZoomRoom 
                    zoomData={zoomData} 
                    onLeave={handleLeave} 
                />
            );
        }

        if (token) {
            return (
                <VideoRoom 
                    token={token} 
                    roomName={roomName} 
                    username={user?.name || user?.email || 'Guest'} 
                    userRole={user?.role || user?.user_type}
                    onLeave={handleLeave} 
                />
            );
        }
    }

    return (
        <div key={componentKey} className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 relative z-[60]">
            <div className="max-w-2xl w-full">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 md:p-12 text-center">
                        <div className={`inline-flex p-4 rounded-3xl mb-6 ${platform === 'zoom' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                            <Video className={`w-12 h-12 ${platform === 'zoom' ? 'text-blue-400' : 'text-indigo-400'}`} />
                        </div>
                        
                        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Ready to Join?</h1>
                        <p className="text-lg text-slate-400 mb-10 max-w-sm mx-auto">
                            You are about to enter a <span className="text-white font-bold uppercase tracking-widest">Secure Consultation</span> for <span className="text-white font-semibold">REF #{roomId}</span>.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-left">
                                <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${platform === 'zoom' ? 'text-blue-400' : 'text-indigo-400'}`}>Identity</span>
                                <p className="text-white font-semibold truncate">{user?.name || user?.email || 'Guest'}</p>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-left">
                                <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${platform === 'zoom' ? 'text-blue-400' : 'text-indigo-400'}`}>Platform</span>
                                <p className="text-white font-semibold capitalize">{platform}</p>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-left">
                                <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${platform === 'zoom' ? 'text-blue-400' : 'text-indigo-400'}`}>Security</span>
                                <p className="text-white font-semibold">End-to-End</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleJoin}
                                disabled={platform === 'zoom' && zoomData?.status === 'WAITING'}
                                className={`w-full py-5 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl flex items-center justify-center space-x-3 group ${
                                    platform === 'zoom' 
                                    ? (zoomData?.status === 'WAITING' ? 'bg-slate-700 cursor-not-allowed opacity-70' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20') 
                                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                                }`}
                            >
                                <span>
                                    {platform === 'zoom' && zoomData?.status === 'WAITING' 
                                        ? 'Waiting for Lawyer...' 
                                        : 'Join Secure Consultation'}
                                </span>
                                <div className={`p-1.5 rounded-lg group-hover:translate-x-1 transition-transform ${platform === 'zoom' ? 'bg-blue-400/30' : 'bg-indigo-400/30'}`}>
                                    {platform === 'zoom' && zoomData?.status === 'WAITING' ? <Loader2 size={20} className="animate-spin" /> : <Video size={20} />}
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
                        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            <ShieldAlert size={14} className="text-green-500" />
                            <span>End-to-End Encrypted</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span>CaseXpert Secure API</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoConsultation;
