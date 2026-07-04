import React, { useEffect, useRef } from 'react';
import { formatDate, formatTime, parseLocalDate } from '../lib/utils';
import { getMapOptions } from '../lib/mapStyles';

export default function MapView({ events, setSelectedEvent, theme }) {
    const mapRef = useRef(null);
    const infoWindowRef = useRef(null);
    const isMobile = typeof window !== 'undefined' && (/android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(navigator.userAgent));

    const setSelectedEventRef = useRef(setSelectedEvent);

    useEffect(() => {
        setSelectedEventRef.current = setSelectedEvent;
    }, [setSelectedEvent]);

    useEffect(() => {
        window.selectEventFromMap = (eventId) => {
            const event = events.find(e => e.id.toString() === eventId.toString());
            if (event) setSelectedEventRef.current(event);
        };
        window.closeInfoWindow = () => {
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
            }
        }
        window.openFirstEventFromInfoWindow = (lat, lng) => {
            const event = events.find(e => e.lat === lat && e.lng === lng);
            if (event) setSelectedEventRef.current(event);
        };
    }, [events]);

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
                const upcomingEvents = locationEvents.filter(e => parseLocalDate(e.start_at) > now).sort((a, b) => parseLocalDate(a.start_at) - parseLocalDate(b.start_at));
                let eventsToShow = upcomingEvents.slice(0, 3);
                let usingUpcoming = true;
                if (eventsToShow.length === 0) {
                    usingUpcoming = false;
                    eventsToShow = locationEvents.slice().sort((a, b) => parseLocalDate(a.start_at) - parseLocalDate(b.start_at)).slice(0, 3);
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
    }, [events, theme]);

    return <div className="mt-8"><div ref={mapRef} className="w-full h-[calc(100vh-280px)] rounded-xl border border-gray-200 dark:border-gray-800" /></div>;
}
