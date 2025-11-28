import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeOnboarding = ({ email, username, password, setToken, setIsLoggedIn, setPage, onComplete, firstName: initialFirstName, lastName: initialLastName, isGoogle, token }) => {
    const [step, setStep] = useState('name'); // name, interests, processing, success
    const [firstName, setFirstName] = useState(initialFirstName || '');
    const [lastName, setLastName] = useState(initialLastName || '');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [error, setError] = useState(null);

    const allInterests = ['sports', 'party', 'clubbing', 'movie', 'dancing', 'singing', 'tech', 'art', 'workshop', 'gaming', 'food', 'comedy', 'hackathon'];

    useEffect(() => {
        if (initialFirstName) setFirstName(initialFirstName);
        if (initialLastName) setLastName(initialLastName);
    }, [initialFirstName, initialLastName]);

    const toggleInterest = (interest) => {
        setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (firstName.trim()) {
            setStep('interests');
        }
    };

    const handleFinish = async () => {
        setStep('processing');
        setError(null);

        try {
            let authToken = token;

            if (!isGoogle) {
                // 1. Sign Up
                const signupResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username, password })
                });

                if (!signupResponse.ok) {
                    const errorData = await signupResponse.json();
                    throw new Error(errorData.detail || 'Failed to sign up');
                }

                // 2. Login
                const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ username: email, password })
                });

                if (!loginResponse.ok) {
                    throw new Error('Failed to log in automatically');
                }

                const loginData = await loginResponse.json();
                authToken = loginData.access_token;
                setToken(authToken);
                setIsLoggedIn(true);
            }

            // 3. Update Profile (Name & Interests)
            await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    interests: selectedInterests
                })
            });

            // Navigate to events page in background so it's ready when overlay lifts
            setPage('events');
            setStep('success');

        } catch (err) {
            console.error(err);
            setError(err.message);
            setStep('name');
        }
    };

    // Auto-close after success animation
    useEffect(() => {
        if (step === 'success') {
            const timer = setTimeout(() => {
                onComplete(); // Trigger exit animation in parent or unmount
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [step, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } }} // Smooth slide up reveal
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1117] text-white overflow-hidden"
        >
            {/* Background Ambient Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/40 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/30 rounded-full blur-[120px] animate-pulse" />

            <AnimatePresence mode="wait">
                {step === 'name' && (
                    <motion.div
                        key="step-name"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 w-full max-w-md p-8"
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                            Let's get started.
                        </h2>
                        <p className="text-xl text-gray-400 mb-10">What should we call you?</p>

                        <form onSubmit={handleNameSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-purple-300 uppercase tracking-wider">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-lg"
                                    placeholder="Your Name"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-purple-300 uppercase tracking-wider">Last Name (Optional)</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-lg"
                                    placeholder="Your Surname"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transform transition hover:scale-[1.02] active:scale-[0.98] mt-4"
                            >
                                Continue
                            </button>
                        </form>
                        {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
                    </motion.div>
                )}

                {step === 'interests' && (
                    <motion.div
                        key="step-interests"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 w-full max-w-3xl p-8 text-center"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            Nice to meet you, <span className="text-purple-400">{firstName}</span>.
                        </h2>
                        <p className="text-xl text-gray-400 mb-12">Select your interests to personalize your feed.</p>

                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                            {allInterests.map((interest, index) => {
                                const isSelected = selectedInterests.includes(interest);
                                return (
                                    <motion.button
                                        key={interest}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-6 py-3 rounded-full font-medium text-base transition-all duration-300 ${isSelected
                                            ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] scale-105'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                            }`}
                                    >
                                        {interest}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setStep('name')}
                                className="px-8 py-3 rounded-xl text-gray-400 hover:text-white transition-colors font-medium"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleFinish}
                                disabled={selectedInterests.length === 0}
                                className="bg-white text-purple-900 hover:bg-gray-100 font-bold py-3 px-12 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Finish Setup
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'processing' && (
                    <motion.div
                        key="step-processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
                        <p className="text-xl text-purple-300 font-medium animate-pulse">Creating your profile...</p>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div
                        key="step-success"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="relative z-10 text-center flex flex-col items-center justify-center h-full"
                    >
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                            className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]"
                        >
                            Welcome, {firstName}.
                        </motion.h1>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100px" }}
                            transition={{ delay: 1, duration: 1 }}
                            className="h-1 bg-purple-500 rounded-full mb-8"
                        />
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="text-2xl text-gray-300 font-light"
                        >
                            You are now part of <span className="font-semibold text-purple-400">The Loop</span>.
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default WelcomeOnboarding;
