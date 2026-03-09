import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Rocket, Target, Briefcase, ArrowRight, Zap, Star, Shield, Cpu, Activity, Sparkles } from 'lucide-react';

const FloatingParticles = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-indigo-500 rounded-full blur-[1px]"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        opacity: Math.random() * 0.5 + 0.2
                    }}
                    animate={{
                        x: [null, Math.random() * window.innerWidth],
                        y: [null, Math.random() * window.innerHeight],
                    }}
                    transition={{
                        duration: Math.random() * 20 + 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.02}px, ${(mousePos.y - window.innerHeight / 2) * 0.02}px)`
                    }}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        </div>
    );
};

const SkillTag = ({ name, mouseX, mouseY, onCapture, captured }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 20 });
    const springY = useSpring(y, { stiffness: 150, damping: 20 });

    useEffect(() => {
        if (captured || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dist = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));

        if (dist < 100) {
            // Attraction
            const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
            const force = (100 - dist) * 0.8;
            x.set(Math.cos(angle) * force);
            y.set(Math.sin(angle) * force);

            if (dist < 30) {
                onCapture(name);
            }
        } else {
            x.set(0);
            y.set(0);
        }
    }, [mouseX, mouseY, captured]);

    return (
        <motion.div
            ref={ref}
            style={{
                x: springX,
                y: springY,
                scale: captured ? 0 : 1,
                opacity: captured ? 0 : 1
            }}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border bg-white/5 border-white/10 text-slate-400 absolute cursor-crosshair hover:border-indigo-500/50"
        >
            {name}
        </motion.div>
    );
};

const SkillMatchingGame = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [capturedSkills, setCapturedSkills] = useState([]);
    const [skills] = useState([
        { name: 'React', x: -200, y: -80 },
        { name: 'Node.js', x: 220, y: -60 },
        { name: 'Python', x: -150, y: 100 },
        { name: 'AWS', x: 200, y: 120 },
        { name: 'Docker', x: 0, y: -150 },
        { name: 'MongoDB', x: -250, y: 20 },
        { name: 'UI/UX', x: 250, y: 40 },
        { name: 'Next.js', x: 120, y: -140 },
    ]);

    const handleCapture = (name) => {
        if (!capturedSkills.includes(name)) {
            setCapturedSkills(prev => [...prev, name]);
        }
    };

    const score = Math.round((capturedSkills.length / skills.length) * 100);

    return (
        <div
            className="relative w-full max-w-2xl mx-auto h-[400px] flex items-center justify-center overflow-visible group"
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
        >
            {/* Play Area Instructions */}
            <div className="absolute top-0 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-indigo-500/50 transition-colors">
                Hover to Collect Your Skills
            </div>

            {skills.map((skill, i) => (
                <div key={i} style={{ position: 'absolute', transform: `translate(${skill.x}px, ${skill.y}px)` }}>
                    <SkillTag
                        name={skill.name}
                        mouseX={mousePos.x}
                        mouseY={mousePos.y}
                        onCapture={handleCapture}
                        captured={capturedSkills.includes(skill.name)}
                    />
                </div>
            ))}

            <motion.div
                animate={{
                    scale: score === 100 ? [1, 1.1, 1] : 1,
                    borderColor: score === 100 ? 'rgba(99, 102, 241, 1)' : 'rgba(99, 102, 241, 0.3)'
                }}
                className="relative z-10 w-56 h-56 rounded-full border-4 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]"
            >
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                    {score === 100 ? 'Perfect Match' : 'Match Progress'}
                </div>
                <div className="text-6xl font-black text-white tracking-tighter">
                    {score}<span className="text-2xl text-indigo-500">%</span>
                </div>

                {/* Visual Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="112"
                        cy="112"
                        r="108"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-indigo-500/10"
                    />
                    <motion.circle
                        cx="112"
                        cy="112"
                        r="108"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray="678"
                        animate={{ strokeDashoffset: 678 - (678 * score) / 100 }}
                        className="text-indigo-500"
                    />
                </svg>
            </motion.div>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, delay, color }) => {
    const colorClasses = {
        indigo: {
            bgGlow: 'bg-indigo-500/5',
            bgGlowHover: 'group-hover:bg-indigo-500/10',
            iconBg: 'bg-indigo-500/10',
            iconBorder: 'border-indigo-500/20',
            iconText: 'text-indigo-400'
        },
        purple: {
            bgGlow: 'bg-purple-500/5',
            bgGlowHover: 'group-hover:bg-purple-500/10',
            iconBg: 'bg-purple-500/10',
            iconBorder: 'border-purple-500/20',
            iconText: 'text-purple-400'
        },
        cyan: {
            bgGlow: 'bg-cyan-500/5',
            bgGlowHover: 'group-hover:bg-cyan-500/10',
            iconBg: 'bg-cyan-500/10',
            iconBorder: 'border-cyan-500/20',
            iconText: 'text-cyan-400'
        },
        amber: {
            bgGlow: 'bg-amber-500/5',
            bgGlowHover: 'group-hover:bg-amber-500/10',
            iconBg: 'bg-amber-500/10',
            iconBorder: 'border-amber-500/20',
            iconText: 'text-amber-400'
        }
    };

    const theme = colorClasses[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay }}
            whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
            className="glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden group perspective-1000"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 transition-all ${theme.bgGlow} ${theme.bgGlowHover}`} />
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-transform group-hover:scale-110 ${theme.iconBg} ${theme.iconBorder}`}>
                <Icon size={32} className={`${theme.iconText}`} />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight text-white">{title}</h3>
            <p className="text-slate-400 leading-relaxed font-bold">{desc}</p>
        </motion.div>
    );
};

const MagneticButton = ({ children, to }) => {
    const btnRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = btnRef.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const dist = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

        if (dist < 100) {
            x.set((clientX - centerX) * 0.4);
            y.set((clientY - centerY) * 0.4);
        } else {
            x.set(0);
            y.set(0);
        }
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={btnRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
        >
            <Link
                to={to}
                className="group relative bg-white text-black px-16 py-6 rounded-[2rem] text-xl font-black transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 inline-flex items-center gap-4"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-[2rem]" />
                {children}
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
        </motion.div>
    );
};

const SkillBubbleGame = ({ onClose }) => {
    const [captured, setCaptured] = useState([]);
    const [score, setScore] = useState(0);
    const skills = [
        { id: 1, name: 'React', color: 'indigo' },
        { id: 2, name: 'Node.js', color: 'emerald' },
        { id: 3, name: 'Python', color: 'blue' },
        { id: 4, name: 'AWS', color: 'orange' },
        { id: 5, name: 'Docker', color: 'cyan' },
        { id: 6, name: 'AI/ML', color: 'purple' },
    ];

    const targetRef = useRef(null);

    const handleDragEnd = (event, info, skillName) => {
        if (!targetRef.current) return;
        const targetRect = targetRef.current.getBoundingClientRect();
        const dropX = info.point.x;
        const dropY = info.point.y;

        if (
            dropX > targetRect.left &&
            dropX < targetRect.right &&
            dropY > targetRect.top &&
            dropY < targetRect.bottom
        ) {
            if (!captured.includes(skillName)) {
                setCaptured(prev => [...prev, skillName]);
                setScore(prev => Math.min(100, prev + 17)); // 17 per skill roughly
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-10 select-none"
        >
            <div className="absolute top-10 right-10 text-slate-500 font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors" onClick={onClose}>
                [ CLOSE ]
            </div>

            <div className="text-center mb-20">
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4"
                >
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400">AFK Secret Protocol Activated</span>
                </motion.div>
                <h2 className="text-5xl font-black text-white tracking-tighter mb-4">SKILL EXTRACTION TEST</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Drag the skill bubbles into the automation core</p>
            </div>

            <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center">
                {/* Captured Skills List */}
                <div className="absolute left-0 top-0 space-y-2">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4">Captured Skills</p>
                    {captured.map(s => (
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={s} className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={12} /> {s}
                        </motion.div>
                    ))}
                </div>

                {/* Automation Core (Target) */}
                <div
                    ref={targetRef}
                    className="relative w-64 h-64 rounded-full border-4 border-indigo-500/20 bg-indigo-500/5 flex flex-col items-center justify-center group"
                >
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/40 animate-spin-slow" />
                    <motion.div
                        animate={{
                            scale: score === 100 ? [1, 1.1, 1] : 1,
                            boxShadow: score === 100 ? "0 0 50px rgba(99, 102, 241, 0.5)" : "none"
                        }}
                        className="text-center z-10"
                    >
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Matching</p>
                        <p className="text-6xl font-black text-white">{Math.min(100, score)}%</p>
                    </motion.div>
                    {score === 100 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-12 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            Optimization Complete
                        </motion.div>
                    )}
                </div>

                {/* Skill Bubbles */}
                {skills.map((skill, i) => (
                    !captured.includes(skill.name) && (
                        <motion.div
                            key={skill.id}
                            drag
                            dragSnapToOrigin
                            onDragEnd={(e, info) => handleDragEnd(e, info, skill.name)}
                            whileDrag={{ scale: 1.2, zIndex: 50 }}
                            initial={{
                                x: Math.sin(i) * 300,
                                y: Math.cos(i) * 200,
                                opacity: 0,
                                scale: 0.8
                            }}
                            animate={{
                                x: [null, Math.sin(i + Date.now()) * 300],
                                y: [null, Math.cos(i + Date.now()) * 200],
                                opacity: 1,
                                scale: 1
                            }}
                            transition={{
                                opacity: { duration: 0.5, delay: i * 0.1 },
                                x: { duration: 15, repeat: Infinity, ease: "linear" },
                                y: { duration: 15, repeat: Infinity, ease: "linear" }
                            }}
                            className={`absolute w-32 h-32 rounded-full glass border border-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-xl hover:border-${skill.color}-500/50 transition-colors`}
                        >
                            <span className="text-xs font-black uppercase tracking-widest text-white/50">{skill.name}</span>
                        </motion.div>
                    )
                ))}
            </div>
        </motion.div>
    );
};

const StudentLanding = ({ user }) => {
    const [isGameActive, setIsGameActive] = useState(false);
    const [inputBuffer, setInputBuffer] = useState('');
    const { scrollYProgress } = useScroll();
    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const newBuffer = (inputBuffer + e.key).slice(-3); // 'afk' is 3 chars
            setInputBuffer(newBuffer);

            if (newBuffer.toLowerCase() === 'afk') {
                setIsGameActive(true);
                setInputBuffer('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputBuffer]);

    return (
        <div className="bg-[#050505] text-white selection:bg-indigo-500/30">
            <AnimatePresence>
                {isGameActive && <SkillBubbleGame onClose={() => setIsGameActive(false)} />}
            </AnimatePresence>

            <FloatingParticles />

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-12 backdrop-blur-md"
                    >
                        <Zap size={16} className="text-indigo-400 fill-indigo-400" />
                        <span className="text-sm font-black tracking-[0.3em] uppercase text-slate-400">Welcome Back, {user.name.split(' ')[0]}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-7xl md:text-9xl font-black mb-10 tracking-tighter leading-[0.85] bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
                    >
                        GO AFK.<br />
                        LET YOUR CAREER <span className="text-indigo-500">WORK.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-bold"
                    >
                        Automated job matching, resume intelligence, and AI-powered interview practice. Your career is officially on autopilot.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-20"
                    >
                        <SkillMatchingGame />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <MagneticButton to="/dashboard">
                            Start My Automation
                        </MagneticButton>
                    </motion.div>
                </div>

                {/* Background Decorations */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
            </section>

            {/* Features Grid */}
            <section className="py-40 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">Built for the <span className="text-indigo-500">1%</span></h2>
                        <p className="text-slate-400 text-xl font-bold max-w-2xl mx-auto">Premium tools to automate the entire application pipeline.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        <FeatureCard
                            icon={Rocket}
                            title="Auto Apply Engine"
                            desc="Intelligent agents scan and apply to high-match roles while you sleep. Completely AFK."
                            delay={0}
                            color="indigo"
                        />
                        <FeatureCard
                            icon={Cpu}
                            title="Resume Intelligence"
                            desc="Dynamic skill extraction and resume optimization for every application."
                            delay={0.2}
                            color="purple"
                        />
                        <FeatureCard
                            icon={Activity}
                            title="Match Score Analytics"
                            desc="Real-time transparency on why you matched and your performance benchmarks."
                            delay={0.4}
                            color="cyan"
                        />
                        <FeatureCard
                            icon={Sparkles}
                            color="amber"
                            title="Interview Simulator"
                            desc="Context-aware AI mock interviews tailored to the specific role you applied for."
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-60 px-6 relative overflow-hidden">
                <motion.div
                    style={{ y: backgroundY }}
                    className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
                >
                    <div className="w-[800px] h-[800px] bg-indigo-500/5 blur-[200px] rounded-full" />
                </motion.div>

                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass p-20 rounded-[4rem] border-indigo-500/20 shadow-2xl shadow-indigo-500/10"
                    >
                        <Star className="text-indigo-500 mx-auto mb-8" size={64} fill="currentColor" />
                        <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-8 italic">Ready to go <span className="text-indigo-500">AFK?</span></h2>
                        <p className="text-xl md:text-2xl text-slate-400 font-bold mb-12 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of students who have automated their career search. Stop the manual grind today.
                        </p>
                        <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 text-white px-16 py-6 rounded-[2rem] text-xl font-black transition-all hover:shadow-2xl hover:shadow-indigo-500/40 inline-block scale-110">
                            Access Portal Now
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-20 px-6 border-t border-white/5 text-center">
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">Hire AFK &copy; 2026 // Automated Excellence</p><br />
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">developed by psychopath</p>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
            `}} />
        </div>
    );
};

export default StudentLanding;
