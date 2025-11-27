import React, { useState } from 'react';

const SignupPage = ({ setPage, setToken, setShowOnboarding, setOnboardingData }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        if (email && username && password) {
            setOnboardingData({ email, username, password });
            setShowOnboarding(true);
        }
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
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-900/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
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
                <div className="bg-[#161b22]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-[0_0_40px_rgba(147,51,234,0.1)] p-8 md:p-10 transform transition-all hover:scale-[1.01] hover:shadow-[0_0_60px_rgba(147,51,234,0.2)]">

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-[-3deg] hover:rotate-[-6deg] transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
                        <p className="text-purple-200/60 mt-2 text-center">Join the community and start exploring</p>
                    </div>

                    <form onSubmit={handleInitialSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-200/80 ml-1" htmlFor="signup-email">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    className="w-full bg-[#0d1117]/50 border border-gray-700/50 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600 hover:bg-[#0d1117]/80"
                                    id="signup-email"
                                    type="email"
                                    placeholder="you@college.edu"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-200/80 ml-1" htmlFor="signup-username">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    className="w-full bg-[#0d1117]/50 border border-gray-700/50 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600 hover:bg-[#0d1117]/80"
                                    id="signup-username"
                                    type="text"
                                    placeholder="cool_student"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-purple-200/80 ml-1" htmlFor="signup-password">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    className="w-full bg-[#0d1117]/50 border border-gray-700/50 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600 hover:bg-[#0d1117]/80"
                                    id="signup-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)] transform hover:scale-[1.02] transition-all duration-300 mt-4"
                            type="submit"
                        >
                            Continue
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setPage('login')}
                                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 transition-all"
                            >
                                Log In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
