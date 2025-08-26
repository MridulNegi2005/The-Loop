import React, { useState, useEffect, useRef } from 'react';

// Mock Data with LATITUDE and LONGITUDE (Now used as a fallback)
const mockEvents = [
  { id: "evt_123", title: "Annual Tech Fest Kick-off", description: "Join us for the opening ceremony of the biggest tech fest on campus. Keynotes, food, and fun!", start_at: "2025-09-01T18:00:00Z", end_at: "2025-09-01T20:00:00Z", venue: "Main Auditorium", tags: ["productive", "tech", "fest"], lat: 30.3558, lng: 76.3625 },
  { id: "evt_124", title: "Acoustic Night at the Cafe", description: "Unwind with some live music from talented student artists. Grab a coffee and enjoy the vibes.", start_at: "2025-09-03T19:30:00Z", end_at: "2025-09-03T21:00:00Z", venue: "The Student Cafe", tags: ["chill", "music", "art"], lat: 30.3532, lng: 76.3651 },
];

// --- MAP CUSTOMIZATION ---
const lightMapStyles = [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}];
const darkMapStyles = [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}];

const getMapOptions = (theme) => ({
    styles: theme === 'dark' ? darkMapStyles : lightMapStyles,
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
});


// --- HELPER COMPONENTS ---
const formatDate = (dateString) => { const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }; return new Date(dateString).toLocaleDateString(undefined, options); };
const Tag = ({ text }) => { const tagColors = { productive: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:border dark:border-blue-700', chill: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border dark:border-green-700', wild: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 dark:border dark:border-purple-700', tech: 'bg-indigo-100 text-indigo-800 dark:bg-violet-900/50 dark:text-violet-300 dark:border dark:border-violet-700', music: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 dark:border dark:border-pink-700', art: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border dark:border-yellow-700', fest: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 dark:border dark:border-red-700', dance: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 dark:border dark:border-teal-700', 'late-night': 'bg-gray-200 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 dark:border dark:border-gray-600', workshop: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 dark:border dark:border-orange-700', hackathon: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border dark:border-cyan-700', default: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 dark:border dark:border-gray-700' }; const colorClass = tagColors[text] || tagColors.default; return <span className={`inline-block rounded-full px-3 py-1 text-xs sm:text-sm font-semibold mr-2 mb-2 ${colorClass}`}>#{text}</span>; };

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
const MapView = ({ events, setSelectedEvent, theme }) => {
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
        ...getMapOptions(theme)
      });

      if (!infoWindowRef.current) {
        infoWindowRef.current = new window.google.maps.InfoWindow({
          pixelOffset: new window.google.maps.Size(0, -35),
          disableAutoPan: true,
        });
      }
      const infoWindow = infoWindowRef.current;

      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      const getPinColor = (tags) => {
        const primaryTag = tags[0];
        const colors = { productive: 'blue', chill: 'green', wild: 'purple', default: 'red' };
        return `https://maps.google.com/mapfiles/ms/icons/${colors[primaryTag] || colors.default}-dot.png`;
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
          const isDark = theme === 'dark';
          const bgColor = isDark ? 'rgba(17, 17, 22, 0.8)' : '#ffffff';
          const textColor = isDark ? '#E5E7EB' : '#1F2937';
          const subTextColor = isDark ? '#9CA3AF' : '#4B5563';
          const borderColor = isDark ? 'rgba(109, 40, 217, 0.5)' : 'rgba(229, 231, 235, 1)';

          const contentString = `
            <div 
              style="
                cursor: pointer; 
                background-color: ${bgColor}; 
                color: ${textColor}; 
                ${isDark ? 'backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);' : ''}
                border: 1px solid ${borderColor};
                border-radius: 0.75rem; 
                padding: 0.75rem 1rem; 
                font-family: 'Inter', sans-serif;
                width: 200px;
                box-shadow: ${isDark ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'};
                text-align: left;
              " 
              onclick="window.selectEventFromMap('${event.id}')"
            >
              <h3 style="font-weight: 600; margin: 0 0 4px 0; font-size: 1rem; letter-spacing: -0.025em;">${event.title}</h3>
              <p style="margin: 0; font-size: 0.875rem; color: ${subTextColor};">${event.venue}</p>
            </div>
          `;
          infoWindow.setContent(contentString);
          infoWindow.open({
            anchor: marker,
            map,
          });
        });

        marker.addListener('click', () => setSelectedEvent(event));
        
        return marker;
      });
      markersRef.current = newMarkers;

      map.addListener('click', () => infoWindow.close());
    }
  }, [events, setSelectedEvent, theme]);

  return (
    <div className="mt-8">
      <div ref={mapRef} className="w-full h-[calc(100vh-280px)] rounded-xl border border-gray-200 dark:border-gray-800" />
    </div>
  );
};

const SingleEventMap = ({ event, theme }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current && window.google) {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: event.lat, lng: event.lng },
                zoom: 16,
                ...getMapOptions(theme)
            });

            new window.google.maps.Marker({
                position: { lat: event.lat, lng: event.lng },
                map: map,
                title: event.title,
            });
        }
    }, [event, theme]);

    return <div ref={mapRef} className="mt-4 w-full h-64 md:h-80 rounded-lg border border-gray-200 dark:border-gray-800" />;
};


// --- PAGE & LAYOUT COMPONENTS ---
const Header = ({ setPage, isLoggedIn, setIsLoggedIn, setSelectedEvent, setViewMode, theme, setTheme }) => {
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

    const handleLogout = () => {
        setIsLoggedIn(false);
        setPage('events');
        setIsMenuOpen(false);
    }

    return (
        <header className="bg-white/80 dark:bg-[#111116]/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-yellow-800/50 sticky top-0 z-20">
            <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <button onClick={goHome} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">The Loop</button>
                
                <div className="hidden md:flex items-center space-x-2">
                    <button onClick={goHome} className="text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 px-3 py-2 rounded-md transition-colors">All Events</button>
                    {isLoggedIn && <button onClick={() => alert('My Feed is coming soon!')} className="text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 px-3 py-2 rounded-md transition-colors">My Feed</button>}
                    {!isLoggedIn && <button onClick={() => navAction('login')} className="bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors duration-300">Login</button>}
                    {isLoggedIn && <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300">Logout</button>}
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        {theme === 'dark' ? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        }
                    </button>
                </div>

                <div className="md:hidden flex items-center gap-2">
                     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        {theme === 'dark' ? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        }
                    </button>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 focus:outline-none">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                        </svg>
                    </button>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-yellow-800/50">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <button onClick={goHome} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md transition-colors">All Events</button>
                        {isLoggedIn && <button onClick={() => alert('My Feed is coming soon!')} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md transition-colors">My Feed</button>}
                        {!isLoggedIn && <button onClick={() => navAction('login')} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md transition-colors">Login</button>}
                        {isLoggedIn && <button onClick={handleLogout} className="w-full text-left block text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-gray-800 px-3 py-2 rounded-md transition-colors">Logout</button>}
                    </div>
                </div>
            )}
        </header>
    );
};
const EventCard = ({ event, onSelect }) => (
    <button onClick={onSelect} className="w-full text-left block bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-yellow-900/50 overflow-hidden shadow-sm hover:shadow-xl dark:hover:border-yellow-500 hover:-translate-y-1 transition-all duration-300 ease-in-out">
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div><div className="uppercase tracking-wide text-sm text-yellow-500 dark:text-yellow-400 font-bold">{event.venue}</div><h2 className="block mt-1 text-xl sm:text-2xl leading-tight font-bold text-gray-900 dark:text-white">{event.title}</h2></div>
                <div className="flex-shrink-0 ml-4 w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center"><svg className="h-6 w-6 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{event.description.substring(0, 100)}...</p>
            <div className="mt-6">{event.tags.map(tag => <Tag key={tag} text={tag} />)}</div>
        </div>
    </button>
);
const EventList = ({ events, setSelectedEvent }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
        {events.map(event => <EventCard key={event.id} event={event} onSelect={() => setSelectedEvent(event)} />)}
    </div>
);
const EventDetailsPage = ({ event, mapScriptLoaded, theme }) => {
    return (
        <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
            <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-yellow-900/50 rounded-xl overflow-hidden shadow-lg">
                <div className="p-6 sm:p-8 md:p-12">
                    <div className="uppercase tracking-wide text-sm text-yellow-500 dark:text-yellow-400 font-bold">{event.venue}</div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-2">{event.title}</h1>
                    <div className="mt-6"><p className="text-gray-600 dark:text-gray-400"><strong>Starts:</strong> {formatDate(event.start_at)}</p><p className="text-gray-500 dark:text-gray-400"><strong>Ends:</strong> {formatDate(event.end_at)}</p></div>
                    <p className="mt-8 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
                    <div className="mt-8">{event.tags.map(tag => <Tag key={tag} text={tag} />)}</div>
                    <div className="mt-10 pt-8 border-t border-gray-200 dark:border-yellow-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Location</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{event.venue}</p>
                            {mapScriptLoaded ? <SingleEventMap event={event} theme={theme} /> : <div className="mt-4 w-full h-64 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div>}
                        </div>
                        <div className="flex flex-col items-stretch gap-4 w-full md:w-auto">
                            <button className="flex items-center justify-center gap-3 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                <span>Remind Me</span>
                            </button>
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
            const response = await fetch('http://localhost:8000/users/login', {
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
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-yellow-900/50 rounded-xl shadow-md px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Welcome Back!</h2>
                    
                    {error && <p className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{error}</p>}

                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">Email</label>
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 dark:bg-slate-700 dark:border-gray-600 dark:text-white appearance-none rounded w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-500" id="email" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 dark:bg-slate-700 dark:border-gray-600 dark:text-white appearance-none rounded w-full py-3 px-4 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-500" id="password" type="password" placeholder="******************" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="flex items-center justify-between">
                        <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-yellow-400 dark:disabled:bg-yellow-800" type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">Don't have an account? <button type="button" onClick={() => setPage('signup')} className="font-bold text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300">Sign Up</button></p>
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
            const response = await fetch('http://localhost:8000/users/signup', {
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
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-yellow-900/50 rounded-xl shadow-md px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Create Your Account</h2>
                    
                    {error && <p className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">{error}</p>}

                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="signup-email">Email</label>
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 dark:bg-slate-700 dark:border-gray-600 dark:text-white appearance-none rounded w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-500" id="signup-email" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="signup-password">Password</label>
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 dark:bg-slate-700 dark:border-gray-600 dark:text-white appearance-none rounded w-full py-3 px-4 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-500" id="signup-password" type="password" placeholder="******************" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="flex items-center justify-between">
                        <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-yellow-400 dark:disabled:bg-yellow-800" type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </div>
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">Already have an account? <button type="button" onClick={() => setPage('login')} className="font-bold text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300">Log In</button></p>
                </form>
            </div>
        </div> 
    ); 
};
const InterestSelectorPage = ({ setPage, setIsLoggedIn }) => { const allInterests = ['sports', 'party', 'clubbing', 'movie', 'dancing', 'singing', 'tech', 'art', 'workshop', 'gaming', 'food', 'comedy', 'hackathon']; const [selectedInterests, setSelectedInterests] = useState([]); const toggleInterest = (interest) => { setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]); }; const handleFinish = () => { console.log('User selected interests:', selectedInterests); alert('Your preferences have been saved!'); setIsLoggedIn(true); setPage('events'); }; return ( <div className="container mx-auto px-4 sm:px-6 py-12 flex justify-center"><div className="w-full max-w-2xl"><div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-yellow-900/50 rounded-xl shadow-md p-8"><h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">What are you into?</h2><p className="text-center text-gray-500 dark:text-gray-400 mb-8">Select a few interests to help us personalize your event feed.</p><div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">{allInterests.map(interest => { const isSelected = selectedInterests.includes(interest); return (<button key={interest} onClick={() => toggleInterest(interest)} className={`capitalize font-bold py-2 px-4 sm:py-3 sm:px-5 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${isSelected ? 'bg-yellow-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}>{interest}</button>); })}</div><div className="flex justify-center"><button onClick={handleFinish} disabled={selectedInterests.length < 1} className="w-full sm:w-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed">Finish</button></div></div></div></div> ); };

// The main App component that brings everything together
export default function App() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const GOOGLE_MAPS_API_KEY = "AIzaSyB4ahphCSv4lWERGhBVL49c-8rhfe2W3uE"; 

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/events'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
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

  useEffect(() => {
    if ((viewMode === 'map' || selectedEvent) && !window.google) {
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
  }, [viewMode, selectedEvent, mapScriptLoaded]);

  const EventsContainer = () => (
    <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {isLoading && <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading events from the server...</div>}
        {error && <div className="text-center mb-4 py-4 text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg">{error}</div>}
        {!isLoading && (
            <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Upcoming Events</h1>
                    <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-yellow-800/50">
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white' : 'bg-transparent text-gray-500 dark:text-gray-400'}`}>List View</button>
                        <button onClick={() => setViewMode('map')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white' : 'bg-transparent text-gray-500 dark:text-gray-400'}`}>Map View</button>
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

  const LandingPage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tighter">Find Your Vibe</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">Never miss out on what's happening on campus. The Loop is your one-stop shop for all college events.</p>
        <button onClick={() => setPage('events')} className="mt-8 bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-yellow-700 transition-colors duration-300">Enter App</button>
    </div>
    );

  const renderPage = () => {
    if (page === 'landing') return <LandingPage />;
    if (selectedEvent) return <EventDetailsPage event={selectedEvent} mapScriptLoaded={mapScriptLoaded} theme={theme} />;
    if (page === 'login') return <LoginPage setPage={setPage} setIsLoggedIn={setIsLoggedIn} />;
    if (page === 'signup') return <SignupPage setPage={setPage} />;
    if (page === 'interest_selection') return <InterestSelectorPage setPage={setPage} setIsLoggedIn={setIsLoggedIn} />;
    
    return <EventsContainer />;
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#111116] text-gray-100'}`}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-transition {
          animation: fadeIn 0.4s ease-in-out;
        }
        /* Google Maps Info Window Customization */
        .gm-style-iw-d {
          overflow: hidden !important;
        }
        .gm-style .gm-style-iw-c {
            padding: 0 !important;
            border-radius: 0.75rem !important;
            box-shadow: none !important;
            background-color: transparent !important;
        }
        .gm-style .gm-style-iw-t::after {
            display: none;
        }
      `}</style>
      {page !== 'landing' && <Header setPage={setPage} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setSelectedEvent={setSelectedEvent} setViewMode={setViewMode} theme={theme} setTheme={setTheme} />}
      <div key={selectedEvent ? selectedEvent.id : page} className="page-transition">
        {renderPage()}
      </div>
    </div>
  );
}
