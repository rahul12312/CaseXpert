import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Video, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VideoNotificationListener = () => {
    const { isLawyer, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [lastCheckedId, setLastCheckedId] = useState(null);
    const pollerRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !isLawyer()) {
            if (pollerRef.current) clearInterval(pollerRef.current);
            return;
        }

        const checkNewRequests = async () => {
            try {
                const { data } = await api.get('/bookings/lawyer');
                if (data.success && data.bookings.length > 0) {
                    const pendingVideo = data.bookings.filter(b => b.status === 'pending' && b.booking_type === 'video_call');
                    
                    if (pendingVideo.length > 0) {
                        const newest = pendingVideo[0]; // Assuming sorted by date descending
                        
                        // If this is a new ID we haven't notified about yet
                        if (lastCheckedId !== null && newest.id > lastCheckedId) {
                            showNotification(newest);
                        }
                        
                        setLastCheckedId(newest.id);
                    }
                }
            } catch (error) {
                console.error('Notification poller error:', error);
            }
        };

        // Initial check
        checkNewRequests();

        // Start polling
        pollerRef.current = setInterval(checkNewRequests, 15000); // Poll every 15 seconds

        return () => {
            if (pollerRef.current) clearInterval(pollerRef.current);
        };
    }, [isAuthenticated, isLawyer, lastCheckedId]);

    const showNotification = (booking) => {
        toast.custom((t) => (
            <div
                className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white ring-4 ring-blue-50">
                                <Video size={20} />
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-bold text-gray-900">
                                New Video Consultation Request
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                {booking.user_name} wants to start a video consultation with you.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            navigate('/lawyer/dashboard');
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-500 focus:outline-none"
                    >
                        View
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        ), { duration: 10000 });
    };

    return null; // This component doesn't render anything visible directly
};

export default VideoNotificationListener;
