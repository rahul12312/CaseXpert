import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Star, Briefcase, Phone } from 'lucide-react';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * FREE Leaflet Map Component - Single Lawyer Office Location
 * Uses OpenStreetMap tiles (100% FREE, no API key needed)
 * 
 * @param {Object} lawyer - Lawyer object with latitude, longitude, and address
 * @param {Boolean} showRoute - Whether to show "Get Directions" button
 */
const LeafletLawyerMap = ({ lawyer, showRoute = true }) => {
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        // Delay map rendering slightly to ensure container dimensions are ready
        const timer = setTimeout(() => {
            setMapReady(true);
            // Trigger resize event to fix potential Leaflet gray box issue
            window.dispatchEvent(new Event('resize'));
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const lat = parseFloat(lawyer?.latitude);
    const lng = parseFloat(lawyer?.longitude);
    const hasValidCoordinates = !isNaN(lat) && !isNaN(lng);

    if (!lawyer || !hasValidCoordinates) {
        return (
            <div className="w-full h-[300px] sm:h-[400px] bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center p-6">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                        Map Unavailable
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        Coordinates missing for {lawyer?.city ? `${lawyer.city}, ${lawyer.state}` : 'this location'}
                    </p>
                </div>
            </div>
        );
    }

    const position = [lat, lng];

    const openInGoogleMaps = () => {
        // Universal geo URI for broader compatibility, fallback to Google Maps web
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            window.open(`geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(lawyer.name || 'Lawyer Office')})`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Map Container - Responsive Height */}
            <div className="w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden shadow-md border border-gray-200 relative z-0">
                {mapReady && (
                    <MapContainer
                        center={position}
                        zoom={15}
                        className="h-full w-full outline-none"
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                        scrollWheelZoom={false} // Disable scroll zoom for better page scrolling experience
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={position}>
                            <Popup className="custom-popup">
                                <div className="p-1 min-w-[200px] max-w-[250px]">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {lawyer.profile_image ? (
                                                <img src={lawyer.profile_image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Briefcase className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                                                {lawyer.name}
                                            </h4>
                                            <div className="text-xs text-blue-600 font-medium mt-0.5">
                                                {lawyer.city}, {lawyer.state}
                                            </div>
                                        </div>
                                    </div>

                                    {lawyer.address_line1 && (
                                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2 line-clamp-3 break-words leading-relaxed">
                                            {lawyer.address_line1}
                                        </p>
                                    )}

                                    <button
                                        onClick={openInGoogleMaps}
                                        className="w-full mt-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded shadow-sm hover:bg-blue-700 transition"
                                    >
                                        Navigate Here
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>
                )}
            </div>

            {/* Actions Bar - Responsive Alignment */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-1 rounded-lg">
                {/* Left: Status */}
                <div className="flex flex-wrap items-center gap-3">
                    {lawyer.location_verified ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Verified Location
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Coordinates from address
                        </div>
                    )}
                </div>

                {/* Right: Primary Action */}
                {showRoute && (
                    <button
                        onClick={openInGoogleMaps}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                    </button>
                )}
            </div>

            {/* Attribution - Subtle */}
            <div className="text-[10px] text-gray-400 text-right px-1">
                © OpenStreetMap contributors
            </div>
        </div>
    );
};

export default LeafletLawyerMap;
