const Application = require('../models/Application');
const Job = require('../models/Job');

exports.getRecruiterStats = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiter: req.user.id });
        const jobIds = jobs.map(j => j._id);

        const apps = await Application.find({ job: { $in: jobIds } });

        const totalApps = apps.length;
        const totalHires = apps.filter(a => a.status === 'accepted').length;
        const avgMatchScore = totalApps > 0
            ? Math.round(apps.reduce((sum, a) => sum + (a.matchScore || 0), 0) / totalApps)
            : 0;

        res.json({
            totalJobs: jobs.length,
            totalApplications: totalApps,
            totalHires,
            avgMatchScore,
            activePostings: jobs.filter(j => j.isActive).length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getJobFunnel = async (req, res) => {
    try {
        const { jobId } = req.params;
        const apps = await Application.find({ job: jobId });

        const funnel = {
            applied: apps.length,
            pending: apps.filter(a => a.status === 'pending').length,
            accepted: apps.filter(a => a.status === 'accepted').length,
            rejected: apps.filter(a => a.status === 'rejected').length
        };

        res.json(funnel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getSkillGapAnalysis = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const apps = await Application.find({ job: jobId }).populate('student');

        const requiredSkills = (job.keywords || []).flatMap(k => k.split(',')).map(k => k.trim().toLowerCase());
        const applicantSkills = {};

        apps.forEach(app => {
            if (app.student && app.student.skills) {
                app.student.skills.forEach(skill => {
                    const s = skill.toLowerCase();
                    applicantSkills[s] = (applicantSkills[s] || 0) + 1;
                });
            }
        });

        res.json({
            requiredSkills,
            applicantSkillCounts: applicantSkills,
            totalApplicants: apps.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
