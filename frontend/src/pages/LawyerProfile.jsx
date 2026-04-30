import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import LeafletLawyerMap from '../components/LeafletLawyerMap';
import api from '../lib/api';
import {
    ArrowLeft,
    Star,
    MapPin,
    Briefcase,
    DollarSign,
    CheckCircle,
    Clock,
    Award,
    Phone,
    Mail,
    Calendar,
    Languages,
    Scale,
    TrendingUp,
    MessageCircle,
    Loader2,
    Navigation,
    X,
    PenTool,
    Video
} from 'lucide-react';

const LawyerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [lawyer, setLawyer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingType, setBookingType] = useState('video_call');

    // Review State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    useEffect(() => {
        fetchLawyerProfile();
    }, [id]);

    const fetchLawyerProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/lawyers/${id}`);
            if (data.success) {
                setLawyer(data.data);
            }
        } catch (error) {
            console.error('Error fetching lawyer profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            // alert('Please login to write a review');
            navigate('/login');
            return;
        }

        setReviewSubmitting(true);
        try {
            const { data: result } = await api.post(`/lawyers/${id}/reviews`, {
                rating: reviewForm.rating,
                review_text: reviewForm.text
            });

            if (result.success) {
                // Optimistic update
                const newReview = {
                    id: Date.now(),
                    rating: reviewForm.rating,
                    review_text: reviewForm.text,
                    created_at: new Date().toISOString(),
                    reviewer_name: user.name || 'You',
                    is_verified: false
                };

                setLawyer(prev => ({
                    ...prev,
                    reviews: [newReview, ...(prev.reviews || [])],
                    average_rating: result.data.rating || prev.average_rating
                }));

                setIsReviewOpen(false);
                setReviewForm({ rating: 5, text: '' });
            } else {
                alert(result.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Review submission error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleBookConsultation = (type = 'video_call') => {
        setBookingType(type);
        setIsBookingModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!lawyer) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lawyer Not Found</h2>
                    <button
                        onClick={() => navigate('/lawyers')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <button
                        onClick={() => navigate('/lawyers')}
                        className="flex items-center gap-2 text-white hover:text-blue-100 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Marketplace
                    </button>
                </div>
            </div>

            {/* Profile Content */}
            <div className="container mx-auto px-4 -mt-16">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden sticky top-4">
                            {/* Profile Header */}
                            <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
                                <div className="relative inline-block mb-4">
                                    <img
                                        src={lawyer.profile_image || '/default-lawyer.png'}
                                        alt={lawyer.name}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 mx-auto"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=3b82f6&color=fff&size=256`;
                                        }}
                                    />
                                    {lawyer.is_verified && (
                                        <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words">{lawyer.name}</h1>

                                {lawyer.bar_council_id && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-all">
                                        Bar Council ID: {lawyer.bar_council_id}
                                    </p>
                                )}

                                {lawyer.average_rating > 0 && (
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg">
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {parseFloat(lawyer.average_rating).toFixed(1)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            ({lawyer.total_reviews} reviews)
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{lawyer.experience}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Years Exp.</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{lawyer.total_consultations || 0}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Consultations</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {lawyer.success_rate ? `${parseFloat(lawyer.success_rate).toFixed(0)}%` : 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{lawyer.total_reviews || 0}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Reviews</div>
                                    </div>
                                </div>
                            </div>

                            {/* Consultation Fee */}
                            <div className="p-6 bg-blue-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-700">
                                <div className="mb-4">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {!lawyer.consultation_fee && lawyer.consultation_fee !== 0
                                            ? 'N/A'
                                            : lawyer.consultation_fee === 0
                                                ? 'Free'
                                                : `₹${parseFloat(lawyer.consultation_fee).toLocaleString()}`}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Consultation Fee</div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleBookConsultation('video_call')}
                                        className="w-full px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800"
                                    >
                                        <Video className="w-5 h-5" />
                                        Video Consultation
                                    </button>
                                    <button
                                        onClick={() => handleBookConsultation('in_person')}
                                        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                            </div>

                            {isBookingModalOpen && (
                                <BookingModal
                                    isOpen={isBookingModalOpen}
                                    onClose={() => setIsBookingModalOpen(false)}
                                    lawyerId={lawyer.id}
                                    lawyerName={lawyer.name}
                                    consultationFee={lawyer.fee_per_hour || lawyer.consultation_fee || 0}
                                    initialType={bookingType}
                                />
                            )}

                            {/* Review Modal */}
                            {isReviewOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Write a Review</h3>
                                            <button
                                                onClick={() => setIsReviewOpen(false)}
                                                className="text-gray-400 hover:text-gray-600 dark:text-gray-400 p-1 rounded-full hover:bg-gray-200 transition"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
                                            {/* Rating */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                            className="focus:outline-none transition-transform active:scale-95"
                                                        >
                                                            <Star
                                                                className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>



                                            {/* Review Text */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review</label>
                                                <textarea
                                                    value={reviewForm.text}
                                                    onChange={(e) => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                                                    placeholder="Share details about your experience working with this lawyer..."
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition min-h-[120px]"
                                                    maxLength={1000}
                                                />
                                            </div>

                                            <div className="pt-2 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsReviewOpen(false)}
                                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={reviewSubmitting}
                                                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                                >
                                                    {reviewSubmitting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Submitting...
                                                        </>
                                                    ) : (
                                                        'Submit Review'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="p-6 space-y-3">
                                {lawyer.phone && (
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm">{lawyer.phone}</span>
                                    </div>
                                )}
                                {lawyer.email && (
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm break-all">{lawyer.email}</span>
                                    </div>
                                )}
                                {(lawyer.city || lawyer.address_line1) && (
                                    <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm break-words w-full">
                                            {lawyer.address_line1 && (
                                                <div className="font-medium">{lawyer.address_line1}</div>
                                            )}
                                            <div>
                                                {[lawyer.city, lawyer.state, lawyer.country]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden">
                            {/* Tabs */}
                            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
                                <div className="flex min-w-max">
                                    <button
                                        onClick={() => setActiveTab('about')}
                                        className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors ${activeTab === 'about'
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white border-b-2 border-transparent'
                                            }`}
                                    >
                                        About
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('location')}
                                        className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors ${activeTab === 'location'
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white border-b-2 border-transparent'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Location
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors ${activeTab === 'reviews'
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white border-b-2 border-transparent'
                                            }`}
                                    >
                                        Reviews ({lawyer.reviews?.length || 0})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('availability')}
                                        className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors ${activeTab === 'availability'
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white border-b-2 border-transparent'
                                            }`}
                                    >
                                        Availability
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        {/* Bio */}
                                        {lawyer.bio && (
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About</h3>
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{lawyer.bio}</p>
                                            </div>
                                        )}

                                        {/* Practice Areas */}
                                        {lawyer.practice_areas && lawyer.practice_areas.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Scale className="w-5 h-5 text-blue-600" />
                                                    Practice Areas
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {lawyer.practice_areas.map((area, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-slate-800/80 rounded-lg"
                                                        >
                                                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-semibold text-gray-900 dark:text-white break-words">{area.area_name}</div>
                                                                {area.years_of_experience > 0 && (
                                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {area.years_of_experience} years experience
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Languages */}
                                        {lawyer.languages && lawyer.languages.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Languages className="w-5 h-5 text-blue-600" />
                                                    Languages
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {lawyer.languages.map((lang, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium break-words text-center"
                                                        >
                                                            {lang.language_name}
                                                            {lang.proficiency_level && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                                    ({lang.proficiency_level})
                                                                </span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Courts Practiced In */}
                                        {lawyer.courts && lawyer.courts.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                                    Courts Practiced In
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {(typeof lawyer.courts === 'string' ? JSON.parse(lawyer.courts) : lawyer.courts).map((court, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium bg-white dark:bg-slate-800 text-center break-words"
                                                        >
                                                            {court}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {lawyer.enrollment_year && (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Enrollment Year</div>
                                                    <div className="text-lg font-bold text-gray-900 dark:text-white">{lawyer.enrollment_year}</div>
                                                </div>
                                            )}
                                            {lawyer.bar_council_state && (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bar Council State</div>
                                                    <div className="text-lg font-bold text-gray-900 dark:text-white">{lawyer.bar_council_state}</div>
                                                </div>
                                            )}
                                            {lawyer.response_time && (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Response Time</div>
                                                    <div className="text-lg font-bold text-gray-900 dark:text-white">{lawyer.response_time}</div>
                                                </div>
                                            )}
                                            {lawyer.gender && (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gender</div>
                                                    <div className="text-lg font-bold text-gray-900 dark:text-white">{lawyer.gender}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-3">
                                            {lawyer.is_available_today && (
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg font-medium">
                                                    <Clock className="w-4 h-4" />
                                                    Available Today
                                                </span>
                                            )}
                                            {lawyer.is_24_7_support && (
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg font-medium">
                                                    <Award className="w-4 h-4" />
                                                    24/7 Support
                                                </span>
                                            )}
                                            {lawyer.is_verified && (
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Verified Lawyer
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'location' && (
                                    <div className="space-y-6">
                                        {/* Office Address */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-blue-600" />
                                                Office Location
                                            </h3>

                                            {(lawyer.address_line1 || lawyer.city) ? (
                                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
                                                    <div className="space-y-2">
                                                        {lawyer.address_line1 && (
                                                            <p className="text-gray-900 dark:text-white font-medium break-words">
                                                                {lawyer.address_line1}
                                                            </p>
                                                        )}
                                                        {lawyer.address_line2 && (
                                                            <p className="text-gray-700 dark:text-gray-300">
                                                                {lawyer.address_line2}
                                                            </p>
                                                        )}
                                                        <p className="text-gray-700 dark:text-gray-300">
                                                            {[lawyer.city, lawyer.state, lawyer.pincode]
                                                                .filter(Boolean)
                                                                .join(', ')}
                                                        </p>
                                                        {lawyer.country && (
                                                            <p className="text-gray-700 dark:text-gray-300 font-medium">
                                                                {lawyer.country}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Office Type Badge */}
                                                    {lawyer.office_type && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                                <Briefcase className="w-3 h-3" />
                                                                {lawyer.office_type} Practice
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                                                    <p className="text-yellow-800 dark:text-yellow-400">
                                                        Office address not available
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Interactive Map */}
                                        {lawyer.latitude && lawyer.longitude ? (
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <Navigation className="w-5 h-5 text-blue-600" />
                                                    Find Us on Map
                                                </h3>

                                                {/* Map Component - Self-responsive */}
                                                <div className="w-full">
                                                    <LeafletLawyerMap lawyer={lawyer} showRoute={true} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                    Map coordinates not available for this office location
                                                </p>
                                                {lawyer.city && lawyer.state && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                        Located in {lawyer.city}, {lawyer.state}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-4">
                                                    💡 Coordinates can be added by running geocoding script
                                                </p>
                                            </div>
                                        )}

                                         {/* Contact for Directions */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                Need Help Finding Us?
                                            </h4>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                                                Contact our office for detailed directions or landmarks
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                {lawyer.phone && (
                                                    <a
                                                        href={`tel:${lawyer.phone}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                        Call Us
                                                    </a>
                                                )}
                                                {lawyer.email && (
                                                    <a
                                                        href={`mailto:${lawyer.email}`}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                        Email Us
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Client Reviews</h3>
                                            <button
                                                onClick={() => setIsReviewOpen(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium"
                                            >
                                                <PenTool className="w-4 h-4" />
                                                Write a Review
                                            </button>
                                        </div>

                                        {lawyer.reviews && lawyer.reviews.length > 0 ? (
                                            lawyer.reviews.map((review) => (
                                                <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-white">{review.reviewer_name}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                            <span className="font-semibold">{review.rating}</span>
                                                        </div>
                                                    </div>
                                                    {review.review_title && (
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{review.review_title}</h4>
                                                    )}
                                                    {review.review_text && (
                                                        <p className="text-gray-700 dark:text-gray-300">{review.review_text}</p>
                                                    )}
                                                    {review.is_verified && (
                                                        <span className="inline-block mt-2 text-xs text-green-600 font-medium">
                                                            ✓ Verified Review
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'availability' && (
                                    <div className="space-y-4">
                                        {lawyer.availability && lawyer.availability.length > 0 ? (
                                            <div className="grid gap-3">
                                                {lawyer.availability.map((schedule, index) => (
                                                        <div
                                                        key={index}
                                                        className={`p-4 rounded-lg border ${schedule.is_available
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-semibold text-gray-900 dark:text-white">{schedule.day_of_week}</div>
                                                            {schedule.is_available ? (
                                                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                    {schedule.start_time} - {schedule.end_time}
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">Not Available</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-600 dark:text-gray-400">No availability schedule set</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default LawyerProfile;
