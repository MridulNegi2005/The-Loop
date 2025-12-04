import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '../lib/utils';

const AdminPortal = ({ currentUser, mapScriptLoaded }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'manage'
    const [myEvents, setMyEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, eventId: null });

    const allTags = ['sports', 'party', 'clubbing', 'movie', 'dancing', 'singing', 'tech', 'art', 'workshop', 'gaming', 'food', 'comedy', 'hackathon', 'chill', 'productive', 'wild', 'music', 'education', 'career'];

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_at: '',
        end_at: '',
        venue: '',
        lat: 30.3558, // Default to campus center
        lng: 76.3625,
        tags: [] // Changed to array for multi-select
    });

    // Map State
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const googleMapRef = useRef(null);

    // Predefined Locations (Mock for now, could be fetched)
    const predefinedLocations = [
        { name: "Main Auditorium", lat: 30.3558, lng: 76.3625 },
        { name: "The Student Cafe", lat: 30.3532, lng: 76.3651 },
        { name: "Gymnasium Hall", lat: 30.3571, lng: 76.3689 },
        { name: "Computer Lab 3", lat: 30.3545, lng: 76.3660 },
        { name: "Tan Auditorium", lat: 30.3565, lng: 76.3645 },
        { name: "COS", lat: 30.3540, lng: 76.3655 },
        { name: "Fete Area", lat: 30.3580, lng: 76.3695 },
    ];

    useEffect(() => {
        if (!currentUser || !currentUser.is_admin) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (activeTab === 'manage') {
            fetchMyEvents();
            // Reset map refs when leaving add tab
            googleMapRef.current = null;
            markerRef.current = null;
        }
    }, [activeTab]);

    // Initialize Map when 'add' tab is active
    useEffect(() => {
        if (activeTab === 'add' && window.google?.maps && !googleMapRef.current) {
            initMap();
        }
    }, [activeTab, mapScriptLoaded]);

    const initMap = () => {
        if (!mapRef.current) return;

        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: formData.lat, lng: formData.lng },
            zoom: 16,
            disableDefaultUI: true,
            styles: [
                { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
                { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
                { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
                { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
                { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
                { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
                { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
                { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
                { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
                { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
                { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
                { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
                { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
                { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
                { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
            ]
        });

        googleMapRef.current = map;

        const marker = new window.google.maps.Marker({
            position: { lat: formData.lat, lng: formData.lng },
            map: map,
            draggable: true,
            animation: window.google.maps.Animation.DROP
        });

        markerRef.current = marker;

        marker.addListener('dragend', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setFormData(prev => ({ ...prev, lat, lng }));
        });

        map.addListener('click', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.setPosition({ lat, lng });
            setFormData(prev => ({ ...prev, lat, lng }));
        });
    };

    const fetchMyEvents = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/events`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMyEvents(data);
            }
        } catch (e) {
            console.error("Failed to fetch admin events", e);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTag = (tag) => {
        setFormData(prev => {
            const currentTags = prev.tags;
            if (currentTags.includes(tag)) {
                return { ...prev, tags: currentTags.filter(t => t !== tag) };
            } else {
                return { ...prev, tags: [...currentTags, tag] };
            }
        });
    };

    const handleEdit = (event) => {
        setIsEditing(true);
        setEditId(event.id);
        setFormData({
            title: event.title,
            description: event.description,
            start_at: event.start_at,
            end_at: event.end_at,
            venue: event.venue,
            lat: event.lat,
            lng: event.lng,
            tags: event.tags // Assuming API returns list of strings now
        });
        setActiveTab('add');
        // Map update handled by initMap on tab switch
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({
            title: '',
            description: '',
            start_at: '',
            end_at: '',
            venue: '',
            lat: 30.3558,
            lng: 76.3625,
            tags: []
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationSelect = (e) => {
        const selectedName = e.target.value;
        if (selectedName === "custom") {
            setFormData(prev => ({ ...prev, venue: '' }));
            return;
        }

        const loc = predefinedLocations.find(l => l.name === selectedName);
        if (loc) {
            setFormData(prev => ({ ...prev, venue: loc.name, lat: loc.lat, lng: loc.lng }));
            if (markerRef.current) {
                markerRef.current.setPosition({ lat: loc.lat, lng: loc.lng });
                googleMapRef.current.panTo({ lat: loc.lat, lng: loc.lng });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                tags: formData.tags // Already an array
            };

            const url = isEditing
                ? `${import.meta.env.VITE_API_URL}/events/${editId}`
                : `${import.meta.env.VITE_API_URL}/events`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSuccessMsg(isEditing ? "Event updated successfully!" : "Event created successfully!");
                handleCancelEdit(); // Reset form
            } else {
                const data = await response.json();
                setError(data.detail || "Failed to save event");
            }
        } catch (e) {
            setError("Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (eventId) => {
        console.log("handleDelete called for event:", eventId);
        setDeleteConfirmation({ show: true, eventId });
    };

    const confirmDelete = async () => {
        const eventId = deleteConfirmation.eventId;
        if (!eventId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMyEvents(prev => prev.filter(e => e.id !== eventId));
                setDeleteConfirmation({ show: false, eventId: null });
            } else {
                alert("Failed to delete event");
            }
        } catch (e) {
            alert("Connection error");
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ show: false, eventId: null });
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-white pt-24 pb-12 px-4 sm:px-6">
            <div className="container mx-auto max-w-5xl">
                <div className="flex items-center justify-between mb-8">

                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'add' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Add Event
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'manage' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            My Events
                        </button>
                    </div>
                </div>

                {activeTab === 'add' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Form Section */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-purple-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                {isEditing ? 'Edit Event' : 'Create New Event'}
                            </h2>

                            {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>}
                            {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>}

                            {/* Success Modal */}
                            {successMsg && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                                    <div className="bg-[#1e1b4b]/90 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center relative overflow-hidden">
                                        {/* Background Glow */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                                        <p className="text-gray-300 mb-8 text-lg">{successMsg}</p>

                                        <button
                                            onClick={() => setSuccessMsg(null)}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
                                        >
                                            Awesome
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Delete Confirmation Modal */}
                            {deleteConfirmation.show && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                                    <div className="bg-[#1e1b4b]/90 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center relative overflow-hidden">
                                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-2">Delete Event?</h3>
                                        <p className="text-gray-300 mb-8 text-lg">Are you sure you want to delete this event? This action cannot be undone.</p>

                                        <div className="flex gap-4 w-full">
                                            <button
                                                onClick={cancelDelete}
                                                className="flex-1 py-3 bg-white/10 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={confirmDelete}
                                                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-red-500/40 hover:scale-[1.02] transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Event Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        placeholder="e.g. Annual Tech Fest"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
                                        <input
                                            type="datetime-local"
                                            name="start_at"
                                            value={formData.start_at}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
                                        <input
                                            type="datetime-local"
                                            name="end_at"
                                            value={formData.end_at}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                    <select
                                        onChange={handleLocationSelect}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 mb-2"
                                    >
                                        <option value="custom">Select a predefined location...</option>
                                        {predefinedLocations.map(loc => (
                                            <option key={loc.name} value={loc.name}>{loc.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-all"
                                        placeholder="Or type custom location name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows="4"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-all resize-none"
                                        placeholder="Event details..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {allTags.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.tags.includes(tag)
                                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="w-1/3 bg-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/20 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Map Section */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-xl h-[400px] lg:h-auto overflow-hidden flex flex-col">
                            <div className="p-4 bg-black/20 border-b border-white/5">
                                <p className="text-sm text-gray-400">
                                    <span className="text-purple-400 font-bold">Tip:</span> Select a location from the dropdown or click on the map to drop a pin.
                                </p>
                            </div>
                            <div ref={mapRef} className="flex-1 w-full h-full min-h-[300px]"></div>
                        </div>
                    </div>
                )}

                {activeTab === 'manage' && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-semibold mb-6">My Events</h2>
                        {isLoading ? (
                            <div className="text-center py-10 text-gray-500">Loading...</div>
                        ) : myEvents.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">You haven't created any events yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myEvents.map(event => (
                                    <div key={event.id} className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-purple-500/30 transition-all group relative">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                                                title="Edit Event"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                title="Delete Event"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{event.title}</h3>
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {formatDate(event.start_at)}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                            {event.venue}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#1e1b4b]/90 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">Delete Event?</h3>
                        <p className="text-gray-300 mb-8 text-lg">Are you sure you want to delete this event? This action cannot be undone.</p>

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 py-3 bg-white/10 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:shadow-red-500/40 hover:scale-[1.02] transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPortal;
