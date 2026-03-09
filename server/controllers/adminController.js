const Report = require('../models/Report');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

exports.createReport = async (req, res) => {
    const { recruiterId, jobId, reason } = req.body;
    try {
        const report = await Report.create({
            student: req.user.id,
            recruiter: recruiterId,
            job: jobId,
            reason
        });
        res.status(201).json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('student', 'name email')
            .populate('recruiter', 'name company')
            .populate('job', 'title');
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resolveReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });

        report.status = 'resolved';
        await report.save();
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.adminActionRecruiter = async (req, res) => {
    const { action } = req.body; // 'approve' or 'block'
    try {
        const recruiter = await User.findById(req.params.id);
        if (!recruiter || recruiter.role !== 'recruiter') {
            return res.status(404).json({ message: 'Recruiter not found' });
        }

        if (action === 'approve') recruiter.isApproved = true;
        if (action === 'block') recruiter.isApproved = false;

        await recruiter.save();
        res.json({ message: `Recruiter ${action}ed successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPlatformStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
        const totalJobs = await Job.countDocuments();
        const totalApplications = await Application.countDocuments();
        const totalReports = await Report.countDocuments({ status: 'pending' });

        res.json({
            totalStudents,
            totalRecruiters,
            totalJobs,
            totalApplications,
            totalReports
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRecruiters = async (req, res) => {
    try {
        const recruiters = await User.find({ role: 'recruiter' }).select('-password');
        res.json(recruiters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('recruiter', 'name company');
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
