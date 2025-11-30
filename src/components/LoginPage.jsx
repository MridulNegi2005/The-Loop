import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = ({ setPage, setIsLoggedIn, setToken, setShowOnboarding, setOnboardingData }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState('username'); // 'username' or 'email'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new URLSearchParams();
        formData.append('username', identifier);
        formData.append('password', password);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();

                let errorMessage = 'Failed to log in';
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map(err => err.msg).join(', ');
                    } else {
                        errorMessage = errorData.detail;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setIsLoggedIn(true);
            if (data.access_token) {
                setToken(data.access_token);
            }
            setPage('events');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            });

            if (!response.ok) {
                throw new Error('Google login failed');
            }

            const data = await response.json();
            setIsLoggedIn(true);
            if (data.access_token) {
                setToken(data.access_token);
            }

            if (data.is_new_user) {
                // Trigger onboarding for new Google users
                setOnboardingData({
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    isGoogle: true
                });
                setShowOnboarding(true);
            } else {
                setPage('events');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleFailure = () => {
        setError("Google Sign In was unsuccessful. Try again later.");
    };

    const toggleLoginMethod = () => {
        setLoginMethod(prev => prev === 'username' ? 'email' : 'username');
        setIdentifier('');
        setError(null);
    };

    return (
        <div className="h-screen flex items-center justify-center bg-[#0d1117] relative overflow-hidden">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
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

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            {/* Floating Icons */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Music Note Icon */}
                <div className="absolute top-[15%] left-[10%] md:left-[5%] md:top-[20%] text-purple-500 animate-float">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>

                {/* Calendar Icon */}
                <div className="absolute top-[20%] right-[10%] md:right-[5%] md:top-[15%] text-fuchsia-500 animate-float-delayed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 drop-shadow-[0_0_15px_rgba(232,121,249,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Map Pin Icon */}
                <div className="absolute bottom-[25%] left-[15%] md:left-[8%] md:bottom-[20%] text-indigo-500 animate-float-slow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>

                {/* Star Icon */}
                <div className="absolute bottom-[30%] right-[20%] md:right-[10%] md:bottom-[15%] text-purple-400 animate-float">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 drop-shadow-[0_0_15px_rgba(192,132,252,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
            </div>

            {/* Back Button */}
            <button
                onClick={() => setPage('landing')}
                className="absolute top-6 left-6 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-sm border border-white/10 group"
                aria-label="Go back"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>

            <div className="w-full max-w-lg z-10 px-4">
                <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.15)] p-6 md:p-8 transform transition-all hover:scale-[1.01] hover:shadow-[0_0_60px_rgba(147,51,234,0.2)]">

                    <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-2 rotate-3 hover:rotate-6 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
                        <p className="text-purple-200/60 mt-1 text-center text-sm">Sign in to continue your journey</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3 animate-fadeIn">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-200/80 ml-1" htmlFor="identifier">
                                {loginMethod === 'username' ? 'Username' : 'Email'}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    className="w-full bg-[#0d1117]/50 border border-gray-700/50 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600 hover:bg-[#0d1117]/80"
                                    id="identifier"
                                    type={loginMethod === 'username' ? 'text' : 'email'}
                                    placeholder={loginMethod === 'username' ? 'cooluser123' : 'you@college.edu'}
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={toggleLoginMethod}
                                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors underline decoration-purple-400/30 hover:decoration-purple-300"
                                >
                                    {loginMethod === 'username' ? 'Log in with Email' : 'Log in with Username'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-purple-200/80" htmlFor="password">Password</label>
                                <button type="button" onClick={() => setPage('forgot-password')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    className="w-full bg-[#0d1117]/50 border border-gray-700/50 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600 hover:bg-[#0d1117]/80"
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </span>
                            ) : 'Sign In'}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-600"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Or continue with</span>
                            <div className="flex-grow border-t border-gray-600"></div>
                        </div>

                        <div className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleFailure}
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setPage('signup')}
                                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 transition-all"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
