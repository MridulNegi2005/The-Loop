import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Users, Plus, Mail } from 'lucide-react';

const CarpoolModal = ({ eventId, onClose, currentUser }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [newGroup, setNewGroup] = useState({ location: '', time: '', capacity: 4 });

    useEffect(() => {
        fetchGroups();
    }, [eventId]);

    const fetchGroups = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/carpool`);
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            }
        } catch (error) {
            console.error("Failed to fetch groups", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}/carpool`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newGroup)
            });

            if (response.ok) {
                fetchGroups();
                setView('list');
            } else {
                alert("Failed to create group. Make sure you have joined the event.");
            }
        } catch (error) {
            console.error("Error creating group", error);
        }
    };

    const handleJoinGroup = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/carpool/${groupId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Request sent!");
            } else {
                const data = await response.json();
                alert(data.message || "Failed to join group");
            }
        } catch (error) {
            console.error("Error joining group", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold text-white">Carpool Groups</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {view === 'list' ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => setView('create')}
                                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Create New Group
                            </button>

                            {loading ? (
                                <div className="text-center text-white/50 py-8">Loading groups...</div>
                            ) : groups.length === 0 ? (
                                <div className="text-center text-white/50 py-8">No carpool groups yet. Be the first to create one!</div>
                            ) : (
                                <div className="space-y-3">
                                    {groups.map(group => (
                                        <div key={group.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-white">{group.owner_username}'s Car</h3>
                                                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                                                    {group.capacity} seats
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-sm text-white/70 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-purple-400" />
                                                    <span>{group.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-purple-400" />
                                                    <span>{group.time}</span>
                                                </div>
                                            </div>

                                            {/* Owner View: Show Members */}
                                            {currentUser && currentUser.username === group.owner_username && group.members && group.members.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-white/10">
                                                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Members</h4>
                                                    <div className="space-y-2">
                                                        {group.members.map((member, idx) => (
                                                            <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                                                <span className="text-sm text-white">@{member.username}</span>
                                                                <a href={`mailto:${member.email}`} className="p-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 rounded-full transition-colors" title="Contact Member">
                                                                    <Mail size={14} />
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {currentUser && currentUser.username !== group.owner_username && (
                                                <button
                                                    onClick={() => handleJoinGroup(group.id)}
                                                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Request to Join
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Pickup Location</label>
                                <input
                                    type="text"
                                    required
                                    value={newGroup.location}
                                    onChange={e => setNewGroup({ ...newGroup, location: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. Main Gate"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Departure Time</label>
                                <input
                                    type="text"
                                    required
                                    value={newGroup.time}
                                    onChange={e => setNewGroup({ ...newGroup, time: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. 5:30 PM"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Available Seats</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="10"
                                    value={newGroup.capacity}
                                    onChange={e => setNewGroup({ ...newGroup, capacity: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarpoolModal;
