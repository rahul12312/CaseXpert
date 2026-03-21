import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Video, Phone, MessageSquare, MapPin, Check, X, Clock, Calendar } from 'lucide-react';

const LawyerConsultations = () => {
    const { isLawyer } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLawyer()) {
            navigate('/assistant');
            return;
        }
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/lawyer');
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        if (!confirm('Are you sure you want to accept this consultation?')) return;
        try {
            const { data } = await api.put(`/bookings/${id}/accept`);
            if (data.success) {
                setBookings(bookings.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
            }
        } catch (error) {
            console.error('Accept error:', error);
            alert(`⚠️ Error: ${error.response?.data?.message || 'Failed to accept consultation'}`);
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Are you sure you want to reject this consultation?')) return;
        try {
            const { data } = await api.put(`/bookings/${id}/reject`);
            if (data.success) {
                setBookings(bookings.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
            }
        } catch (error) {
            console.error('Reject error:', error);
            alert(`⚠️ Error: ${error.response?.data?.message || 'Failed to reject consultation'}`);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        try {
            const { data } = await api.put(`/bookings/${id}/status`, { status: newStatus });
            if (data.success) {
                setBookings(bookings.map(b =>
                    b.id === id ? { ...b, status: newStatus } : b
                ));
            }
        } catch (error) {
            console.error('Update status error:', error);
            const msg = error.response?.data?.message || 'Failed to update status';
            alert(`⚠️ Error: ${msg}`);
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

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const pending = bookings.filter(b => b.status === 'pending');
    const upcoming = bookings.filter(b => b.status === 'confirmed');
    const past = bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status));

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Consultations</h1>
                <button
                    onClick={() => navigate('/lawyer/dashboard')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Pending Requests */}
            {pending.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        Pending Requests ({pending.length})
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {pending.map(booking => (
                            <div key={booking.id} className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold">
                                            {booking.user_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{booking.user_name}</div>
                                            <div className="text-xs text-gray-500">{booking.user_email}</div>
                                        </div>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium uppercase">Pending</span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">
                                            {new Date(booking.booking_time).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">
                                            {new Date(booking.booking_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 capitalize">
                                        {getTypeIcon(booking.booking_type)}
                                        {booking.booking_type.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4 italic">
                                    "{booking.notes}"
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAccept(booking.id)}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" /> Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(booking.id)}
                                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Bookings */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    Upcoming Schedule
                </h2>
                {upcoming.length === 0 ? (
                    <p className="text-gray-500 bg-gray-50 p-6 rounded-lg text-center">No upcoming consultations confirmed.</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {upcoming.map(booking => (
                            <div key={booking.id} className="bg-white p-6 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
                                            {booking.user_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{booking.user_name}</div>
                                            <div className="text-xs text-gray-500">{booking.user_phone || 'No phone'}</div>
                                        </div>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium uppercase">Confirmed</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Date</div>
                                        <div className="font-medium text-gray-900">
                                            {new Date(booking.booking_time).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
                                        <div className="font-medium text-gray-900">
                                            {new Date(booking.booking_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/consultation/${booking.id}`}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 text-center"
                                    >
                                        Start Meeting
                                    </Link>
                                    <button
                                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                        className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Bookings (Collapsed or simple list) */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-gray-400">History ({past.length})</h2>
                {past.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {past.map(booking => (
                                    <tr key={booking.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.user_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(booking.booking_time).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LawyerConsultations;
