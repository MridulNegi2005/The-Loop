import React, { useState, useEffect, useRef } from 'react';
import EventCard from './EventCard';
import { formatDate } from '../lib/utils';
import { useLocation } from 'react-router-dom';

export default function EventList({ events, setSelectedEvent }) {
    const eventsByDate = events.reduce((acc, event) => {
        const dateKey = new Date(event.start_at).toISOString().slice(0, 10);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(event);
        return acc;
    }, {});
    const sortedDates = Object.keys(eventsByDate).sort();
    const [selectedDate, setSelectedDate] = useState(sortedDates[0] || null);
    const sectionRefs = useRef({});
    const gridContainerRef = useRef(null);
    const mobileTimelineRef = useRef(null);
    const isManualScrollRef = useRef(false);
    const manualScrollTimeoutRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [dotsVisible, setDotsVisible] = useState(7);
    const timelineListRef = useRef(null);
    const location = useLocation();

    const SCROLL_DURATION = 700;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const animateScroll = (container, targetScrollTop, duration = SCROLL_DURATION) => {
        if (!container) return Promise.resolve();
        const start = container.scrollTop;
        const change = targetScrollTop - start;
        if (change === 0) return Promise.resolve();
        let startTime = null;
        return new Promise((resolve) => {
            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const t = Math.min(1, elapsed / duration);
                const eased = easeOutCubic(t);
                container.scrollTop = start + change * eased;
                if (elapsed < duration) requestAnimationFrame(step);
                else { container.scrollTop = targetScrollTop; resolve(); }
            };
            requestAnimationFrame(step);
        });
    };

    const animateScrollX = (container, targetScrollLeft, duration = SCROLL_DURATION) => {
        if (!container) return Promise.resolve();
        const start = container.scrollLeft;
        const change = targetScrollLeft - start;
        if (change === 0) return Promise.resolve();
        let startTime = null;
        return new Promise((resolve) => {
            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const t = Math.min(1, elapsed / duration);
                const eased = easeOutCubic(t);
                container.scrollLeft = start + change * eased;
                if (elapsed < duration) requestAnimationFrame(step);
                else { container.scrollLeft = targetScrollLeft; resolve(); }
            };
            requestAnimationFrame(step);
        });
    };

    useEffect(() => {
        function updateDotsVisible() {
            let container = null;
            if (timelineListRef.current) {
                container = timelineListRef.current.closest('aside') || timelineListRef.current.parentElement;
            }
            const minDotHeight = 56;
            let maxDots = 7;
            if (container) {
                const height = container.clientHeight || window.innerHeight * 0.7;
                maxDots = Math.max(3, Math.floor(height / minDotHeight));
            } else {
                if (window.innerWidth < 640) maxDots = 5;
                else if (window.innerWidth < 1024) maxDots = 7;
                else maxDots = 9;
            }
            setDotsVisible(maxDots);
        }
        updateDotsVisible();
        window.addEventListener('resize', updateDotsVisible);
        return () => window.removeEventListener('resize', updateDotsVisible);
    }, []);

    useEffect(() => {
        const observer = new window.IntersectionObserver(
            (entries) => {
                if (isManualScrollRef.current) return;
                const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) {
                    const date = visible[0].target.getAttribute('data-date');
                    const idx = sortedDates.indexOf(date);
                    if (date && date !== selectedDate) setSelectedDate(date);
                    if (idx !== -1 && idx !== activeIndex) setActiveIndex(idx);
                }
            },
            { root: gridContainerRef.current, threshold: 0.5 }
        );
        sortedDates.forEach(date => {
            if (sectionRefs.current[date]) observer.observe(sectionRefs.current[date]);
        });
        return () => observer.disconnect();
    }, [sortedDates]);

    useEffect(() => {
        return () => {
            if (manualScrollTimeoutRef.current) {
                clearTimeout(manualScrollTimeoutRef.current);
                manualScrollTimeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (timelineListRef.current && window.innerWidth >= 768) {
            const container = timelineListRef.current;
            const activeDot = container.querySelector('.timeline-dot-active');
            if (activeDot) {
                const containerRect = container.getBoundingClientRect();
                const dotRect = activeDot.getBoundingClientRect();
                const target = Math.round(container.scrollTop + (dotRect.top - containerRect.top) - container.clientHeight / 2 + dotRect.height / 2);
                animateScroll(container, target, SCROLL_DURATION);
            }
        }
        if (mobileTimelineRef.current && window.innerWidth < 768) {
            const mcont = mobileTimelineRef.current;
            const dots = mcont.querySelectorAll('button');
            const active = dots[activeIndex];
            if (active) {
                const targetLeft = Math.round(active.offsetLeft - (mcont.clientWidth / 2) + (active.clientWidth / 2));
                animateScrollX(mcont, targetLeft, SCROLL_DURATION);
            }
        }
    }, [activeIndex]);

    useEffect(() => {
        if (location && location.pathname && location.pathname.startsWith('/events')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [location.pathname]);

    const handleTimelineClick = async (date, idx) => {
        isManualScrollRef.current = true;
        if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
        manualScrollTimeoutRef.current = setTimeout(() => {
            isManualScrollRef.current = false;
            manualScrollTimeoutRef.current = null;
        }, SCROLL_DURATION + 120);
        setSelectedDate(date);
        setActiveIndex(idx);
        const section = sectionRefs.current[date];
        const grid = gridContainerRef.current;
        const timeline = timelineListRef.current;
        const promises = [];
        if (section && grid) {
            const gridRect = grid.getBoundingClientRect();
            const secRect = section.getBoundingClientRect();
            const targetGrid = Math.round(grid.scrollTop + (secRect.top - gridRect.top));
            promises.push(animateScroll(grid, targetGrid, SCROLL_DURATION));
        }
        if (timeline && window.innerWidth >= 768) {
            const containerRect = timeline.getBoundingClientRect();
            const dotEl = timeline.querySelectorAll('.timeline-dot')[idx];
            if (dotEl) {
                const dotRect = dotEl.getBoundingClientRect();
                const targetTimeline = Math.round(timeline.scrollTop + (dotRect.top - containerRect.top) - timeline.clientHeight / 2 + dotRect.height / 2);
                promises.push(animateScroll(timeline, targetTimeline, SCROLL_DURATION));
            }
        }
        if (mobileTimelineRef.current && window.innerWidth < 768) {
            const mcont = mobileTimelineRef.current;
            const dotEl = mcont.querySelectorAll('button')[idx];
            if (dotEl) {
                const targetLeft = Math.round(dotEl.offsetLeft - (mcont.clientWidth / 2) + (dotEl.clientWidth / 2));
                promises.push(animateScrollX(mcont, targetLeft, SCROLL_DURATION));
            }
        }
        try {
            await Promise.all(promises);
        } catch (e) {
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 mt-8">
            <div className="block md:hidden w-full">
                <div className="relative">
                    <div className="mobile-line" />
                    <div ref={mobileTimelineRef} className="mobile-timeline flex items-center gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 py-3" style={{ touchAction: 'pan-x', overscrollBehavior: 'contain' }}>
                        {sortedDates.map((date, idx) => {
                            const distance = Math.abs(idx - activeIndex);
                            const opacity = activeIndex === idx ? 1 : Math.max(0.12, 1 - distance * 0.28);
                            const scale = activeIndex === idx ? 1 : 1 - Math.min(distance * 0.03, 0.12);
                            const mobileBtnStyle = {
                                opacity,
                                transform: `scale(${scale})`,
                                transition: 'transform 0.28s cubic-bezier(.2,.9,.2,1), opacity 0.28s ease'
                            };
                            return (
                                <button key={date} className={`timeline-dot ${activeIndex === idx ? 'timeline-dot-active' : ''} flex-shrink-0 snap-center`} onClick={() => handleTimelineClick(date, idx)} style={mobileBtnStyle}>
                                    <span className={`mobile-dot w-14 h-10 flex items-center justify-center rounded-full border-2 text-sm select-none ${activeIndex === idx ? 'border-purple-500 bg-purple-700 text-white shadow-lg shadow-purple-400/60' : 'border-purple-400 bg-white dark:bg-[#161b22] text-purple-700 dark:text-purple-200'}`}>
                                        {formatDate(date, { month: 'short', day: 'numeric' })}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <aside className="hidden md:flex md:w-1/4 flex-shrink-0 justify-center">
                <div className="relative flex md:block md:h-full md:min-h-[400px]">
                    <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-purple-400/60 to-purple-900/30 rounded-full" style={{ transform: 'translateX(-50%)' }} />
                    <div
                        ref={timelineListRef}
                        className="flex md:flex-col items-center md:items-stretch w-full md:w-auto z-10 md:max-h-[70vh] md:overflow-y-auto no-scrollbar relative pt-6 pb-6 md:pt-10 md:pb-10 md:px-10"
                        style={{ position: 'relative', minHeight: 200, height: '100%' }}
                    >
                        {sortedDates.map((date, idx) => {
                            const half = Math.floor(dotsVisible / 2);
                            const distance = Math.abs(idx - activeIndex);
                            const opacity = activeIndex === idx ? 1 : Math.max(0.12, 1 - distance * 0.28);
                            const scale = activeIndex === idx ? 1 : 1 - Math.min(distance * 0.03, 0.12);
                            const btnStyle = {
                                zIndex: 20,
                                background: 'none',
                                border: 'none',
                                outline: 'none',
                                cursor: 'pointer',
                                position: 'relative',
                                opacity,
                                transform: `scale(${scale})`,
                                transition: 'transform 0.28s cubic-bezier(.2,.9,.2,1), opacity 0.28s ease'
                            };
                            return (
                                <div key={date} className="flex flex-col items-center">
                                    <button
                                        className={`timeline-dot ${activeIndex === idx ? 'timeline-dot-active' : ''} flex flex-col items-center justify-center mb-0 md:mb-0`}
                                        onClick={() => handleTimelineClick(date, idx)}
                                        style={btnStyle}
                                    >
                                        <span
                                            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-xs font-bold select-none ${activeIndex === idx ? 'border-purple-500 bg-purple-700 text-white shadow-lg shadow-purple-400/60 animate-pulse' : 'border-purple-400 bg-white dark:bg-[#161b22] text-purple-700 dark:text-purple-200'}`}
                                            style={{ boxShadow: activeIndex === idx ? '0 0 0 4px #a78bfa55' : 'none', transition: 'box-shadow 0.2s' }}
                                        >
                                            {formatDate(date, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </button>
                                    {idx < sortedDates.length - 1 && (
                                        <div style={{ height: 40 }} className="hidden md:block w-1 mx-auto bg-transparent" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>

            <section className="flex-1 max-h-[70vh] overflow-y-auto no-scrollbar" ref={gridContainerRef} id="event-grid">
                {sortedDates.map(date => (
                    <div
                        key={date}
                        data-date={date}
                        ref={el => (sectionRefs.current[date] = el)}
                        className="mb-12"
                    >
                        <div className={`bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-purple-800/50 shadow-lg p-6 md:p-10 ${selectedDate === date ? '' : 'opacity-80'}`}>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                <span className="inline-block w-3 h-3 rounded-full bg-purple-500" />
                                {formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {eventsByDate[date].map(event => (
                                    <div key={event.id} className="h-full">
                                        <EventCard event={event} onSelect={() => setSelectedEvent(event)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}
