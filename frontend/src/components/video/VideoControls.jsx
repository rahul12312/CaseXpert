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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3 md:space-x-4 px-4 md:px-6 py-3 md:py-4 bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl z-50">
            {/* Audio Toggle */}
            <button
                onClick={toggleAudio}
                className={`p-3 md:p-4 rounded-2xl transition-all duration-300 ${
                    isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Video Toggle */}
            <button
                onClick={toggleVideo}
                className={`p-3 md:p-4 rounded-2xl transition-all duration-300 ${
                    isVideoOff 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
            >
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>

            {/* Screen Share */}
            <button
                onClick={handleScreenShare}
                className={`hidden md:block p-4 rounded-2xl transition-all duration-300 ${
                    isScreenSharing 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            >
                <Share size={22} />
            </button>

            {/* Recording Toggle */}
            <button
                onClick={toggleRecording}
                className={`p-3 md:p-4 rounded-2xl transition-all duration-300 ${
                    isRecording 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
                <Circle size={22} fill={isRecording ? 'currentColor' : 'none'} />
            </button>

            {/* Chat Toggle */}
            <button
                onClick={toggleChat}
                className={`p-3 md:p-4 rounded-2xl transition-all duration-300 ${
                    showChat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title="Chat"
            >
                <MessageSquare size={22} />
            </button>

            <div className="w-px h-8 bg-slate-700/50 mx-1 md:mx-2"></div>

            {/* End Call */}
            <button
                onClick={handleLeaveRoom}
                className="p-3 md:p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl transition-all duration-300 shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50"
                title="End Call"
            >
                <PhoneOff size={22} />
            </button>
        </div>
    );
};

export default VideoControls;
