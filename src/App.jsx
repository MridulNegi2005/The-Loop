// --- APP VERSION ---
const APP_VERSION = '2';
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import Header from './components/Header';
import EventCard from './components/EventCard';
import CarpoolModal from './components/CarpoolModal';
import EventList from './components/EventList';
import MapView from './components/MapView';
import ProfilePage from './components/ProfilePage';
import WelcomeOnboarding from './components/WelcomeOnboarding';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ChatWidget from './components/ChatWidget';
import { useChatSystem } from './hooks/useChatSystem';
import { formatDate, formatTime, addToCalendar, Tag } from './lib/utils';

// --- MOCK DATA ---
const mockEvents = [
    { id: "evt_123", title: "Annual Tech Fest Kick-off", description: "Join us for the opening ceremony...", start_at: "2025-09-01T18:00:00Z", end_at: "2025-09-01T20:00:00Z", venue: "Main Auditorium", tags: ["productive", "tech", "fest"], lat: 30.3558, lng: 76.3625 },
    { id: "evt_124", title: "Acoustic Night at the Cafe", description: "Unwind with some live music...", start_at: "2025-09-03T19:30:00Z", end_at: "2025-09-03T21:00:00Z", venue: "The Student Cafe", tags: ["chill", "music", "art"], lat: 30.3532, lng: 76.3651 },
    { id: "evt_125", title: "Late Night Dance Party", description: "DJ Ron is back...", start_at: "2025-09-05T22:00:00Z", end_at: "2025-09-06T02:00:00Z", venue: "Gymnasium Hall", tags: ["wild", "dance", "late-night"], lat: 30.3571, lng: 76.3689 },
    { id: "evt_126", title: "Python Workshop", description: "Learn the basics of Pandas...", start_at: "2025-09-06T14:00:00Z", end_at: "2025-09-06T16:00:00Z", venue: "Computer Lab 3", tags: ["productive", "workshop", "tech"], lat: 30.3545, lng: 76.3660 },
    { id: "evt_127", title: "Freshers' Welcome Bash", description: "The official welcome party...", start_at: "2025-09-08T21:00:00Z", end_at: "2025-09-09T01:00:00Z", venue: "Main Auditorium", tags: ["wild", "dance", "late-night"], lat: 30.3558, lng: 76.3625 },
    { id: "evt_128", title: "Guest Lecture: The Future of AI", description: "A talk by a leading researcher...", start_at: "2025-09-15T15:00:00Z", end_at: "2025-09-15T16:30:00Z", venue: "Main Auditorium", tags: ["productive", "tech"], lat: 30.3558, lng: 76.3625 },
    { id: "evt_129", title: "Movie Marathon: Christopher Nolan", description: "A back-to-back screening...", start_at: "2025-09-20T18:00:00Z", end_at: "2025-09-20T23:00:00Z", venue: "Main Auditorium", tags: ["chill", "movie"], lat: 30.3558, lng: 76.3625 },
    { id: "evt_130", title: "Open Mic Night", description: "Showcase your talent...", start_at: "2025-09-12T19:00:00Z", end_at: "2025-09-12T21:00:00Z", venue: "Tan Auditorium", tags: ["chill", "art", "music"], lat: 30.3565, lng: 76.3645 },
    { id: "evt_131", title: "Debate Championship Finals", description: "Watch the best debaters...", start_at: "2025-09-19T16:00:00Z", end_at: "2025-09-19T18:00:00Z", venue: "Tan Auditorium", tags: ["productive"], lat: 30.3565, lng: 76.3645 },
    { id: "evt_132", title: "Robotics Workshop", description: "A hands-on workshop...", start_at: "2025-09-13T10:00:00Z", end_at: "2025-09-13T13:00:00Z", venue: "COS", tags: ["productive", "tech", "workshop"], lat: 30.3540, lng: 76.3655 },
    { id: "evt_133", title: "Science Exhibition", description: "Explore innovative projects...", start_at: "2025-09-22T11:00:00Z", end_at: "2025-09-22T17:00:00Z", venue: "COS", tags: ["productive", "tech", "art"], lat: 30.3540, lng: 76.3655 },
    { id: "evt_134", title: "Food Carnival", description: "A paradise for foodies!", start_at: "2025-09-14T12:00:00Z", end_at: "2025-09-14T22:00:00Z", venue: "Fete Area", tags: ["chill", "wild"], lat: 30.3580, lng: 76.3695 },
    { id: "evt_135", title: "Street Play Festival", description: "Experience powerful performances...", start_at: "2025-09-21T17:00:00Z", end_at: "2025-09-21T20:00:00Z", venue: "Fete Area", tags: ["art", "chill"], lat: 30.3580, lng: 76.3695 },
    { id: "evt_136", title: "Kite Flying Competition", description: "Let your kites soar high...", start_at: "2025-09-28T14:00:00Z", end_at: "2025-09-28T17:00:00Z", venue: "Fete Area", tags: ["chill", "wild"], lat: 30.3580, lng: 76.3695 },
];

// --- MAP CUSTOMIZATION & STYLES ---
const lightMapStyles = [{ "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }];
const darkMapStyles = [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }];

const getMapOptions = (theme) => ({
    styles: theme === 'dark' ? darkMapStyles : lightMapStyles,
    disableDefaultUI: true,
    zoomControl: true,
    minZoom: 6,
    maxZoom: 18,
    restriction: {
        latLngBounds: { north: 30.38, south: 30.33, west: 76.34, east: 76.39 },
        strictBounds: false,
    },
});

// Helpers moved to `src/lib/utils.js`

// --- COMPONENTS (Defined outside of App for performance) ---

// SplineScene removed



// MapView moved to `src/components/MapView.jsx`

// SingleEventMap left in-place but MapView handles detailed map interactions


// Header moved to `src/components/Header.jsx` (imported at top)

// EventCard moved to `src/components/EventCard.jsx` (imported at top)

// VenueScroller removed — not required in App.jsx; use components where needed

// EventList moved to `src/components/EventList.jsx` (imported at top)


const EventDetailsPage = ({ event, mapScriptLoaded, theme, currentUser, fetchEvents }) => {
    const navigate = useNavigate();
    // Share logic
    const shareUrl = window.location.origin + `/events/${event.id}`;
    const shareText = `${event.title} at ${event.venue} on ${formatDate(event.start_at, { weekday: 'long', month: 'long', day: 'numeric' })}`;
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (e) { }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            } catch (e) {
                window.prompt('Copy this link:', shareUrl);
            }
        }
    };
    // Remind Me logic (toggle state)
    const [reminded, setReminded] = React.useState(false);
    const handleRemindMe = () => {
        setReminded(r => !r);
        // Here you could add notification/cookie logic
    };

    // Join/Interested Logic
    const [isJoined, setIsJoined] = React.useState(event.is_joined);
    const [isJoining, setIsJoining] = React.useState(false);
    const [showCarpool, setShowCarpool] = React.useState(false);

    const handleJoin = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to join events.");
            navigate('/login');
            return;
        }
        setIsJoining(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${event.id}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setIsJoined(true);
                // Update global events state to reflect the join status
                fetchEvents();
            } else {
                const data = await response.json();
                alert(data.detail || "Failed to join event.");
            }
        } catch (e) {
            console.error("Join failed", e);
            alert("Could not connect to server.");
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-purple-800/50 rounded-xl overflow-hidden shadow-lg">
                <div className="p-6 sm:p-8 md:p-12">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-purple-600 dark:text-purple-300 focus:outline-none" aria-label="Back">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="uppercase tracking-wide text-sm text-purple-600 dark:text-purple-400 font-bold">{event.venue}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-2">{event.title}</h1>
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span>{formatDate(event.start_at, { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                        <div className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{formatTime(event.start_at)} - {formatTime(event.end_at)}</span></div>
                    </div>
                    <p className="mt-8 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
                    <div className="mt-8">{event.tags.map(tag => <Tag key={tag} text={tag} />)}</div>
                    <div className="mt-10 pt-8 border-t border-gray-200 dark:border-purple-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Location</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{event.venue}</p>
                            {mapScriptLoaded ? (
                                <MapView
                                    events={React.useMemo(() => [event], [event])}
                                    setSelectedEvent={React.useCallback(() => { }, [])}
                                    theme={theme}
                                />
                            ) : (
                                <div className="mt-4 w-full h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">Loading map...</p>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-8 md:mt-0 items-center">
                            <div className="border-b border-gray-200 dark:border-purple-700/50 pb-2 mb-2 w-full text-center">
                                <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">Event Actions</span>
                            </div>

                            {isJoined && (
                                <button
                                    onClick={() => setShowCarpool(true)}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 w-full mb-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Carpool
                                </button>
                            )}
                            {showCarpool && (
                                <CarpoolModal
                                    eventId={event.id}
                                    onClose={() => setShowCarpool(false)}
                                    currentUser={currentUser}
                                />
                            )}

                            <button
                                onClick={handleJoin}
                                disabled={isJoined || isJoining}
                                className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-colors duration-300 w-full ${isJoined ? 'bg-green-600 text-white cursor-default' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                            >
                                {isJoining ? (
                                    <span>Joining...</span>
                                ) : isJoined ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Interested (Joined)</span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        <span>Interested</span>
                                    </>
                                )}
                            </button>

                            <button onClick={() => addToCalendar(event)} className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors duration-300 w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Add to Calendar</button>
                            <button onClick={handleRemindMe} className={`flex items-center justify-center gap-2 ${reminded ? 'bg-purple-800' : 'bg-gray-200 dark:bg-slate-700'} ${reminded ? 'text-white' : 'text-gray-800 dark:text-white'} font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-colors duration-300 w-full`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {reminded ? 'Remind Me (Set!)' : 'Remind Me'}
                            </button>
                            <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors duration-300 w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zm-6 8a6 6 0 1112 0H9z" /></svg>Share</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};


const InterestSelectorPage = ({ setPage, setIsLoggedIn }) => {
    const allInterests = ['sports', 'party', 'clubbing', 'movie', 'dancing', 'singing', 'tech', 'art', 'workshop', 'gaming', 'food', 'comedy', 'hackathon'];
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const toggleInterest = (interest) => {
        setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
    };

    const handleFinish = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            if (token) {
                await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ interests: selectedInterests })
                });
            }
            setIsLoggedIn(true);
            setPage('events');
        } catch (e) {
            console.error("Failed to save interests", e);
            // Proceed anyway
            setIsLoggedIn(true);
            setPage('events');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-12 flex justify-center">
            <div className="w-full max-w-2xl">
                <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-purple-800/50 rounded-xl shadow-md p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">What are you into?</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Select a few interests to help us personalize your event feed.</p>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
                        {allInterests.map(interest => {
                            const isSelected = selectedInterests.includes(interest);
                            return (
                                <button key={interest} onClick={() => toggleInterest(interest)} className={`capitalize font-bold py-2 px-4 sm:py-3 sm:px-5 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${isSelected ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}>{interest}</button>
                            );
                        })}
                    </div>
                    <div className="flex justify-center">
                        <button onClick={handleFinish} disabled={selectedInterests.length < 1 || isLoading} className="w-full sm:w-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Saving...' : 'Finish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventsContainer = ({ events, setSelectedEvent, isLoading, error, setViewMode, viewMode, mapScriptLoaded, theme, currentUser }) => (
    <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {isLoading && <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading events from the server...</div>}
        {error && <div className="text-center mb-4 py-4 text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg">{error}</div>}
        {!isLoading && (
            <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Upcoming Events</h1>
                    <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-purple-700/50">
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white' : 'bg-transparent text-gray-600 dark:text-gray-400'}`}>List View</button>
                        <button onClick={() => setViewMode('map')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white' : 'bg-transparent text-gray-600 dark:text-gray-400'}`}>Map View</button>
                    </div>
                </div>
                {viewMode === 'list' && <EventList events={events} setSelectedEvent={setSelectedEvent} currentUser={currentUser} />}
                {viewMode === 'map' && (
                    mapScriptLoaded
                        ? <MapView events={events} setSelectedEvent={setSelectedEvent} theme={theme} />
                        : <div className="text-center py-10">Loading Map...</div>
                )}
            </>
        )}
    </main>
);

// LandingPage moved to src/components/LandingPage.jsx



export default function App() {
    const [events, setEvents] = useState([]);
    // Persist login state using localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const [viewMode, setViewMode] = useState('list');
    const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [showSplash, setShowSplash] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingData, setOnboardingData] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = window.innerWidth < 768; // Simple check, could be state if needed

    // Initialize Chat System
    const chatSystem = useChatSystem(currentUser, isLoggedIn);

    // Show splash animation only when starting from root in installed PWA
    React.useEffect(() => {
        if ((window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) && location.pathname === '/') {
            setShowSplash(true);
            setTimeout(() => {
                navigate('/events');
                setShowSplash(false);
            }, 1200); // 1.2s splash
        }
    }, [navigate, location.pathname]);

    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    // Keep login state in sync with localStorage
    React.useEffect(() => {
        localStorage.setItem('isLoggedIn', isLoggedIn);
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [isLoggedIn, token]);

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const fetchEvents = React.useCallback(async () => {
        try {
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
                headers: headers
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log("Events fetched:", data.length);
            setEvents(data);
        } catch (e) {
            console.error("Failed to fetch events:", e);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const fetchUser = React.useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data);
            } else if (response.status === 401) {
                console.warn("User token invalid, logging out.");
                setToken('');
                setIsLoggedIn(false);
                localStorage.removeItem('token');
                localStorage.setItem('isLoggedIn', 'false');
            }
        } catch (e) {
            console.error("Failed to fetch user", e);
        }
    }, [token]);

    React.useEffect(() => {
        fetchEvents();
        fetchUser();
    }, [fetchEvents, fetchUser]);

    // Load Google Maps script when needed
    React.useEffect(() => {
        const isMapPage = location.pathname.startsWith('/events') && (viewMode === 'map' || location.pathname.startsWith('/events/'));
        // Check if maps is missing (even if window.google exists from Auth)
        if (isMapPage && (!window.google || !window.google.maps)) {
            if (!document.getElementById('google-maps-script')) {
                const script = document.createElement('script');
                script.id = 'google-maps-script';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
                script.async = true;
                script.defer = true;
                script.onload = () => setMapScriptLoaded(true);
                document.head.appendChild(script);
            }
        } else if (window.google?.maps && !mapScriptLoaded) {
            setMapScriptLoaded(true);
        }
    }, [viewMode, location.pathname]);

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#0d1117] text-gray-100'}`}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .page-transition { animation: fadeIn 0.4s ease-in-out; }
                .gm-style-iw-d { overflow: hidden !important; }
                .gm-style .gm-style-iw-c { padding: 0 !important; border-radius: 0.75rem !important; box-shadow: none !important; background-color: transparent !important; }
                /* Hide Google Maps InfoWindow arrow only */
                .gm-style .gm-style-iw-t::after { display: none !important; }
                .gm-style .gm-style-iw-t::before { display: none !important; }
                /* Hide Google Maps' default close button */
                .gm-style-iw button[title="Close"] { display: none !important; }
                .gm-style-iw .gm-ui-hover-effect { display: none !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .animate-fadeIn { animation: fadeIn 0.7s; }
                /* Mobile timeline tweaks */
                .mobile-timeline { position: relative; }
                .mobile-timeline .mobile-line { position: absolute; left: 1rem; right: 1rem; top: 50%; transform: translateY(-50%); height: 4px; border-radius: 9999px; background: linear-gradient(90deg, rgba(167,139,250,0.15), rgba(99,102,241,0.3)); pointer-events: none; }
                .mobile-timeline .mobile-dot { display: inline-flex; align-items: center; justify-content: center; border-radius: 9999px; font-weight: 700; }
                .mobile-timeline { -webkit-overflow-scrolling: touch; touch-action: pan-x; overscroll-behavior: contain; }
                /* Responsive sizing for dots */
                @media (max-width: 420px) {
                    .mobile-timeline .mobile-dot { width: 64px; height: 36px; font-size: 12px; }
                    .mobile-timeline { gap: 0.75rem; padding-left: 0.75rem; padding-right: 0.75rem; }
                }
                @media (min-width: 421px) and (max-width: 767px) {
                    .mobile-timeline .mobile-dot { width: 78px; height: 42px; font-size: 14px; }
                    .mobile-timeline { gap: 1.25rem; padding-left: 1rem; padding-right: 1rem; }
                }
                @media (min-width: 768px) {
                    .mobile-timeline .mobile-dot { width: auto; height: auto; }
                }
            `}</style>

            {showOnboarding && (
                <WelcomeOnboarding
                    {...onboardingData}
                    setToken={setToken}
                    token={token}
                    setIsLoggedIn={setIsLoggedIn}
                    setPage={page => navigate(page === 'landing' ? '/' : `/${page}`)}
                    onComplete={() => setShowOnboarding(false)}
                />
            )}

            {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup' && !showSplash && (
                <Header
                    setPage={page => navigate(page === 'landing' ? '/' : `/${page}`)}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    setSelectedEvent={event => event ? navigate(`/events/${event.id}`) : navigate('/events')}
                    setViewMode={setViewMode}
                    theme={theme}
                    setTheme={setTheme}
                    setToken={setToken}
                />
            )}
            <div className="page-transition">
                {showSplash ? (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] text-white animate-fadeIn">
                        <img
                            src="/logo_transparent-192x192.PNG"
                            alt="The Loop Logo"
                            className="w-20 h-20 mb-6 animate-bounce rounded-2xl shadow-lg"
                            style={{ background: 'transparent' }}
                        />
                        <span className="text-3xl font-bold tracking-tight">The Loop</span>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/" element={<LandingPage setPage={page => navigate(page === 'events' ? '/events' : `/${page}`)} setIsLoggedIn={setIsLoggedIn} setToken={setToken} setShowOnboarding={setShowOnboarding} setOnboardingData={setOnboardingData} />} />
                        <Route path="/login" element={<LoginPage setPage={page => navigate(page === 'landing' ? '/' : `/${page}`)} setIsLoggedIn={setIsLoggedIn} setToken={setToken} setShowOnboarding={setShowOnboarding} setOnboardingData={setOnboardingData} />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/signup" element={<SignupPage setPage={page => navigate(page === 'landing' ? '/' : `/${page}`)} setIsLoggedIn={setIsLoggedIn} setToken={setToken} setShowOnboarding={setShowOnboarding} setOnboardingData={setOnboardingData} />} />
                        <Route path="/interest_selection" element={<InterestSelectorPage setPage={page => navigate(`/${page}`)} setIsLoggedIn={setIsLoggedIn} />} />
                        <Route path="/profile" element={<ProfilePage setIsLoggedIn={setIsLoggedIn} setPage={page => navigate(`/${page}`)} chatSystem={chatSystem} />} />
                        <Route path="/friends" element={<ProfilePage setIsLoggedIn={setIsLoggedIn} setPage={page => navigate(`/${page}`)} initialTab="friends" chatSystem={chatSystem} />} />
                        <Route path="/events" element={
                            <EventsContainer
                                events={events}
                                setSelectedEvent={event => event ? navigate(`/events/${event.id}`) : navigate('/events')}
                                isLoading={isLoading}
                                error={error}
                                setViewMode={setViewMode}
                                viewMode={viewMode}
                                mapScriptLoaded={mapScriptLoaded}
                                theme={theme}
                                currentUser={currentUser}
                            />
                        } />
                        <Route path="/events/:id" element={
                            <EventDetailsWrapper
                                events={events}
                                isLoading={isLoading}
                                mapScriptLoaded={mapScriptLoaded}
                                theme={theme}
                                currentUser={currentUser}
                                fetchEvents={fetchEvents}
                            />
                        } />
                        <Route path="*" element={<div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <img src="/logo_transparent-192x192.PNG" alt="The Loop Logo" className="w-16 h-16 mb-6" style={{ background: 'transparent' }} />
                            <div>Page not found.</div>
                        </div>} />
                    </Routes>
                )}
            </div>

            {/* Persistent Chat Widget */}
            {isLoggedIn && currentUser && (
                <ChatWidget
                    currentUser={currentUser}
                    friends={chatSystem.friends}
                    activeFriend={chatSystem.activeChatFriend}
                    setActiveFriend={chatSystem.setActiveChatFriend}
                    messages={chatSystem.chatMessages}
                    onSendMessage={chatSystem.handleSendMessage}
                    onClose={() => chatSystem.setActiveChatFriend(null)}
                    isMobile={isMobile}
                    isLoadingChat={chatSystem.isLoadingChat}
                />
            )}
        </div>
    );
}

// Helper component defined outside to prevent recreation on re-renders
const EventDetailsWrapper = ({ events, isLoading, mapScriptLoaded, theme, currentUser, fetchEvents }) => {
    const { id } = useParams();
    // Find event by id, allowing for string/number mismatch
    const event = events.find(e => e.id.toString() === id.toString());

    if (isLoading) {
        return <div className="text-center py-10 text-gray-500">Loading event...</div>;
    }

    if (!event) {
        return <div className="text-center py-10 text-gray-500">Event not found. (Check the event link or try refreshing the events list.)</div>;
    }

    return <EventDetailsPage event={event} mapScriptLoaded={mapScriptLoaded} theme={theme} currentUser={currentUser} fetchEvents={fetchEvents} />;
};
