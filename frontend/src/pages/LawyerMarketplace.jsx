import React, { useState, useEffect } from 'react';
import { Search, Filter, X, SlidersHorizontal, Loader2, Sparkles, MessageSquare, Brain, Send, Award, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import LawyerCard from '../components/LawyerCard';
import FilterSidebar from '../components/FilterSidebar';
import BookingModal from '../components/BookingModal';
import api from '../lib/api';

const LawyerMarketplace = () => {
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        practice_area: '',
        city: '',
        experience_min: '',
        experience_max: '',
        fee_min: '',
        fee_max: '',
        language: '',
        rating: 0,
        verified_only: false,
        gender: '',
        availability: ''
    });
    const [sortBy, setSortBy] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 20,
        offset: 0,
        pages: 0
    });
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);

    // AI Matcher States
    const [aiQuery, setAiQuery] = useState('');
    const [isAiMatching, setIsAiMatching] = useState(false);
    const [aiResults, setAiResults] = useState(null);
    const [isAiExpanded, setIsAiExpanded] = useState(false);

    // Booking States
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [bookingType, setBookingType] = useState('video_call');

    // Debounced search for real-time filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!aiResults) { // Only fetch if not showing AI results
                setPagination(prev => ({ ...prev, offset: 0 }));
                fetchLawyers();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchLawyers();
    }, [filters, sortBy, pagination.offset]);

    useEffect(() => {
        updateActiveFilters();
    }, [filters]);

    const fetchLawyers = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();

            // Add search
            if (searchQuery) queryParams.append('search', searchQuery);

            // Add filters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== '' && value !== false && value !== 0) {
                    queryParams.append(key, value);
                }
            });

            // Add sorting
            if (sortBy === 'rating') {
                queryParams.append('sort_by', 'rating');
                queryParams.append('sort_order', 'desc');
            } else if (sortBy === 'experience') {
                queryParams.append('sort_by', 'experience');
                queryParams.append('sort_order', 'desc');
            } else if (sortBy === 'fee_low') {
                queryParams.append('sort_by', 'fee_low');
            } else if (sortBy === 'fee_high') {
                queryParams.append('sort_by', 'fee_high');
            }

            // Add pagination
            queryParams.append('limit', pagination.limit);
            queryParams.append('offset', pagination.offset);

            const response = await api.get(`/lawyers?${queryParams}`);
            const data = response.data;

            if (data.success) {
                // Clear AI highlights when doing manual search
                setLawyers(data.data.map(l => ({ ...l, recommended: false })));
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    pages: data.pagination.pages
                }));
            }
        } catch (error) {
            console.error('Error fetching lawyers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setAiResults(null); // Clear AI results on manual search
        setPagination(prev => ({ ...prev, offset: 0 }));
        fetchLawyers();
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        setPagination(prev => ({ ...prev, offset: 0 }));
    };

    const handleClearFilters = () => {
        setFilters({
            practice_area: '',
            city: '',
            experience_min: '',
            experience_max: '',
            fee_min: '',
            fee_max: '',
            language: '',
            rating: 0,
            verified_only: false,
            gender: '',
            availability: ''
        });
        setSearchQuery('');
        setAiResults(null);
        setPagination(prev => ({ ...prev, offset: 0 }));
    };

    const removeFilter = (filterKey) => {
        if (filterKey === 'experience') {
            setFilters(prev => ({
                ...prev,
                experience_min: '',
                experience_max: ''
            }));
        } else if (filterKey === 'fee') {
            setFilters(prev => ({
                ...prev,
                fee_min: '',
                fee_max: ''
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [filterKey]: filterKey === 'verified_only' ? false : (filterKey === 'rating' ? 0 : '')
            }));
        }
    };

    const updateActiveFilters = () => {
        const active = [];

        if (filters.practice_area) active.push({ key: 'practice_area', label: `Practice: ${filters.practice_area}` });
        if (filters.city) active.push({ key: 'city', label: `City: ${filters.city}` });
        if (filters.experience_min || filters.experience_max) {
            const label = `Experience: ${filters.experience_min || 0}-${filters.experience_max || '∞'} years`;
            active.push({ key: 'experience', label });
        }
        if (filters.fee_min !== '' || filters.fee_max !== '') {
            const label = `Fee: ₹${filters.fee_min || 0}-₹${filters.fee_max || '∞'}`;
            active.push({ key: 'fee', label });
        }
        if (filters.language) active.push({ key: 'language', label: `Language: ${filters.language}` });
        if (filters.rating > 0) active.push({ key: 'rating', label: `Rating: ${filters.rating}★+` });
        if (filters.verified_only) active.push({ key: 'verified_only', label: 'Verified Only' });
        if (filters.gender) active.push({ key: 'gender', label: `Gender: ${filters.gender}` });
        if (filters.availability) active.push({ key: 'availability', label: filters.availability });

        setActiveFilters(active);
    };

    const handleAiMatch = async (e) => {
        if (e) e.preventDefault();
        if (!aiQuery.trim()) return;

        setIsAiMatching(true);
        try {
            const response = await api.post('/lawyers/ai-recommend', { description: aiQuery });
            if (response.data.success) {
                const aiLawyers = response.data.data.map(l => ({ ...l, recommended: true }));
                setAiResults({
                    lawyers: aiLawyers,
                    analysis: response.data.analysis
                });
                // Merge AI results at the top if desired, or replace results
                // User requirement 4: "Display AI-recommended lawyers"
                // User requirement 7: "AI results highlighted with badge"
                setLawyers(aiLawyers);
                setPagination(prev => ({
                    ...prev,
                    total: aiLawyers.length,
                    pages: 1
                }));
            }
        } catch (error) {
            console.error('AI Match Error:', error);
        } finally {
            setIsAiMatching(false);
        }
    };

    const handleOpenBooking = (lawyer, type = 'video_call') => {
        setSelectedLawyer(lawyer);
        setBookingType(type);
        setIsBookingModalOpen(true);
    };

    const handlePageChange = (newOffset) => {
        setPagination(prev => ({ ...prev, offset: newOffset }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="container mx-auto px-4 relative">
                    <div className="flex flex-col items-center mb-10">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-center tracking-tight leading-tight">
                            Find Your Legal Pro
                        </h1>
                        <p className="text-blue-100 text-base sm:text-lg md:text-xl text-center max-w-2xl font-light opacity-90 px-4">
                            Vetted lawyers at your fingertips. Use manual search or our <span className="text-amber-400 font-semibold">AI Matcher</span> for complex cases.
                        </p>
                    </div>

                    {/* Integrated Search Bar (Requirement 1 & 2) */}
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row items-center gap-2 border-4 border-white/20">

                            {/* AI Matcher Section (Left Side & Expandable) */}
                            <div className={`transition-all duration-500 ease-in-out w-full md:w-auto ${isAiExpanded ? 'flex-[1.5] bg-slate-50 dark:bg-slate-950 rounded-xl p-1 shadow-inner border border-slate-200 dark:border-slate-700' : ''}`}>
                                {!isAiExpanded ? (
                                    <button
                                        onClick={() => setIsAiExpanded(true)}
                                        title="Find best lawyer using AI"
                                        className="w-full md:w-auto p-3 sm:p-4 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-xl transition-all group flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap"
                                    >
                                        <Brain className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500 animate-pulse" />
                                        <span className="font-bold text-xs sm:text-sm">AI MATCH</span>
                                    </button>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-center w-full gap-2 p-1 animate-in fade-in slide-in-from-left-4 duration-300">
                                        <div className="flex items-center w-full gap-2">
                                            <div className="bg-amber-400 p-2 rounded-lg shrink-0">
                                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-white" />
                                            </div>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={aiQuery}
                                                onChange={(e) => setAiQuery(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAiMatch()}
                                                placeholder="Describe your case..."
                                                className="flex-1 bg-transparent text-slate-900 dark:text-white px-2 py-2 sm:py-3 focus:outline-none font-medium placeholder:text-slate-400 text-sm sm:text-base min-w-0"
                                            />
                                        </div>
                                        <div className="flex w-full sm:w-auto gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                                            <button
                                                onClick={handleAiMatch}
                                                disabled={isAiMatching || !aiQuery.trim()}
                                                className="flex-1 sm:flex-none bg-slate-900 text-white px-4 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-slate-800 disabled:bg-slate-400 flex items-center justify-center gap-2 whitespace-nowrap transition-all"
                                            >
                                                {isAiMatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                {isAiMatching ? 'Match' : 'Match Me'}
                                            </button>
                                            <button
                                                onClick={() => { setIsAiExpanded(false); setAiQuery(''); setAiResults(null); }}
                                                className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-400 rounded-lg shrink-0"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-10 w-px bg-slate-200 hidden md:block mx-1"></div>

                            {/* Manual Search (Right Side) */}
                            <div className="flex-1 flex items-center relative group w-full">
                                <Search className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by name, specialization..."
                                    className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl text-slate-900 dark:text-white font-medium text-base sm:text-lg focus:outline-none placeholder:text-slate-400"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); handleSearch(); }}
                                        className="absolute right-4 p-1 hover:bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Manual Search Trigger Button */}
                            {!isAiExpanded && (
                                <button
                                    onClick={handleSearch}
                                    className="w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg text-sm sm:text-lg flex items-center justify-center gap-2"
                                >
                                    <Search className="w-5 h-5" />
                                    <span>Find</span>
                                </button>
                            )}
                        </div>

                        {/* Popular Tags */}
                        <div className="mt-6 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="flex items-center justify-center gap-3 text-sm text-blue-100/80 font-medium whitespace-nowrap px-4">
                                <span className="shrink-0">Popular Areas:</span>
                                {['Property Laws', 'Divorce', 'Corporate Tax', 'Cyber Crime'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            setSearchQuery(tag);
                                            setAiResults(null);
                                            setFilters(f => ({ ...f, practice_area: tag }));
                                        }}
                                        className="hover:text-white hover:bg-white/10 px-3 py-1 rounded-full border border-white/20 transition-all text-xs sm:text-sm"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Results Context Panel (Requirement 4) */}
            {aiResults && (
                <div className="container mx-auto px-4 -mt-8 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="max-w-5xl mx-auto bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center gap-4">
                        <div className="bg-amber-400 p-2 sm:p-3 rounded-2xl shadow-sm shrink-0">
                            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-amber-900 font-bold text-base sm:text-lg mb-1">AI Recommendation Active</h3>
                            <p className="text-amber-800 text-xs sm:text-sm italic">
                                "{aiResults.analysis.summary}" — Based on your issue, we found {aiResults.lawyers.length} expert matches.
                            </p>
                        </div>
                        <button
                            onClick={() => { setAiResults(null); fetchLawyers(); }}
                            className="w-full sm:w-auto bg-white/80 hover:bg-white dark:bg-slate-900 text-amber-800 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-amber-200 transition-all whitespace-nowrap"
                        >
                            Reset AI
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`container mx-auto px-4 ${aiResults ? 'py-12' : 'py-12'}`}>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                <div className="p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                                        <Filter className="w-5 h-5 text-blue-600" />
                                        Advanced Filters
                                    </div>
                                </div>
                                <div className="p-2">
                                    <FilterSidebar
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                        onClearFilters={handleClearFilters}
                                        isOpen={true}
                                        onClose={() => { }}
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                            <div className="text-center sm:text-left">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                    {aiResults ? 'AI Recommended Matches' : 'Lawyers for you'}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                                    Showing <span className="text-slate-900 dark:text-white font-semibold">{pagination.total}</span> verified legal experts
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold shadow-sm active:bg-slate-50 dark:bg-slate-950"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </button>
                                <div className="flex-1 sm:flex-none flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 sm:py-1.5 shadow-sm">
                                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-transparent text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold focus:outline-none w-full outline-none"
                                    >
                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Default Sort</option>
                                        <option value="rating" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Top Rated</option>
                                        <option value="experience" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Experience</option>
                                        <option value="fee_low" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">Price: Low-High</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                                {activeFilters.map((filter) => (
                                    <span
                                        key={filter.key}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100"
                                    >
                                        {filter.label}
                                        <button onClick={() => removeFilter(filter.key)} className="hover:text-blue-900">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                                <button
                                    onClick={handleClearFilters}
                                    className="text-xs text-slate-400 hover:text-blue-600 font-bold px-2"
                                >
                                    Reset All
                                </button>
                            </div>
                        )}

                        {/* Mobile Filter Sidebar */}
                        {showFilters && (
                            <div className="lg:hidden fixed inset-0 z-[60] animate-in fade-in duration-300">
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
                                <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-500">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900 dark:text-white">Filter Search</h3>
                                        <button onClick={() => setShowFilters(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                        </button>
                                    </div>
                                    <div className="p-4 h-[calc(100vh-70px)] overflow-y-auto">
                                        <FilterSidebar
                                            filters={filters}
                                            onFilterChange={handleFilterChange}
                                            onClearFilters={handleClearFilters}
                                            isOpen={showFilters}
                                            onClose={() => setShowFilters(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lawyer Grid (Requirement 4 & 7) */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching best lawyers...</p>
                            </div>
                        ) : lawyers.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center">
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-12 h-12 text-blue-200" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Matching Experts</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                                    We couldn't find lawyers matching your current criteria. Try resetting filters or using the AI Matcher.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid gap-6">
                                    {lawyers.map((lawyer) => (
                                        <div key={lawyer.id} className={lawyer.recommended ? "relative" : ""}>
                                            <LawyerCard
                                                lawyer={lawyer}
                                                onBook={handleOpenBooking}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && !aiResults && (
                                    <div className="mt-12 flex items-center justify-center gap-2 sm:gap-3">
                                        <button
                                            onClick={() => handlePageChange(pagination.offset - pagination.limit)}
                                            disabled={currentPage === 1}
                                            className="p-2 sm:p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="flex gap-1 sm:gap-2">
                                            {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                                                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base transition-all ${currentPage === pageNum
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                                            disabled={currentPage === pagination.pages}
                                            className="p-2 sm:p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Booking Modal */}
            {selectedLawyer && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    lawyerId={selectedLawyer.id}
                    lawyerName={selectedLawyer.name}
                    consultationFee={selectedLawyer.consultation_fee}
                    initialType={bookingType}
                />
            )}
        </div>
    );
};

export default LawyerMarketplace;
