import React, { useState, useEffect, useRef } from 'react';

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

// --- HELPER COMPONENTS & FUNCTIONS ---
const formatDate = (dateString, options = { month: 'short', day: 'numeric' }) => { return new Date(dateString).toLocaleDateString(undefined, options); };
const formatTime = (dateString) => { const options = { hour: 'numeric', minute: 'numeric', hour12: true }; return new Date(dateString).toLocaleTimeString(undefined, options); };
const Tag = ({ text }) => { const tagColors = { productive: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:border dark:border-blue-700', chill: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border dark:border-green-700', wild: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 dark:border dark:border-purple-700', tech: 'bg-indigo-100 text-indigo-800 dark:bg-violet-900/50 dark:text-violet-300 dark:border dark:border-violet-700', music: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 dark:border dark:border-pink-700', art: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border dark:border-yellow-700', fest: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 dark:border dark:border-red-700', dance: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 dark:border dark:border-teal-700', 'late-night': 'bg-gray-200 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 dark:border dark:border-gray-600', workshop: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 dark:border dark:border-orange-700', hackathon: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border dark:border-cyan-700', default: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 dark:border dark:border-gray-700' }; const colorClass = tagColors[text] || tagColors.default; return <span className={`inline-block rounded-full px-3 py-1 text-xs sm:text-sm font-semibold mr-2 mb-2 ${colorClass}`}>#{text}</span>; };

const formatICSDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
const downloadICSFile = (event) => {
    const escapeText = (text) => text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
    const icsContent = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `UID:${event.id}@theloop.com`, `DTSTAMP:${formatICSDate(new Date())}`, `DTSTART:${formatICSDate(new Date(event.start_at))}`, `DTEND:${formatICSDate(new Date(event.end_at))}`, `SUMMARY:${escapeText(event.title)}`, `DESCRIPTION:${escapeText(event.description)}`, `LOCATION:${escapeText(event.venue)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/ /g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

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

const MapView = ({ events, setSelectedEvent, theme }) => {
    const mapRef = useRef(null);
    const infoWindowRef = useRef(null); 

    useEffect(() => {
        window.selectEventFromMap = (eventId) => {
            const event = events.find(e => e.id.toString() === eventId.toString());
            if (event) setSelectedEvent(event);
        };
        window.closeInfoWindow = () => {
            if(infoWindowRef.current) {
                infoWindowRef.current.close();
            }
        }
    }, [events, setSelectedEvent]);

    useEffect(() => {
        if (mapRef.current && window.google) {
            const map = new window.google.maps.Map(mapRef.current, { center: { lat: 30.355, lng: 76.365 }, zoom: 15, ...getMapOptions(theme) });
            if (!infoWindowRef.current) {
                infoWindowRef.current = new window.google.maps.InfoWindow({ content: '' });
                infoWindowRef.current.addListener('domready', () => {
                    const iwOuter = document.querySelector('.gm-style-iw-a');
                    if(iwOuter) {
                        const iwBackground = iwOuter.parentElement;
                        iwBackground.style.setProperty('background', 'transparent', 'important');
                        iwBackground.style.setProperty('box-shadow', 'none', 'important');
                        if (iwOuter.previousElementSibling) { iwOuter.previousElementSibling.remove(); }
                    }
                });
            }
            const infoWindow = infoWindowRef.current;
            const eventsByLocation = events.reduce((acc, event) => {
                const key = `${event.lat},${event.lng}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(event);
                return acc;
            }, {});

            Object.values(eventsByLocation).forEach(locationEvents => {
                const firstEvent = locationEvents[0];
                const marker = new window.google.maps.Marker({ position: { lat: firstEvent.lat, lng: firstEvent.lng }, map: map, title: locationEvents.map(e => e.title).join(', '), animation: window.google.maps.Animation.DROP });

                marker.addListener('mouseover', () => {
                    const now = new Date();
                    const upcomingEvents = locationEvents.filter(e => new Date(e.start_at) > now).sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
                    const eventsToShow = upcomingEvents.slice(0, 3);
                    const hasMoreEvents = upcomingEvents.length > 3;
                    const contentString = `<div style="background-color: #1e1b4b; color: #e0e7ff; border-radius: 8px; padding: 12px; font-family: sans-serif; max-width: 250px; position: relative;"><button onclick="window.closeInfoWindow()" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: #a5b4fc; font-size: 18px; cursor: pointer;">&times;</button><h2 style="font-weight: bold; font-size: 18px; color: #a78bfa; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid #4338ca;">${firstEvent.venue}</h2>${eventsToShow.length > 0 ? eventsToShow.map(event => `<div style="cursor: pointer; padding: 8px 0; border-bottom: ${eventsToShow.length > 1 && eventsToShow.indexOf(event) !== eventsToShow.length - 1 ? '1px solid #312e81' : 'none'};" onclick="window.selectEventFromMap('${event.id}')"><h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 16px; color: #c7d2fe;">${event.title}</h3><p style="margin: 0; color: #a5b4fc; font-size: 14px;">${formatDate(event.start_at)} at ${formatTime(event.start_at)}</p></div>`).join('') : '<p style="margin: 0; color: #a5b4fc; font-size: 14px; text-align: center;">No upcoming events here.</p>'}${hasMoreEvents ? '<p style="text-align: center; margin-top: 8px; color: #818cf8; font-size: 12px;">...and more</p>' : ''}</div>`;
                    infoWindow.setContent(contentString);
                    infoWindow.open({ anchor: marker, map });
                });
            });
            map.addListener('click', () => infoWindow.close());
        }
    }, [events, setSelectedEvent, theme]);

    return <div className="mt-8"><div ref={mapRef} className="w-full h-[calc(100vh-280px)] rounded-xl border border-gray-200 dark:border-gray-800" /></div>;
};

const SingleEventMap = ({ event, theme }) => {
    const mapRef = useRef(null);
    useEffect(() => {
        if (mapRef.current && window.google) {
            const map = new window.google.maps.Map(mapRef.current, { center: { lat: event.lat, lng: event.lng }, zoom: 16, ...getMapOptions(theme) });
            new window.google.maps.Marker({ position: { lat: event.lat, lng: event.lng }, map: map, title: event.title });
        }
    }, [event, theme]);
    return <div ref={mapRef} className="mt-4 w-full h-64 md:h-80 rounded-lg border border-gray-200 dark:border-gray-800" />;
};

const Header = ({ setPage, isLoggedIn, setIsLoggedIn, setSelectedEvent, setViewMode, theme, setTheme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const goHome = () => { setSelectedEvent(null); setPage('events'); setViewMode('list'); setIsMenuOpen(false); }
    const navAction = (page) => { setPage(page); setIsMenuOpen(false); }
    const handleLogout = () => { setIsLoggedIn(false); setPage('events'); setIsMenuOpen(false); }

    return (
        <header className="bg-white dark:bg-[#161b22]/80 backdrop-blur-sm border-b border-gray-200 dark:border-purple-700/50 sticky top-0 z-20">
            <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <button onClick={goHome} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:text-purple-400 transition-colors">The Loop</button>
                <div className="hidden md:flex items-center space-x-2">
                    <button onClick={goHome} className="text-gray-600 dark:text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors">All Events</button>
                    {isLoggedIn && <button onClick={() => alert('My Feed is coming soon!')} className="text-gray-600 dark:text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md transition-colors">My Feed</button>}
                    {!isLoggedIn && <button onClick={() => navAction('login')} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300">Login</button>}
                    {isLoggedIn && <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300">Logout</button>}
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{theme === 'dark' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}</button>
                </div>
                <div className="md:hidden flex items-center gap-2">
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-gray-500 dark:text-gray-400">{theme === 'dark' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}</button>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 dark:text-gray-400"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg></button>
                </div>
            </nav>
            {isMenuOpen && (<div className="md:hidden bg-white dark:bg-[#161b22] border-t border-gray-200 dark:border-purple-700/50"><div className="px-2 pt-2 pb-3 space-y-1 sm:px-3"><button onClick={goHome} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md">All Events</button>{isLoggedIn && <button onClick={() => alert('My Feed is coming soon!')} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md">My Feed</button>}{!isLoggedIn && <button onClick={() => navAction('login')} className="w-full text-left block text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md">Login</button>}{isLoggedIn && <button onClick={handleLogout} className="w-full text-left block text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 px-3 py-2 rounded-md">Logout</button>}</div></div>)}
        </header>
    );
};

const EventCard = ({ event, onSelect }) => (
    <button onClick={onSelect} className="h-full w-full text-left block bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-purple-800/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-600/10 dark:hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col">
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="uppercase tracking-wide text-sm text-purple-600 dark:text-purple-400 font-bold">{event.venue}</div>
                        <h2 className="block mt-1 text-xl sm:text-2xl leading-tight font-bold text-gray-900 dark:text-white">{event.title}</h2>
                    </div>
                    <div className="flex-shrink-0 ml-4 w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center"><svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span>{formatDate(event.start_at, { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{formatTime(event.start_at)} - {formatTime(event.end_at)}</span></div>
                </div>
            </div>
            <div className="mt-6">
                {event.tags.map(tag => <Tag key={tag} text={tag} />)}
            </div>
        </div>
    </button>
);

const VenueScroller = ({ venue, events, setSelectedEvent }) => {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [itemsVisible, setItemsVisible] = useState(3);

    const updateVisibleItems = () => {
        if (window.innerWidth < 768) setItemsVisible(1);
        else if (window.innerWidth < 1024) setItemsVisible(2);
        else setItemsVisible(3);
    };

    useEffect(() => {
        updateVisibleItems();
        window.addEventListener('resize', updateVisibleItems);
        return () => window.removeEventListener('resize', updateVisibleItems);
    }, []);

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            checkScroll();
            container.addEventListener('scroll', checkScroll);
            return () => container.removeEventListener('scroll', checkScroll);
        }
    }, [events, itemsVisible]);

    const scroll = (direction) => {
        const { current } = scrollContainerRef;
        if (current) {
            const cardWidth = current.scrollWidth / events.length;
            const scrollAmount = cardWidth * itemsVisible;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (events.length <= itemsVisible) {
        return (
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{venue}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {events.map(event => <EventCard key={event.id} event={event} onSelect={() => setSelectedEvent(event)} />)}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{venue}</h2>
            <div className="relative">
                {canScrollLeft && (
                    <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-100 dark:bg-gray-800/50 p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-900 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                )}
                <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-6 md:gap-8 py-4 no-scrollbar">
                    {events.map(event => (
                        <div key={event.id} className="snap-start flex-shrink-0 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-1rem)]">
                            <EventCard event={event} onSelect={() => setSelectedEvent(event)} />
                        </div>
                    ))}
                </div>
                {canScrollRight && (
                    <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-100 dark:bg-gray-800/50 p-2 rounded-full text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-900 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
};

const EventList = ({ events, setSelectedEvent }) => {
    const eventsByVenue = events.reduce((acc, event) => {
        const venue = event.venue || 'Unknown Venue';
        if (!acc[venue]) {
            acc[venue] = [];
        }
        acc[venue].push(event);
        return acc;
    }, {});

    return (
        <div className="space-y-12 mt-8">
            {Object.entries(eventsByVenue).map(([venue, venueEvents]) => (
                <VenueScroller key={venue} venue={venue} events={venueEvents} setSelectedEvent={setSelectedEvent} />
            ))}
        </div>
    );
};

const EventDetailsPage = ({ event, mapScriptLoaded, theme }) => (
    <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-purple-800/50 rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 sm:p-8 md:p-12">
                <div className="uppercase tracking-wide text-sm text-purple-600 dark:text-purple-400 font-bold">{event.venue}</div>
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
                        {mapScriptLoaded ? <SingleEventMap event={event} theme={theme} /> : <div className="mt-4 w-full h-64 bg-slate-700 rounded-lg flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div>}
                    </div>
                    <div className="flex flex-col items-stretch gap-4 w-full md:w-auto">
                        <button className="flex items-center justify-center gap-3 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg><span>Remind Me</span></button>
                        <button onClick={() => downloadICSFile(event)} className="flex items-center justify-center gap-3 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Add to Calendar</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
);

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

const LandingPage = ({ setPage }) => (
    <div className="relative flex flex-col items-center justify-end min-h-screen text-center px-4 pb-20">
        <SplineScene />
        <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Find Your Vibe</h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl">Never miss out on what's happening on campus. The Loop is your one-stop shop for all college events.</p>
            <button onClick={() => setPage('events')} className="mt-8 bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors duration-300">Enter App</button>
        </div>
    </div>
);

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
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const GOOGLE_MAPS_API_KEY = "AIzaSyB4ahphCSv4lWERGhBVL49c-8rhfe2W3uE"; 

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/events'); 
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
  }, [viewMode, selectedEvent]);

  const renderPage = () => {
    if (page === 'landing') {
        return <LandingPage setPage={setPage} />;
    }
    if (page === 'login') {
        return <LoginPage setPage={setPage} setIsLoggedIn={setIsLoggedIn} />;
    }
    if (page === 'signup') {
        return <SignupPage setPage={setPage} />;
    }
    if (page === 'interest_selection') {
        return <InterestSelectorPage setPage={setPage} setIsLoggedIn={setIsLoggedIn} />;
    }
    if (page === 'events') {
        if (selectedEvent) {
            return <EventDetailsPage event={selectedEvent} mapScriptLoaded={mapScriptLoaded} theme={theme} />;
        }
        return <EventsContainer 
                    events={events} 
                    setSelectedEvent={setSelectedEvent} 
                    isLoading={isLoading} 
                    error={error} 
                    setViewMode={setViewMode} 
                    viewMode={viewMode}
                    mapScriptLoaded={mapScriptLoaded}
                    theme={theme}
                />;
    }
    return <LandingPage setPage={setPage} />;
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#0d1117] text-gray-100'}`}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .page-transition { animation: fadeIn 0.4s ease-in-out; }
        .gm-style-iw-d { overflow: hidden !important; }
        .gm-style .gm-style-iw-c { padding: 0 !important; border-radius: 0.75rem !important; box-shadow: none !important; background-color: transparent !important; }
        .gm-style .gm-style-iw-t::after { display: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {page !== 'landing' && <Header setPage={setPage} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setSelectedEvent={setSelectedEvent} setViewMode={setViewMode} theme={theme} setTheme={setTheme} />}
      <div key={selectedEvent ? selectedEvent.id : page} className="page-transition">
        {renderPage()}
      </div>
    </div>
  );
}
