import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, DollarSign, Filter, Briefcase, ChevronRight, Check, Users, Flag, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JobsPage = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        minSalary: '',
        keywords: ''
    });
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedJobForReport, setSelectedJobForReport] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        fetchJobs();
        if (user?.role === 'student') {
            fetchAppliedJobs();
        }
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.location) params.append('location', filters.location);
            if (filters.minSalary) params.append('minSalary', filters.minSalary);
            if (filters.keywords) params.append('keywords', filters.keywords);

            const res = await axios.get(`http://localhost:5000/api/jobs?${params.toString()}`);
            setJobs(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchAppliedJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/applications/student');
            setAppliedJobs(res.data.map(app => app.job._id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const handleManualApply = async (jobId) => {
        try {
            await axios.post('http://localhost:5000/api/applications/manual', { jobId });
            alert('Application submitted successfully!');
            fetchAppliedJobs();
        } catch (err) {
            alert(err.response?.data?.message || 'Application failed');
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportReason.trim()) return;

        setSubmittingReport(true);
        try {
            await axios.post('http://localhost:5000/api/admin/report', {
                recruiterId: selectedJobForReport.recruiter?._id || selectedJobForReport.recruiter,
                jobId: selectedJobForReport._id,
                reason: reportReason
            });
            alert('Report submitted successfully. Our team will review it.');
            setShowReportModal(false);
            setReportReason('');
            setSelectedJobForReport(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setSubmittingReport(false);
        }
    };

    return (
        <div className="min-h-screen transition-colors duration-300">
            {/* Header / Hero Section */}
            <div className="relative pt-24 pb-12 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
                            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500 dark:from-indigo-400 dark:via-cyan-400 dark:to-emerald-400">Perfect Role</span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                            Discover career-defining opportunities from top-tier recruiters worldwide. Your next big move starts here.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Filters Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 space-y-8"
                    >
                        <div className="glass p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 sticky top-24">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Filter size={20} className="text-indigo-600 dark:text-indigo-400" /> Filters
                                </h3>
                                <button
                                    onClick={() => {
                                        setFilters({ search: '', location: '', minSalary: '', keywords: '' });
                                        fetchJobs();
                                    }}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Keywords</label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Job title, skills..."
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Location</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="City, Remote..."
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                                            value={filters.location}
                                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Min Salary</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                                        <input
                                            type="number"
                                            placeholder="Salary floor"
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-500/50 transition-all font-bold text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
                                            value={filters.minSalary}
                                            onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={fetchJobs}
                                    className="w-full bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 text-sm tracking-tight active:scale-95"
                                >
                                    Update Results
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Job Listings Grid */}
                    <div className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
                                {loading ? 'Searching...' : `Found ${jobs.length} Positions`}
                            </h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 4, 5].map(i => (
                                    <div key={i} className="glass h-[400px] rounded-[2.5rem] animate-pulse border border-white/5 opacity-40" />
                                ))}
                            </div>
                        ) : jobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {jobs.map((job, idx) => (
                                        <motion.div
                                            key={job._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="glass group p-8 rounded-[3rem] border border-slate-200 dark:border-white/5 hover:border-indigo-600/30 dark:hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 flex flex-col h-full relative overflow-hidden"
                                        >
                                            {/* Top Row: Logo & Report */}
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 duration-500">
                                                    {job.companyLogo ? (
                                                        <img
                                                            src={job.companyLogo.startsWith('http') ? job.companyLogo : `http://localhost:5000/${job.companyLogo}`}
                                                            className="w-full h-full object-cover"
                                                            alt={job.company}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : <div style={{ display: 'none' }}></div>}
                                                    <Briefcase className="text-slate-400 dark:text-slate-500" size={24} style={{ display: job.companyLogo ? 'none' : 'block' }} />
                                                </div>

                                                {user?.role === 'student' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedJobForReport(job);
                                                            setShowReportModal(true);
                                                        }}
                                                        className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                                                        title="Report suspicious posting"
                                                    >
                                                        <Flag size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Content Block */}
                                            <div className="flex-grow">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-[1.1] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <span className="text-sm font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">{job.company}</span>
                                                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{job.jobType}</span>
                                                </div>

                                                <div className="flex flex-wrap gap-4 mb-8">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-white/5">
                                                        <MapPin size={14} className="text-indigo-600 dark:text-indigo-400" /> {job.location}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-white/5">
                                                        <Users size={14} className="text-cyan-600 dark:text-cyan-400" /> {job.vacancies} Openings
                                                    </div>
                                                </div>

                                                <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {job.description}
                                                </p>
                                            </div>

                                            {/* Bottom Row: Salary & Apply */}
                                            <div className="pt-8 mt-auto border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 block mb-1">Annual Package</span>
                                                    <span className="text-xl font-black text-slate-900 dark:text-white">
                                                        {typeof job.salary === 'number' ? `$${job.salary.toLocaleString()}` : job.salary}
                                                    </span>
                                                </div>

                                                {user?.role === 'student' ? (
                                                    appliedJobs.includes(job._id) ? (
                                                        <div className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-xs uppercase tracking-widest">
                                                            <Check size={18} /> Applied
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleManualApply(job._id)}
                                                            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
                                                        >
                                                            Apply <ChevronRight size={18} />
                                                        </button>
                                                    )
                                                ) : <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Login to apply</span>}
                                            </div>

                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-indigo-600/10 transition-all pointer-events-none" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass py-32 rounded-[3.5rem] border border-dashed border-slate-200 dark:border-white/10 text-center"
                            >
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Briefcase className="text-slate-400 dark:text-slate-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No positions found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto font-medium">Try adjusting your keyword or location filters to broaden your search.</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

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
                            className="glass w-full max-w-xl p-10 rounded-[3.5rem] relative border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
                                            <AlertTriangle size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Report Issue</h2>
                                            <p className="text-sm text-slate-500 font-bold">Help us keep Hire AFK safe.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowReportModal(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <X size={28} />
                                    </button>
                                </div>

                                <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/5 mb-10">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Company / Role</p>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white">{selectedJobForReport?.company}</h4>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold">{selectedJobForReport?.title}</p>
                                </div>

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
                                            disabled={submittingReport || !reportReason.trim()}
                                            className="flex-[2] py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50"
                                        >
                                            {submittingReport ? 'Submitting...' : 'Send Report'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobsPage;
