import React from 'react';
import { formatDate, formatTime, Tag } from '../lib/utils';

export default function EventCard({ event, onSelect }) {
    const score = event.match_percentage || 0;
    const isJoined = event.is_joined;

    return (
        <button onClick={onSelect} className="h-full w-full text-left block bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-600/20 dark:hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col relative">
            {isJoined && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    Joined
                </div>
            )}
            {/* Compatibility Bar - Option 2 (Neon Gradients) */}
            {score > 0 && !isJoined && (
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800">
                    <div
                        className={`h-full ${score >= 90 ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-lime-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]' :
                                score >= 70 ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]' :
                                    'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]'
                            } transition-all duration-1000 ease-out`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            )}
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
}
