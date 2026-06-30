import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Phone, MessageSquare, MapPin } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ isOpen, onClose, lawyerId, lawyerName, consultationFee, initialType, onSuccess, initialDescription, initialTime }) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getLocalDateString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        consultationType: initialType || 'video_call',
        date: getLocalDateString(),
        timeSlot: initialTime || (() => {
            const now = new Date();
            return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        })(),
        description: initialDescription || ''
    });

    if (!isOpen) return null;

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to book a consultation with {lawyerName}.</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:bg-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                        >
                            Login Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'video_call': return <Video className="w-5 h-5" />;
            case 'phone_call': return <Phone className="w-5 h-5" />;
            case 'chat': return <MessageSquare className="w-5 h-5" />;
            case 'in_person': return <MapPin className="w-5 h-5" />;
            default: return <Video className="w-5 h-5" />;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Construct a proper Date object in the user's local timezone
            const [year, month, day] = formData.date.split('-').map(Number);
            const [hours, minutes] = formData.timeSlot.split(':').map(Number);
            
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
                throw new Error('Invalid date or time selected');
            }

            const localDateTime = new Date(year, month - 1, day, hours, minutes);

            const response = await api.post('/bookings/book', {
                lawyerId,
                ...formData,
                bookingTimestamp: localDateTime.getTime() // Send exact timestamp
            });

            if (response.data.success) {
                setStep(2); // Success step
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book consultation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {step === 1 ? (initialDescription ? 'Instant Consultation' : 'Book Consultation') : 'Booking Confirmed'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Lawyer Info Summary */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {lawyerName.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">{lawyerName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Fee: <span className="font-medium text-gray-900 dark:text-white">
                                            {consultationFee > 0 ? `₹${consultationFee}` : 'Free'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Type Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Consultation Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['video_call', 'phone_call', 'chat', 'in_person'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, consultationType: type })}
                                            className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${formData.consultationType === type
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {getTypeIcon(type)}
                                            {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="date"
                                            name="date"
                                            required
                                            min={getLocalDateString()}
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Slot</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="time"
                                            name="timeSlot"
                                            required
                                            value={formData.timeSlot}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Briefly describe your issue
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="I need help with..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm resize-none"
                                ></textarea>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                                    <span className="font-bold">Error:</span> {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processsing...
                                        </>
                                    ) : (
                                        'Confirm Booking'
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                ✓
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request Sent!</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Your booking request has been sent to {lawyerName}.<br />
                                You will be notified once they accept it.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/my-bookings')} // Or to bookings page
                                    className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
                                >
                                    View My Bookings
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:text-white"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
