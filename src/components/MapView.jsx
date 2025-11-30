import React, { useEffect, useRef } from 'react';
import { formatDate, formatTime } from '../lib/utils';

// Map styles (copied from App.jsx)
const lightMapStyles = [{ "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }];
const darkMapStyles = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#d59563" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#d59563" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#263c3f" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#6b9a76" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#38414e" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#212a37" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9ca5b3" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#746855" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#1f2835" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#f3d19c" }]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [{ "color": "#2f3948" }]
    },
    {
        "featureType": "transit.station",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#d59563" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#17263c" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#515c6d" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#17263c" }]
    }
];

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

export default function MapView({ events, setSelectedEvent, theme }) {
    const mapRef = useRef(null);
    const infoWindowRef = useRef(null);
    const isMobile = typeof window !== 'undefined' && (/android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(navigator.userAgent));

    useEffect(() => {
        window.selectEventFromMap = (eventId) => {
            const event = events.find(e => e.id.toString() === eventId.toString());
            if (event) setSelectedEvent(event);
        };
        window.closeInfoWindow = () => {
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
            }
        }
        window.openFirstEventFromInfoWindow = (lat, lng) => {
            const event = events.find(e => e.lat === lat && e.lng === lng);
            if (event) setSelectedEvent(event);
        };
    }, [events, setSelectedEvent]);

    useEffect(() => {
        if (mapRef.current && window.google?.maps) {
            const map = new window.google.maps.Map(mapRef.current, { center: { lat: 30.355, lng: 76.365 }, zoom: 15, ...getMapOptions(theme) });

            // Custom Pin Icon
            const pinSvg = `
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                        <feOffset dx="0" dy="1" result="offsetblur"/>
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge> 
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/> 
                        </feMerge>
                    </filter>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#6366f1" filter="url(#dropShadow)"/>
                    <circle cx="12" cy="9" r="3" fill="#ffffff"/>
                </svg>
            `;
            const pinIcon = {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 40), // Anchor at bottom tip
            };

            if (!infoWindowRef.current) {
                infoWindowRef.current = new window.google.maps.InfoWindow({ content: '' });
                infoWindowRef.current.addListener('domready', () => {
                    const iwOuter = document.querySelector('.gm-style-iw-a');
                    if (iwOuter) {
                        const iwBackground = iwOuter.parentElement;
                        iwBackground.style.setProperty('background', 'transparent', 'important');
                        iwBackground.style.setProperty('box-shadow', 'none', 'important');
                        if (iwOuter.previousElementSibling) { iwOuter.previousElementSibling.remove(); }
                    }
                    if (isMobile) {
                        const iwContent = document.querySelector('.gm-style-iw-d > div');
                        if (iwContent) {
                            iwContent.style.cursor = 'pointer';
                            iwContent.onclick = null;
                            const lat = iwContent.getAttribute('data-lat');
                            const lng = iwContent.getAttribute('data-lng');
                            if (lat && lng) {
                                iwContent.onclick = () => window.openFirstEventFromInfoWindow(Number(lat), Number(lng));
                            }
                        }
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
                const marker = new window.google.maps.Marker({
                    position: { lat: firstEvent.lat, lng: firstEvent.lng },
                    map: map,
                    title: locationEvents.map(e => e.title).join(', '),
                    animation: window.google.maps.Animation.DROP,
                    icon: pinIcon
                });

                const now = new Date();
                const upcomingEvents = locationEvents.filter(e => new Date(e.start_at) > now).sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
                let eventsToShow = upcomingEvents.slice(0, 3);
                let usingUpcoming = true;
                if (eventsToShow.length === 0) {
                    usingUpcoming = false;
                    eventsToShow = locationEvents.slice().sort((a, b) => new Date(a.start_at) - new Date(b.start_at)).slice(0, 3);
                }
                const hasMoreEvents = usingUpcoming ? upcomingEvents.length > 3 : locationEvents.length > 3;
                const subtitle = usingUpcoming ? '' : '<p style="margin:0 0 8px 0; color:#a5b4fc; font-size:13px;">Showing recent events</p>';
                const contentString = `<div style="background-color: #1e1b4b; color: #e0e7ff; border-radius: 8px; padding: 12px; font-family: sans-serif; max-width: 250px; position: relative;" class="map-hoverbox" data-lat="${firstEvent.lat}" data-lng="${firstEvent.lng}"><button onclick="window.closeInfoWindow()" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: #a5b4fc; font-size: 28px; line-height: 1; cursor: pointer; transition: color 0.2s;">&times;</button><h2 style="font-weight: bold; font-size: 18px; color: #a78bfa; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid #4338ca;">${firstEvent.venue}</h2>${subtitle}${eventsToShow.length > 0 ? eventsToShow.map(event => `<div style="cursor: pointer; padding: 8px 0; border-bottom: ${eventsToShow.length > 1 && eventsToShow.indexOf(event) !== eventsToShow.length - 1 ? '1px solid #312e81' : 'none'};" onclick="window.selectEventFromMap('${event.id}')"><h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 16px; color: #c7d2fe;">${event.title}</h3><p style="margin: 0; color: #a5b4fc; font-size: 14px;">${formatDate(event.start_at)} at ${formatTime(event.start_at)}</p></div>`).join('') : '<p style="margin: 0; color: #a5b4fc; font-size: 14px; text-align: center;">No events found.</p>'}${hasMoreEvents ? '<p style="text-align: center; margin-top: 8px; color: #818cf8; font-size: 12px;">...and more</p>' : ''}</div>`;

                marker.addListener('mouseover', () => {
                    if (!isMobile) {
                        infoWindow.setContent(contentString);
                        infoWindow.open({ anchor: marker, map });
                    }
                });
                marker.addListener('click', () => {
                    if (isMobile) {
                        infoWindow.setContent(contentString);
                        infoWindow.open({ anchor: marker, map });
                    }
                });
            });
            map.addListener('click', () => infoWindow.close());
        }
    }, [events, setSelectedEvent, theme]);

    return <div className="mt-8"><div ref={mapRef} className="w-full h-[calc(100vh-280px)] rounded-xl border border-gray-200 dark:border-gray-800" /></div>;
}
