import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import GlassSelect from '../components/GlassSelect';
import { Plus, Briefcase, Users, Search, AlertCircle, Check, X, Rocket, Trash2, PieChart as PieIcon, BarChart as BarIcon, TrendingUp, Target, Scale, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
    PieChart, Pie, Funnel, FunnelChart, LabelList
} from 'recharts';

const RecruiterDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [showAddJob, setShowAddJob] = useState(false);
    const [editJobId, setEditJobId] = useState(null);
    const [jobForm, setJobForm] = useState({
        title: '',
        company: '',
        description: '',
        keywords: '',
        prioritySkills: '',
        location: '',
        salary: '',
        vacancies: 1,
        jobType: 'Full-time',
        deadline: '',
        companyLogo: null
    });
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showCompanyEdit, setShowCompanyEdit] = useState(false);
    const [companyForm, setCompanyForm] = useState({ company: '', companyLogo: null });
    const [activeTab, setActiveTab] = useState('overview'); // overview, jobs, applicants, branding, analytics
    const [viewMode, setViewMode] = useState('all'); // all, job-specific
    const [analyticsStats, setAnalyticsStats] = useState(null);
    const [funnelData, setFunnelData] = useState([]);
    const [skillGapData, setSkillGapData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [filterMode, setFilterMode] = useState('smart');
    const [skillInput, setSkillInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [notesLoading, setNotesLoading] = useState({});

    useEffect(() => {
        fetchJobs();
        fetchProfile();
        fetchAnalytics();
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/skills');
            setAvailableSkills(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFilterApplications = async (overrideSkills = null) => {
        try {
            const finalSkills = overrideSkills || selectedSkills;
            if (finalSkills.length === 0) return;

            const queryParams = new URLSearchParams({
                skills: finalSkills.join(','),
                mode: filterMode,
            });
            if (viewMode === 'job-specific' && selectedJob) {
                queryParams.append('jobId', selectedJob._id);
            }
            const res = await axios.get(`http://localhost:5000/api/applications/filter?${queryParams.toString()}`);
            setApplications(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Filter failed');
        }
    };

    const fetchAnalytics = async (jobId = null) => {
        setAnalyticsLoading(true);
        try {
            const statsRes = await axios.get('http://localhost:5000/api/analytics/stats');
            setAnalyticsStats(statsRes.data);

            const activeJobId = jobId || (selectedJob?._id) || (jobs[0]?._id);
            if (activeJobId) {
                const funnelRes = await axios.get(`http://localhost:5000/api/analytics/job-funnel/${activeJobId}`);
                const funnelFormatted = [
                    { value: funnelRes.data.applied, name: 'Applied', fill: '#6366f1' },
                    { value: funnelRes.data.pending, name: 'Shortlisted', fill: '#8b5cf6' },
                    { value: funnelRes.data.accepted, name: 'Hired', fill: '#10b981' }
                ].filter(d => d.value > 0);
                setFunnelData(funnelFormatted);

                const skillRes = await axios.get(`http://localhost:5000/api/analytics/skill-gap/${activeJobId}`);
                setSkillGapData(skillRes.data);
            }
        } catch (err) {
            console.error('[ANALYTICS-ERROR]', err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/profile');
            setProfile(res.data);
            setCompanyForm({ company: res.data.company || '', companyLogo: null });
            // Pre-fill job form with company if empty
            if (res.data.company && !jobForm.company) {
                setJobForm(prev => ({ ...prev, company: res.data.company }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCompanyUpdate = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('company', companyForm.company);
        if (companyForm.companyLogo) {
            data.append('companyLogo', companyForm.companyLogo);
        }

        try {
            const res = await axios.put('http://localhost:5000/api/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data);
            setShowCompanyEdit(false);
            // Also update any pending forms
            setJobForm(prev => ({ ...prev, company: res.data.company }));
            fetchJobs(); // Update existing jobs view if logos changed in some way
        } catch (err) {
            toast.error('Failed to update company branding');
        }
    };

    const fetchApplicants = async (jobId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/applications/job/${jobId}`);
            setApplications(res.data);
            setSelectedJob(jobs.find(j => j._id === jobId));
            setViewMode('job-specific');
            setActiveTab('applicants');
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAllApplicants = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/applications/recruiter');
            setApplications(res.data);
            setSelectedJob(null);
            setViewMode('all');
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveNotes = async (appId, notes) => {
        setNotesLoading(prev => ({ ...prev, [appId]: true }));
        try {
            await axios.put(`http://localhost:5000/api/applications/${appId}/notes`, { notes });
            toast.success('Notes saved');
        } catch (err) {
            toast.error('Failed to save notes');
        } finally {
            setNotesLoading(prev => ({ ...prev, [appId]: false }));
        }
    };

    const toggleCompare = (app) => {
        if (selectedForCompare.find(c => c._id === app._id)) {
            setSelectedForCompare(selectedForCompare.filter(c => c._id !== app._id));
        } else {
            if (selectedForCompare.length >= 2) {
                toast.error('You can only compare 2 candidates at a time');
                return;
            }
            setSelectedForCompare([...selectedForCompare, app]);
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/applications/${appId}/status`, { status });
            if (viewMode === 'all') {
                fetchAllApplicants();
            } else {
                fetchApplicants(selectedJob._id);
            }
        } catch (err) {
            toast.error('Status update failed');
        }
    };

    const handleDeleteApplication = async (appId) => {
        if (!window.confirm('Are you sure you want to permanently delete this application record?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/applications/${appId}`);
            if (viewMode === 'all') {
                fetchAllApplicants();
            } else {
                fetchApplicants(selectedJob._id);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Deletion failed');
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs/myjobs');
            setJobs(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        console.log('[FRONTEND-DEBUG] Submitting form with state:', jobForm);
        const data = new FormData();
        Object.keys(jobForm).forEach(key => {
            if (jobForm[key] !== null) {
                data.append(key, jobForm[key]);
            }
        });

        try {
            if (editJobId) {
                const trimmedId = editJobId.trim();
                console.log(`[FRONTEND-DEBUG] Updating job ${trimmedId}`);
                await axios.put(`http://localhost:5000/api/jobs/${trimmedId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                console.log(`[FRONTEND-DEBUG] Creating new job`);
                await axios.post('http://localhost:5000/api/jobs', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowAddJob(false);
            setEditJobId(null);
            setJobForm({ title: '', company: '', description: '', keywords: '', location: '', salary: '', vacancies: 1, jobType: 'Full-time', deadline: '', companyLogo: null });
            fetchJobs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save job');
        }
    };

    const handleEditClick = (job) => {
        setEditJobId(job._id);
        setJobForm({
            title: job.title || '',
            company: job.company || '',
            description: job.description || '',
            keywords: job.keywords?.join(', ') || '',
            prioritySkills: job.prioritySkills?.join(', ') || '',
            location: job.location || '',
            salary: job.salary || '',
            vacancies: job.vacancies || 1,
            jobType: job.jobType || 'Full-time',
            deadline: job.deadline ? job.deadline.substring(0, 10) : '',
            companyLogo: null
        });
        setShowAddJob(true);
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
            fetchJobs();
        } catch (err) {
            toast.error('Failed to delete job');
        }
    };

    if (loading) return <div className="max-w-7xl mx-auto px-6 py-12 space-y-8"><SkeletonLoader type="card" count={2} /></div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-8">
                            <h2 className="text-2xl font-black flex items-center gap-3"><Rocket className="text-indigo-400" /> Executive Overview</h2>
                            <div className="glass p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-indigo-900/10 to-transparent">
                                <h3 className="text-3xl font-black mb-4 tracking-tighter">Welcome back, {profile?.name || 'Recruiter'}</h3>
                                <p className="text-slate-400 font-bold mb-8 text-lg">You have {jobs.length} active job listings and {analyticsStats?.totalApplications || 0} applications to review. Your current average match score is <span className="text-indigo-400">{analyticsStats?.avgMatchScore || 0}%</span>.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <button onClick={() => setActiveTab('jobs')} className="bg-white/5 hover:bg-white/10 p-8 rounded-[2rem] text-left transition-all border border-white/5 group">
                                        <Briefcase className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                        <p className="font-black text-xl mb-1">Manage Jobs</p>
                                        <p className="text-sm text-slate-500 font-bold">Edit, close or create new posts</p>
                                    </button>
                                    <button onClick={() => setActiveTab('analytics')} className="bg-white/5 hover:bg-white/10 p-8 rounded-[2rem] text-left transition-all border border-white/5 group">
                                        <TrendingUp className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                        <p className="font-black text-xl mb-1">Analytics Lab</p>
                                        <p className="text-sm text-slate-500 font-bold">Deep dive into hiring funnels</p>
                                    </button>
                                    <button onClick={() => setActiveTab('branding')} className="bg-white/5 hover:bg-white/10 p-8 rounded-[2rem] text-left transition-all border border-white/5 group">
                                        <Rocket className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                        <p className="font-black text-xl mb-1">Company Brand</p>
                                        <p className="text-sm text-slate-500 font-bold">Update corporate identity</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight"><AlertCircle className="text-cyan-400" /> Quick Metrics</h2>
                            <div className="space-y-6">
                                <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-indigo-500/10 transition-all"></div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 relative z-10">Total Applications</p>
                                    <p className="text-5xl font-black text-white relative z-10">{analyticsStats?.totalApplications || 0}</p>
                                </div>

                                <div className="glass p-8 rounded-[2rem] border-white/10 relative overflow-hidden group bg-gradient-to-br from-indigo-900/10 to-transparent">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 relative z-10">Average Match Score</p>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 overflow-hidden">
                                            <Target className="text-indigo-400" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-4xl font-black text-white leading-tight">{analyticsStats?.avgMatchScore || 0}%</p>
                                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Platform Average</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden bg-gradient-to-br from-cyan-900/10 to-transparent">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-6 relative z-10">Conversion Funnel</p>
                                    <div className="space-y-6 relative z-10">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-2">
                                                <span className="text-slate-400">Lead to Interview</span>
                                                <span className="text-cyan-400">{analyticsStats?.totalApplications > 0 ? Math.round((analyticsStats.totalInterviews / analyticsStats.totalApplications) * 100) : 0}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${analyticsStats?.totalApplications > 0 ? (analyticsStats.totalInterviews / analyticsStats.totalApplications) * 100 : 0}%` }}
                                                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-2">
                                                <span className="text-slate-400">Interview to Hire</span>
                                                <span className="text-emerald-400">{analyticsStats?.totalInterviews > 0 ? Math.round((analyticsStats.totalHires / analyticsStats.totalInterviews) * 100) : 0}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${analyticsStats?.totalInterviews > 0 ? (analyticsStats.totalHires / analyticsStats.totalInterviews) * 100 : 0}%` }}
                                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'jobs':
                return (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black flex items-center gap-3"><Briefcase className="text-indigo-400" /> Job Management</h2>
                        </div>
                        {jobs.length > 0 ? (
                            jobs.map(job => (
                                <div key={job._id} className="glass p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group border-white/5 relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 overflow-hidden">
                                                {job.companyLogo ? (
                                                    <img src={`http://localhost:5000/${job.companyLogo}`} className="w-full h-full object-cover" alt="Logo" />
                                                ) : (
                                                    <Briefcase className="text-indigo-400" size={32} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black tracking-tight">{job.title}</h3>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-indigo-400 font-black text-sm uppercase tracking-wider">{job.company}</p>
                                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                                    <p className="text-slate-500 font-bold text-sm tracking-tight">{job.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(job)}
                                                    className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-white/5 font-black uppercase tracking-widest transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <span className={`${job.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} border px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]`}>
                                                    {job.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{job.jobType}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {job.keywords && Array.isArray(job.keywords) && job.keywords.map(kw => (
                                            <span key={kw} className="bg-white/5 border border-white/5 px-4 py-1.5 rounded-xl text-xs font-black text-slate-300 hover:border-indigo-500/30 transition-all transition-colors">{kw}</span>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-8 items-center mb-8 bg-black/20 p-6 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Vacancies</p>
                                            <p className="text-white font-black">{job.vacancies}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Salary Range</p>
                                            <p className="text-white font-black">{job.salary || 'Competitive'}</p>
                                        </div>
                                        {job.deadline && (
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Deadline</p>
                                                <p className="text-white font-black">{new Date(job.deadline).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => fetchApplicants(job._id)}
                                            className="flex-1 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 py-4 rounded-2xl text-sm font-black transition-all border border-indigo-500/20 flex items-center justify-center gap-2"
                                        >
                                            <Users size={18} /> View Applications
                                        </button>
                                        <button
                                            onClick={() => handleDeleteJob(job._id)}
                                            className="px-5 py-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl transition-all border border-red-500/20"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState 
                                icon={Briefcase} 
                                title="No Jobs Posted" 
                                message="You haven't posted any jobs yet. Create your first listing to start hiring!" 
                                actionLabel="Post New Job" 
                                onAction={() => setShowAddJob(true)} 
                            />
                        )}
                    </div>
                );
            case 'applicants':
                return (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black flex items-center gap-3"><Users className="text-indigo-400" /> Candidate Management</h2>
                            {viewMode === 'job-specific' && (
                                <button
                                    onClick={fetchAllApplicants}
                                    className="text-xs font-black uppercase tracking-widest bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-6 py-3 rounded-2xl border border-indigo-500/20 transition-all flex items-center gap-2"
                                >
                                    <Users size={16} /> View All Candidates
                                </button>
                            )}
                        </div>

                        {viewMode === 'job-specific' ? (
                            <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem] mb-8 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-1">Filtering by job:</p>
                                    <p className="text-2xl font-black text-white">{selectedJob?.title}</p>
                                </div>
                                <button onClick={fetchAllApplicants} className="text-xs font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/10 transition-all">Clear Filter</button>
                            </div>
                        ) : (
                            <div className="bg-cyan-600/10 border border-cyan-500/20 p-8 rounded-[2.5rem] mb-8">
                                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-1">Global View</p>
                                <p className="text-2xl font-black text-white">All Active Candidates</p>
                                <p className="text-sm text-slate-400 font-bold mt-1">Showing everyone who matched with any of your active job listings.</p>
                            </div>
                        )}

                        {/* Skill Filter UI */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] mb-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                                <h3 className="text-xl font-black text-white flex items-center gap-2"><Search size={20} className="text-indigo-400" /> Skill-Based Filtering</h3>
                                <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => setFilterMode('smart')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterMode === 'smart' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Smart Match (40%+)
                                    </button>
                                    <button
                                        onClick={() => setFilterMode('strict')}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterMode === 'strict' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Strict Match (100%)
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-4">
                                {selectedSkills.map(skill => (
                                    <span key={skill} className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-xl text-sm font-black flex items-center gap-2 group">
                                        {skill}
                                        <button onClick={() => setSelectedSkills(prev => prev.filter(s => s !== skill))} className="hover:text-white transition-colors"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 relative">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => {
                                            setSkillInput(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && skillInput.trim()) {
                                                e.preventDefault();
                                                const trimmedInput = skillInput.trim();
                                                if (!selectedSkills.map(s => s.toLowerCase()).includes(trimmedInput.toLowerCase())) {
                                                    setSelectedSkills(prev => [...prev, trimmedInput]);
                                                }
                                                setSkillInput('');
                                                setShowSuggestions(false);
                                            }
                                        }}
                                        placeholder="Type a skill to filter (e.g., React, Node.js)"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-white placeholder:text-slate-600"
                                    />
                                    {showSuggestions && skillInput && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl z-20 max-h-48 overflow-y-auto overflow-hidden text-sm">
                                            {availableSkills.filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(s)).map(s => (
                                                <div
                                                    key={s}
                                                    onClick={() => {
                                                        setSelectedSkills(prev => [...prev, s]);
                                                        setSkillInput('');
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="px-6 py-3 cursor-pointer hover:bg-white/5 text-slate-300 font-bold hover:text-white transition-colors"
                                                >
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        let currentSkills = [...selectedSkills];
                                        const trimmedInput = skillInput.trim();
                                        if (trimmedInput && !currentSkills.map(s => s.toLowerCase()).includes(trimmedInput.toLowerCase())) {
                                            currentSkills.push(trimmedInput);
                                            setSelectedSkills(currentSkills);
                                            setSkillInput('');
                                            setShowSuggestions(false);
                                        }
                                        handleFilterApplications(currentSkills);
                                    }}
                                    disabled={selectedSkills.length === 0 && skillInput.trim() === ''}
                                    className={`px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${(selectedSkills.length > 0 || skillInput.trim() !== '') ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
                                >
                                    <Search size={20} /> Filter Candidates
                                </button>
                                {selectedSkills.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setSelectedSkills([]);
                                            setSkillInput('');
                                            if (viewMode === 'all') fetchAllApplicants();
                                            else fetchApplicants(selectedJob._id);
                                        }}
                                        className="px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border border-white/5"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {applications.length > 0 ? (
                                applications.map(app => (
                                    <div key={app._id} className={`bg-white/5 p-8 rounded-[3rem] border flex flex-col md:flex-row justify-between gap-8 transition-all relative group/card ${(app.filterMatchScore >= 80 || app.matchScore >= 80) ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:shadow-[0_0_40px_rgba(99,102,241,0.25)]' : 'border-white/5 hover:border-indigo-500/20'}`}>
                                        <div className="absolute top-8 right-8 z-10 hidden md:block">
                                            <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-4 py-2 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedForCompare.some(c => c._id === app._id)}
                                                    onChange={() => toggleCompare(app)}
                                                    className="form-checkbox bg-black/40 border-indigo-500/30 text-indigo-600 rounded focus:ring-indigo-500 h-4 w-4"
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">Compare</span>
                                            </label>
                                        </div>
                                        <div className="flex-1 md:pr-32">
                                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                                <h4 className="text-3xl font-black tracking-tight">{app.student.name}</h4>
                                                <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-5 py-1.5 rounded-full text-sm font-black tracking-tighter shadow-lg shadow-indigo-500/5">
                                                    {app.filterMatchScore !== undefined ? app.filterMatchScore : app.matchScore}% Match
                                                </div>
                                                {(app.filterMatchScore !== undefined ? app.filterMatchScore : app.matchScore) >= 95 && (
                                                    <div className="bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center gap-1 animate-pulse">
                                                        🦄 Unicorn Match
                                                    </div>
                                                )}
                                                {(app.filterMatchScore !== undefined ? app.filterMatchScore : app.matchScore) >= 85 && (app.filterMatchScore !== undefined ? app.filterMatchScore : app.matchScore) < 95 && (
                                                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center gap-1">
                                                        ✨ Top Talent
                                                    </div>
                                                )}
                                                {(app.filterMatchScore !== undefined ? app.filterMatchScore : app.matchScore) >= 75 && (app.filterMatchScore !== undefined ? app.filterMatchScore : app.matchScore) < 85 && (
                                                    <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-center gap-1">
                                                        ✅ Gold Standard
                                                    </div>
                                                )}
                                                {(app.filterMatchScore !== undefined ? app.filterMatchScore : app.matchScore) >= 60 && (app.filterMatchScore !== undefined ? app.filterMatchScore : app.matchScore) < 75 && (
                                                    <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        👍 Strong Match
                                                    </div>
                                                )}
                                                {viewMode === 'all' && (
                                                    <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        For: {app.job?.title || 'Unknown Job'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="md:hidden mb-4">
                                                <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-4 py-2 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all w-max">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedForCompare.some(c => c._id === app._id)}
                                                        onChange={() => toggleCompare(app)}
                                                        className="form-checkbox bg-black/40 border-indigo-500/30 text-indigo-600 rounded focus:ring-indigo-500 h-4 w-4"
                                                    />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">Compare</span>
                                                </label>
                                            </div>
                                            <p className="text-slate-400 font-bold leading-relaxed mb-6 line-clamp-2">{app.student.description}</p>
                                            <div className="flex flex-wrap gap-3 mb-6">
                                                {app.student.skills && Array.isArray(app.student.skills) && app.student.skills.map(s => {
                                                    const isMatched = app.filterMatchedSkills && app.filterMatchedSkills.some(ms => ms.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(ms.toLowerCase()));
                                                    const isPriority = app.job?.prioritySkills && app.job.prioritySkills.some(ps => ps.toLowerCase().trim() === s.toLowerCase().trim() || s.toLowerCase().trim().includes(ps.toLowerCase().trim()));
                                                    
                                                    return (
                                                        <span key={s} className={`px-4 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 transition-all ${
                                                            isPriority && isMatched 
                                                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                                                                : isMatched 
                                                                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                                                                    : 'bg-slate-800/80 border-white/5 text-slate-300'
                                                        }`}>
                                                            {isPriority && isMatched && <Sparkles size={12} className="text-amber-400" />}
                                                            {s}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex items-center gap-6 mb-6">
                                                <a href={`http://localhost:5000/${app.student.resumeUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-400 font-black hover:text-indigo-300 transition-colors group">
                                                    <Search size={18} className="group-hover:scale-110 transition-transform" />
                                                    <span className="border-b-2 border-indigo-500/20 group-hover:border-indigo-500 transition-all">Review Resume</span>
                                                </a>
                                                {app.status === 'rejected' && (
                                                    <button
                                                        onClick={() => handleDeleteApplication(app._id)}
                                                        className="text-red-500/40 hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                                                    >
                                                        <Trash2 size={16} /> Delete Application
                                                    </button>
                                                )}
                                            </div>
                                            <div className="border-t border-white/5 pt-6 mt-2">
                                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                                                    <FileText size={14} /> Internal Recruiter Notes (Auto-saved)
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        defaultValue={app.recruiterNotes || ''}
                                                        onBlur={(e) => handleSaveNotes(app._id, e.target.value)}
                                                        placeholder="Add private evaluation notes about this candidate..."
                                                        className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm font-bold text-slate-300 outline-none focus:border-indigo-500/30 transition-all resize-none h-20 placeholder:text-slate-600 focus:bg-white/5"
                                                    ></textarea>
                                                    {notesLoading[app._id] && <div className="absolute top-4 right-4 text-[10px] uppercase font-black tracking-widest text-indigo-400 animate-pulse">Saving...</div>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center gap-4 min-w-[220px]">
                                            <button
                                                onClick={() => handleUpdateStatus(app._id, 'accepted')}
                                                disabled={app.status === 'accepted'}
                                                className={`w-full px-6 py-4 rounded-3xl font-black flex items-center justify-center gap-2 transition-all shadow-lg ${app.status === 'accepted'
                                                    ? 'bg-green-600/20 text-green-500 border border-green-500/30'
                                                    : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'
                                                    }`}
                                            >
                                                <Check size={20} /> {app.status === 'accepted' ? 'Hired' : 'Hire Candidate'}
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                disabled={app.status === 'rejected'}
                                                className={`w-full px-6 py-4 rounded-3xl font-black flex items-center justify-center gap-2 transition-all border ${app.status === 'rejected'
                                                    ? 'bg-red-600/20 text-red-500 border-red-500/30'
                                                    : 'bg-red-600/10 text-red-500 hover:bg-red-600/20 border-red-500/20'
                                                    }`}
                                            >
                                                <X size={20} /> {app.status === 'rejected' ? 'Passed' : 'Reject / Pass'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState 
                                    icon={Users} 
                                    title="No Candidates Found" 
                                    message="No candidates to review at the moment. Try checking another job or loosening your smart filter." 
                                />
                            )}
                        </div>
                    </div>
                );
            case 'branding':
                return (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black flex items-center gap-3"><Rocket className="text-indigo-400" /> Company Identity</h2>
                        <div className="glass p-10 rounded-[3rem] border-white/5 max-w-3xl">
                            <form onSubmit={handleCompanyUpdate} className="space-y-8">
                                <div className="flex flex-col md:flex-row gap-10 items-center mb-6">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 overflow-hidden shrink-0">
                                        {profile?.companyLogo ? (
                                            <img src={`http://localhost:5000/${profile.companyLogo}`} className="w-full h-full object-cover" alt="Logo" />
                                        ) : (
                                            <Briefcase className="text-indigo-400" size={48} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Update Company Logo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setCompanyForm({ ...companyForm, companyLogo: e.target.files[0] })}
                                            className="w-full text-xs text-slate-500 file:bg-slate-800 file:border-none file:px-6 file:py-3 file:rounded-xl file:text-white file:font-black file:mr-4 file:hover:bg-slate-700 transition-all cursor-pointer"
                                        />
                                        <p className="text-[10px] text-slate-600 mt-2 font-bold italic">Recommended: Square PNG/JPG, min 400x400px</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={companyForm.company}
                                        onChange={e => setCompanyForm({ ...companyForm, company: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-black text-lg"
                                        placeholder="e.g., TechNova Solutions"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 rounded-3xl font-black text-xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                                >
                                    Save Branding Changes <Check size={24} />
                                </button>
                            </form>
                        </div>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="space-y-12">
                        <div className="flex justify-between items-center bg-indigo-600/10 p-8 rounded-[3rem] border border-indigo-500/20 overflow-visible">
                            <div>
                                <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter text-white">
                                    <TrendingUp className="text-indigo-400" /> Talent Intelligence
                                </h2>
                                <p className="text-slate-400 font-bold mt-1">Data-driven insights for your active job listings.</p>
                            </div>
                            <div className="flex gap-4 min-w-[250px]">
                                <GlassSelect
                                    options={jobs.map(j => ({ value: j._id, label: j.title }))}
                                    value={selectedJob?._id || ""}
                                    onChange={(val) => fetchAnalytics(val)}
                                    placeholder="Select Job to Analyze"
                                />
                            </div>
                        </div>

                        {analyticsLoading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin mb-4" />
                                <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Aggregating Global Talent Data...</p>
                            </div>
                        ) : (
                            <>
                                {/* Top Metrics Row */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Avg Match Score', value: `${analyticsStats?.avgMatchScore || 0}%`, icon: Target, color: 'text-indigo-400' },
                                        { label: 'Total Applicants', value: analyticsStats?.totalApplications || 0, icon: Users, color: 'text-cyan-400' },
                                        { label: 'Conversion Rate', value: `${analyticsStats?.totalApplications > 0 ? Math.round((analyticsStats.totalHires / analyticsStats.totalApplications) * 100) : 0}%`, icon: Rocket, color: 'text-green-400' },
                                        { label: 'Active Jobs', value: analyticsStats?.activePostings || 0, icon: Briefcase, color: 'text-yellow-400' }
                                    ].map((m, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                            className="glass p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-t from-white/5 to-transparent"
                                        >
                                            <m.icon className={`${m.color} mb-3`} size={24} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{m.label}</p>
                                            <p className="text-3xl font-black text-white tracking-tighter">{m.value}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Hiring Funnel */}
                                    <div className="lg:col-span-5 glass p-10 rounded-[3.5rem] border-white/5">
                                        <h3 className="text-xl font-black mb-10 flex items-center gap-2"><PieIcon className="text-indigo-400" size={20} /> Recruitment Funnel</h3>
                                        <div className="h-[350px] w-full">
                                            {funnelData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <FunnelChart>
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}
                                                            itemStyle={{ color: '#fff' }}
                                                        />
                                                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                                                            <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="name" />
                                                        </Funnel>
                                                    </FunnelChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                                    <AlertCircle size={48} className="mb-4 opacity-20" />
                                                    <p className="font-bold">No funnel data for this job</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skill Gap Analysis */}
                                    <div className="lg:col-span-7 glass p-10 rounded-[3.5rem] border-white/5">
                                        <h3 className="text-xl font-black mb-10 flex items-center gap-2"><BarIcon className="text-cyan-400" size={20} /> Applicant Skill Inventory</h3>
                                        <div className="h-[350px] w-full">
                                            {skillGapData?.applicantSkillCounts ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={Object.entries(skillGapData.applicantSkillCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8)}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                                        <YAxis hide />
                                                        <Tooltip
                                                            cursor={{ fill: '#ffffff05' }}
                                                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontWeight: 'bold' }}
                                                            itemStyle={{ color: '#fff' }}
                                                        />
                                                        <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                                                            {Object.entries(skillGapData.applicantSkillCounts).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={skillGapData.requiredSkills.includes(entry[0]) ? '#6366f1' : '#334155'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                                    <Target size={48} className="mb-4 opacity-20" />
                                                    <p className="font-bold">Select a job to see skill analysis</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-8 flex gap-6 text-[10px] uppercase font-black tracking-widest text-slate-500">
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#6366f1]" /> Required by Job</div>
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#334155]" /> Additional Candidate Skills</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tighter text-white">Recruiter Center</h1>
                    <p className="text-slate-400 font-bold">Manage your corporate identity and find the best talent.</p>
                </div>
                <button
                    onClick={() => {
                        setEditJobId(null);
                        setJobForm({
                            title: '',
                            company: profile?.company || '',
                            description: '',
                            keywords: '',
                            prioritySkills: '',
                            location: '',
                            salary: '',
                            vacancies: 1,
                            jobType: 'Full-time',
                            deadline: '',
                            companyLogo: null
                        });
                        setShowAddJob(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all transform hover:scale-105 shadow-xl shadow-indigo-600/20"
                >
                    <Plus size={24} /> Post New Job
                </button>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex flex-wrap gap-4 mb-10 border-b border-white/5 pb-6">
                {[
                    { id: 'overview', label: 'Overview', icon: AlertCircle },
                    { id: 'jobs', label: 'Job Management', icon: Briefcase },
                    { id: 'applicants', label: 'All Applicants', icon: Users },
                    { id: 'analytics', label: 'Analytics Lab', icon: TrendingUp },
                    { id: 'branding', label: 'Company Brand', icon: Rocket }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id === 'applicants') fetchAllApplicants();
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-12">
                {renderContent()}
            </div>

            {/* Sticky Compare Action Bar */}
            <AnimatePresence>
                {selectedForCompare.length > 0 && activeTab === 'applicants' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
                    >
                        <div className="glass px-8 py-4 rounded-full border border-indigo-500/30 shadow-[0_10px_40px_rgba(99,102,241,0.2)] flex items-center gap-6 bg-[#0f172a]/90 backdrop-blur-xl">
                            <div className="flex -space-x-3">
                                {selectedForCompare.map((c, i) => (
                                    <div key={c._id} className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-[#0f172a] flex items-center justify-center font-black text-xs text-white uppercase overflow-hidden shadow-lg">
                                        {c.student.name.substring(0, 2)}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">{selectedForCompare.length}/2</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected</p>
                            </div>
                            <div className="flex items-center gap-3 border-l border-white/10 pl-6 ml-2">
                                <button 
                                    onClick={() => setSelectedForCompare([])}
                                    className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                                >
                                    Clear
                                </button>
                                <button 
                                    onClick={() => setShowCompareModal(true)}
                                    disabled={selectedForCompare.length !== 2}
                                    className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${selectedForCompare.length === 2 ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30' : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'}`}
                                >
                                    <Scale size={16} /> Compare
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Compare Modal */}
            <AnimatePresence>
                {showCompareModal && selectedForCompare.length === 2 && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-6xl max-h-[90vh] flex flex-col glass border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <div>
                                    <h2 className="text-3xl font-black text-white flex items-center gap-3"><Scale className="text-indigo-400" /> Candidate Comparison</h2>
                                    <p className="text-slate-400 font-bold text-sm mt-1">Side-by-side technical evaluation</p>
                                </div>
                                <button onClick={() => setShowCompareModal(false)} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                    {selectedForCompare.map((app, idx) => (
                                        <div key={app._id} className="bg-black/20 border border-white/5 p-8 rounded-[2.5rem] flex flex-col">
                                            <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-white/5">
                                                <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl font-black uppercase tracking-widest mb-4">
                                                    {app.student.name.substring(0, 2)}
                                                </div>
                                                <h3 className="text-2xl font-black text-white">{app.student.name}</h3>
                                                <p className="text-indigo-400 font-black mt-1">{app.filterMatchScore !== undefined ? app.filterMatchScore : app.matchScore}% Machine Match</p>
                                            </div>
                                            
                                            <div className="flex-1 space-y-8">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><Target size={14} /> Profile Summary</h4>
                                                    <p className="text-slate-300 font-bold text-sm leading-relaxed">{app.student.description || 'No description provided.'}</p>
                                                </div>

                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><Briefcase size={14} /> Claimed Skills</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {app.student.skills && app.student.skills.map(s => (
                                                            <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-slate-300">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {app.aiFeedback?.strengths && app.aiFeedback.strengths.length > 0 && (
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-3 flex items-center gap-2"><TrendingUp size={14} /> AI Identified Strengths</h4>
                                                        <ul className="space-y-2">
                                                            {app.aiFeedback.strengths.map((str, i) => (
                                                                <li key={i} className="text-sm font-bold text-slate-300 flex items-start gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /> {str}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {app.aiFeedback?.weaknesses && app.aiFeedback.weaknesses.length > 0 && (
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2"><TrendingUp size={14} className="rotate-180" /> AI Identified Weaknesses</h4>
                                                        <ul className="space-y-2">
                                                            {app.aiFeedback.weaknesses.map((wk, i) => (
                                                                <li key={i} className="text-sm font-bold text-slate-300 flex items-start gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /> {wk}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                                                <a href={`http://localhost:5000/${app.student.resumeUrl}`} target="_blank" rel="noreferrer" className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl text-center font-black text-sm transition-all border border-white/5">
                                                    View Resume
                                                </a>
                                                <button onClick={() => {
                                                    handleUpdateStatus(app._id, 'accepted');
                                                    setShowCompareModal(false);
                                                }} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl text-center font-black text-sm transition-all shadow-lg shadow-green-600/20">
                                                    Hire Candidate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add/Edit Job Modal */}
            {showAddJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddJob(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass p-10 rounded-[3rem] w-full max-w-2xl relative z-10 border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-4xl font-black tracking-tighter text-white">{editJobId ? 'Edit Job' : 'Post a New Job'}</h2>
                            <button onClick={() => setShowAddJob(false)} className="text-slate-400 hover:text-white p-2 transition-colors"><X size={32} /></button>
                        </div>

                        <form onSubmit={handleJobSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Job Title</label>
                                <input
                                    type="text" required value={jobForm.title}
                                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-white placeholder:text-slate-600" placeholder="Senior Backend Engineer"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Company Name</label>
                                <input
                                    type="text" required value={jobForm.company}
                                    onChange={e => setJobForm({ ...jobForm, company: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-white placeholder:text-slate-600" placeholder="Tech Labs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Company Logo</label>
                                <input
                                    type="file" accept="image/*"
                                    onChange={e => setJobForm({ ...jobForm, companyLogo: e.target.files[0] })}
                                    className="text-xs text-slate-500 file:bg-slate-800 file:border-none file:px-4 file:py-3 file:rounded-xl file:text-white file:font-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Location</label>
                                <input
                                    type="text" value={jobForm.location}
                                    onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-white placeholder:text-slate-600" placeholder="Remote / Bengaluru"
                                />
                            </div>
                            <div>
                                <GlassSelect
                                    label="Job Type"
                                    options={[
                                        { value: 'Full-time', label: 'Full-time' },
                                        { value: 'Part-time', label: 'Part-time' },
                                        { value: 'Internship', label: 'Internship' },
                                        { value: 'Contract', label: 'Contract' }
                                    ]}
                                    value={jobForm.jobType}
                                    onChange={(val) => setJobForm({ ...jobForm, jobType: val })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Number of Vacancies</label>
                                <input
                                    type="number" value={jobForm.vacancies}
                                    onChange={e => setJobForm({ ...jobForm, vacancies: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-white placeholder:text-slate-600" placeholder="1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Salary Range</label>
                                <input
                                    type="text" value={jobForm.salary}
                                    onChange={e => setJobForm({ ...jobForm, salary: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-white placeholder:text-slate-600" placeholder="10LPA - 15LPA"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Keywords (Comma separated)</label>
                                <input
                                    type="text" required value={jobForm.keywords}
                                    onChange={e => setJobForm({ ...jobForm, keywords: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-white placeholder:text-slate-600" placeholder="React, Node.js, Typescript"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-amber-500 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2"><Sparkles size={14} /> Priority Skills (2x Weight - Must be in keywords too)</label>
                                <input
                                    type="text" value={jobForm.prioritySkills}
                                    onChange={e => setJobForm({ ...jobForm, prioritySkills: e.target.value })}
                                    className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl px-6 py-4 outline-none focus:border-amber-500/50 transition-all font-bold text-white placeholder:text-slate-700" placeholder="e.g. React, Docker"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Application Deadline</label>
                                <input
                                    type="date" value={jobForm.deadline}
                                    onChange={e => setJobForm({ ...jobForm, deadline: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Job Description</label>
                                <textarea
                                    required value={jobForm.description}
                                    onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none h-32 transition-all font-bold resize-none text-white placeholder:text-slate-600" placeholder="Explain the role and requirements..."
                                ></textarea>
                            </div>
                            <button type="submit" className="md:col-span-2 bg-indigo-600 py-6 rounded-3xl font-black text-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 text-white">
                                {editJobId ? 'Update Job Details' : 'Publish Job Opening'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div >
    );
};

export default RecruiterDashboard;
