import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, Briefcase, Phone, MapPin } from 'lucide-react';

// Fix Leaflet's default icon issue in React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle dynamic map centering
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], zoom || map.getZoom(), {
                animate: true,
                duration: 1
            });
        }
    }, [center, zoom, map]);
    return null;
};

const LawyerMap = ({ lawyers = [], onMarkerClick, center, zoom = 12 }) => {
    // Default to India center if no coordinates are available
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    const [mapCenter, setMapCenter] = React.useState(center || defaultCenter);

    useEffect(() => {
        if (lawyers.length > 0 && !center) {
            // Auto-center to first lawyer
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

    const validLawyers = lawyers.filter(lawyer => lawyer.latitude && lawyer.longitude);

    return (
        <div className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
            <MapContainer 
                center={[mapCenter.lat, mapCenter.lng]} 
                zoom={zoom} 
                scrollWheelZoom={true}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapUpdater center={mapCenter} zoom={zoom} />

                {validLawyers.map((lawyer) => (
                    <Marker
                        key={lawyer.id || lawyer._id}
                        position={[parseFloat(lawyer.latitude), parseFloat(lawyer.longitude)]}
                        eventHandlers={{
                            click: () => {
                                if (onMarkerClick) {
                                    onMarkerClick(lawyer);
                                }
                            },
                        }}
                    >
                        <Popup className="rounded-xl custom-popup">
                            <div className="p-1 min-w-[200px]">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                                        {lawyer.name?.charAt(0) || 'L'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 m-0 leading-tight">{lawyer.name}</h3>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 m-0 mt-1">
                                            <Briefcase className="w-3 h-3" />
                                            {lawyer.experience_years} years exp.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 text-sm text-yellow-500 mb-2 font-semibold">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>{lawyer.rating?.toFixed(1) || '4.0'}</span>
                                    <span className="text-slate-400 text-xs ml-1 font-normal">
                                        ({lawyer.reviews_count || 0} reviews)
                                    </span>
                                </div>
                                
                                <div className="text-xs text-slate-600 mb-3 line-clamp-2">
                                    <span className="font-semibold text-slate-700">Expertise:</span>{' '}
                                    {Array.isArray(lawyer.practice_areas) ? lawyer.practice_areas.join(', ') : lawyer.practice_areas || 'General Law'}
                                </div>

                                <button 
                                    onClick={() => {
                                        if (onMarkerClick) onMarkerClick(lawyer);
                                    }}
                                    className="w-full py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    View Profile
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LawyerMap;
