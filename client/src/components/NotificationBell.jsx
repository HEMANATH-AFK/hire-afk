import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { AnimatePresence, motion } from 'framer-motion';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { socket } = useSocket();
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!socket) return;
        
        const handleNewNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 text-[10px] font-black text-white rounded-full flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 glass bg-white/90 dark:bg-[#0f172a]/95 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-1"
                                >
                                    <Check size={12} /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif._id} 
                                        onClick={() => !notif.read && markAsRead(notif._id)}
                                        className={`p-4 border-b border-slate-100 dark:border-white/5 transition-colors cursor-pointer ${notif.read ? 'opacity-50 hover:opacity-100' : 'bg-indigo-50/50 dark:bg-indigo-500/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                <Bell size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${notif.read ? 'text-slate-600 dark:text-slate-400 font-medium' : 'text-slate-800 dark:text-slate-200 font-bold'}`}>
                                                    {notif.message}
                                                </p>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2 block">
                                                    {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
