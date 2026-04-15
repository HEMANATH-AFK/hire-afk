import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import GlassSelect from '../components/GlassSelect';
import { Camera, FileText, CheckCircle, CheckCircle2, ChevronRight, Briefcase, Trash2, Rocket, Search, X, AlertTriangle, Play, Info, Zap, Filter, Sparkles, Flame, Trophy, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [step, setStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        description: '',
        skills: '',
        profilePic: null,
        resume: null
    });
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedAppForReport, setSelectedAppForReport] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [selectedAppDetails, setSelectedAppDetails] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    // AI Matcher State
    const [aiMatches, setAiMatches] = useState(null);
    const [showAiMatches, setShowAiMatches] = useState(false);
    const [fetchingAi, setFetchingAi] = useState(false);

    const [gamification, setGamification] = useState(null);

    const fetchAiMatches = async () => {
        setFetchingAi(true);
        setShowAiMatches(true);
        try {
            const res = await axios.get('http://localhost:5000/api/jobs/ai-match', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Safety net
                }
            });
            setAiMatches(res.data);
        } catch (err) {
            toast.error('Failed to fetch AI matches');
            setShowAiMatches(false);
        } finally {
            setFetchingAi(false);
        }
    };

    const fetchGamification = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/gamification/status', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setGamification(res.data);
        } catch (err) {
            console.error("Error fetching gamification status:", err);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchApplications();
        if (user?.role === 'student') fetchGamification();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/profile');
            setProfile(res.data);
            if (res.data.isProfileComplete) setStep(0); // 0 means dashboard
            setFormData({
                name: res.data.name || '',
                email: res.data.email || '',
                mobile: res.data.mobile || '',
                description: res.data.description || '',
                skills: res.data.skills?.join(', ') || '',
                profilePic: null,
                resume: null
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchApplications = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/applications/student');
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const calculateProfileStrength = () => {
        if (!profile) return 0;
        let score = 0;
        if (profile.name) score += 10;
        if (profile.email) score += 10;
        if (profile.mobile) score += 10;
        if (profile.description?.length > 50) score += 20;
        if (profile.skills?.length >= 3) score += 20;
        if (profile.profilePic) score += 15;
        if (profile.resumeUrl) score += 15;
        return score;
    };

    const getSkillGap = () => {
        if (!aiMatches) return [];
        const missing = aiMatches.flatMap(m => m.analysis?.missingSkills || []);
        const counts = {};
        missing.forEach(s => {
            const skill = s.toLowerCase().trim();
            counts[skill] = (counts[skill] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(e => e[0]);
    };

    const handleWithdraw = async (appId) => {
        if (!window.confirm('Are you sure you want to withdraw this application?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/applications/${appId}`);
            fetchApplications();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Withdrawal failed');
        }
    };

    const filteredApplications = applications.filter(app => {
        if (!app.job) return false;
        const matchesSearch = app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleUpdate = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('mobile', formData.mobile);
        data.append('description', formData.description);
        data.append('skills', formData.skills);
        if (formData.profilePic) data.append('profilePic', formData.profilePic);
        if (formData.resume) data.append('resume', formData.resume);

        setIsUpdating(true);
        try {
            const res = await axios.put('http://localhost:5000/api/profile', data);
            setProfile(res.data);

            // Sync form data with updated profile (crucial for extracted skills)
            setFormData(prev => ({
                ...prev,
                skills: res.data.skills?.join(', ') || '',
                resume: null,
                profilePic: null
            }));

            if (isEditing) {
                setIsEditing(false);
            } else if (step === 3) {
                setStep(0); // Finished onboarding
                fetchApplications();
            } else {
                setStep(step + 1);
            }
        } catch (err) {
            toast.error('Update failed');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportReason.trim() || !selectedAppForReport) return;

        setSubmittingReport(true);
        try {
            await axios.post('http://localhost:5000/api/admin/report', {
                recruiterId: selectedAppForReport.job.recruiter?._id || selectedAppForReport.job.recruiter,
                jobId: selectedAppForReport.job._id,
                reason: reportReason
            });
            toast.success('Report submitted successfully. Our team will review it.');
            setShowReportModal(false);
            setReportReason('');
            setSelectedAppForReport(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit report.');
        } finally {
            setSubmittingReport(false);
        }
    };

    if (loading) return <div className="max-w-7xl mx-auto px-6 py-12 space-y-8"><SkeletonLoader type="card" count={2} /></div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <AnimatePresence mode="wait">
                {step > 0 ? (
                    <motion.div
                        key="onboarding"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass p-10 rounded-3xl max-w-2xl mx-auto"
                    >
                        <div className="flex justify-between mb-8">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`w-1/3 h-2 rounded-full mx-1 transition-all ${s <= step ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            ))}
                        </div>

                        {step === 1 && (
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <h2 className="text-3xl font-bold mb-4 font-black tracking-tight text-slate-900 dark:text-white transition-colors">Basic Information</h2>
                                <div>
                                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-widest">Mobile Number</label>
                                    <input
                                        type="text" value={formData.mobile}
                                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white font-bold" placeholder="+91 0000000000" required
                                    />
                                </div>
                                <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-center group hover:border-indigo-500 transition-colors">
                                    <Camera className="mx-auto mb-2 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" size={32} />
                                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-bold cursor-pointer">Profile Picture (Optional)</label>
                                    <input type="file" onChange={e => setFormData({ ...formData, profilePic: e.target.files[0] })} className="text-xs text-slate-500 file:bg-slate-200 dark:file:bg-slate-700 file:border-none file:px-4 file:py-2 file:rounded-full file:text-slate-700 dark:file:text-white file:cursor-pointer" />
                                </div>
                                <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 text-white">Next <ChevronRight size={20} /></button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <h2 className="text-3xl font-bold mb-4 font-black tracking-tight text-slate-900 dark:text-white transition-colors">Professional Details</h2>
                                <div>
                                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-widest">Description / Bio</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 outline-none h-32 focus:border-indigo-500 transition-colors resize-none text-slate-900 dark:text-white font-bold" placeholder="Tell us about yourself..." required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-widest">Skills (Comma separated)</label>
                                    <input
                                        type="text" value={formData.skills}
                                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white font-bold" placeholder="React, Node.js, MongoDB..." required
                                    />
                                </div>
                                <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 text-white">Next <ChevronRight size={20} /></button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleUpdate} className="space-y-6 text-center">
                                <h2 className="text-3xl font-bold mb-4 font-black tracking-tight text-slate-900 dark:text-white transition-colors">Upload Resume</h2>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 flex flex-col items-center gap-4 hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/20">
                                    <FileText size={64} className="text-indigo-600 dark:text-indigo-400" />
                                    <p className="text-slate-500 dark:text-slate-400">Select your professional resume (PDF only)</p>
                                    <input type="file" accept=".pdf" onChange={e => setFormData({ ...formData, resume: e.target.files[0] })} required className="hidden" id="resume-upload" />
                                    <label htmlFor="resume-upload" className="bg-slate-200 dark:bg-slate-700 px-8 py-3 rounded-2xl cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 font-bold transition-all text-slate-900 dark:text-white">
                                        {formData.resume ? formData.resume.name : 'Choose File'}
                                    </label>
                                </div>
                                <button
                                    disabled={isUpdating}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-5 rounded-2xl font-black text-2xl mt-6 transition-all shadow-2xl shadow-indigo-600/30 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            {formData.resume ? "Extracting Skills..." : "Saving..."}
                                        </>
                                    ) : (
                                        "Finish & Auto-Apply"
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                        {isEditing ? (
                            <div className="glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-4xl font-black tracking-tighter text-white">Edit Your Profile</h2>
                                    <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white font-bold p-3">Cancel</button>
                                </div>

                                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                            <input
                                                type="text" value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                            <input
                                                type="email" value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                                            <input
                                                type="text" value={formData.mobile}
                                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Profile Picture</label>
                                            <div className="flex items-center gap-4">
                                                {profile?.profilePic && <img src={`http://localhost:5000/${profile.profilePic}`} className="w-16 h-16 rounded-2xl object-cover border border-white/10" alt="Current" />}
                                                <input type="file" onChange={e => setFormData({ ...formData, profilePic: e.target.files[0] })} className="text-xs text-slate-500 file:bg-slate-800 file:border-none file:px-4 file:py-2 file:rounded-xl file:text-white file:font-bold" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Bio / Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none h-32 focus:border-indigo-500/50 transition-all font-bold resize-none text-slate-900 dark:text-white"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Skills (Comma Seperated)</label>
                                            <input
                                                type="text" value={formData.skills}
                                                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Update Resume (PDF)</label>
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                                    <FileText size={20} />
                                                </div>
                                                <input type="file" accept=".pdf" onChange={e => setFormData({ ...formData, resume: e.target.files[0] })} className="text-xs text-slate-500 file:bg-slate-800 file:border-none file:px-4 file:py-2 file:rounded-xl file:text-white file:font-bold" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-6">
                                        <button
                                            type="submit"
                                            disabled={isUpdating}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 py-5 rounded-3xl font-black text-xl transition-all shadow-2xl shadow-indigo-600/30 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {isUpdating ? (
                                                <>
                                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                    {formData.resume ? "Extracting Skills..." : "Saving..."}
                                                </>
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            {profile?.profilePic ? (
                                                <img src={`http://localhost:5000/${profile.profilePic}`} className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] object-cover border-4 border-indigo-500/30 shadow-2xl shadow-indigo-500/20" alt="Profile" />
                                            ) : (
                                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-indigo-900/20 flex items-center justify-center border-4 border-indigo-500/30">
                                                    <Rocket className="text-indigo-400" size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-1 bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">Hello, {profile?.name} ✨</h1>
                                            <p className="text-slate-500 dark:text-slate-400 font-bold mb-4 flex items-center gap-2">
                                                <CheckCircle size={18} className="text-green-600 dark:text-green-400" /> Professional Developer
                                            </p>
                                            <div className="flex gap-3">
                                                <button onClick={() => setIsEditing(true)} className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-6 py-2 rounded-xl text-sm font-bold transition-all border border-slate-300 dark:border-white/5 text-slate-900 dark:text-white">Edit Profile</button>
                                                {profile?.resumeUrl && (
                                                    <a href={`http://localhost:5000/${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/20 px-6 py-2 rounded-xl text-sm font-bold transition-all border border-indigo-500/20">
                                                        <FileText size={16} /> View Resume
                                                    </a>
                                                )}
                                            </div>

                                            {/* Gamification HUD */}
                                            {gamification && (
                                                <div className="flex flex-wrap items-center gap-4 mt-8">
                                                    <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/30">
                                                            {gamification.level}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Current Level</p>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                                {gamification.xp} <span className="text-slate-400">XP</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-orange-500/10 px-4 py-2 rounded-2xl border border-orange-500/20 group hover:bg-orange-500/20 transition-all cursor-default relative">
                                                        <Flame className={`text-orange-500 ${gamification.streakCount > 0 ? 'animate-pulse' : ''}`} size={24} />
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Daily Streak</p>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{gamification.streakCount} Days</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-[200px] bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/5">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                            <span>{gamification.level >= 10 ? 'MAX LEVEL REACHED' : 'Next Level'}</span>
                                                            {gamification.level < 10 && <span>{gamification.xpToNextLevel} XP needed</span>}
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out" 
                                                                style={{ width: gamification.level >= 10 ? '100%' : `${Math.min(100, (gamification.xp % 100))}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="glass px-8 py-6 rounded-[2rem] text-center border-slate-200 dark:border-white/5 md:w-64">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Status</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">Automated</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold leading-relaxed">Agent is actively applying to matches.</p>
                                        <button onClick={fetchAiMatches} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
                                            <Sparkles size={14} /> Top 5 Matches
                                        </button>
                                    </div>
                                </div>

                                {/* Profile Strength & Skill Gap Analysis */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/5 to-transparent border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-10">
                                            <Sparkles size={80} className="text-indigo-400" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Profile Strength</h3>
                                        <div className="flex items-end gap-4 mb-4">
                                            <span className="text-6xl font-black text-slate-900 dark:text-white transition-colors">{calculateProfileStrength()}%</span>
                                            <span className="text-slate-400 font-bold mb-2 uppercase tracking-widest text-[10px]">Optimized</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6 transition-colors">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${calculateProfileStrength()}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {calculateProfileStrength() < 100 && (
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors">
                                                    Tip: {!profile?.resumeUrl ? "Upload your resume" : !profile?.profilePic ? "Add a profile photo" : "Expand your description"} to reach 100%
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-500/5 to-transparent border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 text-orange-400">
                                            <Target size={80} />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Skill Gap Analysis</h3>
                                        {getSkillGap().length > 0 ? (
                                            <div className="space-y-4">
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed transition-colors">Top missing skills in your target jobs:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {getSkillGap().map(skill => (
                                                        <a 
                                                            key={skill}
                                                            href={`https://www.youtube.com/results?search_query=learn+${skill}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="group flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 px-4 py-2 rounded-xl text-orange-600 dark:text-orange-400 transition-all border border-orange-500/20"
                                                        >
                                                            <span className="text-xs font-black uppercase tracking-widest">{skill}</span>
                                                            <Play size={10} className="group-hover:translate-x-1 transition-transform" />
                                                        </a>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic mt-4">Click to find learning resources on YouTube</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full py-4">
                                                <CheckCircle size={32} className="text-green-500/50 mb-3" />
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No major skill gaps found!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-8 flex flex-col gap-8">
                                        <div className="space-y-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white"><Briefcase className="text-indigo-600 dark:text-indigo-400" size={32} /> Applications</h2>

                                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                                    <div className="relative flex-1 sm:w-64">
                                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                                                        <input
                                                            type="text"
                                                            placeholder="Search jobs..."
                                                            value={searchTerm}
                                                            onChange={e => setSearchTerm(e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:border-indigo-500/50 outline-none transition-all text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <GlassSelect
                                                        className="min-w-[180px]"
                                                        options={[
                                                            { value: 'all', label: 'All Status' },
                                                            { value: 'pending', label: 'Pending' },
                                                            { value: 'accepted', label: 'Accepted' },
                                                            { value: 'rejected', label: 'Rejected' }
                                                        ]}
                                                        value={statusFilter}
                                                        onChange={(val) => setStatusFilter(val)}
                                                    />
                                                </div>
                                            </div>

                                            {filteredApplications.length > 0 ? (
                                                <div className="grid gap-6">
                                                    <AnimatePresence>
                                                        {filteredApplications.map((app, i) => (
                                                            <motion.div
                                                                layout
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95, x: -50 }}
                                                                transition={{ duration: 0.2 }}
                                                                key={app._id}
                                                                className="glass p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 border-white/5 hover:border-indigo-500/20 transition-all group"
                                                            >
                                                                <div className="flex items-center gap-6 w-full md:w-auto">
                                                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                                                        <Briefcase size={28} />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-2xl font-black tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-slate-900 dark:text-white">{app.job.title}</h3>
                                                                        <p className="text-slate-500 dark:text-slate-400 font-bold mb-3">{app.job.company}</p>
                                                                        {app.analysis?.matchedSkills?.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {app.analysis.matchedSkills.slice(0, 3).map((skill, i) => (
                                                                                    <span key={i} className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-green-500/10 text-green-600 border border-green-500/20 shadow-sm shadow-green-500/5">
                                                                                        {skill}
                                                                                    </span>
                                                                                ))}
                                                                                {app.analysis.matchedSkills.length > 3 && (
                                                                                    <span className="text-[9px] font-black text-slate-400 self-center">+{app.analysis.matchedSkills.length - 3} more</span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                                    <div className="text-right">
                                                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mb-1">Match Score</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-indigo-500" style={{ width: `${app.matchScore}%` }}></div>
                                                                            </div>
                                                                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{app.matchScore}%</span>
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md ${app.matchScore >= 75 ? 'bg-green-500/10 text-green-500' :
                                                                                app.matchScore >= 50 ? 'bg-indigo-500/10 text-indigo-500' :
                                                                                    'bg-slate-500/10 text-slate-500'
                                                                                }`}>
                                                                                {app.matchScore >= 75 ? 'Strong Match' : app.matchScore >= 50 ? 'Good Fit' : 'Fair Match'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col items-end gap-2">
                                                                        <div className={`px-8 py-3 rounded-2xl text-sm font-black tracking-wider ${app.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                                            app.status === 'accepted' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                                                'bg-red-500/10 text-red-500 border border-red-500/20'
                                                                            }`}>
                                                                            {app.status.toUpperCase()}
                                                                        </div>
                                                                        {app.status === 'pending' && (
                                                                            <button
                                                                                onClick={() => handleWithdraw(app._id)}
                                                                                className="text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors flex items-center gap-1 mt-1"
                                                                            >
                                                                                <Trash2 size={12} /> Withdraw
                                                                            </button>
                                                                        )}
                                                                        {(app.status === 'accepted' || app.status === 'pending') && (
                                                                            <button
                                                                                onClick={() => navigate(`/interview-prep/${app.job._id}`)}
                                                                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20 mt-2 flex items-center gap-2"
                                                                            >
                                                                                <Rocket size={14} fill="currentColor" /> Practice Interview
                                                                            </button>
                                                                        )}
                                                                        {app.status === 'rejected' && (
                                                                            <button
                                                                                onClick={() => handleWithdraw(app._id)}
                                                                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1 mt-1"
                                                                            >
                                                                                <Trash2 size={12} /> Delete Record
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedAppDetails(app);
                                                                                setShowDetailsModal(true);
                                                                            }}
                                                                            className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mt-2 flex items-center gap-2 border border-slate-200 dark:border-white/5 w-full justify-center"
                                                                        >
                                                                            <Info size={14} /> View Match Breakdown
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            ) : (
                                                <EmptyState 
                                                    title={searchTerm || statusFilter !== 'all' ? "No Matches Found" : "No Applications Yet"}
                                                    message={searchTerm || statusFilter !== 'all' ? "We couldn't find any applications matching your filters. Try adjusting your search." : "You haven't submitted any applications. Head over to the Jobs page to start!"}
                                                    actionLabel="Browse Jobs"
                                                    onAction={() => navigate('/jobs')}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 flex flex-col gap-10">
                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">Your Skills</h2>
                                            <div className="glass p-8 rounded-[2.5rem] border-slate-200 dark:border-white/5 flex flex-wrap gap-3">
                                                {profile?.skills?.map((skill, i) => (
                                                    <span key={i} className="bg-slate-100 dark:bg-white/5 hover:bg-indigo-500/20 px-5 py-2 rounded-xl text-sm font-black transition-all border border-slate-200 dark:border-white/5 hover:border-indigo-600 dark:hover:border-indigo-500/30 cursor-default text-slate-700 dark:text-white">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {gamification?.challenges && (
                                            <div className="space-y-6">
                                                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
                                                    <Trophy className="text-amber-500" /> Achievements
                                                </h2>
                                                <div className="glass p-8 rounded-[2.5rem] border-slate-200 dark:border-white/5 space-y-4">
                                                    {gamification.challenges.map((challenge) => (
                                                        <div key={challenge.id} className={`p-5 rounded-3xl border transition-all ${challenge.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className={`font-black text-sm ${challenge.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                                    {challenge.title}
                                                                </h4>
                                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${challenge.completed ? 'bg-emerald-500 text-white' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                                                    +{challenge.xp} XP
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-tight">{challenge.description}</p>
                                                            {challenge.completed && (
                                                                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                                                    <CheckCircle2 size={12} /> Completed
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-red-600 dark:text-red-500">Report Recruiter</h2>
                                            <div className="glass p-8 rounded-[2.5rem] border-red-200 dark:border-red-500/10 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-red-500/10 transition-all"></div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-bold leading-relaxed relative z-10">Did a recruiter try to sell you a course instead of a job? Report them to keep the platform clean.</p>
                                                <button
                                                    onClick={() => {
                                                        const validApp = applications.find(a => a.job);
                                                        setSelectedAppForReport(validApp || null);
                                                        setShowReportModal(true);
                                                    }}
                                                    className="w-full border-2 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 py-4 rounded-2xl hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all font-black text-lg relative z-10 shadow-lg shadow-red-500/5"
                                                >
                                                    File a Report
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Reporting Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReportModal(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass w-full max-w-xl p-10 rounded-[3.5rem] relative border-slate-200 dark:border-white/10 shadow-2xl"
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 flex items-center justify-center">
                                            <AlertTriangle size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Report Recruiter</h2>
                                            <p className="text-sm text-slate-500 font-bold">Help us keep Hire AFK safe.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowReportModal(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <X size={28} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
                                        <GlassSelect
                                            label="Select Application to Report"
                                            options={[
                                                { value: '', label: 'Choose an application...' },
                                                ...applications.filter(a => a.job).map(app => ({
                                                    value: app._id,
                                                    label: `${app.job?.company} - ${app.job?.title}`
                                                }))
                                            ]}
                                            value={selectedAppForReport?._id || ''}
                                            onChange={(val) => {
                                                const app = applications.find(a => a._id === val);
                                                setSelectedAppForReport(app);
                                            }}
                                        />
                                    </div>

                                    {selectedAppForReport?.job && (
                                        <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Company / Role</p>
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white">{selectedAppForReport.job.company}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">{selectedAppForReport.job.title}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleReportSubmit} className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 ml-1">Detail the suspicious activity</label>
                                            <textarea
                                                required
                                                value={reportReason}
                                                onChange={(e) => setReportReason(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-3xl px-8 py-6 outline-none focus:border-red-500/50 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none h-40"
                                                placeholder="Example: Asking for payment, selling courses instead of hiring, misleading description..."
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowReportModal(false)}
                                                className="flex-1 py-5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white font-black text-sm transition-all border border-slate-200 dark:border-white/10"
                                            >
                                                Discard
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submittingReport || !reportReason.trim() || !selectedAppForReport}
                                                className="flex-[2] py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50"
                                            >
                                                {submittingReport ? 'Submitting...' : 'Send Report'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Match Breakdown Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedAppDetails && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailsModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 md:p-10 rounded-[3rem] relative border-slate-200 dark:border-white/10 shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                                        <Zap size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Match Insights</h2>
                                        <p className="text-sm text-slate-500 font-bold">{selectedAppDetails.job.title} @ {selectedAppDetails.job.company}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowDetailsModal(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Score & Summary */}
                                <div className="bg-indigo-600/5 p-8 rounded-3xl border border-indigo-500/10 text-center">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Overall Match Score</p>
                                    <h3 className="text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-4">{selectedAppDetails.matchScore}%</h3>
                                    <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed italic">"{selectedAppDetails.analysis?.summary || "Great match based on your core skills!"}"</p>
                                </div>

                                {/* Skill Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-green-600 dark:text-green-500 flex items-center gap-2">
                                            <CheckCircle size={16} /> Matched Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedAppDetails.analysis?.matchedSkills?.length > 0 ? (
                                                selectedAppDetails.analysis.matchedSkills.map((s, i) => (
                                                    <span key={i} className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-xl text-xs font-black border border-green-500/20 capitalize">{s}</span>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-400 font-bold">No direct skill matches found.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <AlertTriangle size={16} /> Missing Gaps
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedAppDetails.analysis?.missingSkills?.length > 0 ? (
                                                selectedAppDetails.analysis.missingSkills.map((s, i) => (
                                                    <span key={i} className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl text-xs font-black border border-slate-200 dark:border-white/5 capitalize">{s}</span>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-400 font-bold">Perfect alignment with job keywords!</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Feedback */}
                                <div className="space-y-6 pt-4">
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Rocket className="text-purple-500" size={20} />AFK Resume Feedback
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
                                            <p className="text-xs font-black uppercase text-indigo-500 mb-3 tracking-widest">Key Strengths</p>
                                            <ul className="space-y-2">
                                                {selectedAppDetails.aiFeedback?.strengths?.map((s, i) => (
                                                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 font-bold flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" /> {s}
                                                    </li>
                                                )) || <li className="text-sm text-slate-400 font-bold italic">Analyzing strengths...</li>}
                                            </ul>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
                                            <p className="text-xs font-black uppercase text-purple-500 mb-3 tracking-widest">Growth Areas</p>
                                            <ul className="space-y-2">
                                                {selectedAppDetails.aiFeedback?.weaknesses?.map((w, i) => (
                                                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 font-bold flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" /> {w}
                                                    </li>
                                                )) || <li className="text-sm text-slate-400 font-bold italic">Analyzing growth areas...</li>}
                                            </ul>
                                        </div>

                                        <div className="bg-indigo-600 dark:bg-indigo-500 p-6 rounded-3xl text-white shadow-xl shadow-indigo-600/20">
                                            <p className="text-xs font-black uppercase text-indigo-100 mb-3 tracking-widest">Smart Recommendations</p>
                                            <ul className="space-y-2">
                                                {selectedAppDetails.aiFeedback?.recommendations?.map((r, i) => (
                                                    <li key={i} className="text-sm font-black flex items-start gap-2">
                                                        <ChevronRight size={16} className="shrink-0" /> {r}
                                                    </li>
                                                )) || <li className="text-sm opacity-50 font-bold italic">Generating recommendations...</li>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="w-full mt-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                            >
                                Got it, thanks!
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Top 5 AI Matches Modal */}
            <AnimatePresence>
                {showAiMatches && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAiMatches(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-10 rounded-[3rem] relative border-indigo-500/20 shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-8 border-b border-indigo-500/10 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                                        <Sparkles size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">AI Job Matcher <span className="text-indigo-500 italic text-xl">Top 5</span></h2>
                                        <p className="text-sm text-slate-500 font-bold">Curated mathematically and personalized by AI.</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAiMatches(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={28} />
                                </button>
                            </div>

                            {fetchingAi ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <p className="text-indigo-500 font-bold animate-pulse">Consulting the Smart Matching Engine...</p>
                                </div>
                            ) : aiMatches && aiMatches.length > 0 ? (
                                <div className="space-y-6">
                                    {aiMatches.map((job, idx) => (
                                        <div key={job._id} className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all group">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-black uppercase tracking-widest bg-indigo-500 text-white px-2 py-0.5 rounded-md">#{idx + 1}</span>
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{job.title}</h3>
                                                    </div>
                                                    <p className="text-slate-500 dark:text-slate-400 font-bold">{job.company}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mb-1">Match Grade</p>
                                                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{job.matchScore || 0}%</span>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                                                <p className="text-xs uppercase font-black tracking-widest text-indigo-500 mb-2">AI Pitch</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">"{job.aiPitch}"</p>
                                            </div>
                                            
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {job.keywords?.slice(0, 5).map((k, i) => (
                                                    <span key={i} className="text-[10px] font-black uppercase px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{k}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Search}
                                    title="No Matches Available"
                                    message="We couldn't mathematically match you with active jobs. Try updating your profile or skills!"
                                />
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default StudentDashboard;
