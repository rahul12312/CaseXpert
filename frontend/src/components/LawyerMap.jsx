import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Star, Briefcase, Phone } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
};

const defaultCenter = {
    lat: 20.5937, // India center
    lng: 78.9629
};

/**
 * LawyerMap Component - Shows multiple lawyers on an interactive map
 * @param {Array} lawyers - Array of lawyer objects with lat/lng
 * @param {Function} onMarkerClick - Callback when marker is clicked
 * @param {Object} center - Optional center coordinates
 * @param {Number} zoom - Optional zoom level (default: 12)
 */
const LawyerMap = ({ lawyers = [], onMarkerClick, center, zoom = 12 }) => {
    const [selectedLawyer, setSelectedLawyer] = React.useState(null);
    const [mapCenter, setMapCenter] = React.useState(center || defaultCenter);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    React.useEffect(() => {
        if (lawyers.length > 0 && !center) {
            // Auto-center to first lawyer or calculate bounds
            const firstLawyer = lawyers.find(l => l.latitude && l.longitude);
            if (firstLawyer) {
                setMapCenter({
                    lat: parseFloat(firstLawyer.latitude),
                    lng: parseFloat(firstLawyer.longitude)
                });
            }
        } else if (center) {
            setMapCenter(center);
        }
    }, [lawyers, center]);

    const handleMarkerClick = (lawyer) => {
        setSelectedLawyer(lawyer);
        if (onMarkerClick) {
            onMarkerClick(lawyer);
        }
    };

    // Fallback: If no API key, show message
    if (!apiKey) {
        return (
            <div className="w-full h-[500px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center p-8">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Map View Unavailable
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        Displaying {lawyers.length} lawyers with location data
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={zoom}
                    options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true
                    }}
                >
                    {lawyers
                        .filter(lawyer => lawyer.latitude && lawyer.longitude)
                        .map((lawyer) => (
                            <Marker
                                key={lawyer.id}
                                position={{
                                    lat: parseFloat(lawyer.latitude),
                                    lng: parseFloat(lawyer.longitude)
                                }}
                                onClick={() => handleMarkerClick(lawyer)}
                                title={lawyer.name}
                            />
                        ))}

                    {selectedLawyer && (
                        <InfoWindow
                            position={{
                                lat: parseFloat(selectedLawyer.latitude),
                                lng: parseFloat(selectedLawyer.longitude)
                            }}
                            onCloseClick={() => setSelectedLawyer(null)}
                        >
                            <div className="p-3 max-w-xs">
                                <div className="flex items-start gap-3 mb-3">
                                    <img
                                        src={selectedLawyer.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedLawyer.name)}&background=3b82f6&color=fff`}
                                        alt={selectedLawyer.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                                            {selectedLawyer.name}
                                        </h4>
                                        {selectedLawyer.average_rating > 0 && (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                    {parseFloat(selectedLawyer.average_rating).toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedLawyer.address_line1 && (
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <p className="line-clamp-2">
                                            {selectedLawyer.address_line1}, {selectedLawyer.city}
                                        </p>
                                    </div>
                                )}

                                {selectedLawyer.practice_areas && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                                        <p className="line-clamp-1">{selectedLawyer.practice_areas}</p>
                                    </div>
                                )}

                                {selectedLawyer.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        <p>{selectedLawyer.phone}</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => window.location.href = `/lawyer/${selectedLawyer.id}`}
                                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Book Consultation
                                </button>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default LawyerMap;
