import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const ChatWidget = () => {
    const { user, isAuthenticated } = useAuth();
    const { socket } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            fetchContacts();
        }
    }, [isOpen, isAuthenticated]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;
        
        const handleNewMessage = (message) => {
            // Update current active chat
            if (activeChat && (message.sender._id === activeChat._id || message.receiver === activeChat._id)) {
                setMessages(prev => [...prev, message]);
            }
            // Update contacts list last message & unread
            fetchContacts();
        };

        socket.on('new_message', handleNewMessage);
        return () => socket.off('new_message', handleNewMessage);
    }, [socket, activeChat]);

    const fetchContacts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/chat/contacts', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setContacts(res.data);
        } catch (err) {
            console.error('Failed to fetch contacts', err);
        }
    };

    const fetchMessages = async (contact) => {
        try {
            const chatId = [user._id || user.id, contact._id].sort().join('_');
            const res = await axios.get(`http://localhost:5000/api/chat/${chatId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(res.data);
            setActiveChat(contact);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const res = await axios.post('http://localhost:5000/api/chat/send', {
                receiverId: activeChat._id,
                content: newMessage
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // The socket 'new_message' will pick this up to add to state, but we can do it optimistically too:
            // setMessages(prev => [...prev, res.data]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    if (!isAuthenticated) return null;

    const unreadTotal = contacts.reduce((acc, c) => acc + (c.chatDetails?.unread || 0), 0);

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-[350px] md:w-[400px] h-[550px] max-h-[80vh] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {!activeChat ? (
                            <>
                                <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1e293b]">
                                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm flex items-center justify-between">
                                        Messages
                                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={18} /></button>
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto w-full p-2">
                                    {contacts.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 font-bold text-sm">
                                            <MessageSquare size={32} className="mb-4 opacity-20" />
                                            No recent conversations.
                                        </div>
                                    ) : (
                                        contacts.map(c => (
                                            <div 
                                                key={c.user._id} 
                                                onClick={() => fetchMessages(c.user)}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black tracking-widest uppercase shrink-0">
                                                    {c.user.name.substring(0, 2)}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-black text-slate-800 dark:text-slate-200 truncate">{c.user.name}</h4>
                                                        {c.chatDetails.unread > 0 && (
                                                            <span className="w-5 h-5 rounded-full bg-indigo-500 text-[10px] font-black text-white flex items-center justify-center">{c.chatDetails.unread}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold truncate mt-1">{c.chatDetails.lastMessage}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1e293b] flex items-center gap-3">
                                    <button onClick={() => setActiveChat(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
                                        <X size={18} />
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-[10px] uppercase">
                                        {activeChat.name.substring(0,2)}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-black text-sm text-slate-800 dark:text-white truncate">{activeChat.name}</h4>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-transparent">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender._id === (user._id || user.id);
                                        return (
                                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-tl-sm'}`}>
                                                    {msg.content}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest px-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a]">
                                    <form onSubmit={sendMessage} className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-slate-100 dark:bg-white/5 border-none rounded-full px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-800 dark:text-white"
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={!newMessage.trim()}
                                            className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                        >
                                            <Send size={18} className="translate-x-[1px] translate-y-[-1px]" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all transform hover:scale-110 active:scale-95 z-50 relative ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-indigo-600 shadow-indigo-500/30'}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full animate-pulse border-2 border-[#0f172a]">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
