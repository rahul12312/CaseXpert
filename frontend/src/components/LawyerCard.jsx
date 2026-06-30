import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  Video
} from 'lucide-react';

const LawyerCard = ({ lawyer, onBook }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/lawyer/${lawyer.id}`);
  };

  const handleBookConsultation = () => {
    if (onBook) {
      onBook(lawyer);
    }
  };

  // Parse practice areas if it's a string
  const practiceAreas = typeof lawyer.practice_areas === 'string'
    ? lawyer.practice_areas.split(', ').slice(0, 3)
    : (lawyer.practice_areas || []).slice(0, 3);

  // Parse languages if it's a string
  const languages = typeof lawyer.languages === 'string'
    ? lawyer.languages.split(', ').slice(0, 3)
    : (lawyer.languages || []).slice(0, 3);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-blue-300">
      {/* Header Section */}
      <div className="p-6">
        {lawyer.recommended && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
            <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
            AI RECOMMENDED
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Profile Image */}
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            <img
              src={lawyer.profile_image || '/default-lawyer.png'}
              alt={lawyer.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-blue-100"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=3b82f6&color=fff&size=128`;
              }}
            />
            {lawyer.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Lawyer Info */}
          <div className="flex-1 min-w-0 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                  {lawyer.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    ID: #{lawyer.id?.slice(-8).toUpperCase() || 'N/A'}
                  </span>
                  {lawyer.bar_council_id && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Bar: {lawyer.bar_council_id}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating Badge */}
              {lawyer.average_rating > 0 && (
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded-lg shrink-0 border border-yellow-100 dark:border-yellow-500/20">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    {parseFloat(lawyer.average_rating).toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Location & Experience */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {(lawyer.city || lawyer.state || lawyer.country) && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {[lawyer.city, lawyer.state, lawyer.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
              {lawyer.experience && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{lawyer.experience} years exp.</span>
                </div>
              )}
              {lawyer.distance_km !== undefined && (
                <div className="flex items-center gap-1 text-blue-600 font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>{lawyer.distance_km} km away</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Practice Areas */}
        {practiceAreas.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {practiceAreas.map((area, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio Preview */}
        {lawyer.bio && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {lawyer.bio}
          </p>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Languages:</span>
            <span>{languages.join(', ')}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 sm:bg-transparent rounded-lg">
            <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {lawyer.total_cases || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Cases</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {lawyer.total_reviews || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {lawyer.success_rate ? `${parseFloat(lawyer.success_rate).toFixed(0)}%` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Success</div>
          </div>
        </div>

        {/* Availability & Response Time */}
        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
          {lawyer.is_available_today && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
              <Clock className="w-3 h-3" />
              Available Today
            </span>
          )}
          {lawyer.is_24_7_support && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
              <Award className="w-3 h-3" />
              24/7 Support
            </span>
          )}
          {lawyer.response_time && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Response: {lawyer.response_time}
            </span>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left leading-tight">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {lawyer.consultation_fee === 0
              ? 'Free'
              : `₹${parseFloat(lawyer.consultation_fee).toLocaleString()}`}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Consultation Fee</div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleViewProfile}
            className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-blue-600 bg-white dark:bg-slate-900 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-sm"
          >
            Profile
          </button>
          <button
            onClick={() => onBook(lawyer, 'video_call')}
            className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-blue-600 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
          >
            <Video className="w-4 h-4" /> Video
          </button>
          <button
            onClick={handleBookConsultation}
            className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LawyerCard;
