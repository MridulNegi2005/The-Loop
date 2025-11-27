import React from 'react';

export const formatDate = (dateString, options = { month: 'short', day: 'numeric' }) => {
  return new Date(dateString).toLocaleDateString(undefined, options);
};
export const formatTime = (dateString) => {
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};
export const formatICSDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');

export const addToCalendar = (event) => {
  const isAndroid = /android/i.test(navigator.userAgent);
  const formatGoogleDate = (dateString) => {
    const d = new Date(dateString);
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  if (isAndroid) {
    const start = formatGoogleDate(event.start_at);
    const end = formatGoogleDate(event.end_at);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;
    window.open(url, '_blank');
  } else {
    const escapeText = (text) => text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\n');
    const icsContent = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `UID:${event.id}@theloop.com`, `DTSTAMP:${formatICSDate(new Date())}`, `DTSTART:${formatICSDate(new Date(event.start_at))}`, `DTEND:${formatICSDate(new Date(event.end_at))}`, `SUMMARY:${escapeText(event.title)}`, `DESCRIPTION:${escapeText(event.description)}`, `LOCATION:${escapeText(event.venue)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/ /g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const Tag = ({ text }) => {
  const tagColors = {
    productive: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:border dark:border-blue-700',
    chill: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border dark:border-green-700',
    wild: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 dark:border dark:border-purple-700',
    tech: 'bg-indigo-100 text-indigo-800 dark:bg-violet-900/50 dark:text-violet-300 dark:border dark:border-violet-700',
    music: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 dark:border dark:border-pink-700',
    art: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border dark:border-yellow-700',
    fest: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 dark:border dark:border-red-700',
    dance: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 dark:border dark:border-teal-700',
    dancing: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 dark:border dark:border-teal-700',
    'late-night': 'bg-gray-200 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 dark:border dark:border-gray-600',
    workshop: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 dark:border dark:border-orange-700',
    hackathon: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border dark:border-cyan-700',
    sports: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border dark:border-emerald-700',
    party: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 dark:border dark:border-rose-700',
    clubbing: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300 dark:border dark:border-fuchsia-700',
    movie: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 dark:border dark:border-sky-700',
    singing: 'bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300 dark:border dark:border-lime-700',
    gaming: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300 dark:border dark:border-violet-700',
    food: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 dark:border dark:border-amber-700',
    comedy: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 dark:border dark:border-orange-700',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 dark:border dark:border-gray-700'
  };
  const colorClass = tagColors[text] || tagColors.default;
  return React.createElement('span', { className: `inline-block rounded-full px-3 py-1 text-xs sm:text-sm font-semibold mr-2 mb-2 ${colorClass}` }, `#${text}`);
};
