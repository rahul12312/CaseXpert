import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { user, isAuthenticated, logout, isLawyer, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdminUser = isAdmin();
    const isLawyerUser = isLawyer();

    // LAWYER Navigation
    const lawyerNavLinks = [
        { name: 'Dashboard', path: '/lawyer/dashboard', icon: '📊' },
        { name: 'Accepted Cases', path: '/lawyer/accepted-cases', icon: '📁' },
        { name: 'Consultations', path: '/lawyer/consultations', icon: '📅' },
        { name: 'Case Requests', path: '/lawyer/case-requests', icon: '📋' },
    ];

    // USER/CLIENT Navigation
    const userNavLinks = [
        { name: 'AI Assistant', path: '/assistant', icon: '🤖' },
        { name: 'Video Consult', path: '/video-hub', icon: '📹' },
        { name: 'Case Tracker', path: '/cases', icon: '📋' },
        { name: 'Documents', path: '/documents', icon: '📄' },
        { name: 'Find Lawyers', path: '/lawyers', icon: '⚖️' },
        { name: 'News', path: '/news', icon: '📰' },
    ];

    // Select navigation based on role
    const navLinks = isAdminUser ? [] : (isLawyerUser ? lawyerNavLinks : userNavLinks);

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled
                ? 'bg-white/95 backdrop-blur-sm shadow-md border-slate-200 dark:border-slate-700 dark:bg-slate-900/95 dark:border-slate-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:border-slate-800'
                }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg group-hover:scale-105 transition-transform">
                            <span className="text-lg font-bold">⚖️</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white dark:text-white">
                            CaseXpert
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {!isAdminUser && (
                        <div className="hidden md:flex md:items-center md:gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(link.path)
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-white dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="rounded-lg p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    {user?.profile_image ? (
                                        <img 
                                            src={user.profile_image} 
                                            alt={user?.name} 
                                            className="h-7 w-7 rounded-full object-cover" 
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white"
                                        style={{ display: user?.profile_image ? 'none' : 'flex' }}
                                    >
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:inline">{user?.name || 'User'}</span>
                                    <svg
                                        className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* User Dropdown Menu */}
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-800 z-20">
                                            <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 dark:border-slate-700">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white dark:text-white">
                                                    {user?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
                                                    {user?.email}
                                                </p>
                                                {user?.role && (
                                                    <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="py-1">
                                                {!isAdminUser && (
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        My Profile
                                                    </Link>
                                                )}

                                                {/* My Bookings - Only for Clients */}
                                                {!isAdminUser && !isLawyerUser && (
                                                    <Link
                                                        to="/my-bookings"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        My Bookings
                                                    </Link>
                                                )}

                                                {/* Dashboard - Only for Clients */}
                                                {!isAdminUser && !isLawyerUser && (
                                                    <Link
                                                        to="/dashboard"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                                        </svg>
                                                        Dashboard
                                                    </Link>
                                                )}

                                                {isAdminUser && (
                                                    <Link
                                                        to="/admin/dashboard"
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                        Admin Dashboard
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    to="/admin/dashboard"
                                    className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-1.5"
                                    title="Admin Login"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Admin
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        {!isAdminUser && (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden rounded-lg p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {!isAdminUser && mobileMenuOpen && (
                <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 md:hidden dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-1 px-4 py-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(link.path)
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-white dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {!isAuthenticated && (
                            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 dark:border-slate-800">
                                <Link
                                    to="/login"
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="block rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    to="/admin/dashboard"
                                    className="block rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-red-800 flex items-center justify-center gap-1.5"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Admin Dashboard
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
