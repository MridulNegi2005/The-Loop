import React, { useState, useEffect, useRef } from 'react';

export default function Header({ setPage, isLoggedIn, setIsLoggedIn, setSelectedEvent, setViewMode, theme, setTheme }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPwaButton, setShowPwaButton] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const deferredPromptRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            deferredPromptRef.current = e;
            setShowPwaButton(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
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
    const navAction = (page) => { setPage(page); setIsMenuOpen(false); }
    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('token');
        setPage('events');
        setIsMenuOpen(false);
    }

    return (
    <header className="bg-white dark:bg-[#161b22]/80 backdrop-blur-sm border-b border-gray-200 dark:border-purple-700/50 sticky top-0 z-20">
            <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src="/logo_transparent-192x192.PNG" alt="The Loop Logo" className="w-8 h-8 sm:w-10 sm:h-10 mr-2" style={{ background: 'transparent' }} />
                  <button onClick={goHome} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:text-purple-400 transition-colors">The Loop <span className="ml-2 text-xs font-semibold text-purple-500 align-top">v2</span></button>
                  {showPwaButton && (
                    <button
                      onClick={handlePwaInstall}
                      className="ml-3 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 border-2 border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      style={{animation: 'fadeIn 0.4s'}}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4" /></svg>
                      Download App
                    </button>
                  )}
                </div>
                <div className="hidden md:flex items-center space-x-2">
                    <button onClick={goHome} className="text-gray-600 dark:text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors">All Events</button>
                    {isLoggedIn && <button onClick={() => alert('My Feed is coming soon!')} className="text-gray-600 dark:text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors">My Feed</button>}
                    {!isLoggedIn && <button onClick={() => navAction('login')} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300">Login</button>}
                    {isLoggedIn && <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300">Logout</button>}
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{theme === 'dark' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}</button>
                </div>
                <div className="md:hidden flex items-center gap-2">
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-gray-500 dark:text-gray-400">{theme === 'dark' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}</button>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 dark:text-gray-400"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg></button>
                </div>
            </nav>
            {isMenuOpen && (<div className="md:hidden bg-white dark:bg-[#161b22] border-t border-gray-200 dark:border-purple-700/50"><div className="px-2 pt-2 pb-3 space-y-1 sm:px-3"><button onClick={goHome} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md">All Events</button>{isLoggedIn && <button onClick={() => alert('My Feed is coming soon!')} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md">My Feed</button>}{!isLoggedIn && <button onClick={() => navAction('login')} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md">Login</button>}{isLoggedIn && <button onClick={handleLogout} className="w-full text-left block text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 px-3 py-2 rounded-md">Logout</button>}</div></div>)}
        </header>
    );
}
