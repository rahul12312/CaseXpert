import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Star, Briefcase, Navigation } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
};

/**
 * Single Lawyer Map Component - Shows one lawyer's office location
 * @param {Object} lawyer - Lawyer object with location data
 * @param {Boolean} showRoute - Whether to show route button
 */
const SingleLawyerMap = ({ lawyer, showRoute = true }) => {
    const [showInfo, setShowInfo] = React.useState(true);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    if (!lawyer || !lawyer.latitude || !lawyer.longitude) {
        return (
            <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center p-6">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Location not available</p>
                </div>
            </div>
        );
    }

    const center = {
        lat: parseFloat(lawyer.latitude),
        lng: parseFloat(lawyer.longitude)
    };

    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
        window.open(url, '_blank');
    };

    // Fallback: If no API key, show static info
    if (!apiKey) {
        return (
            <div className="w-full h-[400px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center border-2 border-blue-200">
                <div className="text-center p-8">
                    <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        📍 {lawyer.city}, {lawyer.state}
                    </h3>
                    {lawyer.address_line1 && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {lawyer.address_line1}
                        </p>
                    )}
                    {lawyer.country && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{lawyer.country}</p>
                    )}
                    <button
                        onClick={openInGoogleMaps}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                    >
                        <Navigation className="w-5 h-5" />
                        View on Google Maps
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={15}
                    options={{
                        zoomControl: true,
                        streetViewControl: true,
                        mapTypeControl: false,
                        fullscreenControl: true
                    }}
                >
                    <Marker
                        position={center}
                        title={lawyer.name}
                        onClick={() => setShowInfo(true)}
                    />

                    {showInfo && (
                        <InfoWindow
                            position={center}
                            onCloseClick={() => setShowInfo(false)}
                        >
                            <div className="p-2">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{lawyer.name}</h4>
                                {lawyer.address_line1 && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {lawyer.address_line1}
                                        <br />
                                        {lawyer.city}, {lawyer.state}
                                    </p>
                                )}
                                {lawyer.practice_areas && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        <Briefcase className="w-3 h-3 inline mr-1" />
                                        {lawyer.practice_areas}
                                    </p>
                                )}
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </LoadScript>

            {showRoute && (
                <button
                    onClick={openInGoogleMaps}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all"
                >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                </button>
            )}
        </div>
    );
};

export default SingleLawyerMap;
