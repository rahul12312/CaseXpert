import React, { useState, useEffect, useRef } from 'react';
import Video from 'twilio-video';
import VideoControls from './VideoControls';
import { User, ShieldCheck, Clock, MessageSquare, Send, X, Video as VideoIcon, MicOff, ShieldAlert, Loader2, Share } from 'lucide-react';

const TrackRenderer = ({ track }) => {
    const ref = useRef();
    useEffect(() => {
        if (ref.current && track) {
            const el = track.attach();
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.objectFit = 'cover';
            if (track.name === 'screen') {
                el.style.objectFit = 'contain';
            }
            ref.current.appendChild(el);
            return () => {
                track.detach().forEach(e => e.remove());
            };
        }
    }, [track]);
    return <div ref={ref} className="h-full w-full bg-slate-900 transition-all duration-700 animate-in fade-in zoom-in-95" />;
};

const AudioTrack = ({ track, identity, onStall }) => {
    const ref = useRef();
    useEffect(() => {
        if (track && track.kind === 'audio') {
            console.log(`🔊 [AudioTrack] Attaching track from ${identity}`);
            const el = track.attach();
            
            // In some browsers, we need to explicitly call play()
            el.play().catch(err => {
                console.warn(`🔊 [AudioTrack] Autoplay prevented for ${identity}, user interaction needed:`, err);
            });

            if (ref.current) {
                ref.current.appendChild(el);
            }

            const handleWarning = (name) => {
                if (name === 'track-stalled') {
                    console.warn(`⚠️ [AudioTrack] Stalled: ${identity}`);
                    onStall(track.sid, true);
                    
                    // Attempt immediate recovery by detaching and re-attaching
                    track.detach().forEach(e => e.remove());
                    const freshEl = track.attach();
                    ref.current?.appendChild(freshEl);
                    freshEl.play().catch(() => {});
                }
            };

            const handleWarningCleared = (name) => {
                if (name === 'track-stalled') {
                    console.log(`✅ [AudioTrack] Recovered: ${identity}`);
                    onStall(track.sid, false);
                }
            };

            track.on('warning', handleWarning);
            track.on('warningsCleared', handleWarningCleared);

            return () => {
                console.log(`🔇 [AudioTrack] Detaching track from ${identity}`);
                track.off('warning', handleWarning);
                track.off('warningsCleared', handleWarningCleared);
                track.detach().forEach(e => e.remove());
                onStall(track.sid, false);
            };
        }
    }, [track, identity, onStall]);

    return <div ref={ref} className="absolute inset-0 pointer-events-none opacity-0 h-0 w-0" aria-hidden="true" />;
};

const VideoRoom = ({ token, roomName, username, userRole, onLeave }) => {
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenTrack, setScreenTrack] = useState(null);
    const [remoteTracks, setRemoteTracks] = useState([]); // Array of { sid, track, identity }
    const [remoteAudioTracks, setRemoteAudioTracks] = useState([]); // Array of { sid, track, identity }
    const [stalledTracks, setStalledTracks] = useState(new Set());
    const [callTime, setCallTime] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [disabledRemoteVideos, setDisabledRemoteVideos] = useState(new Set());
    const [error, setError] = useState(null);

    const handleStall = React.useCallback((sid, isStalled) => {
        setStalledTracks(prev => {
            const next = new Set(prev);
            if (isStalled) next.add(sid);
            else next.delete(sid);
            return next;
        });
    }, []);

    const localVideoRef = useRef();
    const chatEndRef = useRef();

    useEffect(() => {
        const timer = setInterval(() => {
            setCallTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, showChat]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        let isMounted = true;
        let activeRoom = null;

        const addRemoteTrack = (track, participant) => {
            if (track.kind !== 'video' && track.kind !== 'audio') return;
            
            console.log(`🔗 Adding remote ${track.kind} track from ${participant.identity} (SID: ${track.sid})`);

            if (track.kind === 'video') {
                setRemoteTracks(prev => {
                    if (prev.find(t => t.sid === track.sid)) return prev;
                    return [...prev, { sid: track.sid, track, identity: participant.identity }];
                });

                // Listen for track disabled/enabled events (e.g. camera toggle)
                track.on('disabled', () => {
                    console.log(`📹 Video track disabled from ${participant.identity}`);
                    setDisabledRemoteVideos(prev => new Set(prev).add(track.sid));
                });
                track.on('enabled', () => {
                    console.log(`📹 Video track enabled from ${participant.identity}`);
                    setDisabledRemoteVideos(prev => {
                        const next = new Set(prev);
                        next.delete(track.sid);
                        return next;
                    });
                });

                // Set initial state
                if (!track.isEnabled) {
                    setDisabledRemoteVideos(prev => new Set(prev).add(track.sid));
                }
            } else if (track.kind === 'audio') {
                setRemoteAudioTracks(prev => {
                    if (prev.find(t => t.sid === track.sid)) return prev;
                    return [...prev, { sid: track.sid, track, identity: participant.identity }];
                });
            }
        };

        const removeRemoteTrack = (track) => {
            if (track.kind === 'video') {
                setRemoteTracks(prev => prev.filter(t => t.sid !== track.sid));
                setDisabledRemoteVideos(prev => {
                    const next = new Set(prev);
                    next.delete(track.sid);
                    return next;
                });
            } else if (track.kind === 'audio') {
                setRemoteAudioTracks(prev => prev.filter(t => t.sid !== track.sid));
                setStalledTracks(prev => {
                    const next = new Set(prev);
                    next.delete(track.sid);
                    return next;
                });
            }
            track.detach().forEach(el => el.remove());
        };

        const participantConnected = (participant) => {
            console.log('👤 Participant joined:', participant.identity, participant.sid);
            setParticipants((prevParticipants) => {
                if (!prevParticipants.find(p => p.sid === participant.sid)) {
                    return [...prevParticipants, participant];
                }
                return prevParticipants;
            });

            // Attach tracks that are ALREADY subscribed
            participant.tracks.forEach((publication) => {
                if (publication.isSubscribed && publication.track) {
                    addRemoteTrack(publication.track, participant);
                }
            });

            // Listen for future track subscriptions
            participant.on('trackSubscribed', (track) => {
                console.log('🔔 Track subscribed:', track.kind, track.name);
                addRemoteTrack(track, participant);
            });

            participant.on('trackUnsubscribed', (track) => {
                console.log('🔕 Track unsubscribed:', track.kind);
                removeRemoteTrack(track);
            });

            setMessages(prev => [...prev, { system: true, text: `${participant.identity} joined the consultation` }]);
        };

        const participantDisconnected = (participant) => {
            setParticipants((prevParticipants) =>
                prevParticipants.filter((p) => p !== participant)
            );
            // Cleanup all tracks for this participant
            participant.tracks.forEach((publication) => {
                if (publication.track) {
                    removeRemoteTrack(publication.track);
                }
            });
            setMessages(prev => [...prev, { system: true, text: `${participant.identity} left the consultation` }]);
        };

        Video.connect(token, {
            name: roomName,
            video: true,
            audio: true
        }).then((room) => {
            if (!isMounted) {
                room.disconnect();
                return;
            }
            activeRoom = room;
            setRoom(room);
            
            // Attach local camera securely
            const localParticipant = room.localParticipant;
            if (localVideoRef.current) {
                localVideoRef.current.innerHTML = '';
            }
            localParticipant.videoTracks.forEach(publication => {
                if (localVideoRef.current) {
                    localVideoRef.current.appendChild(publication.track.attach());
                }
            });

            room.on('participantConnected', participantConnected);
            room.on('participantDisconnected', participantDisconnected);
            room.participants.forEach(participantConnected);

            room.on('disconnected', () => {
                if (isMounted) {
                    setRoom(null);
                    setParticipants([]);
                    setRemoteTracks([]);
                    setDisabledRemoteVideos(new Set());
                }
            });
        }).catch(err => {
            console.error('Twilio Video Connect Error:', err);
            if (isMounted) {
                if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
                    setError('Camera and Microphone access was denied. Please enable them in your browser settings and refresh to join the consultation.');
                } else {
                    setError(`Connection Error: ${err.message}`);
                }
            }
        });

        return () => {
            isMounted = false;
            if (activeRoom) {
                activeRoom.localParticipant.tracks.forEach((publication) => {
                    if (publication.track) {
                        publication.track.stop();
                    }
                });
                activeRoom.disconnect();
            }
        };
    }, [token, roomName]);

    const toggleAudio = () => {
        if (room) {
            room.localParticipant.audioTracks.forEach(publication => {
                if (isMuted) {
                    publication.track.enable();
                } else {
                    publication.track.disable();
                }
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (room) {
            room.localParticipant.videoTracks.forEach(publication => {
                if (isVideoOff) {
                    publication.track.enable();
                } else {
                    publication.track.disable();
                }
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                // Check for browser support
                if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                    setError('Screen sharing is not supported by your mobile browser. Please try using Chrome or Safari on a desktop instead.');
                    return;
                }

                const stream = await navigator.mediaDevices.getDisplayMedia();
                const newScreenTrack = new Video.LocalVideoTrack(stream.getTracks()[0], {
                    name: 'screen'
                });
                room.localParticipant.publishTrack(newScreenTrack);
                setScreenTrack(newScreenTrack);
                setIsScreenSharing(true);

                newScreenTrack.mediaStreamTrack.onended = () => {
                    stopScreenShare();
                };
            } else {
                stopScreenShare();
            }
        } catch (error) {
            console.error('Error sharing screen:', error);
            if (error.name !== 'NotAllowedError') {
                setError(`Screen Sharing Error: ${error.message}`);
            }
        }
    };

    const stopScreenShare = () => {
        if (screenTrack) {
            room.localParticipant.unpublishTrack(screenTrack);
            screenTrack.stop();
            setScreenTrack(null);
            setIsScreenSharing(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            setMessages(prev => [...prev, { sender: 'You', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            setNewMessage('');
        }
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
    };

    const handleLeaveRoom = () => {
        if (room) {
            room.disconnect();
        }
        onLeave();
    };

    return (
        <div className="relative h-screen w-full bg-slate-950 overflow-hidden text-white font-sans flex flex-col md:flex-row">
            {/* Advanced Audio Track Management */}
            {remoteAudioTracks.map(({ sid, track, identity }) => (
                <AudioTrack 
                    key={sid} 
                    track={track} 
                    identity={identity} 
                    onStall={handleStall} 
                />
            ))}

            {/* Main Area */}
            <div className="relative flex-grow flex flex-col min-w-0">
                {/* HUD Header */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-start z-40 pointer-events-none">
                <div className="flex items-start gap-6 pointer-events-auto">
                    <div className="group relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
                        <div className="relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-2 md:p-4 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-4 shadow-2xl">
                            <div className="p-2 md:p-3 bg-blue-600 rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/30">
                                <ShieldCheck className="text-white" size={window.innerWidth < 768 ? 18 : 24} />
                            </div>
                            <div>
                                <h2 className="text-sm md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                                    Secure<span className="hidden sm:inline"> Session</span>
                                    <span className="text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">E2E</span>
                                </h2>
                                <p className="text-[9px] md:text-xs font-bold text-slate-400 font-mono tracking-wider opacity-60 truncate max-w-[80px] md:max-w-none">{roomName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4 pointer-events-auto">
                    <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-4 shadow-2xl">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <Clock size={18} className="animate-pulse" />
                            <span className="font-mono text-xl font-black tracking-widest">{formatTime(callTime)}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live</span>
                        </div>
                    </div>
                </div>
            </div>

                {/* Video Stage */}
                <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
                    {/* Stall Warning Banner */}
                    {stalledTracks.size > 0 && (
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-red-600/90 backdrop-blur-xl border border-red-400/30 rounded-2xl flex items-center gap-4 shadow-2xl animate-in fade-in slide-in-from-top-4">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                                <MicOff size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">Audio Issue Detected</p>
                                <p className="text-[10px] font-bold text-red-100 uppercase tracking-widest whitespace-nowrap">
                                    Connections for {stalledTracks.size} participant(s) are unstable
                                </p>
                            </div>
                        </div>
                    )}
                    {error ? (
                        <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
                            <div className="p-8 bg-red-500/10 rounded-[3rem] border border-red-500/20 backdrop-blur-xl shadow-2xl shadow-red-500/10">
                                <ShieldAlert className="w-20 h-20 text-red-500 mb-6 mx-auto" />
                                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Access Blocked</h3>
                                <p className="text-slate-400 mb-10 max-w-sm leading-relaxed">{error}</p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-red-600/20 active:scale-95"
                                >
                                    Retry Connection
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full w-full relative">
                            {remoteTracks.length === 0 && !isScreenSharing ? (
                                <div className="h-full w-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
                                    <div className="relative mb-12">
                                        <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20 animate-pulse scale-150"></div>
                                        <div className="relative w-40 h-40 bg-slate-900 rounded-[3rem] flex items-center justify-center border border-white/10 shadow-3xl">
                                            <User size={80} className="text-slate-700 dark:text-slate-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-300 tracking-tight text-center">
                                        {userRole === 'lawyer' ? 'Waiting for Client...' : 'Waiting for legal expert to join...'}
                                    </h3>
                                    <p className="mt-4 text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Establishing Secure Tunnel</p>
                                    <div className="mt-12 flex space-x-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`h-full w-full grid gap-1 md:gap-4 p-1 md:p-2 transition-all duration-700 ${
                                    remoteTracks.length + (isScreenSharing ? 1 : 0) === 1 ? 'grid-cols-1' :
                                    remoteTracks.length + (isScreenSharing ? 1 : 0) === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                                    'grid-cols-1 md:grid-cols-2'
                                }`}>
                                    {remoteTracks.map(({ sid, track, identity }) => {
                                        const isTrackDisabled = disabledRemoteVideos.has(sid);
                                        return (
                                            <div key={sid} className="relative group rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ring-1 ring-white/5 h-full">
                                                {isTrackDisabled ? (
                                                    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 animate-in fade-in duration-500">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-slate-400 blur-[80px] opacity-10 animate-pulse scale-150"></div>
                                                            <div className="relative w-32 h-32 bg-slate-800 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl">
                                                                <VideoIcon size={48} className="text-slate-600" />
                                                                <div className="absolute -bottom-2 -right-2 p-3 bg-slate-900 rounded-2xl border border-white/10 shadow-lg">
                                                                    <MicOff size={20} className="text-slate-500" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <h4 className="mt-8 text-lg font-black text-slate-400 tracking-tight uppercase">Camera Off</h4>
                                                        <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-[.3em]">{identity}</p>
                                                    </div>
                                                ) : (
                                                    <TrackRenderer track={track} />
                                                )}
                                                
                                                <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-white/10 flex items-center space-x-3 z-10 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${isTrackDisabled ? 'bg-slate-500' : (track.name === 'screen' ? 'bg-emerald-400' : 'bg-blue-400')} animate-pulse`}></div>
                                                    <span className="text-sm font-black text-white tracking-wide">
                                                        {identity} {track.name === 'screen' ? '(Screen)' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isScreenSharing && screenTrack && (
                                        <div className="relative group rounded-3xl overflow-hidden border border-emerald-500/20 shadow-2xl transition-all duration-500 h-full">
                                            <TrackRenderer track={screenTrack} />
                                            <div className="absolute top-6 left-6 bg-emerald-500/80 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-emerald-400/20 flex items-center space-x-3 z-10">
                                                <Share size={16} className="text-white" />
                                                <span className="text-sm font-black text-white tracking-wide uppercase">Your Screen</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* PiP Local Video Thumbnail (Floating) */}
                <div className={`fixed bottom-28 md:bottom-32 ${showChat ? 'right-96' : 'right-4 md:right-8'} w-32 sm:w-48 md:w-64 lg:w-80 aspect-video z-50 transition-all duration-500 group animate-in slide-in-from-bottom-12`}>
                    <div className="relative h-full w-full bg-slate-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-3xl ring-2 ring-white/5 group-hover:ring-blue-500/50 transition-all">
                        <div ref={localVideoRef} className="h-full w-full mirror-video [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />
                        
                        {isVideoOff && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center border border-white/5">
                                    <User size={32} className="text-slate-600" />
                                </div>
                                <span className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Self View Hidden</span>
                            </div>
                        )}

                        <div className="absolute bottom-4 left-4 flex items-center gap-2 group-hover:translate-y-[-4px] transition-transform">
                            <div className="bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10">
                                <span className="text-[10px] font-black text-white/90 truncate uppercase tracking-wider">{username} (You)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <VideoControls 
                    isMuted={isMuted}
                    toggleAudio={toggleAudio}
                    isVideoOff={isVideoOff}
                    toggleVideo={toggleVideo}
                    isScreenSharing={isScreenSharing}
                    handleScreenShare={handleScreenShare}
                    handleLeaveRoom={handleLeaveRoom}
                    showChat={showChat}
                    toggleChat={() => setShowChat(!showChat)}
                    toggleRecording={toggleRecording}
                    isRecording={isRecording}
                />
            </div>

            {/* Chat Sidebar */}
            {showChat && (
                <div className="w-full md:w-80 h-[50vh] md:h-screen bg-slate-900 border-l border-white/5 flex flex-col shadow-2xl z-30 animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                        <div className="flex items-center space-x-2">
                            <MessageSquare size={18} className="text-indigo-400" />
                            <h3 className="font-bold">Consultation Chat</h3>
                        </div>
                        <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                                {msg.system ? (
                                    <div className="w-full text-center py-2">
                                        <span className="text-[10px] bg-white/5 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">{msg.text}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-[10px] font-bold text-slate-400">{msg.sender}</span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{msg.time}</span>
                                        </div>
                                        <div className={`px-3 py-2 rounded-2xl max-w-[90%] text-sm ${
                                            msg.sender === 'You' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/50 border-t border-white/5">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Message colleague..." 
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 pr-10"
                            />
                            <button 
                                type="submit"
                                className="absolute right-2 top-1.5 p-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .mirror-video video {
                    transform: rotateY(180deg);
                }
                @keyframes slide-in-from-right {
                  from { transform: translateX(100%); }
                  to { transform: translateX(0); }
                }
                .animate-in {
                  animation-duration: 0.3s;
                  animation-fill-mode: both;
                }
            `}} />
        </div>
    );
};

export default VideoRoom;
