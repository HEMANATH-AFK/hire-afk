import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ShieldCheck, Flag, Check, X, AlertTriangle,
    Users, Briefcase, BarChart3, Trash2,
    UserCheck, UserMinus, Globe, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [reports, setReports] = useState([]);
    const [students, setStudents] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [reportsRes, statsRes, studentsRes, recruitersRes, jobsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/reports'),
                axios.get('http://localhost:5000/api/admin/stats'),
                axios.get('http://localhost:5000/api/admin/students'),
                axios.get('http://localhost:5000/api/admin/recruiters'),
                axios.get('http://localhost:5000/api/admin/jobs')
            ]);
            setReports(reportsRes.data);
            setStats(statsRes.data);
            setStudents(studentsRes.data);
            setRecruiters(recruitersRes.data);
            setJobs(jobsRes.data);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReportAction = async (reportId, recruiterId, action) => {
        try {
            if (action !== 'discard' && recruiterId) {
                await axios.put(`http://localhost:5000/api/admin/recruiters/${recruiterId}/action`, { action });
            }
            await axios.put(`http://localhost:5000/api/admin/reports/${reportId}/resolve`);
            fetchAllData();
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleRecruiterAction = async (recruiterId, action) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/recruiters/${recruiterId}/action`, { action });
            fetchAllData();
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
            fetchAllData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
        try {
            await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
            fetchAllData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'reports', label: 'Reports', icon: Flag, count: reports.filter(r => r.status === 'pending').length },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'recruiters', label: 'Recruiters', icon: Briefcase },
        { id: 'jobs', label: 'Jobs', icon: Briefcase }
    ];

    // Prepare Chart Data
    const userDistData = [
        { name: 'Students', value: stats?.totalStudents || 0 },
        { name: 'Recruiters', value: stats?.totalRecruiters || 0 }
    ];

    const recruiterApprovalData = [
        { name: 'Approved', value: recruiters.filter(r => r.isApproved).length },
        { name: 'Pending', value: recruiters.filter(r => !r.isApproved).length }
    ];

    const jobStatusData = [
        { name: 'Active', value: jobs.filter(j => j.isActive).length },
        { name: 'Inactive', value: jobs.filter(j => !j.isActive).length }
    ];

    const COLORS = ['#6366f1', '#06b6d4']; // Indigo-500, Cyan-500
    const STATUS_COLORS = ['#22c55e', '#f59e0b']; // Green-500, Amber-500

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <ShieldCheck className="text-indigo-500" size={40} /> Admin Panel
                    </h1>
                    <p className="text-slate-400">Manage users, reports, and platform health.</p>
                </div>
                <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-sm ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && stats && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
                            {[
                                { label: 'Total Students', value: stats.totalStudents, color: 'text-indigo-400' },
                                { label: 'Total Recruiters', value: stats.totalRecruiters, color: 'text-cyan-400' },
                                { label: 'Active Jobs', value: stats.totalJobs, color: 'text-green-400' },
                                { label: 'Applications', value: stats.totalApplications, color: 'text-orange-400' },
                                { label: 'Pending Reports', value: stats.totalReports, color: 'text-red-400' }
                            ].map((stat, i) => (
                                <div key={`stat-${i}`} className="glass p-6 rounded-3xl text-center flex flex-col justify-center border-white/5">
                                    <p className="text-slate-400 text-xs mb-2 uppercase font-black tracking-widest">{stat.label}</p>
                                    <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="glass p-8 rounded-3xl border border-white/5">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Globe className="text-indigo-400" size={24} /> Platform Status
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* User Distribution Chart */}
                                <div className="bg-slate-800/20 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-sm font-bold text-slate-400 mb-4 text-center">User Distribution</h4>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={userDistData}
                                                    innerRadius={40}
                                                    outerRadius={60}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {userDistData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-4 text-xs font-bold mt-2">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Students</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500"></div>Recruiters</div>
                                    </div>
                                </div>

                                {/* Recruiter Approvals Chart */}
                                <div className="bg-slate-800/20 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-sm font-bold text-slate-400 mb-4 text-center">Recruiter Approvals</h4>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={recruiterApprovalData}
                                                    innerRadius={50}
                                                    outerRadius={60}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {recruiterApprovalData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-4 text-xs font-bold mt-2">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>Approved</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Pending</div>
                                    </div>
                                </div>

                                {/* Job Market Status Chart */}
                                <div className="bg-slate-800/20 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-sm font-bold text-slate-400 mb-4 text-center">Job Market Status</h4>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={jobStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} itemStyle={{ color: '#fff' }} />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                    {jobStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#64748b'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                    <motion.div
                        key="reports"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {reports.filter(r => r.status === 'pending').length > 0 ? (
                            reports.filter(r => r.status === 'pending').map(report => (
                                <div key={report._id} className="glass p-8 rounded-3xl border-red-500/10 flex flex-col md:flex-row justify-between gap-8 hover:bg-white/5 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="text-red-500" size={20} />
                                            <span className="text-red-500 font-bold uppercase text-[10px] tracking-widest">Job Abuse Report</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1">Recruiter: {report.recruiter?.name} ({report.recruiter?.company})</h3>
                                        {report.job && (
                                            <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold w-fit mb-3 border border-indigo-500/20">
                                                For Job: {report.job.title}
                                            </div>
                                        )}
                                        <p className="text-slate-400 mb-4 bg-black/20 p-4 rounded-2xl italic border border-white/5 relative">
                                            <span className="absolute -top-3 left-4 bg-slate-900 px-2 text-[10px] font-black uppercase text-slate-500">Student Message</span>
                                            " {report.reason} "
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span>Reported by: <span className="text-slate-300 font-medium">{report.student?.name}</span></span>
                                            <span>Email: <span className="text-slate-300 font-medium">{report.student?.email}</span></span>
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col justify-center gap-3">
                                        <button
                                            onClick={() => handleReportAction(report._id, report.recruiter?._id, 'block')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20"
                                        >
                                            <UserMinus size={18} /> Block Recruiter
                                        </button>
                                        <button
                                            onClick={() => handleReportAction(report._id, report.recruiter?._id, 'approve')}
                                            className="bg-green-600/10 hover:bg-green-600/20 text-green-500 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-green-600/20"
                                        >
                                            <Check size={18} /> Approve Brand
                                        </button>
                                        <button
                                            onClick={() => handleReportAction(report._id, null, 'discard')}
                                            className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-600/20"
                                        >
                                            <Trash2 size={18} /> Discard Report
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="glass p-20 rounded-3xl text-center text-slate-500 flex flex-col items-center gap-4">
                                <ShieldCheck size={48} className="text-green-500/20" />
                                <p className="text-xl">Platform is safe. No pending reports.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* STUDENTS TAB */}
                {activeTab === 'students' && (
                    <motion.div
                        key="students"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass overflow-hidden rounded-3xl border border-white/5"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs">Student</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs">Email</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs">Profile</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {students.map(student => (
                                    <tr key={student._id} className="hover:bg-white/5 transition-all group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="font-bold">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-slate-400 flex items-center gap-2">
                                            <Mail size={14} /> {student.email}
                                        </td>
                                        <td className="p-6">
                                            {student.isProfileComplete ? (
                                                <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-green-500/20">Complete</span>
                                            ) : (
                                                <span className="bg-slate-500/10 text-slate-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-500/20">Incomplete</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(student._id)}
                                                className="text-slate-500 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-500/10"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {/* RECRUITERS TAB */}
                {activeTab === 'recruiters' && (
                    <motion.div
                        key="recruiters"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass overflow-hidden rounded-3xl border border-white/5"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs">Recruiter</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs">Company</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs text-center border-x border-white/5">Status</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recruiters.map(recruiter => (
                                    <tr key={recruiter._id} className="hover:bg-white/5 transition-all">
                                        <td className="p-6">
                                            <div>
                                                <p className="font-bold">{recruiter.name}</p>
                                                <p className="text-xs text-slate-500">{recruiter.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-6 text-slate-300 font-medium">
                                            {recruiter.company || 'N/A'}
                                        </td>
                                        <td className="p-6 text-center border-x border-white/5">
                                            {recruiter.isApproved ? (
                                                <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-green-500/20">Approved</span>
                                            ) : (
                                                <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-yellow-500/20">Pending</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!recruiter.isApproved ? (
                                                    <button
                                                        onClick={() => handleRecruiterAction(recruiter._id, 'approve')}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20"
                                                    >
                                                        <UserCheck size={14} /> Approve
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRecruiterAction(recruiter._id, 'block')}
                                                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                                                    >
                                                        <UserMinus size={14} /> Block
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteUser(recruiter._id)}
                                                    className="text-slate-500 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-500/10 ml-2"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {/* JOBS TAB */}
                {activeTab === 'jobs' && (
                    <motion.div
                        key="jobs"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass overflow-hidden rounded-3xl border border-white/5"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs">Job Title</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs">Company</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs">Posted By</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs">Status</th>
                                    <th className="p-6 font-bold text-slate-400 uppercase text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {jobs.map(job => (
                                    <tr key={job._id} className="hover:bg-white/5 transition-all">
                                        <td className="p-6 font-bold">{job.title}</td>
                                        <td className="p-6 text-slate-300">{job.company}</td>
                                        <td className="p-6 text-slate-400">
                                            {job.recruiter?.name || 'Unknown'}
                                        </td>
                                        <td className="p-6">
                                            {job.isActive ? (
                                                <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-green-500/20">Active</span>
                                            ) : (
                                                <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-red-500/20">Inactive</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
                                                className="text-slate-500 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-500/10"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;

