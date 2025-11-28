import React, { useState, useEffect } from 'react';
import { Tag } from '../lib/utils';
import { Check, X, Clock, MapPin } from 'lucide-react';

import MobileProfileView from './MobileProfileView';

export default function ProfilePage({ setIsLoggedIn, setPage }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        interests: []
    });
    const [activeTab, setActiveTab] = useState('profile');
    const [requestsReceived, setRequestsReceived] = useState([]);
    const [requestsSent, setRequestsSent] = useState([]);
    const allInterests = ['sports', 'party', 'clubbing', 'movie', 'dancing', 'singing', 'tech', 'art', 'workshop', 'gaming', 'food', 'comedy', 'hackathon'];

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                setPage('login');
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    // Token invalid or expired (or user deleted)
                    setIsLoggedIn(false);
                    localStorage.removeItem('token');
                    setPage('login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setUser(data);
                setFormData({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    interests: data.interests ? data.interests.split(',').filter(i => i) : []
                });
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [setIsLoggedIn, setPage]);

    useEffect(() => {
        if (activeTab === 'carpool') {
            fetchRequests();
        }
    }, [activeTab]);

    const fetchRequests = async () => {
        const token = localStorage.getItem('token');
        try {
            const [resReceived, resSent] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/carpool/requests/received`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/carpool/requests/sent`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (resReceived.ok) setRequestsReceived(await resReceived.json());
            if (resSent.ok) setRequestsSent(await resSent.json());
        } catch (e) {
            console.error("Failed to fetch requests", e);
        }
    };

    const handleRequestAction = async (requestId, action) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/carpool/requests/${requestId}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchRequests(); // Refresh
            }
        } catch (e) {
            console.error(`Failed to ${action} request`, e);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('token'); // Ensure token is removed
        setPage('events');
    };

    const toggleInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const saveProfile = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert('Failed to save profile.');
        }
    };

    const handleDeleteProfile = async () => {
        if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete profile');
                }

                handleLogout();
            } catch (error) {
                console.error(error);
                alert('Failed to delete profile.');
            }
        }
    };

    if (isLoading) {
        return <div className="text-center py-10 text-gray-500">Loading profile...</div>;
    }

    if (!user) {
        return <div className="text-center py-10 text-gray-500">Could not load profile.</div>;
    }

    const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`;

    return (
        <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileProfileView
                    user={user}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    formData={formData}
                    setFormData={setFormData}
                    saveProfile={saveProfile}
                    toggleInterest={toggleInterest}
                    allInterests={allInterests}
                    handleLogout={handleLogout}
                    handleDeleteProfile={handleDeleteProfile}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    requestsReceived={requestsReceived}
                    requestsSent={requestsSent}
                    handleRequestAction={handleRequestAction}
                />
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex max-w-6xl mx-auto flex-col md:flex-row gap-8">

                {/* Main Content Area - Switched based on activeTab */}
                {activeTab === 'profile' ? (
                    <div className="flex-grow bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)] p-6 sm:p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                            <div className="flex-shrink-0 relative">
                                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50 rounded-full"></div>
                                <img
                                    src={avatarUrl}
                                    alt={`${user.username}'s avatar`}
                                    className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-lg relative z-10"
                                />
                            </div>
                            <div className="flex-grow text-center md:text-left w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">@{user.username}</h1>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                                    </div>
                                    {!isEditing && (
                                        <button onClick={() => setIsEditing(true)} className="text-purple-600 hover:text-purple-500 font-medium text-sm border border-purple-600 hover:border-purple-500 px-4 py-2 rounded-lg transition-colors shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="space-y-4 mt-4 bg-gray-50/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.first_name}
                                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none backdrop-blur-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.last_name}
                                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none backdrop-blur-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interests</label>
                                            <div className="flex flex-wrap gap-2">
                                                {allInterests.map(interest => {
                                                    const isSelected = formData.interests.includes(interest);
                                                    return (
                                                        <button
                                                            key={interest}
                                                            onClick={() => toggleInterest(interest)}
                                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${isSelected ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-gray-200/80 dark:bg-slate-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
                                                        >
                                                            {interest}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-6">
                                            <button
                                                onClick={handleDeleteProfile}
                                                className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors"
                                            >
                                                Delete Account
                                            </button>
                                            <div className="flex gap-3">
                                                <button onClick={() => { setIsEditing(false); setFormData({ first_name: user.first_name || '', last_name: user.last_name || '', interests: user.interests ? user.interests.split(',').filter(i => i) : [] }); }} className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
                                                <button onClick={saveProfile} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]">Save Changes</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            <div className="bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700/50 transition-all duration-300 ease-in-out">
                                                <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">First Name</h3>
                                                <p className="text-lg text-gray-900 dark:text-white font-medium">{user.first_name || <span className="text-gray-400 italic">Not set</span>}</p>
                                            </div>
                                            <div className="bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700/50 transition-all duration-300 ease-in-out">
                                                <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">Last Name</h3>
                                                <p className="text-lg text-gray-900 dark:text-white font-medium">{user.last_name || <span className="text-gray-400 italic">Not set</span>}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Interests</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {user.interests && user.interests.length > 0 ? (
                                                    user.interests.split(',').map(tag => <Tag key={tag} text={tag} />)
                                                ) : (
                                                    <span className="text-gray-500 italic">No interests selected.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'carpool' ? (
                    <div className="flex-grow bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)] p-6 sm:p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Carpool Requests</h2>

                        <div className="space-y-8">
                            {/* Received Requests */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Requests Received</h3>
                                {requestsReceived.length === 0 ? (
                                    <p className="text-gray-500 italic">No pending requests.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {requestsReceived.map(req => (
                                            <div key={req.id} className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        <span className="text-purple-600 dark:text-purple-400">@{req.requester_username}</span> wants to join your carpool
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Event: {req.event_title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-full ${req.status === 'accepted' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {req.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                {req.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleRequestAction(req.id, 'accept')} className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                                                            <Check size={18} />
                                                        </button>
                                                        <button onClick={() => handleRequestAction(req.id, 'reject')} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sent Requests */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Requests Sent</h3>
                                {requestsSent.length === 0 ? (
                                    <p className="text-gray-500 italic">You haven't sent any requests.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {requestsSent.map(req => (
                                            <div key={req.id} className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            Request to join carpool at <span className="text-purple-600 dark:text-purple-400">{req.group_location}</span>
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Event: {req.event_title}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${req.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : req.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)] p-6 sm:p-8 md:p-12 flex items-center justify-center">
                        <p className="text-gray-500">Friends feature coming soon!</p>
                    </div>
                )}

                {/* Right Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)] sticky top-24">
                        <div className="p-4 border-b border-gray-200 dark:border-purple-500/20 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-gray-900 dark:text-white">Menu</h3>
                        </div>
                        <nav className="flex flex-col p-2 space-y-2">
                            <button onClick={() => setActiveTab('profile')} data-tab="profile" className={`flex items-center gap-3 px-4 py-3 text-left rounded-lg font-medium border transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 ${activeTab === 'profile' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-500/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border-transparent'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Profile
                            </button>
                            <button onClick={() => setActiveTab('carpool')} data-tab="carpool" className={`flex items-center gap-3 px-4 py-3 text-left rounded-lg font-medium border transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 ${activeTab === 'carpool' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-500/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border-transparent'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Car Pooling
                            </button>
                            <button onClick={() => setActiveTab('friends')} data-tab="friends" className={`flex items-center gap-3 px-4 py-3 text-left rounded-lg font-medium border transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 ${activeTab === 'friends' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-500/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 border-transparent'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Friends
                            </button>
                            <div className="my-2 border-t border-gray-200 dark:border-gray-700 mx-2"></div>
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-transparent transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-red-600/10 dark:hover:border-red-500 hover:-translate-y-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6 0H9" /></svg>
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </main>
    );
}
