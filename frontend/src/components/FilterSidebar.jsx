import React, { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../lib/api.js';

const FilterSidebar = ({ filters, onFilterChange, onClearFilters, isOpen, onClose }) => {
    const [filterOptions, setFilterOptions] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        practiceArea: true,
        city: false,
        experience: false,
        fee: false,
        language: false,
        rating: true,
        availability: false,
        other: false
    });

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const fetchFilterOptions = async () => {
        try {
            const { data } = await api.get('/lawyers/filters');
            if (data.success) {
                setFilterOptions(data.data);
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleFilterChange = (filterType, value) => {
        onFilterChange(filterType, value);
    };

    const FilterSection = ({ title, sectionKey, children }) => (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between py-2 text-left"
            >
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                {expandedSections[sectionKey] ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
            </button>
            {expandedSections[sectionKey] && (
                <div className="mt-3 space-y-2">
                    {children}
                </div>
            )}
        </div>
    );

    if (!filterOptions) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden ${isOpen ? 'block' : 'hidden'} lg:block`}>
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Filters</h2>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden text-white hover:bg-blue-700 rounded p-1"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Filter Content */}
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
                {/* Practice Area */}
                <FilterSection title="Practice Area" sectionKey="practiceArea">
                    <select
                        value={filters.practice_area || ''}
                        onChange={(e) => handleFilterChange('practice_area', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Practice Areas</option>
                        {filterOptions.practice_areas?.map((area) => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </FilterSection>

                {/* City */}
                <FilterSection title="City" sectionKey="city">
                    <select
                        value={filters.city || ''}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Cities</option>
                        {filterOptions.cities?.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </FilterSection>

                {/* Experience Range */}
                <FilterSection title="Experience" sectionKey="experience">
                    {(filterOptions.experience_ranges || []).map((range) => (
                        <label key={range.label} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <input
                                type="radio"
                                name="experience"
                                checked={filters.experience_min === range.min && filters.experience_max === range.max}
                                onChange={() => {
                                    handleFilterChange('experience_min', range.min);
                                    handleFilterChange('experience_max', range.max);
                                }}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
                        </label>
                    ))}
                    <button
                        onClick={() => {
                            handleFilterChange('experience_min', '');
                            handleFilterChange('experience_max', '');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                        Clear Experience Filter
                    </button>
                </FilterSection>

                {/* Consultation Fee */}
                <FilterSection title="Consultation Fee" sectionKey="fee">
                    {(filterOptions.fee_ranges || []).map((range) => (
                        <label key={range.label} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <input
                                type="radio"
                                name="fee"
                                checked={filters.fee_min === range.min && filters.fee_max === range.max}
                                onChange={() => {
                                    handleFilterChange('fee_min', range.min);
                                    handleFilterChange('fee_max', range.max);
                                }}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
                        </label>
                    ))}
                    <button
                        onClick={() => {
                            handleFilterChange('fee_min', '');
                            handleFilterChange('fee_max', '');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                        Clear Fee Filter
                    </button>
                </FilterSection>

                {/* Languages */}
                <FilterSection title="Languages" sectionKey="language">
                    <select
                        value={filters.language || ''}
                        onChange={(e) => handleFilterChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Languages</option>
                        {filterOptions.languages?.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </FilterSection>

                {/* Rating */}
                <FilterSection title="Rating" sectionKey="rating">
                    {(filterOptions.ratings || []).map((ratingOption) => (
                        <label key={ratingOption.label} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <input
                                type="radio"
                                name="rating"
                                checked={filters.rating === ratingOption.value}
                                onChange={() => handleFilterChange('rating', ratingOption.value)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{ratingOption.label}</span>
                        </label>
                    ))}
                </FilterSection>

                {/* Availability */}
                <FilterSection title="Availability" sectionKey="availability">
                    {(filterOptions.availability_options || []).map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <input
                                type="radio"
                                name="availability"
                                checked={filters.availability === option}
                                onChange={() => handleFilterChange('availability', option)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                        </label>
                    ))}
                    <button
                        onClick={() => handleFilterChange('availability', '')}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                        Clear Availability Filter
                    </button>
                </FilterSection>

                {/* Other Filters */}
                <FilterSection title="Other Filters" sectionKey="other">
                    {/* Verified Only */}
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        <input
                            type="checkbox"
                            checked={filters.verified_only || false}
                            onChange={(e) => handleFilterChange('verified_only', e.target.checked)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Verified Lawyers Only</span>
                    </label>

                    {/* Gender */}
                    <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</p>
                        {(filterOptions.genders || []).map((gender) => (
                            <label key={gender} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                <input
                                    type="radio"
                                    name="gender"
                                    checked={filters.gender === gender}
                                    onChange={() => handleFilterChange('gender', gender)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{gender}</span>
                            </label>
                        ))}
                        <button
                            onClick={() => handleFilterChange('gender', '')}
                            className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                        >
                            Clear Gender Filter
                        </button>
                    </div>
                </FilterSection>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <button
                    onClick={onClearFilters}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white dark:bg-slate-900 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                    Clear All Filters
                </button>
            </div>
        </div>
    );
};

export default FilterSidebar;
