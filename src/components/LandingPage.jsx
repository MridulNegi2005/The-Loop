import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

const LandingPage = ({ setPage, setIsLoggedIn, setToken, setShowOnboarding, setOnboardingData }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new URLSearchParams();
        formData.append('username', email);
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
                    errorMessage = Array.isArray(errorData.detail)
                        ? errorData.detail.map(err => err.msg).join(', ')
                        : errorData.detail;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setIsLoggedIn(true);
            if (data.access_token) {
                setToken(data.access_token);
            }
            navigate('/events');

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
                navigate('/events');
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

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            await handleGoogleSuccess({ credential: tokenResponse.access_token });
        },
        onError: handleGoogleFailure,
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d1117] relative overflow-hidden">
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

            {/* Background Effects - Pure Purple */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-800/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[150px] animate-pulse delay-500"></div>
            </div>

            {/* Floating Icons */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Music Note Icon */}
                <div className="absolute top-[15%] left-[10%] md:left-[5%] md:top-[20%] text-purple-500/30 animate-float">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>

                {/* Calendar Icon */}
                <div className="absolute top-[20%] right-[10%] md:right-[5%] md:top-[15%] text-fuchsia-500/30 animate-float-delayed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 drop-shadow-[0_0_15px_rgba(232,121,249,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Map Pin Icon */}
                <div className="absolute bottom-[25%] left-[15%] md:left-[8%] md:bottom-[20%] text-indigo-500/30 animate-float-slow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>

                {/* Star Icon */}
                <div className="absolute bottom-[30%] right-[20%] md:right-[10%] md:bottom-[15%] text-purple-400/30 animate-float">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 drop-shadow-[0_0_15px_rgba(192,132,252,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
            </div>

            <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl">

                {/* Left Side: Hero Text */}
                <div className="flex-1 text-center md:text-left space-y-6">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                        Discover Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 animate-gradient-x">
                            Campus Vibe
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-lg mx-auto md:mx-0 leading-relaxed">
                        The Loop is the ultimate platform to connect, explore, and experience everything happening around you.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] transform hover:scale-105 transition-all duration-300 w-full sm:w-auto border border-purple-500/20"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => navigate('/events')}
                            className="px-8 py-4 bg-purple-900/20 hover:bg-purple-800/30 border border-purple-500/30 text-purple-100 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 group hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]"
                        >
                            Explore Events
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="hidden md:block flex-1 w-full max-w-md">
                    <div className="bg-[#161b22]/80 backdrop-blur-xl border border-purple-500/20 p-6 md:p-8 rounded-2xl shadow-[0_0_40px_rgba(147,51,234,0.1)] hover:shadow-[0_0_50px_rgba(147,51,234,0.2)] transition-shadow duration-500">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Welcome Back</h2>
                            <p className="text-gray-400 text-sm">Enter your credentials to access your account</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="group">
                                <label className="block text-gray-300 text-sm font-medium mb-2 group-hover:text-purple-300 transition-colors" htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="w-full bg-[#0d1117] border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:border-purple-500/40 focus:shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                                    placeholder="you@college.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="group">
                                <label className="block text-gray-300 text-sm font-medium mb-2 group-hover:text-purple-300 transition-colors" htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="w-full bg-[#0d1117] border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:border-purple-500/40 focus:shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] hover:scale-[1.02]"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-600"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Or continue with</span>
                                <div className="flex-grow border-t border-gray-600"></div>
                            </div>

                            <div className="flex justify-center w-full">
                                <button
                                    type="button"
                                    onClick={() => googleLogin()}
                                    className="w-full bg-white dark:bg-[#161b22] text-gray-700 dark:text-white font-bold py-3 rounded-lg border border-gray-300 dark:border-purple-500/30 hover:bg-gray-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md group"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    <span className="group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">Continue with Google</span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400 text-sm">
                                New here? <button onClick={() => navigate('/signup')} className="text-purple-400 hover:text-purple-300 font-semibold hover:underline hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all">Create an account</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
