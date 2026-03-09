import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, ChevronLeft, Award, Play, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';

const InterviewPrep = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [currentStep, setCurrentStep] = useState(-1); // -1 for intro
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const startInterview = async () => {
        setIsGenerating(true);
        try {
            const res = await axios.post('http://localhost:5000/api/interviews/generate', { jobId });
            setInterview(res.data);
            setCurrentStep(0);
        } catch (err) {
            alert('Failed to start interview');
        } finally {
            setIsGenerating(false);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/interviews/submit', {
                interviewId: interview._id,
                questionIndex: currentStep,
                answer
            });
            setFeedback(res.data.responses[res.data.responses.length - 1]);
            setInterview(res.data);
        } catch (err) {
            alert('Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const nextQuestion = () => {
        setFeedback(null);
        setAnswer('');
        if (currentStep < interview.questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(100); // Completed
        }
    };

    if (isGenerating) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="w-20 h-20 border-t-2 border-indigo-500 rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-black text-white">AI Agent is generating questions...</h2>
                <p className="text-slate-500 font-bold mt-2">Personalizing interview based on job description</p>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-6 md:p-12 selection:bg-indigo-500/30">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-xs tracking-widest group">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-all">
                            <ChevronLeft size={16} />
                        </div>
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <ShieldCheck className="text-indigo-500" size={20} />
                        </div>
                        <span className="text-sm font-black text-white uppercase tracking-tighter">AI Interview Lab v1.0</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Intro Stage */}
                    {currentStep === -1 && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden text-center"
                        >
                            <div className="relative z-10">
                                <Award className="text-indigo-400 mx-auto mb-8" size={64} />
                                <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Ready to Scale?</h1>
                                <p className="text-xl text-slate-400 font-bold mb-12 max-w-xl mx-auto leading-relaxed">
                                    Our AI agent will simulate a real interview scenario. Be concise, professional, and specific. Your performance will be analyzed in real-time.
                                </p>
                                <button
                                    onClick={startInterview}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-6 rounded-[2rem] text-xl font-black transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-4 mx-auto group"
                                >
                                    Start AI Simulator <Play size={24} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="mt-12 flex justify-center gap-8">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600">
                                        <MessageSquare size={14} /> 5 Custom Questions
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600">
                                        <CheckCircle size={14} /> Instant Feedback
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                        </motion.div>
                    )}

                    {/* Interview Stage */}
                    {currentStep >= 0 && currentStep < 100 && (
                        <motion.div
                            key="interview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-10"
                        >
                            {/* Question UI */}
                            <div className="glass p-10 rounded-[3rem] border-indigo-500/20 bg-gradient-to-br from-indigo-900/10 to-transparent">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">Question {currentStep + 1}/5</span>
                                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">{interview.questions[currentStep].type}</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 italic">Interview in progress</span>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight leading-tight">
                                    {interview.questions[currentStep].text}
                                </h3>
                            </div>

                            {/* Answer Input */}
                            {!feedback ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="relative">
                                        <textarea
                                            autoFocus
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="w-full bg-slate-900/50 border-2 border-white/5 rounded-[2.5rem] px-10 py-10 outline-none focus:border-indigo-500/50 transition-all font-bold text-lg text-white placeholder:text-slate-700 h-64 resize-none shadow-inner"
                                        />
                                        <div className="absolute bottom-6 right-10 text-xs font-black text-slate-600 uppercase tracking-widest">
                                            {answer.length} characters
                                        </div>
                                    </div>
                                    <button
                                        onClick={submitAnswer}
                                        disabled={loading || !answer.trim()}
                                        className="w-full bg-white text-black hover:bg-indigo-50 py-6 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 shadow-2xl"
                                    >
                                        {loading ? 'AI Agent is analyzing...' : 'Submit Response'} <Send size={24} />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-white/5 border border-indigo-500/20 rounded-[2.5rem] p-10 relative overflow-hidden">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                                {feedback.score}
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">AI Score</p>
                                                <p className="text-lg font-black text-indigo-400">Response Insight</p>
                                            </div>
                                        </div>
                                        <p className="text-xl text-white font-bold leading-relaxed pr-24">
                                            {feedback.feedback}
                                        </p>
                                        <div className="absolute top-10 right-10 opacity-10">
                                            <ShieldCheck size={120} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={nextQuestion}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-3xl font-black text-xl transition-all shadow-xl shadow-indigo-600/20"
                                    >
                                        {currentStep === 4 ? 'Finish Interview' : 'Next Question'}
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Completion Stage */}
                    {currentStep === 100 && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-16 rounded-[4rem] text-center border-indigo-500/30 bg-gradient-to-t from-indigo-900/20 to-transparent"
                        >
                            <div className="w-24 h-24 bg-green-500/10 rounded-[2.5rem] border border-green-500/20 flex items-center justify-center mx-auto mb-8 text-green-500">
                                <Award size={48} />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Simulation Complete</h2>
                            <p className="text-slate-400 font-bold mb-12">Analysis complete. Your readiness score for this role is:</p>

                            <div className="flex justify-center items-end gap-2 mb-16">
                                <span className="text-9xl font-black text-white leading-none tracking-tighter">{interview.overallScore}</span>
                                <span className="text-3xl font-black text-indigo-500 mb-4">%</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto mb-12">
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Consistency</p>
                                    <p className="text-xl font-black text-white">Stable</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Role Match</p>
                                    <p className="text-xl font-black text-white">Advanced</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-white text-black px-12 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl"
                            >
                                Finish & Exit Lab
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InterviewPrep;
