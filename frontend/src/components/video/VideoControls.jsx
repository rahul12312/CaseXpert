import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Share, MessageSquare, Circle } from 'lucide-react';

const VideoControls = ({ 
    isMuted, 
    toggleAudio, 
    isVideoOff, 
    toggleVideo, 
    isScreenSharing,
    handleScreenShare,
    showChat,
    toggleChat,
    isRecording,
    toggleRecording,
    handleLeaveRoom 
}) => {
    return (
        <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 px-3 py-3 md:px-6 md:py-5 bg-slate-950/40 backdrop-blur-3xl rounded-2xl md:rounded-[2.5rem] border border-white/10 shadow-3xl z-50 animate-in slide-in-from-bottom-24 duration-700 ring-1 ring-white/5">
            {/* Audio Toggle */}
            <button
                onClick={toggleAudio}
                className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 ${
                    isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? <MicOff size={window.innerWidth < 768 ? 18 : 22} /> : <Mic size={window.innerWidth < 768 ? 18 : 22} />}
            </button>

            {/* Video Toggle */}
            <button
                onClick={toggleVideo}
                className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 ${
                    isVideoOff 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
            >
                {isVideoOff ? <VideoOff size={window.innerWidth < 768 ? 18 : 22} /> : <Video size={window.innerWidth < 768 ? 18 : 22} />}
            </button>

            {/* Screen Share */}
            <button
                onClick={handleScreenShare}
                className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 ${
                    isScreenSharing 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            >
                <Share size={window.innerWidth < 768 ? 18 : 22} />
            </button>

            {/* Recording Toggle */}
            <button
                onClick={toggleRecording}
                className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 ${
                    isRecording 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
                <Circle size={window.innerWidth < 768 ? 18 : 22} fill={isRecording ? 'currentColor' : 'none'} />
            </button>

            {/* Chat Toggle */}
            <button
                onClick={toggleChat}
                className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 ${
                    showChat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title="Chat"
            >
                <MessageSquare size={window.innerWidth < 768 ? 18 : 22} />
            </button>

            <div className="w-px h-6 md:h-8 bg-slate-700/50 mx-1 md:mx-2"></div>

            {/* End Call */}
            <button
                onClick={handleLeaveRoom}
                className="p-2.5 md:p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl md:rounded-2xl transition-all duration-300 shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50"
                title="End Call"
            >
                <PhoneOff size={window.innerWidth < 768 ? 18 : 22} />
            </button>
        </div>
    );
};

export default VideoControls;
