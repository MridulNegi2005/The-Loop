import React, { useState, useEffect, useRef } from 'react';
import { Tag } from '../lib/utils';
import { Check, X, Clock, MapPin, UserPlus, MessageCircle, Search, Send, Minimize2 } from 'lucide-react';

import MobileProfileView from './MobileProfileView';

export default function ProfilePage({ setIsLoggedIn, setPage, initialTab = 'profile' }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        interests: []
    });
    const [activeTab, setActiveTab] = useState(initialTab);
    const [requestsReceived, setRequestsReceived] = useState([]);
    const [requestsSent, setRequestsSent] = useState([]);

    // Friends System State
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]); // Received
    const [sentFriendRequests, setSentFriendRequests] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Chat System State
    const [activeChatFriend, setActiveChatFriend] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);

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
        } else if (activeTab === 'friends') {
            fetchFriendsData();
            // Auto-refresh every 5 seconds
            const intervalId = setInterval(fetchFriendsData, 5000);
            return () => clearInterval(intervalId);
        }
    }, [activeTab]);

    // Chat WebSocket & History
    useEffect(() => {
        if (activeChatFriend && user) {
            // Fetch history
            fetchChatHistory(activeChatFriend.id);

            // Connect WS
            const token = localStorage.getItem('token');
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'; // Fallback
            const socket = new WebSocket(`${wsUrl}/ws/chat/${user.id}?token=${token}`);

            socket.onopen = () => {
                console.log("Connected to Chat WS");
            };

            socket.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                // Only add if it belongs to this conversation
                if ((msg.sender_id === activeChatFriend.id && msg.receiver_id === user.id) ||
                    (msg.sender_id === user.id && msg.receiver_id === activeChatFriend.id)) {
                    setChatMessages(prev => {
                        // Avoid duplicates if we already added it optimistically (though we aren't doing that yet)
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                }
            };

            socket.onclose = () => {
                console.log("Disconnected from Chat WS");
            };

            setWs(socket);

            return () => {
                socket.close();
            };
        }
    }, [activeChatFriend, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages, activeChatFriend]);

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

    // --- Friends System Functions ---

    const fetchFriendsData = async () => {
        const token = localStorage.getItem('token');
        try {
            const [resFriends, resRec, resSent] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/friends`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/friends/requests/received`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/friends/requests/sent`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (resFriends.ok) setFriends(await resFriends.json());
            if (resRec.ok) setFriendRequests(await resRec.json());
            if (resSent.ok) setSentFriendRequests(await resSent.json());
        } catch (e) {
            console.error("Failed to fetch friends data", e);
        }
    };

    const searchUsers = async (query) => {
        if (!query) {
            setUserSearchResults([]);
            return;
        }
        setIsSearching(true);
        const token = localStorage.getItem('token');
        // Strip @ if present and trim whitespace
        const trimmed = query.trim();
        const cleanQuery = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;

        try {
            console.log(`Searching for: ${cleanQuery} at ${import.meta.env.VITE_API_URL}/users/search`);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/search?query=${cleanQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("Search response status:", response.status);

            if (response.status === 401) {
                handleLogout(); // Token expired/invalid
                return;
            }

            if (response.ok) {
                const data = await response.json();
                console.log("Search results:", data);
                setUserSearchResults(data);
            } else {
                console.error("Search failed:", response.status);
            }
        } catch (e) {
            console.error("Failed to search users", e);
        } finally {
            setIsSearching(false);
        }
    };

    const sendFriendRequest = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/friends/request/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Friend request sent!");
                fetchFriendsData();
                setUserSearchResults([]); // Clear search
                setUserSearchQuery('');
            } else {
                const data = await response.json();
                alert(data.message || "Failed to send request");
            }
        } catch (e) {
            console.error("Failed to send friend request", e);
        }
    };

    const respondToFriendRequest = async (requestId, action) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/friends/respond/${requestId}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchFriendsData();
            }
        } catch (e) {
            console.error(`Failed to ${action} friend request`, e);
        }
    };

    // --- Chat Functions ---

    const fetchChatHistory = async (friendId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/history/${friendId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setChatMessages(await response.json());
            }
        } catch (e) {
            console.error("Failed to fetch chat history", e);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

        const message = {
            receiver_id: activeChatFriend.id,
            content: chatInput
        };

        ws.send(JSON.stringify(message));
        setChatInput('');
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
                    // Friends Props
                    friends={friends}
                    friendRequests={friendRequests}
                    sentFriendRequests={sentFriendRequests}
                    userSearchQuery={userSearchQuery}
                    setUserSearchQuery={setUserSearchQuery}
                    userSearchResults={userSearchResults}
                    searchUsers={searchUsers}
                    sendFriendRequest={sendFriendRequest}
                    respondToFriendRequest={respondToFriendRequest}
                    setActiveChatFriend={setActiveChatFriend}
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
                    <div className="flex-grow bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)] p-6 sm:p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Friends</h2>

                        <div className="space-y-8">
                            {/* Add Friend Section */}
                            <div className="bg-purple-50/50 dark:bg-purple-900/10 p-6 rounded-xl border border-purple-100 dark:border-purple-500/20">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                    <UserPlus size={20} className="text-purple-600" />
                                    Add Friend
                                </h3>
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Search by username..."
                                            value={userSearchQuery}
                                            onChange={(e) => {
                                                setUserSearchQuery(e.target.value);
                                                searchUsers(e.target.value);
                                            }}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                        {isSearching && (
                                            <div className="absolute right-3 top-2.5">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {userSearchQuery && !isSearching && userSearchResults.length === 0 && (
                                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic px-1">
                                        No users found.
                                    </div>
                                )}
                                {userSearchResults.length > 0 && (
                                    <div className="mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                                        {userSearchResults.map(u => (
                                            <div key={u.id} className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 last:border-0">
                                                <span className="font-medium text-gray-900 dark:text-white">@{u.username}</span>
                                                <button
                                                    onClick={() => sendFriendRequest(u.id)}
                                                    className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full hover:bg-purple-700 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Friend Requests */}
                            {(friendRequests.length > 0 || sentFriendRequests.length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {friendRequests.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Received Requests</h3>
                                            <div className="space-y-3">
                                                {friendRequests.map(req => (
                                                    <div key={req.id} className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                                        <span className="font-medium text-gray-900 dark:text-white">@{req.requester_username}</span>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => respondToFriendRequest(req.id, 'accept')} className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200"><Check size={16} /></button>
                                                            <button onClick={() => respondToFriendRequest(req.id, 'reject')} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><X size={16} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {sentFriendRequests.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Sent Requests</h3>
                                            <div className="space-y-3">
                                                {sentFriendRequests.map(req => (
                                                    <div key={req.id} className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                                        <span className="font-medium text-gray-900 dark:text-white">@{req.receiver_username}</span>
                                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Friends List */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Friends ({friends.length})</h3>
                                {friends.length === 0 ? (
                                    <p className="text-gray-500 italic">You haven't added any friends yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {friends.map(friend => (
                                            <div key={friend.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xl">
                                                    {friend.username[0].toUpperCase()}
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-gray-900 dark:text-white">@{friend.username}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{friend.first_name} {friend.last_name}</p>
                                                </div>
                                                <button
                                                    onClick={() => setActiveChatFriend(friend)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors"
                                                    title="Message"
                                                >
                                                    <MessageCircle size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
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

            {/* Chat Modal / Floating Window */}
            {activeChatFriend && (
                <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-t-xl rounded-b-lg shadow-2xl border border-purple-200 dark:border-purple-900 flex flex-col z-50 overflow-hidden ring-1 ring-black/5">
                    {/* Header */}
                    <div className="bg-purple-600 p-3 flex justify-between items-center text-white shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                                {activeChatFriend.username[0].toUpperCase()}
                            </div>
                            <span className="font-bold">@{activeChatFriend.username}</span>
                        </div>
                        <button onClick={() => setActiveChatFriend(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <Minimize2 size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-950 space-y-3">
                        {chatMessages.map((msg, idx) => {
                            const isMe = msg.sender_id === user.id;
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${isMe
                                        ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'
                                        }`}>
                                        <p>{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'} text-right`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow px-4 py-2 rounded-full bg-gray-100 dark:bg-slate-800 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-0 text-sm transition-all outline-none dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={!chatInput.trim()}
                            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </main>
    );
}
