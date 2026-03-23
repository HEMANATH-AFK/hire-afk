import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import {
    Rocket,
    Target,
    Shield,
    ArrowRight,
    Zap,
    ChevronDown,
    Cpu,
    Activity,
    Globe,
    Lock,
    Compass,
    Sparkles,
    MousePointer2,
    CheckCircle2
} from 'lucide-react';

// --- HELPERS ---
const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (event) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    return mousePosition;
};

// --- COMPONENTS ---

const IntroLoader = ({ onComplete }) => {
    const [phase, setPhase] = useState(0); // 0: biometric, 1: terminal, 2: neural, 3: lockdown, 4: blast
    const [lineIndex, setLineIndex] = useState(0);

    const logs = [
        "[OK] INITIALIZING_QUANTUM_AUTH",
        "[OK] BYPASSING_RECRUITER_GATEWAYS",
        "[OK] SYNCING_GLOBAL_OPPORTUNITY_SPHERES",
        "[OK] DECRYPTING_MATCH_PROTOCOLS",
        "[OK] LOADING_AFK_CORE_V4.0",
        "[OK] NEURAL_NETWORK_STABILIZED",
        "[OK] REDIRECTING_TO_FUTURE",
    ];

    useEffect(() => {
        if (phase === 0) setTimeout(() => setPhase(1), 1200);
        if (phase === 1) {
            const timer = setInterval(() => {
                setLineIndex(prev => {
                    if (prev >= logs.length - 1) {
                        clearInterval(timer);
                        setTimeout(() => setPhase(2), 200);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 80);
            return () => clearInterval(timer);
        }
        if (phase === 2) setTimeout(() => setPhase(3), 1500);
        if (phase === 3) setTimeout(() => setPhase(4), 1000);
        if (phase === 4) setTimeout(onComplete, 1000);
    }, [phase, logs.length, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(40px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[1000] bg-[#020205] flex items-center justify-center overflow-hidden"
        >
            <div className="absolute inset-0 cyber-glow-pattern opacity-10 pointer-events-none" />

            <AnimatePresence mode="wait">
                {phase === 0 && (
                    <motion.div
                        key="biometric"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 2 }}
                        className="relative flex flex-col items-center"
                    >
                        <motion.div
                            className="w-48 h-48 rounded-full border border-indigo-500/30 flex items-center justify-center relative shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]" />
                            <Target className="text-indigo-500" size={48} />
                        </motion.div>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 240 }}
                            className="h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-12"
                        />
                        <p className="mt-6 font-mono text-xs text-indigo-400 tracking-[0.8em] uppercase animate-pulse font-black">Scanning_Protocol_V4</p>
                    </motion.div>
                )}

                {phase === 1 && (
                    <motion.div
                        key="terminal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-[10px] md:text-sm text-indigo-400/80 p-10 max-w-lg w-full"
                    >
                        {logs.slice(0, lineIndex + 1).map((log, i) => (
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                key={i}
                                className="mb-2 flex items-center gap-4"
                            >
                                <span className="opacity-30 text-[8px] font-black">{Math.random().toString(16).slice(2, 10)}</span>
                                <span className="font-black tracking-tighter uppercase">{log}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {phase === 2 && (
                    <motion.div
                        key="neural"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <svg className="w-[600px] h-[600px] opacity-60">
                            {[...Array(12)].map((_, i) => {
                                const angle = (i * 30) * Math.PI / 180;
                                const x = 300 + Math.cos(angle) * 200;
                                const y = 300 + Math.sin(angle) * 200;
                                return (
                                    <React.Fragment key={i}>
                                        <motion.circle
                                            cx={x} cy={y} r="3" fill="#6366f1"
                                            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
                                            transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
                                            className="will-change-transform"
                                        />
                                        <motion.line
                                            x1={x} y1={y} x2={300} y2={300}
                                            stroke="#6366f1" strokeWidth="0.5"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.3 }}
                                            transition={{ duration: 1.5, delay: i * 0.05 }}
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </svg>
                        <div className="absolute text-center">
                            <h2 className="text-white text-5xl font-black tracking-[1.5em] opacity-10 italic">NEURAL_DEEP</h2>
                        </div>
                    </motion.div>
                )}

                {phase === 3 && (
                    <motion.div
                        key="lockdown"
                        initial={{ opacity: 0, scale: 5, filter: "blur(30px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative"
                    >
                        <motion.div
                            animate={{
                                x: [0, -4, 4, -4, 4, 0],
                                rotate: [0, 2, -2, 2, -2, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 0.15, delay: 0.3 }}
                            className="text-[14rem] md:text-[25rem] font-black text-white leading-none tracking-tighter drop-shadow-[0_0_100px_rgba(99,102,241,0.6)] select-none"
                        >
                            AFK.
                        </motion.div>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="absolute -bottom-6 left-0 right-0 h-1.5 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                        />
                    </motion.div>
                )}

                {phase === 4 && (
                    <motion.div
                        key="blast"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 30 }}
                        transition={{ duration: 1.2, ease: "expoIn" }}
                        className="w-20 h-20 bg-white rounded-full blur-[120px]"
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const CosmicBackground = () => {
    const mouse = useMousePosition();
    const particles = useMemo(() => {
        return [...Array(40)].map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            duration: Math.random() * 20 + 20
        }));
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50 dark:bg-[#020205] transition-colors duration-500">
            {/* Ambient Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 dark:bg-purple-600/10 blur-[150px] rounded-full" />

            {/* Particles */}
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-white/20 will-change-transform"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        x: (mouse.x - window.innerWidth / 2) * (p.size * 0.01),
                        y: (mouse.y - window.innerHeight / 2) * (p.size * 0.01),
                        translateZ: 0,
                    }}
                    animate={{
                        opacity: [0.1, 0.4, 0.1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}

            {/* Cursor Glow Spotlight */}
            <div
                className="absolute w-[800px] h-[800px] rounded-full bg-indigo-500/5 blur-[120px]"
                style={{
                    left: mouse.x - 400,
                    top: mouse.y - 400,
                    transition: 'transform 0.1s ease-out'
                }}
            />
        </div>
    );
};

const RapidScannerGame = () => {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameState, setGameState] = useState('idle'); // idle, playing, over
    const [targetCriteria, setTargetCriteria] = useState('');
    const [currentCandidate, setCurrentCandidate] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong'
    const [combo, setCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(100);

    const CRITERIA = [
        { label: 'NEEDS REACT', skill: 'React' },
        { label: 'NEEDS PYTHON', skill: 'Python' },
        { label: 'NEEDS DESIGN', skill: 'Figma' },
        { label: 'NEEDS CLOUD', skill: 'AWS' },
        { label: 'NEEDS MOBILE', skill: 'Flutter' },
        { label: 'NEEDS GO', skill: 'Go' },
        { label: 'NEEDS SECURITY', skill: 'Rust' },
        { label: 'NEEDS AI', skill: 'PyTorch' },
        { label: 'NEEDS GROWTH', skill: 'Marketing' }
    ];

    const CANDIDATES = [
        { name: 'Alex River', skills: ['React', 'NodeJS'], avatar: 'AR' },
        { name: 'Sarah Chen', skills: ['Python', 'Django'], avatar: 'SC' },
        { name: 'Jordan Lee', skills: ['Figma', 'UI/UX'], avatar: 'JL' },
        { name: 'Mike Ross', skills: ['AWS', 'Docker'], avatar: 'MR' },
        { name: 'Elena G.', skills: ['Flutter', 'Dart'], avatar: 'EG' },
        { name: 'David W.', skills: ['C++', 'Rust'], avatar: 'DW' },
        { name: 'Zoe Kim', skills: ['SQL', 'Tableau'], avatar: 'ZK' },
        { name: 'Hiroshi T.', skills: ['Go', 'Kubernetes'], avatar: 'HT' },
        { name: 'Sven O.', skills: ['Rust', 'Wasm'], avatar: 'SO' },
        { name: 'Aria V.', skills: ['Marketing', 'SEO'], avatar: 'AV' },
        { name: 'Liam B.', skills: ['PyTorch', 'FastAPI'], avatar: 'LB' }
    ];

    const generateRound = () => {
        const crit = CRITERIA[Math.floor(Math.random() * CRITERIA.length)];
        // 50% chance to show a matching candidate
        const shouldMatch = Math.random() > 0.5;
        let cand;
        if (shouldMatch) {
            const matches = CANDIDATES.filter(c => c.skills.includes(crit.skill));
            cand = matches[Math.floor(Math.random() * matches.length)];
        } else {
            const nonMatches = CANDIDATES.filter(c => !c.skills.includes(crit.skill));
            cand = nonMatches[Math.floor(Math.random() * nonMatches.length)];
        }

        setTargetCriteria(crit);
        setCurrentCandidate({ ...cand, id: Date.now() });
        setFeedback(null);
        setTimeLeft(100);
    };

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && !feedback) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) {
                        handleAction(false);
                        return 0;
                    }
                    return prev - 1.5;
                });
            }, 50);
        }
        return () => clearInterval(timer);
    }, [gameState, feedback]);

    const handleAction = (isAccept) => {
        if (gameState !== 'playing' || feedback) return;

        const isMatch = currentCandidate.skills.includes(targetCriteria.skill);
        const correct = (isAccept && isMatch) || (!isAccept && !isMatch);

        if (correct) {
            const addedScore = 100 + (combo * 20);
            setScore(s => s + addedScore);
            setCombo(c => c + 1);
            setFeedback('correct');
        } else {
            setLives(l => {
                if (l <= 1) setGameState('over');
                return l - 1;
            });
            setCombo(0);
            setFeedback('wrong');
        }

        setTimeout(generateRound, 500);
    };

    const startGame = () => {
        setScore(0);
        setLives(3);
        setCombo(0);
        setGameState('playing');
        generateRound();
    };

    return (
        <div className="relative w-full max-w-4xl h-[650px] glass rounded-[3rem] border-slate-200 dark:border-white/5 overflow-hidden flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-8 select-none mx-auto shadow-2xl transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />

            {/* HUD Mini */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 opacity-60">Yield</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{score}</p>
                    </div>
                    {combo > 1 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-indigo-600 dark:bg-indigo-500 px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase italic shadow-lg shadow-indigo-500/40">
                            {combo}x Combo
                        </motion.div>
                    )}
                </div>

                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <motion.div key={i} animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.2 }} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${i < lives ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-300 dark:border-white/10'}`}>
                            <Zap size={14} className={i < lives ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Timer Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-white/5 overflow-hidden">
                <motion.div initial={{ width: '100%' }} animate={{ width: `${timeLeft}%` }} className="h-full bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" transition={{ ease: "linear" }} />
            </div>

            {/* Game Content */}
            {gameState === 'playing' && (
                <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-[300px]">
                    {/* Mission Header */}
                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
                        <h4 className="text-xl font-black tracking-widest text-slate-900 dark:text-white border-b-2 border-indigo-500/50 pb-1 mb-1 italic">
                            {targetCriteria.label}
                        </h4>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Criteria Locked</p>
                    </motion.div>

                    {/* Candidate Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentCandidate?.id}
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{
                                x: feedback === 'correct' ? 300 : (feedback === 'wrong' ? -300 : 0),
                                scale: 0.8, opacity: 0, rotate: feedback === 'correct' ? 10 : -10
                            }}
                            className={`relative w-full aspect-[3/4] glass rounded-[2.5rem] border-2 p-6 flex flex-col items-center justify-center text-center transition-all will-change-transform
                                ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-500/5' :
                                    feedback === 'wrong' ? 'border-red-500 bg-red-500/5' : 'border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-md'}`}
                        >
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white mb-6 shadow-xl">
                                {currentCandidate?.avatar}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{currentCandidate?.name}</h3>
                            <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 opacity-60 uppercase tracking-widest mb-6">Expert Talent</p>

                            <div className="flex flex-wrap justify-center gap-2">
                                {currentCandidate?.skills.map((s, i) => (
                                    <span key={i} className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border
                                        ${s === targetCriteria.skill ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400'}`}>
                                        {s}
                                    </span>
                                ))}
                            </div>

                            {/* Flash Indicators */}
                            <AnimatePresence>
                                {feedback === 'correct' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <CheckCircle2 size={80} className="text-emerald-500/40" />
                                    </motion.div>
                                )}
                                {feedback === 'wrong' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Activity size={80} className="text-red-500/40" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex gap-4 w-full">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAction(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 font-black uppercase tracking-tight text-[10px] hover:text-slate-900 dark:hover:text-white transition-colors">SKIP</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAction(true)} className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-tight text-[10px] shadow-lg shadow-indigo-600/20">RECRUIT</motion.button>
                    </div>
                </div>
            )}

            {/* Overlays */}
            <AnimatePresence>
                {(gameState === 'idle' || gameState === 'over') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-black/80 backdrop-blur-xl p-8">
                        <div className="text-center max-w-sm">
                            <Activity className="text-indigo-600 dark:text-indigo-400 mx-auto mb-6" size={40} />
                            <h3 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-4">{gameState === 'idle' ? 'RAPID SCANNER' : 'SCAN FAILED'}</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-[10px]">
                                {gameState === 'idle' ? 'High-speed talent filtration. No room for error.' : `Protocol Terminated. Final Score: ${score}`}
                            </p>
                            <button onClick={startGame} className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-colors shadow-2xl shadow-indigo-500/20">
                                {gameState === 'idle' ? 'Start Protocol' : 'Retry Refresh'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MagneticCTA = ({ children, to }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const dist = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

        if (dist < 150) {
            x.set((clientX - centerX) * 0.5);
            y.set((clientY - centerY) * 0.5);
        } else {
            x.set(0);
            y.set(0);
        }
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ x: springX, y: springY }}
        >
            <Link
                to={to}
                className="group relative inline-flex items-center gap-4 px-16 py-7 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-black text-xl font-black transition-all hover:shadow-[0_0_50px_rgba(79,70,229,0.3)] dark:hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 overflow-hidden"
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity"
                />
                {children}
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
        </motion.div>
    );
};

const RoleCard = ({ title, desc, icon: Icon, path, color }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    const colorClasses = {
        indigo: {
            bgGlow: 'bg-indigo-500/5',
            bgHover: 'group-hover:bg-indigo-500/10',
            iconBg: 'bg-indigo-500/10',
            iconBorder: 'border-indigo-500/20',
            iconText: 'text-indigo-600 dark:text-indigo-400'
        },
        emerald: {
            bgGlow: 'bg-emerald-500/5',
            bgHover: 'group-hover:bg-emerald-500/10',
            iconBg: 'bg-emerald-500/10',
            iconBorder: 'border-emerald-500/20',
            iconText: 'text-emerald-600 dark:text-emerald-400'
        },
        red: {
            bgGlow: 'bg-red-500/5',
            bgHover: 'group-hover:bg-red-500/10',
            iconBg: 'bg-red-500/10',
            iconBorder: 'border-red-500/20',
            iconText: 'text-red-600 dark:text-red-400'
        }
    };

    const theme = colorClasses[color];

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - (rect.left + rect.width / 2));
        y.set(e.clientY - (rect.top + rect.height / 2));
    };

    return (
        <Link to={path} className="perspective-1000">
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={() => { x.set(0); y.set(0); }}
                style={{ rotateX, rotateY }}
                className="glass p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/5 relative group hover:border-indigo-500/30 transition-colors"
                whileHover={{ y: -10 }}
            >
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 transition-all ${theme.bgGlow} ${theme.bgHover}`} />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border shadow-inner group-hover:scale-110 transition-transform ${theme.iconBg} ${theme.iconBorder}`}>
                    <Icon size={32} className={`${theme.iconText}`} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{desc}</p>
                <div className="mt-8 flex items-center gap-2 text-slate-400 dark:text-white/40 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                    <span className="text-xs font-black uppercase tracking-widest">Enter Portal</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>
        </Link>
    );
};

const GuestLanding = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isOverride, setIsOverride] = useState(false);
    const [inputBuffer, setInputBuffer] = useState('');

    const { scrollYProgress } = useScroll();
    const backgroundTransform = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const newBuffer = (inputBuffer + e.key).slice(-3);
            setInputBuffer(newBuffer);
            if (newBuffer.toLowerCase() === 'afk') {
                setIsOverride(true);
                setTimeout(() => setIsOverride(false), 8000);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputBuffer]);

    return (
        <div className={`bg-white dark:bg-[#020205] text-slate-900 dark:text-white selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-500 ${isOverride ? 'cyber-mode' : ''}`}>
            <AnimatePresence>
                {!isLoaded && <IntroLoader onComplete={() => setIsLoaded(true)} />}
            </AnimatePresence>

            <CosmicBackground />

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
                {/* 3D Floating Ghost Elements */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: [0, 0.15, 0],
                                scale: [0.8, 1.2, 0.8],
                                x: Math.random() * 800 - 400,
                                y: Math.random() * 800 - 400,
                                rotate: [0, 10, 0],
                            }}
                            transition={{
                                duration: 15 + Math.random() * 10,
                                repeat: Infinity,
                                delay: i * 2,
                                ease: "linear"
                            }}
                            className="absolute glass p-6 rounded-3xl border-indigo-500/20 w-64 h-40 flex flex-col justify-between will-change-transform backface-hidden"
                        >
                            <div className="flex justify-between">
                                <div className="w-10 h-2 bg-indigo-500/30 rounded" />
                                <div className="w-2 h-2 rounded-full bg-indigo-500/50" />
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-1 bg-white/5 rounded" />
                                <div className="w-3/4 h-1 bg-white/5 rounded" />
                                <div className="w-1/2 h-1 bg-white/5 rounded" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 4.2 }}
                        className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/10 mb-16 backdrop-blur-2xl shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:border-indigo-500/30 transition-all group cursor-default"
                    >
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles size={20} className="text-indigo-400" />
                        </motion.div>
                        <span className="text-xs font-black tracking-[0.5em] uppercase text-indigo-400 group-hover:text-white transition-colors">Neural_Autopilot_Active</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 50, filter: "blur(20px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ delay: 4.4, duration: 1.2, ease: "easeOut" }}
                        className="text-8xl md:text-[14rem] font-black mb-14 tracking-tighter leading-[0.75] bg-gradient-to-b from-white via-white to-white/10 bg-clip-text text-transparent italic"
                    >
                        IDLE IS THE<br />
                        NEW <span className="text-indigo-500 drop-shadow-[0_0_50px_rgba(99,102,241,0.4)]">ELITE.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 4.8, duration: 1 }}
                        className="text-xl md:text-4xl text-slate-400 max-w-5xl mx-auto mb-20 leading-tight font-black tracking-tight"
                    >
                        Stop applying. Start arriving. Let our neural match engine curate your existence in the global talent sphere.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 5 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-8"
                    >
                        <MagneticCTA to="/register">
                            BREACH THE SYSTEM
                        </MagneticCTA>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-12 py-7 rounded-3xl border border-white/10 font-black text-xl hover:bg-white/5 transition-all text-slate-500 uppercase tracking-widest"
                        >
                            Watch Pipeline
                        </motion.button>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30"
                >
                    <span className="text-[10px] font-black tracking-widest uppercase">Scroll to Discover</span>
                    <ChevronDown size={20} />
                </motion.div>
            </section>

            {/* Game Showstopper Section */}
            <section className="py-40 px-6 relative z-10 bg-gradient-to-b from-transparent via-indigo-950/5 dark:via-indigo-950/20 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6"
                        >
                            <MousePointer2 size={14} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-400">Interactive Simulator</span>
                        </motion.div>
                        <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-8 italic text-slate-900 dark:text-white dark:shadow-indigo-500/20 drop-shadow-2xl uppercase">RAPID <span className="text-indigo-600 dark:text-indigo-500 text-glow">SCANNER</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xl font-bold max-w-2xl mx-auto font-mono uppercase tracking-widest text-xs opacity-60">Speed-test your talent filters. Recruit or Skip in real-time.</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ margin: "-100px" }}
                    >
                        <RapidScannerGame />
                    </motion.div>
                </div>
            </section>

            {/* How It Works Layered Section */}
            <section className="py-60 px-6 relative z-10 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div>
                            <h2 className="text-6xl font-black tracking-tighter mb-12 leading-none text-slate-900 dark:text-white">
                                AUTONOMOUS<br />
                                <span className="text-slate-400 dark:text-slate-500 italic">PIPELINE.</span>
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { icon: Cpu, title: "Neural Parsing", desc: "Our engine deconstructs your resume into a multi-dimensional skill vector." },
                                    { icon: Globe, title: "Global Sourcing", desc: "Automated crawlers scan 100+ job boards 24/7 for relevant openings." },
                                    { icon: Activity, title: "Match Tuning", desc: "Context-aware scoring ensures you only apply to roles where you'll shine." }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 20 }}
                                        className="p-8 glass rounded-3xl flex gap-6 group transition-all cursor-crosshair"
                                    >
                                        <div className="w-12 h-12 shrink-0 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                                            <item.icon size={24} className="text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black mb-2 text-slate-900 dark:text-white">{item.title}</h4>
                                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="relative aspect-square">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/20"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-20 rounded-full border-2 border-dashed border-purple-500/20"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full"
                                />
                                <Compass size={120} className="text-white relative z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Role Portal Section */}
            <section className="py-40 px-6 relative z-10 bg-slate-50 dark:bg-[#050508] transition-colors duration-500">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-32">
                        <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter mb-8 leading-[0.8] text-slate-900 dark:text-white">CHOOSE YOUR <span className="text-indigo-600 dark:text-indigo-500">DIMENSION.</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 text-2xl font-bold italic">Tailored experiences for every stakeholder.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <RoleCard
                            title="Student"
                            desc="Automate your job search and master interviews with AI. Go AFK while your career builds itself."
                            icon={Rocket}
                            color="indigo"
                            path="/register"
                        />
                        <RoleCard
                            title="Recruiter"
                            desc="Source precision talent with 99% match accuracy. Turn your hiring pipeline into an autopilot engine."
                            icon={Target}
                            color="emerald"
                            path="/login"
                        />
                        <RoleCard
                            title="Admin"
                            desc="Govern the future ecosystem. Real-time platform policing and infrastructure control."
                            icon={Lock}
                            color="red"
                            path="/login"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Final Hook */}
            <section className="py-80 px-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        style={{ y: backgroundTransform }}
                        className="w-[1200px] h-[1200px] bg-indigo-500/5 blur-[200px] rounded-full"
                    />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="glass p-24 rounded-[5rem] border-slate-200 dark:border-white/10"
                    >
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-12 leading-[0.85] text-slate-900 dark:text-white">THE FUTURE IS <span className="italic text-indigo-600 dark:text-indigo-500 underline decoration-indigo-500/30">IDLE.</span></h2>
                        <p className="text-2xl text-slate-500 dark:text-slate-400 font-bold mb-16 leading-relaxed">Join 10k+ elite developers who have automated their career search.</p>
                        <Link to="/register" className="bg-slate-900 dark:bg-white text-white dark:text-black px-16 py-7 rounded-[2rem] text-2xl font-black transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-indigo-500/20 inline-block">
                            Initialize Protocol
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Status Footer */}
            <footer className="py-20 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-black/40 backdrop-blur-3xl text-center transition-colors duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 max-w-7xl mx-auto opacity-50 font-black uppercase tracking-[0.4em] text-[10px] text-slate-500 dark:text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_emerald]" />
                        <span>System Status: Optimal</span>
                    </div>
                    <span>Hire AFK &copy; 2026 // Next-gen Recruitment Architecture</span>
                    <div className="flex gap-10">
                        <span>P-6092</span>
                        <span>Node-V.04</span>
                    </div>
                </div><br />
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">developed by psychopath</p>
            </footer>

            {/* Easter Egg Overlay */}
            <AnimatePresence>
                {isOverride && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-red-600/10 pointer-events-none flex items-center justify-center flex-col gap-6"
                    >
                        <div className="absolute inset-0 cyber-glow-pattern pointer-events-none" />
                        <motion.h2
                            animate={{ scale: [1, 1.1, 1], filter: ["blur(0px)", "blur(20px)", "blur(0px)"] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                            className="text-8xl font-black text-red-500 tracking-[0.5em] italic"
                        >
                            AUTOMATION ACTIVATED
                        </motion.h2>
                        <div className="text-red-500/50 font-black tracking-widest uppercase text-xl">System Override in Progress...</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                .cyber-mode {
                    filter: hue-rotate(280deg) brightness(1.2) contrast(1.2);
                }
                .cyber-glow-pattern {
                    background-image: repeating-linear-gradient(0deg, rgba(255,0,0,0.1) 0px, transparent 1px, transparent 40px);
                    background-size: 100% 40px;
                }
            ` }} />
        </div>
    );
};

export default GuestLanding;
