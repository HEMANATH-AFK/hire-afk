import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Briefcase, Shield, Menu, X, Rocket, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Explore Jobs', path: '/jobs', icon: Briefcase, show: true },
        {
            name: user?.role === 'admin' ? 'Admin Panel' : user?.role === 'recruiter' ? 'Recruiter Center' : 'Dashboard',
            path: user?.role === 'admin' ? '/admin' : user?.role === 'recruiter' ? '/recruiter' : '/dashboard',
            icon: user?.role === 'admin' ? Shield : Rocket,
            show: !!user
        },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
                        <Rocket className="text-white" size={20} />
                    </div>
                    <span className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">Hire AFK</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {navLinks.filter(l => l.show).map(link => (
                        <Link key={link.name} to={link.path} className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2">
                            <link.icon size={16} /> {link.name}
                        </Link>
                    ))}

                    {user && <NotificationCenter />}

                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-6 pl-6 border-l border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">{user.role}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white">Login</Link>
                            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-600/20">Sign Up</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 dark:text-slate-300">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl transition-colors duration-300"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navLinks.filter(l => l.show).map(link => (
                                <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="text-xl font-bold text-slate-600 dark:text-slate-300 flex items-center gap-3 active:text-indigo-600">
                                    <link.icon size={20} /> {link.name}
                                </Link>
                            ))}
                            {user ? (
                                <button onClick={handleLogout} className="text-xl font-bold text-red-500 flex items-center gap-3 mt-4">
                                    <LogOut size={20} /> Logout
                                </button>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-xl font-bold text-slate-600 dark:text-slate-300">Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="bg-indigo-600 py-4 rounded-2xl text-center font-bold text-white shadow-lg shadow-indigo-600/20">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
