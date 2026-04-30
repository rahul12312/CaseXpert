import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Video, Phone, MessageSquare, MapPin, X, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/user');
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const { data } = await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
            if (data.success) {
                // Update local state
                setBookings(bookings.map(b =>
                    b.id === bookingId ? { ...b, status: 'cancelled' } : b
                ));
            }
        } catch (error) {
            alert('Failed to cancel booking');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'video_call': return <Video className="w-5 h-5 text-blue-600" />;
            case 'phone_call': return <Phone className="w-5 h-5 text-green-600" />;
            case 'chat': return <MessageSquare className="w-5 h-5 text-purple-600" />;
            case 'in_person': return <MapPin className="w-5 h-5 text-red-600" />;
            default: return <Video className="w-5 h-5" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
            completed: 'bg-blue-100 text-blue-800'
        };

        const labels = {
            pending: 'Waiting for lawyer approval',
            confirmed: 'Approved by lawyer',
            rejected: 'Rejected by lawyer',
            cancelled: 'Cancelled',
            completed: 'Completed'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Consultations</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No bookings found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't booked any consultations yet.</p>
                    <Link to="/lawyers" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Find a Lawyer
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">

                            {/* Date Block */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-blue-50 rounded-xl text-blue-800">
                                <span className="text-sm font-semibold uppercase">
                                    {new Date(booking.booking_time).toLocaleString('en-US', { month: 'short' })}
                                </span>
                                <span className="text-3xl font-bold">
                                    {new Date(booking.booking_time).getDate()}
                                </span>
                                <span className="text-xs">
                                    {new Date(booking.booking_time).toLocaleString('en-US', { weekday: 'short' })}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusBadge(booking.status)}
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            {new Date(booking.booking_time).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </div>
                                        {booking.meeting?.platform && (
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${booking.meeting.platform === 'zoom' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'}`}>
                                                {booking.meeting.platform}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {getTypeIcon(booking.booking_type)}
                                        {booking.booking_type.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-2 mb-4">
                                    <img
                                        src={booking.lawyer_image || '/default-lawyer.png'}
                                        onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.lawyer_name)}&background=random`}
                                        alt={booking.lawyer_name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{booking.lawyer_name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{booking.specialization} Lawyer</div>
                                    </div>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                    <FileText className="w-4 h-4 inline mr-2 text-gray-400" />
                                    {booking.notes}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col justify-center items-end gap-3 min-w-[140px]">
                                {booking.status === 'pending' && (
                                    <button
                                        onClick={() => handleCancel(booking.id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                )}
                                {booking.status === 'confirmed' && (
                                    <Link
                                        to={`/consultation/B${booking.id}`}
                                        className="w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition shadow-sm"
                                    >
                                        Join Meeting
                                    </Link>
                                )}
                                {booking.status === 'completed' && (
                                    <Link
                                        to={`/cases/create?lawyer_id=${booking.lawyer_id}&lawyer_name=${encodeURIComponent(booking.lawyer_name)}`}
                                        className="w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition shadow-sm"
                                    >
                                        Assign Case
                                    </Link>
                                )}
                                <Link
                                    to={`/lawyer/${booking.lawyer_id}`}
                                    className="w-full text-center px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:bg-gray-900 text-sm font-medium transition"
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserBookings;
