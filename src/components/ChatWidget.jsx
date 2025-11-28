import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, ChevronLeft, Edit, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWidget({
    currentUser,
    friends,
    activeFriend,
    setActiveFriend,
    messages,
    onSendMessage,
    onClose,
    isMobile
}) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [view, setView] = useState(activeFriend ? 'chat' : 'list'); // 'list' or 'chat'
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (activeFriend) {
            setView('chat');
            setIsMinimized(false);
        } else {
            setView('list');
        }
    }, [activeFriend]);

    useEffect(() => {
        if (view === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            if (!isMobile) {
                inputRef.current?.focus();
            }
        }
    }, [messages, view, isMobile]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleBackToList = () => {
        setActiveFriend(null);
        setView('list');
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AnimatePresence>
            {isMinimized ? (
                <motion.button
                    key="minimized"
                    layoutId="chat-widget"
                    onClick={() => setIsMinimized(false)}
                    className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center overflow-hidden"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    aria-label="Open Chat"
                >
                    <motion.div
                        className="relative"
                        layoutId="chat-icon"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <MessageCircle size={28} />
                    </motion.div>
                </motion.button>
            ) : (
                <motion.div
                    key="expanded"
                    layoutId="chat-widget"
                    className={`fixed bottom-0 right-4 md:right-8 z-50 bg-white dark:bg-slate-900 shadow-2xl rounded-t-xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden ${isMobile ? 'w-[90vw] right-5 bottom-4 rounded-xl h-[60vh]' : 'w-80 md:w-96 h-[500px]'}`}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        transition={{ delay: 0.2, duration: 0.2 }}
                        className="flex flex-col h-full"
                    >
                        {/* Header */}
                        <div className="bg-white dark:bg-slate-900 p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {view === 'chat' && (
                                    <button onClick={handleBackToList} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors mr-1">
                                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                                    </button>
                                )}

                                {view === 'list' ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <img
                                                src={`https://api.dicebear.com/9.x/initials/svg?seed=${currentUser?.username}`}
                                                alt="Avatar"
                                                className="w-8 h-8 rounded-full border border-gray-200"
                                            />
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                                        </div>
                                        <span className="font-bold text-lg text-gray-900 dark:text-white">Messages</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                                            {activeFriend?.username[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">@{activeFriend?.username}</span>
                                            <span className="text-[10px] text-green-500 font-medium">Active now</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsMinimized(true)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <Minimize2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
                            {view === 'list' ? (
                                <div className="p-2">
                                    {friends.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full py-10 text-gray-500">
                                            <MessageCircle size={48} className="mb-2 opacity-20" />
                                            <p>No friends yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {friends.map(friend => (
                                                <div
                                                    key={friend.id}
                                                    onClick={() => setActiveFriend(friend)}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                                                >
                                                    <div className="relative">
                                                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg">
                                                            {friend.username[0].toUpperCase()}
                                                        </div>
                                                        {/* Online indicator simulation */}
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <h4 className="font-medium text-gray-900 dark:text-white truncate">@{friend.username}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            Click to start chatting
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 space-y-4">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender_id === currentUser.id;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${isMe
                                                    ? 'bg-purple-600 text-white rounded-br-none'
                                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-bl-none'
                                                    }`}>
                                                    <p>{msg.content}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Footer (Input) - Only in Chat View */}
                        {view === 'chat' && (
                            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900">
                                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                    <div className="flex-grow relative bg-gray-100 dark:bg-slate-800 rounded-full border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-600 transition-all">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Message..."
                                            className="w-full px-4 py-2 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-500"
                                        />
                                    </div>
                                    {inputValue.trim() && (
                                        <button
                                            type="submit"
                                            className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors px-2"
                                        >
                                            Send
                                        </button>
                                    )}
                                </form>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
