import React, { useState, useEffect, useRef } from 'react';
import Video from 'twilio-video';
import VideoControls from './VideoControls';
import { User, ShieldCheck, Clock, MessageSquare, Send, X, Video as VideoIcon, MicOff, ShieldAlert, Loader2 } from 'lucide-react';

const VideoRoom = ({ token, roomName, username, userRole, onLeave }) => {
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenTrack, setScreenTrack] = useState(null);
    const [callTime, setCallTime] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState(null);

    const localVideoRef = useRef();
    const remoteMediaRef = useRef();
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

        const attachTrack = (track) => {
            if (!remoteMediaRef.current || track.kind === 'data') return;
            const el = track.attach();
            if (track.kind === 'video') {
                el.style.width = '100%';
                el.style.height = '100%';
                el.style.objectFit = 'cover';
            }
            remoteMediaRef.current.appendChild(el);
            console.log(`✅ Attached remote ${track.kind} track`);
        };

        const participantConnected = (participant) => {
            console.log('👤 Participant joined:', participant.identity, participant.sid);
            setParticipants((prevParticipants) => {
                if (!prevParticipants.find(p => p.sid === participant.sid)) {
                    console.log('🆕 Adding new participant to state');
                    return [...prevParticipants, participant];
                }
                return prevParticipants;
            });

            // Attach tracks that are ALREADY subscribed (e.g. second person joining)
            participant.tracks.forEach((publication) => {
                console.log(`📼 Track: ${publication.kind}, subscribed=${publication.isSubscribed}, track=${!!publication.track}`);
                if (publication.isSubscribed && publication.track) {
                    attachTrack(publication.track);
                }
            });

            // Listen for future track subscriptions
            participant.on('trackSubscribed', (track) => {
                console.log('🔔 Track subscribed:', track.kind);
                attachTrack(track);
            });

            participant.on('trackUnsubscribed', (track) => {
                console.log('🔕 Track unsubscribed:', track.kind);
                track.detach().forEach(element => element.remove());
            });

            setMessages(prev => [...prev, { system: true, text: `${participant.identity} joined the consultation` }]);
        };

        const participantDisconnected = (participant) => {
            setParticipants((prevParticipants) =>
                prevParticipants.filter((p) => p !== participant)
            );
            // Optionally detach tracks left behind
            participant.tracks.forEach((publication) => {
                if (publication.track) {
                    publication.track.detach().forEach(element => element.remove());
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
                // If unmounted before connect resolved
                room.disconnect();
                return;
            }
            activeRoom = room;
            setRoom(room);
            console.log('✅ Connected to Twilio room:', room.name);
            console.log('👥 Current participants:', room.participants.size);
            room.participants.forEach(p => console.log('👤 Present:', p.identity));
            
            // Attach local tracks securely
            const localParticipant = room.localParticipant;
            if (localVideoRef.current) {
                localVideoRef.current.innerHTML = ''; // Wipe existing tracks to prevent dupes
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
                if (activeRoom.localParticipant.state === 'connected') {
                    activeRoom.localParticipant.tracks.forEach((publication) => {
                        if (publication.track) {
                            publication.track.stop();
                            publication.track.detach().forEach(el => el.remove());
                        }
                    });
                }
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
            // In a real app, use Twilio DataTracks to send this to others
            setMessages(prev => [...prev, { sender: 'You', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            setNewMessage('');
        }
    };

    const toggleRecording = () => {
        // Mock recording logic
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
            {/* Main Area */}
            <div className="relative flex-grow flex flex-col min-w-0">
                {/* Header / Info Bar */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center space-x-4">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">Secure Consultation</h2>
                            <div className="flex items-center text-indigo-300 text-sm">
                                <span className="bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 mr-2">CaseXpert</span>
                                <span>{roomName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                            <Clock size={18} className="text-indigo-400" />
                            <span className="font-mono text-lg">{formatTime(callTime)}</span>
                        </div>
                        {isRecording && (
                            <div className="flex items-center space-x-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-sm font-medium text-red-400 uppercase tracking-wider">Recording</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-2 bg-indigo-500/20 px-4 py-2 rounded-full border border-indigo-500/30">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium">Live</span>
                        </div>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="h-full w-full flex flex-col md:flex-row p-4 gap-4 pb-32 pt-24">
                    {/* Main Remote Video (Wait for participant) */}
                    <div className="relative flex-grow bg-slate-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 ring-1 ring-white/10">
                        <div ref={remoteMediaRef} className="h-full w-full object-cover [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />
                        
                        {error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-50 p-6 text-center">
                                <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 max-w-md">
                                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Connection Blocked</h3>
                                    <p className="text-slate-400 mb-8">{error}</p>
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : participants.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 scale-150 animate-pulse"></div>
                                    <div className="relative w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700">
                                        <User size={64} className="text-slate-500" />
                                    </div>
                                </div>
                                <h3 className="mt-8 text-2xl font-semibold text-slate-300">
                                    {userRole === 'lawyer' ? 'Waiting for Client...' : 'Waiting for Lawyer...'}
                                </h3>
                                <p className="mt-2 text-slate-500 max-w-xs text-center px-4">
                                    Your secure consultation will begin as soon as the {userRole === 'lawyer' ? 'client' : 'lawyer'} joins the room.
                                </p>
                                <div className="mt-8 flex space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                                </div>
                            </div>
                        )}

                        {/* Remote Participant Label */}
                        {participants.length > 0 && (
                            <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                <span className="text-sm font-medium">{participants[0].identity}</span>
                            </div>
                        )}
                    </div>

                    {/* Local Video Thumbnail */}
                    <div className="md:w-72 lg:w-96 h-48 md:h-64 flex-shrink-0 relative bg-slate-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl group transition-all duration-300 hover:ring-2 hover:ring-indigo-500/50">
                        <div ref={localVideoRef} className="h-full w-full mirror-video [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />
                        
                        {isVideoOff && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
                                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
                                    <User size={32} className="text-slate-400" />
                                </div>
                                <span className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">Camera Off</span>
                            </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center whitespace-nowrap overflow-hidden">
                            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex items-center space-x-2">
                                <span className="text-xs font-medium text-white/90 truncate">{username} (You)</span>
                            </div>
                            {isMuted && (
                                <div className="bg-red-500/80 backdrop-blur-sm p-1.5 rounded-lg border border-red-400/20">
                                    <MicOff size={14} className="text-white" />
                                </div>
                            )}
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
                                        <span className="text-[10px] bg-white/5 text-slate-500 px-3 py-1 rounded-full">{msg.text}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-[10px] font-bold text-slate-400">{msg.sender}</span>
                                            <span className="text-[10px] text-slate-500">{msg.time}</span>
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
