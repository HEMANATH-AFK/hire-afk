import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Bell, X, Check, Info, Rocket, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState(null);
    const socketRef = useRef();

    useEffect(() => {
        if (!user) return;

        // Connect to Socket.io
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('connect', () => {
            console.log('[SOCKET] Connected to server');
            socketRef.current.emit('join_room', user._id);
        });

        const handleNewNotification = (data) => {
            console.log('[SOCKET] Received notification:', data);
            const newNotif = {
                id: Date.now(),
                ...data,
                read: false,
                timestamp: new Date()
            };
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast
            setToast(newNotif);
            setTimeout(() => setToast(null), 5000);
        };

        socketRef.current.on('status_updated', handleNewNotification);
        socketRef.current.on('auto_applied', handleNewNotification);
        socketRef.current.on('new_application', handleNewNotification);

        return () => {
            socketRef.current.disconnect();
        };
    }, [user]);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
    };

    const getIcon = (status) => {
        if (status === 'accepted') return <Check size={14} className="text-green-500" />;
        if (status === 'rejected') return <X size={14} className="text-red-500" />;
        if (status === 'pending') return <Info size={14} className="text-blue-500" />;
        return <Rocket size={14} className="text-indigo-500" />;
    };

    if (!user) return null;

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0f172a]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-80 md:w-96 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 p-2"
                        >
                            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 mb-2">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button onClick={clearAll} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors">Clear All</button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto space-y-1 custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Bell className="text-slate-300 dark:text-slate-600" size={20} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400">All caught up!</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id)}
                                            className={`p-4 rounded-2xl transition-all cursor-pointer flex gap-3 ${notif.read ? 'opacity-60' : 'bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm'}`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/10">
                                                {getIcon(notif.status)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{notif.company || 'System'}</p>
                                                    <span className="text-[9px] font-bold text-slate-400">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{notif.message}</p>
                                            </div>
                                            {!notif.read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Real-time Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-10 right-10 z-[100] bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10 max-w-sm"
                    >
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
                            <Rocket size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-600 mb-1">New Update</p>
                            <p className="text-sm font-bold leading-tight line-clamp-2">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 dark:hover:bg-black/5 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
