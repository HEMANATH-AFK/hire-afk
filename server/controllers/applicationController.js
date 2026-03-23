const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const socketService = require('../services/socketService');

exports.getStudentApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user.id })
            .populate('job', 'title company location salary');
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getJobApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Ensure the recruiter owns this job
        if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('student', 'name email mobile skills resumeUrl description');
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const application = await Application.findById(req.params.id).populate('job');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Ensure the recruiter owns the job associated with this application
        if (application.job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        application.status = status;
        await application.save();

        // Emit real-time notification to the student
        socketService.emitToUser(application.student.toString(), 'status_updated', {
            applicationId: application._id,
            jobTitle: application.job.title,
            company: application.job.company,
            status: status,
            message: `Your application for ${application.job.title} at ${application.job.company} has been ${status}.`
        });

        res.json(application);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.manualApply = async (req, res) => {
    const { jobId } = req.body;
    try {
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check if already applied
        const existingApp = await Application.findOne({ student: req.user.id, job: jobId });
        if (existingApp) return res.status(400).json({ message: 'Already applied' });

        const aiController = require('./aiController');
        const automationController = require('./automationController');

        // Extract text and calculate initial match score
        const student = await User.findById(req.user.id);
        const resumeText = await automationController.extractKeywords(student.resumeUrl);
        const jobKeywords = (job.keywords || []).flatMap(k => k.split(',')).map(k => k.trim().toLowerCase());

        let matchCount = 0;
        jobKeywords.forEach(skill => {
            if (resumeText.includes(skill)) matchCount++;
        });
        const score = jobKeywords.length > 0 ? (matchCount / jobKeywords.length) * 100 : 0;

        const analysis = await aiController.analyzeResume(student.resumeUrl, job);

        const application = await Application.create({
            student: req.user.id,
            job: jobId,
            matchScore: Math.round(score),
            status: 'pending',
            analysis: {
                matchedSkills: analysis.matchedSkills,
                missingSkills: analysis.missingSkills,
                summary: analysis.summary
            },
            aiFeedback: {
                strengths: analysis.strengths,
                weaknesses: analysis.weaknesses,
                recommendations: analysis.recommendations,
                rawFeedback: analysis.rawFeedback
            }
        });

        res.status(201).json(application);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRecruiterApplications = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiter: req.user.id });
        const jobIds = jobs.map(j => j._id);
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('job', 'title company location')
            .populate('student', 'name email mobile skills resumeUrl description');
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('job');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        const isStudent = req.user.role === 'student';
        const isRecruiter = req.user.role === 'recruiter' || req.user.role === 'admin';

        if (isStudent) {
            // Ensure student owns the application
            if (application.student.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            // Allow delete if pending (withdraw) or rejected (cleanup)
            if (application.status === 'accepted') {
                return res.status(400).json({ message: 'Cannot delete an accepted application' });
            }
        } else if (isRecruiter) {
            // Ensure recruiter owns the job or is admin
            if (application.job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized' });
            }
            // Recruiters can only delete rejected applications
            if (application.status !== 'rejected') {
                return res.status(400).json({ message: 'Recruiters can only delete rejected applications' });
            }
        }

        await application.deleteOne();
        res.json({ message: 'Application deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.filterApplications = async (req, res) => {
    try {
        const { skills, mode, jobId } = req.query;
        
        if (!skills) {
            return res.status(400).json({ message: 'Skills parameter is required' });
        }

        const selectedSkills = skills.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== '');
        if (selectedSkills.length === 0) {
            return res.status(400).json({ message: 'Valid skills parameter is required' });
        }

        let query = {};
        
        // If a specific job is selected
        if (jobId) {
            query.job = jobId;
        } else {
            // Find all jobs for this recruiter
            const recruiterJobs = await Job.find({ recruiter: req.user.id }).select('_id');
            const jobIds = recruiterJobs.map(j => j._id);
            query.job = { $in: jobIds };
        }

        // Only search pending or active applications maybe? For now, fetch all non-rejected as per previous view, or just fetch all
        // query.status = { $ne: 'rejected' }; // optional

        const applications = await Application.find(query)
            .populate('job', 'title company location')
            .populate('student', 'name email mobile skills resumeUrl description');

        let filteredApplications = [];

        applications.forEach(app => {
            if (!app.student) return;
            
            const candidateSkills = (app.student.skills || [])
                .filter(s => s && typeof s === 'string' && s.trim() !== '')
                .map(s => s.toLowerCase().trim());
            
            let matchCount = 0;
            const matchedSkills = [];
            
            selectedSkills.forEach(reqSkill => {
                const isMatch = candidateSkills.some(cs => {
                    if (!cs) return false;
                    return cs.includes(reqSkill) || reqSkill.includes(cs);
                });
                if (isMatch) {
                    matchCount++;
                    matchedSkills.push(reqSkill);
                }
            });

            const matchScore = Math.round((matchCount / selectedSkills.length) * 100);

            let includeCandidate = false;
            
            if (mode === 'strict' && matchScore === 100) {
                includeCandidate = true;
            } else if (mode === 'smart' && matchScore >= 40) {
                includeCandidate = true;
            }

            if (includeCandidate) {
                // Convert mongoose doc to plain object to attach new fields without saving to DB
                const appObj = app.toObject();
                appObj.filterMatchScore = matchScore; // New field for this query
                appObj.filterMatchedSkills = matchedSkills;
                filteredApplications.push(appObj);
            }
        });

        // Sort by highest match score first
        filteredApplications.sort((a, b) => b.filterMatchScore - a.filterMatchScore);

        res.json(filteredApplications);
    } catch (err) {
        console.error(`[ERROR] filterApplications failed: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
};

