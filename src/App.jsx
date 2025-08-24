import React, { useState, useEffect, useRef } from 'react';

// Mock Data with LATITUDE and LONGITUDE
const mockEvents = [
  { id: "evt_123", title: "Annual Tech Fest Kick-off", description: "Join us for the opening ceremony of the biggest tech fest on campus. Keynotes, food, and fun!", start_at: "2025-09-01T18:00:00Z", end_at: "2025-09-01T20:00:00Z", venue: "Main Auditorium", tags: ["productive", "tech", "fest"], lat: 30.3558, lng: 76.3625 },
  { id: "evt_124", title: "Acoustic Night at the Cafe", description: "Unwind with some live music from talented student artists. Grab a coffee and enjoy the vibes.", start_at: "2025-09-03T19:30:00Z", end_at: "2025-09-03T21:00:00Z", venue: "The Student Cafe", tags: ["chill", "music", "art"], lat: 30.3532, lng: 76.3651 },
  { id: "evt_125", title: "Late Night Dance Party", description: "DJ Ron is back with the hottest tracks. Get ready to dance the night away!", start_at: "2025-09-05T22:00:00Z", end_at: "2025-09-06T02:00:00Z", venue: "Gymnasium Hall", tags: ["wild", "dance", "late-night"], lat: 30.3571, lng: 76.3689 },
  { id: "evt_126", title: "Python Workshop", description: "Learn the basics of Pandas and Matplotlib in this hands-on workshop by the Coding Club.", start_at: "2025-09-06T14:00:00Z", end_at: "2025-09-06T16:00:00Z", venue: "Computer Lab 3", tags: ["productive", "workshop", "tech"], lat: 30.3545, lng: 76.3660 },
  { id: "evt_127", title: "24-Hour Hackathon", description: "Build, break, and innovate! Compete for amazing prizes and learn from industry mentors.", start_at: "2025-09-10T17:00:00Z", end_at: "2025-09-11T17:00:00Z", venue: "CSED Building", tags: ["productive", "tech", "hackathon"], lat: 30.3540, lng: 76.3655 },
];

// --- MAP CUSTOMIZATION (New "Aubergine" Dark Theme) ---
const mapStyles = [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}];
const mapOptions = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
    minZoom: 14,
    maxZoom: 18,
    restriction: {
        latLngBounds: {
            north: 30.360,
            south: 30.350,
            west: 76.359,
            east: 76.372,
        },
        strictBounds: false,
    },
};


// --- HELPER COMPONENTS ---
const formatDate = (dateString) => { const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }; return new Date(dateString).toLocaleDateString(undefined, options); };
const Tag = ({ text }) => { const tagColors = { productive: 'bg-blue-100 text-blue-800', chill: 'bg-green-100 text-green-800', wild: 'bg-purple-100 text-purple-800', tech: 'bg-indigo-100 text-indigo-800', music: 'bg-pink-100 text-pink-800', art: 'bg-yellow-100 text-yellow-800', fest: 'bg-red-100 text-red-800', dance: 'bg-teal-100 text-teal-800', 'late-night': 'bg-gray-200 text-gray-800', workshop: 'bg-orange-100 text-orange-800', hackathon: 'bg-cyan-100 text-cyan-800', default: 'bg-gray-100 text-gray-800' }; const colorClass = tagColors[text] || tagColors.default; return <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2 ${colorClass}`}>#{text}</span>; };

// --- CALENDAR HELPER FUNCTIONS ---
const formatICSDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
};

const downloadICSFile = (event) => {
    const startDate = new Date(event.start_at);
    const endDate = new Date(event.end_at);
    const now = new Date();

    const escapeText = (text) => {
        return text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
    }

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `UID:${event.id}@theloop.com`,
        `DTSTAMP:${formatICSDate(now)}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${escapeText(event.title)}`,
        `DESCRIPTION:${escapeText(event.description)}`,
        `LOCATION:${escapeText(event.venue)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/ /g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


// --- MAP COMPONENTS ---
const MapView = ({ events, setSelectedEvent }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null); 

  useEffect(() => {
    window.selectEventFromMap = (eventId) => {
      const event = events.find(e => e.id === eventId);
      if (event) setSelectedEvent(event);
    };
  }, [events, setSelectedEvent]);

  useEffect(() => {
    if (mapRef.current && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 30.355, lng: 76.365 },
        zoom: 15,
        ...mapOptions
      });

      if (!infoWindowRef.current) {
        infoWindowRef.current = new window.google.maps.InfoWindow();
      }
      const infoWindow = infoWindowRef.current;

      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      const getPinColor = (tags) => {
        const primaryTag = tags[0];
        const colors = { productive: 'blue', chill: 'green', wild: 'purple', default: 'red' };
        return `http://maps.google.com/mapfiles/ms/icons/${colors[primaryTag] || colors.default}-dot.png`;
      };

      const newMarkers = events.map(event => {
        const marker = new window.google.maps.Marker({
          position: { lat: event.lat, lng: event.lng },
          map: map,
          title: event.title,
          icon: { url: getPinColor(event.tags) },
          animation: window.google.maps.Animation.DROP,
        });

        marker.addListener('mouseover', () => {
          const isNearTop = event.lat > 30.358;
          const yOffset = isNearTop ? 15 : -35;

          infoWindow.setOptions({
              pixelOffset: new window.google.maps.Size(0, yOffset)
          });

          const contentString = `
            <div style="cursor: pointer; margin: 0; padding: 0; background-color: #333; color: #fff; border-radius: 5px; padding: 10px;" onclick="window.selectEventFromMap('${event.id}')">
              <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 16px; margin-top: 0; color: #f3d19c;">${event.title}</h3>
              <p style="margin: 0; color: #ccc;">${event.venue}</p>
            </div>
          `;
          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);
        });

        marker.addListener('click', () => setSelectedEvent(event));
        
        return marker;
      });
      markersRef.current = newMarkers;

      map.addListener('click', () => infoWindow.close());
    }
  }, [events, setSelectedEvent]);

  return (
    <div className="mt-8">
      <div ref={mapRef} style={{ width: '100%', height: 'calc(100vh - 280px)', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} />
    </div>
  );
};

const SingleEventMap = ({ event }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current && window.google) {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: event.lat, lng: event.lng },
                zoom: 16,
                ...mapOptions
            });

            new window.google.maps.Marker({
                position: { lat: event.lat, lng: event.lng },
                map: map,
                title: event.title,
            });
        }
    }, [event]);

    return <div ref={mapRef} className="mt-4 w-full h-64 md:h-80 rounded-lg" />;
};


// --- PAGE & LAYOUT COMPONENTS ---
const Header = ({ setPage, isLoggedIn, setSelectedEvent, setViewMode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const goHome = () => { 
        setSelectedEvent(null); 
        setPage('events');
        setViewMode('list'); 
        setIsMenuOpen(false);
    }
    
    const navAction = (page) => {
        setPage(page);
        setIsMenuOpen(false);
    }

    return (
        <header className="bg-white shadow-md sticky top-0 z-20">
            <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <button onClick={goHome} className="text-xl sm:text-2xl font-bold text-gray-800 hover:text-indigo-600">The Loop</button>
                
                <div className="hidden md:flex items-center space-x-3">
                    <button onClick={goHome} className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">All Events</button>
                    {isLoggedIn && <button onClick={() => alert('My Feed is coming soon!')} className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md">My Feed</button>}
                    {!isLoggedIn && <button onClick={() => navAction('login')} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300">Login</button>}
                    {isLoggedIn && <button onClick={() => alert('Logging out!')} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300">Logout</button>}
                </div>

                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                        </svg>
                    </button>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <button onClick={goHome} className="w-full text-left block text-gray-600 hover:text-indigo-600 hover:bg-gray-100 px-3 py-2 rounded-md">All Events</button>
                        {isLoggedIn && <button onClick={() => alert('My Feed is coming soon!')} className="w-full text-left block text-gray-600 hover:text-indigo-600 hover:bg-gray-100 px-3 py-2 rounded-md">My Feed</button>}
                        {!isLoggedIn && <button onClick={() => navAction('login')} className="w-full text-left block text-gray-600 hover:text-indigo-600 hover:bg-gray-100 px-3 py-2 rounded-md">Login</button>}
                        {isLoggedIn && <button onClick={() => alert('Logging out!')} className="w-full text-left block text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md">Logout</button>}
                    </div>
                </div>
            )}
        </header>
    );
};
const EventCard = ({ event, onSelect }) => (
    <button onClick={onSelect} className="w-full text-left block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out">
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div><div className="uppercase tracking-wide text-sm text-indigo-600 font-bold">{event.venue}</div><h2 className="block mt-1 text-2xl leading-tight font-bold text-black">{event.title}</h2></div>
                <div className="flex-shrink-0 ml-4 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center"><svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
            </div>
            <p className="mt-4 text-gray-600">{event.description.substring(0, 100)}...</p>
            <div className="mt-6">{event.tags.map(tag => <Tag key={tag} text={tag} />)}</div>
        </div>
    </button>
);
const EventList = ({ events, setSelectedEvent }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {events.map(event => <EventCard key={event.id} event={event} onSelect={() => setSelectedEvent(event)} />)}
    </div>
);
const EventDetailsPage = ({ event, mapScriptLoaded }) => {
    return (
        <main className="container mx-auto px-4 sm:px-6 py-12">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-6 sm:p-8 md:p-12">
                    <div className="uppercase tracking-wide text-sm text-indigo-600 font-bold">{event.venue}</div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mt-2">{event.title}</h1>
                    <div className="mt-6"><p className="text-gray-500"><strong>Starts:</strong> {formatDate(event.start_at)}</p><p className="text-gray-500"><strong>Ends:</strong> {formatDate(event.end_at)}</p></div>
                    <p className="mt-8 text-lg text-gray-700 leading-relaxed">{event.description}</p>
                    <div className="mt-8">{event.tags.map(tag => <Tag key={tag} text={tag} />)}</div>
                    <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-xl font-bold text-gray-800">Location</h3>
                            <p className="text-gray-600 mt-1">{event.venue}</p>
                            {mapScriptLoaded ? <SingleEventMap event={event} /> : <div className="mt-4 w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div>}
                        </div>
                        <div className="flex flex-col items-stretch gap-4 w-full md:w-auto">
                            <button className="group flex items-center justify-center gap-3 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg><span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out">Remind Me</span></button>
                            <button onClick={() => downloadICSFile(event)} className="flex items-center justify-center gap-3 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Add to Calendar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
const LoginPage = ({ setPage, setIsLoggedIn }) => { const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const handleSubmit = (e) => { e.preventDefault(); console.log('Logging in with:', { email, password }); alert('Login successful!'); setIsLoggedIn(true); setPage('events'); }; return ( <div className="container mx-auto px-4 sm:px-6 py-12 flex justify-center"><div className="w-full max-w-md"><form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-xl px-8 pt-6 pb-8 mb-4"><h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Welcome Back!</h2><div className="mb-4"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label><input className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400" id="email" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="mb-6"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label><input className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400" id="password" type="password" placeholder="******************" value={password} onChange={e => setPassword(e.target.value)} required /></div><div className="flex items-center justify-between"><button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300" type="submit">Sign In</button></div><p className="text-center text-gray-500 text-sm mt-6">Don't have an account? <button type="button" onClick={() => setPage('signup')} className="font-bold text-indigo-600 hover:text-indigo-800">Sign Up</button></p></form></div></div> ); };
const SignupPage = ({ setPage }) => { const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const handleSubmit = (e) => { e.preventDefault(); console.log('Signing up with:', { name, email, password }); alert('Signup successful! Please select your interests.'); setPage('interest_selection'); }; return ( <div className="container mx-auto px-4 sm:px-6 py-12 flex justify-center"><div className="w-full max-w-md"><form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-xl px-8 pt-6 pb-8 mb-4"><h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Create Your Account</h2><div className="mb-4"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label><input className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400" id="name" type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required /></div><div className="mb-4"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">Email</label><input className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400" id="signup-email" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="mb-6"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">Password</label><input className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-400" id="signup-password" type="password" placeholder="******************" value={password} onChange={e => setPassword(e.target.value)} required /></div><div className="flex items-center justify-between"><button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300" type="submit">Sign Up</button></div><p className="text-center text-gray-500 text-sm mt-6">Already have an account? <button type="button" onClick={() => setPage('login')} className="font-bold text-indigo-600 hover:text-indigo-800">Log In</button></p></form></div></div> ); };
const InterestSelectorPage = ({ setPage, setIsLoggedIn }) => { const allInterests = ['sports', 'party', 'clubbing', 'movie', 'dancing', 'singing', 'tech', 'art', 'workshop', 'gaming', 'food', 'comedy', 'hackathon']; const [selectedInterests, setSelectedInterests] = useState([]); const toggleInterest = (interest) => { setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]); }; const handleFinish = () => { console.log('User selected interests:', selectedInterests); alert('Your preferences have been saved!'); setIsLoggedIn(true); setPage('events'); }; return ( <div className="container mx-auto px-4 sm:px-6 py-12 flex justify-center"><div className="w-full max-w-2xl"><div className="bg-white shadow-2xl rounded-xl p-8"><h2 className="text-3xl font-bold text-center text-gray-800 mb-2">What are you into?</h2><p className="text-center text-gray-500 mb-8">Select a few interests to help us personalize your event feed.</p><div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">{allInterests.map(interest => { const isSelected = selectedInterests.includes(interest); return (<button key={interest} onClick={() => toggleInterest(interest)} className={`capitalize font-bold py-2 px-4 sm:py-3 sm:px-5 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{interest}</button>); })}</div><div className="flex justify-center"><button onClick={handleFinish} disabled={selectedInterests.length < 1} className="w-full sm:w-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">Finish</button></div></div></div></div> ); };

// The main App component that brings everything together
export default function App() {
  const [events, setEvents] = useState(mockEvents);
  const [page, setPage] = useState('events');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);

  // FIX: Using environment variable for the API key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; 

  // Effect to load the Google Maps script
  useEffect(() => {
    if ((viewMode === 'map' || selectedEvent) && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapScriptLoaded(true);
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
            document.head.removeChild(script);
        }
      };
    } else if (window.google) {
        setMapScriptLoaded(true);
    }
  }, [viewMode, selectedEvent, GOOGLE_MAPS_API_KEY]);

  const EventsContainer = () => (
    <main className="container mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Upcoming Events</h1>
        <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-lg">
          <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow' : 'bg-transparent text-gray-600'}`}>List View</button>
          <button onClick={() => setViewMode('map')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow' : 'bg-transparent text-gray-600'}`}>Map View</button>
        </div>
      </div>
      {viewMode === 'list' && <EventList events={events} setSelectedEvent={setSelectedEvent} />}
      {viewMode === 'map' && (
        mapScriptLoaded 
          ? <MapView events={events} setSelectedEvent={setSelectedEvent} /> 
          : <div className="text-center py-10">Loading Map...</div>
      )}
    </main>
  );

  const renderPage = () => {
    if (selectedEvent) return <EventDetailsPage event={selectedEvent} mapScriptLoaded={mapScriptLoaded} />;
    if (page === 'login') return <LoginPage setPage={setPage} setIsLoggedIn={setIsLoggedIn} />;
    if (page === 'signup') return <SignupPage setPage={setPage} />;
    if (page === 'interest_selection') return <InterestSelectorPage setPage={setPage} setIsLoggedIn={setIsLoggedIn} />;
    
    return <EventsContainer />;
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header setPage={setPage} isLoggedIn={isLoggedIn} setSelectedEvent={setSelectedEvent} setViewMode={setViewMode} />
      {renderPage()}
    </div>
  );
}
