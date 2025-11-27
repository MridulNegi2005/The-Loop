import React, { useState, useEffect, useRef } from 'react';

export default function Header({ setPage, isLoggedIn, setIsLoggedIn, setSelectedEvent, setViewMode, theme, setTheme, setToken }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [showPwaButton, setShowPwaButton] = useState(false);
    const deferredPromptRef = useRef(null);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            deferredPromptRef.current = e;
            setShowPwaButton(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePwaInstall = () => {
        if (deferredPromptRef.current) {
            deferredPromptRef.current.prompt();
            deferredPromptRef.current.userChoice.then(() => {
                deferredPromptRef.current = null;
                setShowPwaButton(false);
            });
        }
    };

    const goHome = () => { setSelectedEvent(null); setPage('events'); setViewMode('list'); setIsMenuOpen(false); }
    const navAction = (page, tab = 'profile') => {
        setPage(page);
        if (page === 'profile') {
            // We need a way to set the active tab in ProfilePage. 
            // Since ProfilePage is a child of App, we might need to pass this down or use a global state/context.
            // For now, we'll just navigate to the page. The user asked for "Carpool option to Header profile menu".
            // Ideally, we should pass a prop to ProfilePage to set the initial tab.
            // Let's assume we can pass a state setter or use a URL param if we had routing.
            // Given the current structure, we might need to lift the 'activeTab' state to App.jsx or pass a prop 'initialTab'.
            // Let's modify App.jsx later to handle 'initialTab'.
        }
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
    }
    const handleLogout = () => {
        setIsLoggedIn(false);
        setToken('');
        setPage('events');
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float 7s ease-in-out infinite 1s;
                }
                .animate-float-slow {
                    animation: float 8s ease-in-out infinite 2s;
                }
            `}</style>

            {/* Icons Layer - Behind Glass */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Music Note Icon */}
                <div className="absolute top-2 left-[15%] text-purple-500 animate-float">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>

                {/* Calendar Icon */}
                <div className="absolute top-3 right-[20%] text-fuchsia-500 animate-float-delayed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Map Pin Icon */}
                <div className="absolute top-4 left-[40%] text-indigo-500 animate-float-slow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>

                {/* Star Icon */}
                <div className="absolute top-2 right-[10%] text-purple-400 animate-float">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
            </div>

            {/* Glass Background Layer */}
            <div className="absolute inset-0 bg-white/60 dark:bg-purple-900/20 backdrop-blur-sm border-b border-purple-500/30 shadow-[0_0_20px_rgba(147,51,234,0.15)] z-10"></div>

            <nav className="container mx-auto px-4 sm:px-6 py-3 relative flex justify-between items-center h-16 z-20">

                {/* 1. Logo Section */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={goHome}>
                    <div className="relative w-9 h-9 flex items-center justify-center bg-transparent rounded-xl group-hover:scale-105 transition-transform duration-300">
                        <img src="/logo_transparent-192x192.PNG" alt="Logo" className="w-8 h-8 object-contain" style={{ background: 'transparent' }} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 tracking-tight">
                            The Loop
                        </span>
                    </div>
                </div>

                {/* 2. Center Section: Events Button */}
                <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                    <button
                        onClick={goHome}
                        className="px-6 py-2 rounded-full bg-gray-100 dark:bg-white/5 text-sm font-bold text-gray-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm hover:shadow-md"
                    >
                        Events
                    </button>
                </div>

                {/* 3. Actions & Profile */}
                <div className="hidden md:flex items-center gap-3">
                    {showPwaButton && (
                        <button
                            onClick={handlePwaInstall}
                            className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Install
                        </button>
                    )}

                    <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>

                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                    >
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>

                    {isLoggedIn ? (
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-[#0d1117] flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#161b22] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden animate-fadeIn origin-top-right">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">My Account</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Student</p>
                                    </div>
                                    <div className="py-1">
                                        <button onClick={() => navAction('profile')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Profile
                                        </button>
                                        <button onClick={() => { setPage('profile'); setIsProfileMenuOpen(false); setTimeout(() => { const btn = document.querySelector('button[data-tab="carpool"]'); if (btn) btn.click(); }, 100); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            Car Pooling
                                        </button>
                                        <button onClick={() => alert('Coming soon!')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            Friends
                                        </button>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-white/5 py-1">
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navAction('login')}
                            className="bg-white dark:bg-white text-gray-900 font-bold py-2 px-5 rounded-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                            Log In
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-3">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                        {theme === 'dark' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                    </button>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-xl animate-fadeIn">
                        <div className="px-4 py-4 space-y-2">
                            <button onClick={goHome} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                Events
                            </button>

                            <div className="h-px bg-gray-200 dark:bg-white/10 my-2"></div>

                            {isLoggedIn ? (
                                <>
                                    <button onClick={() => navAction('profile')} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        My Profile
                                    </button>
                                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => navAction('login')} className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all">
                                    Log In
                                </button>
                            )}
                        </div>
                    </div>
                )
            }
        </header >
    );
}
