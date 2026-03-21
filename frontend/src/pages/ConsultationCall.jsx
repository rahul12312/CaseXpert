import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Settings, Shield,
  Clock, Wifi, Loader2, AlertCircle,
  MessageSquare, Camera, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const ConsultationCall = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasInitialized = useRef(false);

  // Meeting Roles
  const [isMeetingHost, setIsMeetingHost] = useState(false);
  const [isMeetingParticipant, setIsMeetingParticipant] = useState(false);

  // UI States
  const [booking, setBooking] = useState(null);
  const [meetingState, setMeetingState] = useState('initializing'); // initializing, validating, setup, joining, waiting_host, host_waiting, waiting_approval, active, ended, error

  // Media States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasMediaAccess, setHasMediaAccess] = useState(false);

  // Call States
  const [callDuration, setCallDuration] = useState(0);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const [error, setError] = useState(null);
  const [joinRequest, setJoinRequest] = useState(null); // { userId, socketId }
  const [showChat, setShowChat] = useState(false);

  // Refs
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);

  // 1. Validation & Setup
  useEffect(() => {
    // Immediate check for ID
    if (!id) {
      setError("No consultation ID provided.");
      setMeetingState('error');
      return;
    }

    // Only run validation once per mount
    if (!user || hasInitialized.current) return;

    const validateBooking = async () => {
      try {
        hasInitialized.current = true;
        setMeetingState('validating');

        const { data } = await api.get(`/bookings/${id}`);
        if (data.success) {
          const b = data.booking;
          // You might check date/time here for "Join button enabled only at scheduled time" requirement

          if (b.status !== 'confirmed' && b.status !== 'completed' && b.status !== 'approved') { // Adjusted for flexibility
            setError('This consultation is not confirmed.');
            setMeetingState('error');
            return;
          }
          setBooking(b);

          // Role Detection
          const userId = Number(user.id);
          const participantId = Number(b.user_id);
          const hostUserId = Number(b.lawyer_user_id);

          const isHost = userId === hostUserId;
          const isParticipant = userId === participantId;

          setIsMeetingHost(isHost);
          setIsMeetingParticipant(isParticipant);

          if (!isHost && !isParticipant) {
            setError('Unauthorized access.');
            setMeetingState('error');
            return;
          }

          // Proceed to Device Setup
          setMeetingState('setup');
          setupLocalMedia();

        }
      } catch (err) {
        console.error("Validation error:", err);
        setError(err.response?.data?.message || 'Access validation failed.');
        setMeetingState('error');
      }
    };

    validateBooking();

    return () => {
      handleEndCall(false); // Cleanup on unmount
    };
  }, [id, user]);


  // 2. Media Setup
  const setupLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.volume = 0; // Mute local echo
      }
      setHasMediaAccess(true);
      setIsMuted(false);
      setIsVideoOff(false);
    } catch (err) {
      console.error("Media setup failed:", err);
      // Fallback or show error
      setHasMediaAccess(false);
      toast.error("Camera/Mic access denied. Please enable permissions.");
    }
  };

  // 3. Join Meeting (Connect Socket)
  const joinMeeting = async () => {
    try {
      setMeetingState('joining');

      // Initialize Socket
      const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
        transports: ['websocket'],
        reconnection: true
      });
      socketRef.current = socket;

      // Register Listeners
      setupSocketListeners(socket);

      // Connect Logic
      const statusRes = await api.get(`/bookings/${id}/meeting/status`);
      const currentStatus = statusRes.data.status;

      socket.emit('join-room', {
        roomId: id,
        userId: user.id,
        role: isMeetingHost ? 'lawyer' : 'client'
      });

      if (isMeetingHost) {
        await api.post(`/bookings/${id}/meeting/start`);
        setMeetingState('host_waiting');
        socket.emit('recheck-lobby');
      } else {
        if (currentStatus === 'NOT_CREATED' || currentStatus === 'CREATED') { // Rough check logic
          setMeetingState('waiting_host');
        } else {
          try {
            await api.post(`/bookings/${id}/meeting/join`);
            setMeetingState('waiting_approval');
          } catch (e) {
            // If join fails, usually implies already active or error
          }
        }
      }
    } catch (err) {
      setError('Connection failed. Please check network.');
      setMeetingState('error');
    }
  };

  const setupSocketListeners = (socket) => {
    socket.on('join-request', (payload) => {
      if (isMeetingHost) {
        setJoinRequest(payload);
        toast.success(`${booking?.user_name || 'Participant'} is in the waiting room!`, { icon: '🤝', duration: 6000 });
      }
    });

    socket.on('request-rejoin-status', () => {
      if (!isMeetingHost) socket.emit('join-room', { roomId: id, userId: user.id, role: 'client' });
    });

    socket.on('host-ready', () => {
      if (!isMeetingHost) {
        setMeetingState('waiting_approval');
        socket.emit('join-room', { roomId: id, userId: user.id, role: 'client' });
      }
    });

    socket.on('request-approved', () => {
      setMeetingState('active');
      // Unmute audio tracks if they were muted for lobby (optional logic)
      startTimer();
      initiateOffer(); // Client can also initiate if needed, but usually Host does. 
    });

    socket.on('meeting-active', () => {
      setMeetingState('active');
      startTimer();
      if (isMeetingHost) {
        setTimeout(() => initiateOffer(), 1000);
      }
    });

    socket.on('request-rejected', ({ reason }) => {
      setError(reason);
      setMeetingState('error');
    });

    socket.on('user-left', () => {
      setIsRemoteConnected(false);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      toast.error('The other participant left.');
    });

    socket.on('call-ended', () => handleEndCall(false));
    socket.on('webrtc-offer', async ({ offer }) => await handleOffer(offer));
    socket.on('webrtc-answer', async ({ answer }) => await handleAnswer(answer));
    socket.on('webrtc-ice-candidate', async ({ candidate }) => {
      if (pcRef.current) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { }
      }
    });
  };

  // Actions
  const handleAcceptParticipant = async () => {
    if (!joinRequest || !socketRef.current) return;
    try {
      await api.post(`/bookings/${id}/meeting/approve`);
      socketRef.current.emit('approve-request', { roomId: id, participantSocketId: joinRequest.socketId });
      setJoinRequest(null);
      setMeetingState('active');
      startTimer();
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleRejectParticipant = async () => {
    if (!joinRequest || !socketRef.current) return;
    try {
      await api.post(`/bookings/${id}/meeting/reject`);
      socketRef.current.emit('reject-request', { roomId: id, participantSocketId: joinRequest.socketId });
      setJoinRequest(null);
    } catch (err) {
      toast.error('Rejection failed');
    }
  };

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc-ice-candidate', { roomId: id, candidate: event.candidate });
      }
    };
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsRemoteConnected(true);
      }
    };

    // Add tracks safely
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        // Check if already added to avoid error? addTrack usually fine
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pcRef.current = pc;
    return pc;
  }, [id]);

  const initiateOffer = async () => {
    const pc = createPeerConnection();
    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      socketRef.current.emit('webrtc-offer', { roomId: id, offer });
    } catch (e) { console.error("Offer error", e); }
  };

  const handleOffer = async (offer) => {
    const pc = createPeerConnection();
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit('webrtc-answer', { roomId: id, answer });
    } catch (e) { console.error("Handle offer error", e); }
  };

  const handleAnswer = async (answer) => {
    if (pcRef.current) {
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) { console.error("Handle answer error", e); }
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleEndCall = async (shouldRedirect = true) => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (pcRef.current) pcRef.current.close();
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId: id, userId: user.id });
      socketRef.current.disconnect();
    }
    clearInterval(timerRef.current);
    pcRef.current = null;
    socketRef.current = null;

    setMeetingState('ended');
    if (shouldRedirect) {
      try { await api.post(`/bookings/${id}/end`, { duration: callDuration }); } catch (e) { }
      toast.success('Consultation ended');
      navigate(isMeetingHost ? '/lawyer/dashboard' : '/my-bookings');
    }
  };

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Render ---

  // 1. Error State
  if (meetingState === 'error') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 px-4 text-center font-sans">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Meeting Error</h2>
          <p className="text-slate-400 mb-6">{error || 'Unknown error occurred.'}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-all">Go Back</button>
            <button onClick={() => navigate('/my-bookings')} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all">My Bookings</button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State (Init or Joining)
  if (meetingState === 'initializing' || meetingState === 'validating' || meetingState === 'joining') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 font-sans">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin relative z-10" />
          </div>
          <p className="text-slate-400 font-medium">{meetingState === 'joining' ? 'Connecting to secure chamber...' : 'Verifying credentials...'}</p>
        </div>
      </div>
    );
  }

  // 3. Device Setup Screen (Pre-Join)
  if (meetingState === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-2xl w-full bg-slate-900/50 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Video Consultation Setup</h1>
          <p className="text-slate-400 text-center mb-8">Please check your camera and microphone before joining.</p>

          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-6 border border-slate-700 shadow-inner group">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover mirror ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} />
            {isVideoOff && <div className="absolute inset-0 flex items-center justify-center text-slate-500 flex-col gap-2"><VideoOff className="w-12 h-12" /><span>Camera is Off</span></div>}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/5">
              <button onClick={toggleMute} className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={toggleVideo} className={`p-3 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={joinMeeting}
              disabled={!hasMediaAccess}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {hasMediaAccess ? 'Join Configured Meeting' : 'Waiting for Camera Access...'}
              {hasMediaAccess && <CheckCircle className="w-5 h-5" />}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> End-to-end encrypted session</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Active Meeting UI
  return (
    <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="p-4 md:p-6 bg-slate-900 border-b border-white/5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm md:text-base">
              {isMeetingHost ? `Consultation with ${booking?.user_name}` : `Meeting with Adv. ${booking?.lawyer_name}`}
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{formatTime(callDuration)}</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border ${meetingState === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'} text-[10px] font-bold uppercase tracking-wider`}>
          {meetingState === 'active' ? 'Live' : 'Waiting Area'}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative flex flex-col md:flex-row gap-4 p-4 md:p-6 min-h-0">

        {/* Waiting State Overlay */}
        {meetingState !== 'active' && meetingState !== 'ended' && (
          <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl border border-white/10 text-center shadow-2xl">
              {/* Host Waiting for Participant */}
              {isMeetingHost && meetingState === 'host_waiting' && (
                <>
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Waiting for Client</h3>
                  <p className="text-slate-400 mb-6">The secure room is ready. Waiting for <b>{booking?.user_name}</b> to join.</p>
                </>
              )}
              {/* Host Receiving Request */}
              {isMeetingHost && joinRequest && (
                <>
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Shield className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Client is Ready</h3>
                  <p className="text-slate-400 mb-6"><b>{booking?.user_name || 'Participant'}</b> is requesting to join.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleRejectParticipant} className="py-3 bg-slate-700 text-white rounded-xl font-bold">Reject</button>
                    <button onClick={handleAcceptParticipant} className="py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20">Admit</button>
                  </div>
                </>
              )}
              {/* Client Waiting states */}
              {isMeetingParticipant && (
                <>
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{meetingState === 'waiting_host' ? 'Waiting for Advocate' : 'Waiting for Admission'}</h3>
                  <p className="text-slate-400 mb-0">
                    {meetingState === 'waiting_host' ? 'The advocate has not joined yet. Please stay on this screen.' : 'Advocate has been notified. Please wait to be admitted.'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 relative h-full">
          {/* Remote Video */}
          <div className="flex-1 bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5 relative group">
            {!isRemoteConnected && <div className="absolute inset-0 flex items-center justify-center text-slate-600"><div className="text-center"><div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-2 animate-pulse" /><p>Remote Feed</p></div></div>}
            <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover ${isRemoteConnected ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute bottom-4 left-4"><span className="px-3 py-1 bg-black/40 backdrop-blur rounded-lg text-white text-xs font-bold">{isMeetingHost ? booking?.user_name : `Adv. ${booking?.lawyer_name}`}</span></div>
          </div>

          {/* Local Video (PiP style on desktop) */}
          <div className="absolute bottom-4 right-4 w-32 md:w-64 aspect-video bg-slate-800 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-30">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover mirror ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} />
            {isVideoOff && <div className="absolute inset-0 flex items-center justify-center bg-slate-800"><VideoOff className="w-6 h-6 text-slate-500" /></div>}
          </div>
        </div>

        {/* Chat Placeholder (To be expanded in Step 371-B) */}
        {showChat && (
          <div className="absolute right-4 top-4 bottom-4 w-80 bg-slate-900/95 backdrop-blur rounded-2xl border border-white/10 z-50 p-4">
            <div className="flex justify-between items-center mb-4 text-white font-bold">
              <span>Chat</span>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">Close</button>
            </div>
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Chat Module Coming Soon</div>
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="p-4 md:p-6 flex justify-center items-center shrink-0">
        <div className="bg-slate-900/90 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
          <button onClick={toggleMute} className={`p-4 rounded-xl transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{isMuted ? <MicOff /> : <Mic />}</button>
          <button onClick={toggleVideo} className={`p-4 rounded-xl transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{isVideoOff ? <VideoOff /> : <Video />}</button>
          <div className="w-px h-8 bg-white/10" />
          <button onClick={() => setShowChat(!showChat)} className={`p-4 rounded-xl transition-all ${showChat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}><MessageSquare /></button>
          <button className="p-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"><Settings /></button>
          <button onClick={() => handleEndCall(true)} className="px-6 py-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 hover:scale-105 transition-all">End Call</button>
        </div>
      </footer>

      <style>{`
        .mirror { transform: scaleX(-1); }
      `}</style>
    </div>
  );
};

export default ConsultationCall;
