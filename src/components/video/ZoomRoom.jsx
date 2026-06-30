// CaseXpert Premium Video Hub - v1.1.0
import React, { useEffect, useState } from 'react';
import { Video, ExternalLink, ShieldCheck, User, Info, AlertCircle, Play, Loader2, Monitor, Users, Clock, Radio } from 'lucide-react';

const ZoomEmbeddedSession = React.lazy(() => import('./ZoomEmbeddedSession'));

const ZoomRoom = ({ zoomData, onLeave }) => {
    const { signature, sdkKey, meetingNumber, userName, userRole, zoomJoinUrl, zoomStartUrl, zakToken, zoomPassword } = zoomData;
    const [isJoiningSDK, setIsJoiningSDK] = useState(false);

    useEffect(() => {
        console.log('🔗 ZoomRoom initialized:', { meetingNumber, userName, userRole });
        
        if (isJoiningSDK) {
            document.body.classList.add('zoom-active');
        } else {
            document.body.classList.remove('zoom-active');
        }

        return () => {
            document.body.classList.remove('zoom-active');
        };
    }, [meetingNumber, userName, userRole, isJoiningSDK]);

    const handleJoinSDK = () => {
        setIsJoiningSDK(true);
    };

    if (isJoiningSDK) {
        return (
            <React.Suspense fallback={
                <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-950">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                    <h1 className="text-white font-black text-xl tracking-tight mb-2">Syncing Hub...</h1>
                </div>
            }>
                <ZoomEmbeddedSession 
                    zoomData={zoomData} 
                    onLeave={() => {
                        setIsJoiningSDK(false);
                        onLeave();
                    }} 
                />
            </React.Suspense>
        );
    }

    const isHost = !!zoomStartUrl;
    const pwd = zoomPassword || '';
    const baseUrl = zoomStartUrl || zoomJoinUrl;
    
    // Construct the most reliable Web Client URL that honors the 'uname' parameter
    let webJoinUrl = `https://zoom.us/wc/join/${meetingNumber}?pwd=${pwd}&uname=${encodeURIComponent(userName)}`;
    
    // If we have a zakToken (Lawyer/Host), we MUST use it for browser-based hosting
    if (isHost && zakToken) {
        webJoinUrl += `&zak=${zakToken}`;
    }
    
    console.log('🔗 Final Redirect URL:', webJoinUrl);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
            <div className="max-w-xl w-full">
                <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    
                    <div className="p-10 md:p-14 text-center">
                        <div className="inline-flex p-5 rounded-3xl bg-blue-500/10 border border-blue-500/20 mb-8">
                            <Video className="w-14 h-14 text-blue-400" />
                        </div>
                        
                        <h1 className="text-4xl font-black mb-4 tracking-tight">Zoom Meeting Ready</h1>
                        <p className="text-lg text-slate-400 mb-10 italic">
                            "A secure meeting room has been generated on Zoom."
                        </p>

                        <div className="space-y-4 mb-10">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between text-left">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-xl">
                                        <User className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Joining As</span>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${isHost ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                {isHost ? 'HOST' : 'PARTICIPANT'}
                                            </span>
                                        </div>
                                        <p className="text-white font-bold text-lg">{userName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleJoinSDK}
                                className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-2xl transition-all duration-300 shadow-2xl shadow-blue-500/30 flex items-center justify-center space-x-4 group"
                            >
                                <Play size={24} className="fill-current" />
                                <span>Join on This Page</span>
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] font-black text-slate-600"><span className="bg-slate-950 px-4">OR</span></div>
                            </div>

                            <a
                                href={webJoinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-blue-500/20"
                            >
                                <ExternalLink size={18} />
                                Open in Zoom Official
                            </a>

                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-4">
                                Opens in a new tab or Zoom App
                            </p>

                            <button
                                onClick={onLeave}
                                className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-white font-bold transition-all text-xs uppercase tracking-[0.2em]"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 px-10 py-6 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span>Valid Meeting ID: {meetingNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZoomRoom;
