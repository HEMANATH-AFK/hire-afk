const Job = require('../models/Job');
const User = require('../models/User');
const { applyAllStudentsToJob, extractKeywords } = require('./automationController');
const { addSkills } = require('./skillController');
const matchEngine = require('../utils/matchEngine');
const { GoogleGenAI } = require('@google/genai');

exports.createJob = async (req, res) => {
    const { title, company, description, keywords, location, salary, vacancies, jobType, deadline } = req.body;
    try {
        // Check if recruiter is approved
        const recruiter = await User.findById(req.user.id);
        if (!recruiter.isApproved) {
            return res.status(403).json({ message: 'Recruiter account not yet approved by admin' });
        }

        const job = await Job.create({
            recruiter: req.user.id,
            title,
            company: company || recruiter.company || 'Unknown Company',
            companyLogo: req.file ? req.file.path.replace(/\\/g, '/') : (recruiter.companyLogo || undefined),
            description,
            keywords: typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords,
            prioritySkills: typeof req.body.prioritySkills === 'string' ? req.body.prioritySkills.split(',').map(k => k.trim()) : req.body.prioritySkills,
            location: location || 'Remote',
            salary,
            vacancies: vacancies || 1,
            jobType: jobType || 'Full-time',
            deadline: deadline || undefined
        });

        // Trigger Reverse Auto-Apply (intentional non-await to run in background)
        applyAllStudentsToJob(job);

        // Add extracted skills to dictionary
        if (job.keywords && job.keywords.length > 0) {
            addSkills(job.keywords);
        }

        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getJobs = async (req, res) => {
    try {
        const { search, location, minSalary, keywords } = req.query;
        let query = { isActive: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (minSalary) {
            query.salary = { $gte: minSalary };
        }

        if (keywords) {
            const keywordArray = keywords.split(',').map(k => k.trim());
            query.keywords = { $in: keywordArray };
        }

        const jobs = await Job.find(query).populate('recruiter', 'name company companyLogo');
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRecruiterJobs = async (req, res) => {
    try {
        console.log(`[DEBUG] Fetching jobs for recruiter: ${req.user.id}`);
        const jobs = await Job.find({ recruiter: req.user.id });
        res.json(jobs);
    } catch (err) {
        console.error(`[ERROR] getRecruiterJobs failed: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const jobId = req.params.id.trim();
        const { title, company, description, keywords, prioritySkills, location, salary, vacancies, jobType, deadline, isActive } = req.body;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found in database' });
        }

        // Fix: Safety check for recruiter existence and admin override
        if (req.user.role !== 'admin' && (!job.recruiter || job.recruiter.toString() !== req.user.id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updateData = {
            title: title !== undefined ? title : job.title,
            company: company !== undefined ? company : job.company,
            description: description !== undefined ? description : job.description,
            keywords: keywords !== undefined ? (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords) : job.keywords,
            prioritySkills: prioritySkills !== undefined ? (typeof prioritySkills === 'string' ? prioritySkills.split(',').map(k => k.trim()) : prioritySkills) : job.prioritySkills,
            location: location !== undefined ? location : job.location,
            salary: salary !== undefined ? salary : job.salary,
            vacancies: vacancies !== undefined ? vacancies : job.vacancies,
            jobType: jobType !== undefined ? jobType : job.jobType,
            deadline: deadline !== undefined ? deadline : job.deadline,
            isActive: isActive !== undefined ? isActive : job.isActive
        };

        if (req.file) {
            // Normalize path for web usage (Windows backslashes to forward slashes)
            updateData.companyLogo = req.file.path.replace(/\\/g, '/');
        } else if (!updateData.companyLogo && recruiter.companyLogo) {
            updateData.companyLogo = recruiter.companyLogo;
        }

        if (!updateData.company && recruiter.company) {
            updateData.company = recruiter.company;
        }

        const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, { new: true });

        // RE-trigger matching for updated job
        applyAllStudentsToJob(updatedJob);

        // Add extracted skills to dictionary
        if (updatedJob.keywords && updatedJob.keywords.length > 0) {
            addSkills(updatedJob.keywords);
        }

        res.json(updatedJob);
    } catch (err) {
        console.error(`[ERROR] updateJob failed: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Fix: Safety check for recruiter existence and admin override
        if (req.user.role !== 'admin' && (!job.recruiter || job.recruiter.toString() !== req.user.id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } catch (err) {
        console.error(`[ERROR] deleteJob failed: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
};

exports.getAIJobSuggestions = async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        if (!student) return res.status(404).json({ message: 'User not found' });

        const activeJobs = await Job.find({ isActive: true }).lean();
        
        let resumeText = "";
        if (student.resumeUrl) {
            resumeText = await extractKeywords(student.resumeUrl);
        }

        const scoredJobs = activeJobs.map(job => {
            const score = matchEngine.calculateSmartScore(student, job, resumeText);
            return { ...job, matchScore: score };
        });

        const topJobs = scoredJobs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

        if (process.env.GEMINI_API_KEY && topJobs.length > 0) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                
                const jobsContext = topJobs.map((j, i) => `[${i}] ${j.title} at ${j.company} (Skills: ${j.keywords?.join(', ')})`).join('\n');
                const profileContext = `Skills: ${student.skills?.join(', ')}.`;
                
                const prompt = `You are an AI Job Matcher. I have a candidate with these skills: ${profileContext}.
Here are their top 5 mathematical job matches:
${jobsContext}

For each job, write a personalized, 1-sentence "AI Pitch" explaining why they are a strong fit.
Return ONLY a valid JSON array of objects with exactly this structure:
[
  { "jobIndex": 0, "aiPitch": "..." },
  { "jobIndex": 1, "aiPitch": "..." }
]`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                
                let responseText = response.text || "";
                responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const aiPitches = JSON.parse(responseText);

                aiPitches.forEach(pitch => {
                    if (topJobs[pitch.jobIndex]) {
                        topJobs[pitch.jobIndex].aiPitch = pitch.aiPitch;
                    }
                });
            } catch (err) {
                console.error("Gemini API Error in getAIJobSuggestions:", err.message);
                topJobs.forEach(j => j.aiPitch = `Based on your profile, you have a solid ${Math.round(j.matchScore)}% match for this role.`);
            }
        } else {
            topJobs.forEach(j => j.aiPitch = `Based on your profile, you have a solid ${Math.round(j.matchScore)}% match for this role. Add more skills to improve your score!`);
        }

        res.json(topJobs);
    } catch (err) {
        console.error("getAIJobSuggestions error:", err);
        res.status(500).json({ message: err.message });
    }
};
