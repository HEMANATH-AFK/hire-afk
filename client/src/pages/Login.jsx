import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
            // Shake effect handled by Framer Motion on the error state
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="glass p-10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
                style={{
                    animation: error ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none'
                }}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400" />
                <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-8 flex items-center gap-2 text-slate-900 dark:text-white">
                    <LogIn className="text-indigo-600 dark:text-indigo-400" /> Welcome Back
                </motion.h2>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-500 px-4 py-2 rounded-lg mb-6 text-sm overflow-hidden font-bold"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#1e293b]/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#1e293b]/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-12 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-black text-lg transition-all shadow-lg shadow-indigo-500/20 text-white"
                    >
                        Sign In
                    </motion.button>
                </form>

                <motion.p variants={itemVariants} className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    New to Hire AFK? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">Create an account</Link>
                </motion.p>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                  10%, 90% { transform: translate3d(-1px, 0, 0); }
                  20%, 80% { transform: translate3d(2px, 0, 0); }
                  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                  40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}} />
        </div>
    );
};

export default Login;
