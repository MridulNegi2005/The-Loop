import React from 'react';
import { Tag } from '../lib/utils';
import { Check, X } from 'lucide-react';

export default function MobileProfileView({
    user,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    saveProfile,
    toggleInterest,
    allInterests,
    handleLogout,
    handleDeleteProfile,
    activeTab,
    setActiveTab,
    requestsReceived,
    requestsSent,
    handleRequestAction
}) {
    const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`;

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Mobile Menu - Top Horizontal */}
            <div className="overflow-x-auto no-scrollbar -mx-4 px-4 py-2">
                <nav className="flex items-center gap-3 min-w-max">
                    <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap border ${activeTab === 'profile' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.15)]' : 'text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Profile
                    </button>
                    <button onClick={() => setActiveTab('carpool')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap border ${activeTab === 'carpool' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.15)]' : 'text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Car Pooling
                    </button>
                    <button onClick={() => setActiveTab('friends')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap border ${activeTab === 'friends' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.15)]' : 'text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Friends
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full whitespace-nowrap active:bg-red-50 dark:active:bg-red-900/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6 0H9" /></svg>
                        Logout
                    </button>
                </nav>
            </div>

            {/* Header / Avatar Section */}
            <div className="flex flex-col items-center text-center mt-2 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500/30 blur-2xl rounded-full -z-10"></div>
                <img
                    src={avatarUrl}
                    alt={`${user.username}'s avatar`}
                    className="w-28 h-28 rounded-full border-4 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] mb-4 relative z-10"
                />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">@{user.username}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{user.email}</p>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 text-purple-600 hover:text-purple-500 font-medium text-sm border border-purple-600 hover:border-purple-500 px-6 py-2 rounded-full transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-purple-500/30 rounded-xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                {activeTab === 'profile' ? (
                    isEditing ? (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none backdrop-blur-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none backdrop-blur-sm"
                                />
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
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isSelected ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-gray-100/80 dark:bg-slate-700/80 text-gray-700 dark:text-gray-300'}`}
                                            >
                                                {interest}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            first_name: user.first_name || '',
                                            last_name: user.last_name || '',
                                            interests: user.interests ? user.interests.split(',').filter(i => i) : []
                                        });
                                    }}
                                    className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium bg-gray-100/80 dark:bg-slate-800/80 rounded-lg backdrop-blur-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveProfile}
                                    className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all"
                                >
                                    Save
                                </button>
                            </div>
                            <button
                                onClick={handleDeleteProfile}
                                className="w-full py-3 mt-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30"
                            >
                                Delete Account
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                    <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">First Name</h3>
                                    <p className="text-base text-gray-900 dark:text-white font-medium truncate">{user.first_name || <span className="text-gray-400 italic text-sm">Not set</span>}</p>
                                </div>
                                <div className="bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                    <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">Last Name</h3>
                                    <p className="text-base text-gray-900 dark:text-white font-medium truncate">{user.last_name || <span className="text-gray-400 italic text-sm">Not set</span>}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-3">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.interests && user.interests.length > 0 ? (
                                        user.interests.split(',').map(tag => <Tag key={tag} text={tag} />)
                                    ) : (
                                        <span className="text-gray-500 italic text-sm">No interests selected.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                ) : activeTab === 'carpool' ? (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Carpool Requests</h2>

                        {/* Received Requests */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Requests Received</h3>
                            {requestsReceived.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">No pending requests.</p>
                            ) : (
                                <div className="space-y-3">
                                    {requestsReceived.map(req => (
                                        <div key={req.id} className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                    <span className="text-purple-600 dark:text-purple-400">@{req.requester_username}</span>
                                                </p>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${req.status === 'accepted' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                Event: {req.event_title}
                                            </p>
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRequestAction(req.id, 'accept')} className="flex-1 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex justify-center items-center">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => handleRequestAction(req.id, 'reject')} className="flex-1 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex justify-center items-center">
                                                        <X size={16} />
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
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Requests Sent</h3>
                            {requestsSent.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">You haven't sent any requests.</p>
                            ) : (
                                <div className="space-y-3">
                                    {requestsSent.map(req => (
                                        <div key={req.id} className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                        To: <span className="text-purple-600 dark:text-purple-400">{req.group_location}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Event: {req.event_title}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${req.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : req.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-10">
                        <p className="text-gray-500">Friends feature coming soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
