// --- APP VERSION ---
const APP_VERSION = '2';
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import Header from './components/Header';
import EventCard from './components/EventCard';
import EventList from './components/EventList';
import MapView from './components/MapView';
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
const lightMapStyles = [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}];
const darkMapStyles = [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}];

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

const SplineScene = () => {
  useEffect(() => {
    const scriptId = 'spline-viewer-script';
    if (document.getElementById(scriptId)) return; 

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.0.25/build/spline-viewer.js';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        // document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full z-0">
      <spline-viewer url="https://draft.spline.design/b6NpAoTs9BU03p64/scene.splinecode"></spline-viewer>
    </div>
  );
};


// MapView moved to `src/components/MapView.jsx`

// SingleEventMap left in-place but MapView handles detailed map interactions


// Header moved to `src/components/Header.jsx` (imported at top)

// EventCard moved to `src/components/EventCard.jsx` (imported at top)

// VenueScroller removed — not required in App.jsx; use components where needed

// EventList moved to `src/components/EventList.jsx` (imported at top)


const EventDetailsPage = ({ event, mapScriptLoaded, theme }) => {
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
            } catch (e) {}
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
                            {mapScriptLoaded ? <MapView events={[event]} setSelectedEvent={() => {}} theme={theme} /> : <div className="mt-4 w-full h-64 bg-slate-700 rounded-lg flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div>}
                        </div>
                        <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-8 md:mt-0 items-center">
                            <div className="border-b border-gray-200 dark:border-purple-700/50 pb-2 mb-2 w-full text-center">
                                <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">Event Actions</span>
                            </div>
                            <button onClick={() => addToCalendar(event)} className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Add to Calendar</button>
                            <button onClick={handleRemindMe} className={`flex items-center justify-center gap-2 ${reminded ? 'bg-purple-800' : 'bg-purple-500'} text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 w-full`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {reminded ? 'Remind Me (Set!)' : 'Remind Me'}
                            </button>
                            <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-purple-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 w-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zm-6 8a6 6 0 1112 0H9z" /></svg>Share</button>
                            {/* Suggestions for filling empty space: */}
                            {/* 1. Show a countdown timer to event start */}
                            {/* 2. Show a list of similar/upcoming events */}
                            {/* 3. Add a fun event-related quote or fact */}
                            {/* 4. Show a QR code for sharing the event */}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

const LoginPage = ({ setPage, setIsLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
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
                throw new Error(errorData.detail || 'Failed to log in');
            }
            
            const data = await response.json();
            console.log("Received token:", data.access_token); 

            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
            }
            setPage('events');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-12 flex justify-center">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                  <img src="/logo_transparent-192x192.PNG" alt="The Loop Logo" className="w-16 h-16" style={{ background: 'transparent' }} />
                </div>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-purple-800/50 rounded-xl shadow-md px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Welcome Back!</h2>
                    {error && <p className="bg-red-100 border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">Email</label>
                        <input className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none rounded w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500" id="email" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <input className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none rounded w-full py-3 px-4 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500" id="password" type="password" placeholder="******************" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="flex items-center justify-between">
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-purple-800" type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">Don't have an account? <button type="button" onClick={() => setPage('signup')} className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Sign Up</button></p>
                </form>
            </div>
        </div> 
    ); 
};

const SignupPage = ({ setPage }) => { 
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to sign up');
            }
            
            setPage('interest_selection');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }; 

    return ( 
        <div className="container mx-auto px-4 sm:px-6 py-12 flex justify-center">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                  <img src="/logo_transparent-192x192.PNG" alt="The Loop Logo" className="w-16 h-16" style={{ background: 'transparent' }} />
                </div>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-purple-800/50 rounded-xl shadow-md px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Create Your Account</h2>
                    {error && <p className="bg-red-100 border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="signup-email">Email</label>
                        <input className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none rounded w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500" id="signup-email" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="signup-password">Password</label>
                        <input className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none rounded w-full py-3 px-4 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500" id="signup-password" type="password" placeholder="******************" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="flex items-center justify-between">
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-purple-800" type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </div>
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">Already have an account? <button type="button" onClick={() => setPage('login')} className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">Log In</button></p>
                </form>
            </div>
        </div> 
    ); 
};
const InterestSelectorPage = ({ setPage, setIsLoggedIn }) => { const allInterests = ['sports', 'party', 'clubbing', 'movie', 'dancing', 'singing', 'tech', 'art', 'workshop', 'gaming', 'food', 'comedy', 'hackathon']; const [selectedInterests, setSelectedInterests] = useState([]); const toggleInterest = (interest) => { setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]); }; const handleFinish = () => { console.log('User selected interests:', selectedInterests); alert('Your preferences have been saved!'); setIsLoggedIn(true); setPage('events'); }; return ( <div className="container mx-auto px-4 sm:px-6 py-12 flex justify-center"><div className="w-full max-w-2xl"><div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-purple-800/50 rounded-xl shadow-md p-8"><h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">What are you into?</h2><p className="text-center text-gray-500 dark:text-gray-400 mb-8">Select a few interests to help us personalize your event feed.</p><div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">{allInterests.map(interest => { const isSelected = selectedInterests.includes(interest); return (<button key={interest} onClick={() => toggleInterest(interest)} className={`capitalize font-bold py-2 px-4 sm:py-3 sm:px-5 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${isSelected ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}>{interest}</button>); })}</div><div className="flex justify-center"><button onClick={handleFinish} disabled={selectedInterests.length < 1} className="w-full sm:w-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">Finish</button></div></div></div></div> ); };

const EventsContainer = ({ events, setSelectedEvent, isLoading, error, setViewMode, viewMode, mapScriptLoaded, theme }) => (
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
                {viewMode === 'list' && <EventList events={events} setSelectedEvent={setSelectedEvent} />}
                {viewMode === 'map' && (
                mapScriptLoaded 
                    ? <MapView events={events} setSelectedEvent={setSelectedEvent} theme={theme} /> 
                    : <div className="text-center py-10">Loading Map...</div>
                )}
            </>
        )}
    </main>
);

const LandingPage = ({ setPage }) => {
    const [showPwaButton, setShowPwaButton] = React.useState(false);
    const deferredPromptRef = React.useRef(null);

    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            deferredPromptRef.current = e;
            setShowPwaButton(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handlePwaInstall = () => {
        if (deferredPromptRef.current) {
            deferredPromptRef.current.prompt();
            deferredPromptRef.current.userChoice.then(() => {
                deferredPromptRef.current = null;
                setShowPwaButton(false);
            });
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-end min-h-screen text-center px-4 pb-20">
            <SplineScene />
            <div className="relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Find Your Vibe</h1>
                <p className="mt-4 text-lg text-gray-400 max-w-2xl">Never miss out on what's happening on campus. The Loop is your one-stop shop for all college events.</p>
                                {showPwaButton && (
                                    <div className="flex justify-center w-full">
                                        <button
                                            onClick={handlePwaInstall}
                                            className="mt-8 mb-2 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-300 border-2 border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            style={{animation: 'fadeIn 0.4s'}}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4" /></svg>
                                            Download App
                                        </button>
                                    </div>
                                )}
                                <div className="flex justify-center w-full">
                                    <button onClick={() => setPage('events')} className="mt-4 bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors duration-300">Enter App</button>
                                </div>
            </div>
        </div>
    );
};


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
    const navigate = useNavigate();
    const location = useLocation();

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

    React.useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/events`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setEvents(data);
            } catch (e) {
                console.error("Failed to fetch events:", e);
                setError("Could not connect to the server. Displaying sample data.");
                setEvents(mockEvents);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Load Google Maps script when needed
    React.useEffect(() => {
        const isMapPage = location.pathname.startsWith('/events') && (viewMode === 'map' || location.pathname.startsWith('/events/'));
        if (isMapPage && !window.google) {
            if (!document.getElementById('google-maps-script')) {
                const script = document.createElement('script');
                script.id = 'google-maps-script';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
                script.async = true;
                script.defer = true;
                script.onload = () => setMapScriptLoaded(true);
                document.head.appendChild(script);
            }
        } else if (window.google && !mapScriptLoaded) {
            setMapScriptLoaded(true);
        }
    }, [viewMode, location.pathname]);

    // Route components
    function EventDetailsRoute() {
        const { id } = useParams();
        // Find event by id, allowing for string/number mismatch
        const event = events.find(e => e.id.toString() === id.toString());
        if (isLoading) {
            return <div className="text-center py-10 text-gray-500">Loading event...</div>;
        }
        if (!event) {
            return <div className="text-center py-10 text-gray-500">Event not found. (Check the event link or try refreshing the events list.)</div>;
        }
        return <EventDetailsPage event={event} mapScriptLoaded={mapScriptLoaded} theme={theme} />;
    }

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
            {location.pathname !== '/' && !showSplash && (
                <Header
                    setPage={page => navigate(page === 'landing' ? '/' : `/${page}`)}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    setSelectedEvent={event => event ? navigate(`/events/${event.id}`) : navigate('/events')}
                    setViewMode={setViewMode}
                    theme={theme}
                    setTheme={setTheme}
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
                        <Route path="/" element={<LandingPage setPage={page => navigate(page === 'events' ? '/events' : `/${page}`)} />} />
                        <Route path="/login" element={<LoginPage setPage={page => navigate(`/${page}`)} setIsLoggedIn={setIsLoggedIn} />} />
                        <Route path="/signup" element={<SignupPage setPage={page => navigate(`/${page}`)} />} />
                        <Route path="/interest_selection" element={<InterestSelectorPage setPage={page => navigate(`/${page}`)} setIsLoggedIn={setIsLoggedIn} />} />
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
                            />
                        } />
                        <Route path="/events/:id" element={<EventDetailsRoute />} />
                                                <Route path="*" element={<div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                                    <img src="/logo_transparent-192x192.PNG" alt="The Loop Logo" className="w-16 h-16 mb-6" style={{ background: 'transparent' }} />
                                                    <div>Page not found.</div>
                                                </div>} />
                    </Routes>
                )}
            </div>
        </div>
    );
}
