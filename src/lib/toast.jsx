import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

// Minimal dependency-free toast store. Call toast.success/error/info from
// anywhere; a single <Toaster /> mounted at the root renders the queue.
let listeners = [];
let toasts = [];
let counter = 0;

const emit = () => listeners.forEach((l) => l(toasts));

const remove = (id) => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
};

const add = (message, type, duration = 4000) => {
    const id = ++counter;
    toasts = [...toasts, { id, message, type }];
    emit();
    if (duration) setTimeout(() => remove(id), duration);
    return id;
};

export const toast = {
    success: (message, duration) => add(message, 'success', duration),
    error: (message, duration) => add(message, 'error', duration),
    info: (message, duration) => add(message, 'info', duration),
    dismiss: remove,
};

const STYLES = {
    success: { icon: CheckCircle2, ring: 'border-green-500/40', accent: 'text-green-400' },
    error: { icon: XCircle, ring: 'border-red-500/40', accent: 'text-red-400' },
    info: { icon: Info, ring: 'border-purple-500/40', accent: 'text-purple-300' },
};

export function Toaster() {
    const [items, setItems] = useState(toasts);

    useEffect(() => {
        listeners.push(setItems);
        return () => {
            listeners = listeners.filter((l) => l !== setItems);
        };
    }, []);

    return createPortal(
        <div
            aria-live="polite"
            aria-atomic="false"
            className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[min(92vw,360px)] pointer-events-none"
        >
            <AnimatePresence initial={false}>
                {items.map(({ id, message, type }) => {
                    const { icon: Icon, ring, accent } = STYLES[type] || STYLES.info;
                    return (
                        <motion.div
                            key={id}
                            layout
                            initial={{ opacity: 0, y: -12, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 24, scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                            role="status"
                            className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${ring} bg-[#0a0a0a]/90 backdrop-blur-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)]`}
                        >
                            <Icon size={18} className={`${accent} mt-0.5 shrink-0`} />
                            <span className="text-sm text-white/90 leading-snug flex-1">{message}</span>
                            <button
                                onClick={() => remove(id)}
                                aria-label="Dismiss notification"
                                className="text-white/40 hover:text-white/80 transition-colors shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>,
        document.body
    );
}
