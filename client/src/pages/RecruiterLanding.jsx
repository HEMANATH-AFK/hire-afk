import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Briefcase,
    Plus,
    ArrowRight,
    Zap,
    Target,
    BarChart3,
    ShieldCheck,
    Search,
    CheckCircle2,
    TrendingUp,
    LayoutDashboard
} from 'lucide-react';

const MetricCard = ({ label, value, sub }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
    >
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">{label}</p>
        <h4 className="text-4xl font-black text-slate-900 mb-1">{value}</h4>
        <p className="text-slate-400 text-xs font-medium">{sub}</p>
    </motion.div>
);

const FeatureSection = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="flex gap-6 group"
    >
        <div className="w-14 h-14 shrink-0 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
            <Icon size={28} />
        </div>
        <div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    </motion.div>
);

const DashboardPreview = () => (
    <div className="relative w-full max-w-xl">
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-6 relative z-10 overflow-hidden"
        >
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="bg-slate-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Live Analytics
                </div>
            </div>

            <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-slate-50 rounded-2xl p-4">
                        <BarChart3 className="text-slate-300 mb-2" size={20} />
                        <div className="h-2 bg-slate-200 rounded-full w-1/2" />
                    </div>
                    <div className="h-24 bg-slate-900 rounded-2xl p-4">
                        <TrendingUp className="text-white/50 mb-2" size={20} />
                        <div className="h-2 bg-white/20 rounded-full w-1/2" />
                    </div>
                </div>
                <div className="space-y-3 pt-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-slate-100" />
                            <div className="flex-1 space-y-2">
                                <div className="h-2 bg-slate-100 rounded-full w-1/3" />
                                <div className="h-1.5 bg-slate-50 rounded-full w-1/2" />
                            </div>
                            <div className="w-12 h-4 bg-emerald-100 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>

        {/* Floating Accents */}
        <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-10 -right-10 bg-[#0f172a] text-white p-6 rounded-3xl shadow-xl z-20 hidden md:block"
        >
            <BarChart3 size={24} className="mb-2" />
            <p className="text-xs font-black uppercase tracking-widest opacity-50">Precision</p>
            <p className="text-2xl font-black">98.2%</p>
        </motion.div>

        <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-6 -left-10 bg-white border border-slate-200 p-6 rounded-3xl shadow-xl z-20 hidden md:block"
        >
            <Users size={24} className="text-slate-900 mb-2" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Talent</p>
            <p className="text-2xl font-black text-slate-900">12.4k</p>
        </motion.div>
    </div>
);

const RecruiterLanding = ({ user }) => {
    return (
        <div className="bg-slate-50 min-h-screen selection:bg-slate-900 selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-40 pb-32 px-6">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 border border-slate-900/10 mb-8">
                            <Zap size={14} className="text-slate-900 fill-slate-900" />
                            <span className="text-xs font-black tracking-widest uppercase text-slate-900">Recruiter Portal v2.0</span>
                        </div>

                        <h1 className="text-7xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.85] text-slate-900">
                            FIND PRECISION.<br />
                            NOT JUST <span className="italic font-serif text-slate-400">APPLICANTS.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-500 max-w-xl mb-12 leading-relaxed font-bold">
                            Welcome, {user.name.split(' ')[0]}. Streamline your hiring pipeline with AI-powered candidate filtering and instant match scoring.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link to="/recruiter" className="bg-slate-900 text-white px-12 py-5 rounded-2xl text-lg font-black transition-all hover:bg-slate-800 shadow-xl shadow-slate-900/20 flex items-center gap-3">
                                Manage Openings
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/recruiter" className="bg-white border border-slate-200 text-slate-900 px-12 py-5 rounded-2xl text-lg font-black transition-all hover:border-slate-300 flex items-center gap-3">
                                <Plus size={20} />
                                Post New Job
                            </Link>
                        </div>
                    </motion.div>

                    <div className="flex-1 w-full flex justify-center lg:justify-end">
                        <DashboardPreview />
                    </div>
                </div>
            </section>

            {/* Metrics Section */}
            <section className="py-24 px-6 border-y border-slate-200 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <MetricCard
                            label="Filtering Accuracy"
                            value="99.8%"
                            sub="Proprietary keyword matching engine"
                        />
                        <MetricCard
                            label="Time Saved"
                            value="85%"
                            sub="Average reduction in manual screening"
                        />
                        <MetricCard
                            label="Match Scoring"
                            value="Instant"
                            sub="Real-time candidate qualification"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-40 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div className="space-y-20">
                            <FeatureSection
                                icon={Briefcase}
                                title="Streamlined Job Posting"
                                desc="Our intuitive editor helps you define crystal-clear requirements, feeding the match engine and the AI Interview Lab automatically."
                                delay={0}
                            />
                            <FeatureSection
                                icon={Target}
                                title="Auto Candidate Ranking"
                                desc="Applications are automatically scored and ranked by relevance, so you only see the 1% who actually fit your profile."
                                delay={0.1}
                            />
                            <FeatureSection
                                icon={LayoutDashboard}
                                title="Interview Performance Insights"
                                desc="Review detailed AI analytics from candidate mock interviews before you even pick up the phone."
                                delay={0.2}
                            />
                            <FeatureSection
                                icon={ShieldCheck}
                                title="Report & Moderation Tools"
                                desc="Maintain a high-quality ecosystem with professional reporting tools to flag suspicious applicant behavior."
                                delay={0.3}
                            />
                        </div>

                        {/* Interactive Graph Mockup */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-[#0f172a] rounded-[4rem] p-16 relative overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                            <h3 className="text-3xl font-black text-white mb-10 tracking-tight">Recruiting Efficiency</h3>
                            <div className="relative h-64 flex items-end gap-4 overflow-visible">
                                {[30, 50, 45, 80, 70, 95].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-xl relative group-hover:from-blue-400 group-hover:to-cyan-300 transition-colors"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-black text-white">
                                            {h}%
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between">
                                <span className="text-white/40 text-xs font-black uppercase tracking-widest">Q1 2024</span>
                                <span className="text-white/40 text-xs font-black uppercase tracking-widest">Live Optimization</span>
                                <span className="text-white text-xs font-black uppercase tracking-widest">Q4 2024</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 px-6 bg-[#0f172a] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <CheckCircle2 className="text-white/20 mx-auto mb-10" size={80} strokeWidth={1} />
                    <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                        READY TO RECRUIT<br />
                        <span className="text-slate-400 italic">SMARTER?</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-bold mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join the next generation of data-driven hiring. Start your precision journey today.
                    </p>
                    <Link
                        to="/recruiter"
                        className="bg-white text-slate-900 px-16 py-6 rounded-[2rem] text-xl font-black transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-white/10 inline-block"
                    >
                        Start Recruiting Smarter
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 bg-white border-t border-slate-100 text-center">
                <div className="flex justify-center items-center gap-4 mb-8">
                    <BarChart3 className="text-slate-900" size={24} />
                    <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">Hire AFK Enterprises</span>
                </div>
                <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">&copy; 2026 // Precision Recruitment Architecture</p><br />
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">developed by psychopath</p>
            </footer>
        </div>
    );
};

export default RecruiterLanding;
