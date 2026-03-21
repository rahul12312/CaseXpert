import React, { useState, useEffect } from 'react';
import { Search, Filter, Map as MapIcon, List, MapPin, X } from 'lucide-react';
import axios from 'axios';
import LawyerCard from '../components/LawyerCard';
import LawyerMap from '../components/LawyerMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const MapViewToggle = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [lawyers, setLawyers] = useState([]);
    const [filteredLawyers, setFilteredLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch lawyers with location
    useEffect(() => {
        fetchLawyers();
    }, []);

    const fetchLawyers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/lawyers`);
            const lawyersData = response.data.data || [];

            // Filter lawyers with valid location data for map view
            const lawyersWithLocation = lawyersData.filter(
                l => l.latitude && l.longitude
            );

            setLawyers(lawyersWithLocation);
            setFilteredLawyers(lawyersWithLocation);
        } catch (error) {
            console.error('Error fetching lawyers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter lawyers
    useEffect(() => {
        let filtered = [...lawyers];

        if (selectedCity) {
            filtered = filtered.filter(l => l.city === selectedCity);
        }

        if (searchQuery) {
            filtered = filtered.filter(l =>
                l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.practice_areas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.city?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredLawyers(filtered);
    }, [selectedCity, searchQuery, lawyers]);

    const uniqueCities = [...new Set(lawyers.map(l => l.city).filter(Boolean))].sort();

    const handleMarkerClick = (lawyer) => {
        // Scroll to lawyer card
        const element = document.getElementById(`lawyer-${lawyer.id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-blue-500');
            setTimeout(() => {
                element.classList.remove('ring-4', 'ring-blue-500');
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">Lawyer Marketplace</h1>
                    <p className="text-blue-100">Find lawyers near you with our interactive map</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-6">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search lawyers by name, practice area, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* City Filter */}
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Cities</option>
                            {uniqueCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${viewMode === 'list'
                                        ? 'bg-white text-blue-600 shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${viewMode === 'map'
                                        ? 'bg-white text-blue-600 shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <MapIcon className="w-5 h-5" />
                                Map
                            </button>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(selectedCity || searchQuery) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {selectedCity && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    <MapPin className="w-3 h-3" />
                                    {selectedCity}
                                    <button onClick={() => setSelectedCity('')}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {searchQuery && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    Search: {searchQuery}
                                    <button onClick={() => setSearchQuery('')}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-4 text-gray-600">
                    Showing <span className="font-bold text-gray-900">{filteredLawyers.length}</span> lawyer{filteredLawyers.length !== 1 ? 's' : ''}
                    {lawyers.length !== filteredLawyers.length && ` out of ${lawyers.length}`}
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading lawyers...</p>
                    </div>
                ) : filteredLawyers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No lawyers found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <>
                        {/* Map View */}
                        {viewMode === 'map' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MapIcon className="w-5 h-5 text-blue-600" />
                                        Lawyer Locations
                                    </h3>
                                    <LawyerMap
                                        lawyers={filteredLawyers}
                                        onMarkerClick={handleMarkerClick}
                                    />
                                </div>

                                {/* Lawyer cards below map */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredLawyers.map(lawyer => (
                                        <div key={lawyer.id} id={`lawyer-${lawyer.id}`} className="transition-all duration-300">
                                            <LawyerCard lawyer={lawyer} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredLawyers.map(lawyer => (
                                    <div key={lawyer.id} id={`lawyer-${lawyer.id}`}>
                                        <LawyerCard lawyer={lawyer} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MapViewToggle;
