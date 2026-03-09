import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
    ShieldCheck,
    Activity,
    Users,
    Briefcase,
    AlertTriangle,
    UserX,
    Clock,
    ArrowRight,
    Search,
    ChevronRight,
    Database,
    Lock,
    Command,
    Bell,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const colorMap = {
    blue: {
        bg: 'bg-blue-600/10',
        bgHover: 'group-hover:bg-blue-600/20',
        iconBg: 'bg-blue-600/10',
        iconBorder: 'border-blue-600/20',
        iconText: 'text-blue-400'
    },
    indigo: {
        bg: 'bg-indigo-600/10',
        bgHover: 'group-hover:bg-indigo-600/20',
        iconBg: 'bg-indigo-600/10',
        iconBorder: 'border-indigo-600/20',
        iconText: 'text-indigo-400'
    },
    red: {
        bg: 'bg-red-600/10',
        bgHover: 'group-hover:bg-red-600/20',
        iconBg: 'bg-red-600/10',
        iconBorder: 'border-red-600/20',
        iconText: 'text-red-400'
    },
    emerald: {
        bg: 'bg-emerald-600/10',
        bgHover: 'group-hover:bg-emerald-600/20',
        iconBg: 'bg-emerald-600/10',
        iconBorder: 'border-emerald-600/20',
        iconText: 'text-emerald-400'
    }
};

const AnimatedCounter = ({ value, duration = 2 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (start === end) return;
        let totalMiliseconds = duration * 1000;
        let incrementTime = totalMiliseconds / end;
        let timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);
        return () => clearInterval(timer);
    }, [value, duration]);
    return <span>{count}</span>;
};

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 transition-all ${colorMap[color].bg} ${colorMap[color].bgHover}`} />
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">{label}</p>
                <h4 className="text-4xl font-black text-white mb-2 tracking-tighter">
                    <AnimatedCounter value={value} />
                </h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{sub}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all ${colorMap[color].iconBg} ${colorMap[color].iconBorder} ${colorMap[color].iconText}`}>
                <Icon size={24} />
            </div>
        </div>
    </motion.div>
);

const ActivityFeed = () => {
    const activities = [
        { id: 1, type: 'report', text: 'New report filed against Recruiter ID #502', time: '2m ago' },
        { id: 2, type: 'user', text: 'New student registration: Alex M.', time: '5m ago' },
        { id: 3, type: 'job', text: 'New job listing: Senior React Dev at TechFlow', time: '12m ago' },
        { id: 4, type: 'ban', text: 'User accounts restricted for spam behavior', time: '18m ago' },
        { id: 5, type: 'auth', text: 'System backup initiated successfully', time: '25m ago' },
        { id: 6, type: 'verify', text: 'Recruiter "CloudCorp" verified', time: '30m ago' },
    ];

    return (
        <div className="space-y-4">
            {activities.map((act) => (
                <div key={act.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                    <div className={`w-2 h-2 rounded-full ${act.type === 'report' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-blue-500 shadow-[0_0_8px_blue]'}`} />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-300">{act.text}</p>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase">{act.time}</span>
                </div>
            ))}
        </div>
    );
};

const SystemHealthGraph = () => (
    <div className="h-48 w-full flex items-end gap-2 overflow-hidden px-4">
        {[40, 60, 45, 90, 65, 80, 50, 70, 85, 40, 55, 75, 90, 60, 100].map((h, i) => (
            <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.05 }}
                className={`flex-1 rounded-t-sm transition-all duration-500 ${h > 80 ? 'bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}
            />
        ))}
    </div>
);

const AdminLanding = ({ user }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isOverride, setIsOverride] = useState(false);
    const [inputBuffer, setInputBuffer] = useState('');
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const newBuffer = (inputBuffer + e.key).slice(-8); // 'override' is 8 chars
            setInputBuffer(newBuffer);

            if (newBuffer === 'override') {
                setIsOverride(true);
                setTimeout(() => setIsOverride(false), 5000); // 5 seconds of glory
                setInputBuffer('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputBuffer]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className={`bg-[#020202] min-h-screen text-white selection:bg-red-500/30 font-sans overflow-x-hidden transition-all duration-1000 ${isOverride ? 'brightness-125 saturate-150' : ''}`}>
            {/* Override Overlay */}
            <AnimatePresence>
                {isOverride && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-red-600/10 pointer-events-none flex items-center justify-center overflow-hidden"
                    >
                        {/* Rapid Scanning Lines */}
                        <div className="absolute inset-0 opacity-20">
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="h-[2px] w-full bg-red-500 absolute"
                                    animate={{ top: ['-10%', '110%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                />
                            ))}
                        </div>
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-black/80 backdrop-blur-2xl px-20 py-10 rounded-full border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                        >
                            <h2 className="text-5xl font-black text-red-500 tracking-[0.2em] animate-pulse italic">
                                SYSTEM OVERRIDE ACTIVATED
                            </h2>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Grid & Mouse Follow Glow */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className={`absolute inset-0 transition-opacity duration-1000 ${isOverride ? 'opacity-20' : 'opacity-[0.03]'}`}
                    style={{
                        backgroundImage: `linear-gradient(${isOverride ? '#f00' : '#fff'} 1px, transparent 1px), linear-gradient(90deg, ${isOverride ? '#f00' : '#fff'} 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                <div
                    className="absolute w-[800px] h-[800px] rounded-full blur-[150px] opacity-10"
                    style={{
                        background: isOverride
                            ? `red`
                            : `radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)`,
                        left: mousePos.x - 400,
                        top: mousePos.y - 400,
                        transition: 'transform 0.1s ease-out'
                    }}
                />
            </div>

            {/* Sidebar Mockup */}
            <div className="fixed left-0 top-0 bottom-0 w-20 border-r border-white/5 bg-black/40 backdrop-blur-3xl z-50 flex flex-col items-center py-10 gap-8 hidden lg:flex">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                    <Command size={24} />
                </div>
                {[Lock, Database, Users, Bell, Activity].map((Icon, i) => (
                    <div key={i} className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer relative group">
                        <Icon size={20} />
                        {i === 0 && <div className="absolute right-0 top-3 w-1 h-6 bg-red-500 shadow-[0_0_10px_red] rounded-l-full" />}
                    </div>
                ))}
            </div>

            <main className="lg:pl-20 relative z-10">
                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6 lg:px-20 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col lg:flex-row gap-20 items-end"
                        >
                            <div className="flex-1">
                                <motion.div
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-8 backdrop-blur-sm"
                                    animate={{ boxShadow: ['0 0 10px rgba(239,68,68,0.1)', '0 0 20px rgba(239,68,68,0.3)', '0 0 10px rgba(239,68,68,0.1)'] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
                                    <span className="text-[10px] font-black tracking-widest uppercase text-red-400">RESTRICTED ACCESS // LEVEL 1 ADMIN</span>
                                </motion.div>

                                <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] text-white">
                                    SYSTEM <span className="text-red-500">COMMAND</span><br />
                                    CENTER.
                                </h1>

                                <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-bold">
                                    Real-time platform governance, automated moderation, and cross-session security enforcement. Monitoring system health for <span className="text-white">Active Session: {user.name}</span>.
                                </p>

                                <div className="flex gap-6">
                                    <Link to="/admin" className="group bg-red-600 hover:bg-red-500 text-white px-12 py-5 rounded-2xl text-lg font-black transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] active:scale-95 flex items-center gap-4">
                                        Deploy Admin Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex-1 w-full max-w-lg lg:max-w-none">
                                <div className="glass p-1 rounded-[3rem] border-white/5 overflow-hidden">
                                    <div className="bg-black/60 backdrop-blur-3xl rounded-[2.9rem] p-10 border border-white/5">
                                        <div className="flex items-center justify-between mb-10">
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                                                <Activity size={14} className="text-blue-500" /> System Latency & Heat
                                            </h3>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-4 bg-blue-500/20" />
                                                <div className="w-1 h-4 bg-blue-500/40" />
                                                <div className="w-1 h-4 bg-blue-500/60" />
                                                <div className="w-1 h-4 bg-blue-500" />
                                            </div>
                                        </div>
                                        <SystemHealthGraph />
                                        <div className="grid grid-cols-2 gap-4 mt-8">
                                            <div className="p-4 bg-white/5 rounded-2xl">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">CPU Load</p>
                                                <p className="text-xl font-black text-white">24.2%</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Network</p>
                                                <p className="text-xl font-black text-blue-400">Stable</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Counters Grid */}
                <section className="py-20 px-6 lg:px-20 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                            <StatCard label="Platform Users" value="2450" icon={Users} color="blue" sub="+12% growth this week" />
                            <StatCard label="Active Recruiters" value="184" icon={Briefcase} color="indigo" sub="98% verification rate" />
                            <StatCard label="Flagged Reports" value="12" icon={AlertTriangle} color="red" sub="Requires immediate review" />
                            <StatCard label="Job Ecosystem" value="512" icon={Database} color="emerald" sub="Live across all sectors" />
                        </div>
                    </div>
                </section>

                {/* Command Panels */}
                <section className="py-40 px-6 lg:px-20">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Governance Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass p-12 rounded-[4rem] border-white/5 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -mr-32 -mt-32" />
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-14 h-14 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500 border border-red-600/30">
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight text-white mb-1">Moderation HQ</h3>
                                    <p className="text-xs font-black text-red-500/70 uppercase tracking-widest">Live Security Feed</p>
                                </div>
                            </div>

                            <ActivityFeed />

                            <button className="w-full mt-10 py-5 rounded-3xl bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-4">
                                Open Moderation Queue <ChevronRight size={16} />
                            </button>
                        </motion.div>

                        {/* Enforcement Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass p-12 rounded-[4rem] border-white/5 relative bg-gradient-to-br from-white/5 to-transparent"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight text-white mb-1">User Enforcement</h3>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Account Status Policy</p>
                                </div>
                                <div className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                    System Active
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { name: 'John Doe', role: 'Student', status: 'Active' },
                                    { name: 'Global Tech', role: 'Recruiter', status: 'Pending' },
                                    { name: 'SpamBot99', role: 'Student', status: 'Restricted' },
                                ].map((u, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/5 group hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-500">
                                                {u.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-white">{u.name}</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{u.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 scale-0 group-hover:scale-100 transition-all">
                                            <button title="Verify" className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button title="Restrict" className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                <UserX size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-600/20">
                                <Search className="text-indigo-400 mb-4" size={24} />
                                <h4 className="text-lg font-black text-white mb-2">Internal Global Search</h4>
                                <p className="text-sm text-slate-400 font-bold mb-4">Scan user database with advanced filtering and behavior scoring.</p>
                                <div className="h-2 bg-indigo-600/20 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="h-full w-1/4 bg-indigo-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer Section */}
                <footer className="py-20 px-6 lg:px-20 border-t border-white/5">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-red-500" size={24} />
                            <span className="text-xl font-black text-white tracking-widest uppercase">Admin Core 3.0</span>
                        </div>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">&copy; 2026 // Global Governance Protocol</p>
                        <div className="flex gap-8">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={12} /> Server Time: {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </div> <br />
                    <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs text-center">developed by psychopath</p>

                </footer>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(40px);
                    -webkit-backdrop-filter: blur(40px);
                }
            ` }} />
        </div>
    );
};

export default AdminLanding;
