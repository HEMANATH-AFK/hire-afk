const pdf = require('pdf-parse');
const fs = require('fs');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const aiController = require('./aiController');
const socketService = require('../services/socketService');

/**
 * Extracts text from a PDF resume.
 */
exports.extractKeywords = async (filePath) => {
    if (!filePath || !fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return "";
    }

    try {
        const dataBuffer = fs.readFileSync(filePath);
        let rawText = "";

        if (typeof pdf === 'function') {
            // pdf-parse 1.x
            const data = await pdf(dataBuffer);
            rawText = data?.text || "";
        } else if (pdf && typeof pdf.PDFParse === 'function') {
            // pdf-parse 2.x
            const parser = new pdf.PDFParse({ data: dataBuffer });
            const result = await parser.getText();
            rawText = result?.text || "";
            await parser.destroy();
        } else if (pdf && pdf.default && typeof pdf.default === 'function') {
            // ESM default import
            const data = await pdf.default(dataBuffer);
            rawText = data?.text || "";
        }

        return rawText.toLowerCase();
    } catch (err) {
        console.error('PDF Parse Error:', err);
        return "";
    }
};

/**
 * Automatically extracts skills from a PDF file by matching against a dictionary.
 * Dictionary is dynamically built from all existing Job keywords.
 */
exports.autoExtractSkills = async (filePath) => {
    const rawText = await exports.extractKeywords(filePath);
    if (!rawText) return [];

    try {
        // Build dictionary from job keywords
        const jobs = await Job.find({}, 'keywords');
        const dictionary = new Set([
            'react', 'node', 'express', 'mongodb', 'javascript', 'python', 'java', 'c++',
            'aws', 'docker', 'kubernetes', 'typescript', 'tailwind', 'css', 'html', 'next.js',
            'redux', 'sql', 'postgresql', 'git', 'github', 'agile', 'scrum', 'react native'
        ]);

        jobs.forEach(job => {
            if (job.keywords) {
                job.keywords.forEach(k => {
                    if (!k) return;
                    // Split if the keyword itself is a comma-separated string
                    k.split(',').forEach(subK => {
                        const trimmed = subK.toLowerCase().trim();
                        if (trimmed) dictionary.add(trimmed);
                    });
                });
            }
        });

        // Add core safety keywords to ensure extraction always has a baseline
        const safetyKeywords = ['react', 'node', 'node.js', 'javascript', 'mongodb', 'express', 'html', 'css', 'sql', 'python', 'java', 'git', 'full stack', 'developer'];
        safetyKeywords.forEach(k => dictionary.add(k));


        const foundSkills = [];
        const text = rawText.toLowerCase();

        dictionary.forEach(skill => {
            if (!skill) return;

            const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(^|[^a-zA-Z0-9])${escapedSkill}(?![a-zA-Z0-9])`, 'i');

            // Lenient matching: regex OR simple includes as fallback for complex punctuation
            if (regex.test(text) || text.includes(skill.toLowerCase())) {
                foundSkills.push(skill);
            }
        });

        return [...new Set(foundSkills)]; // Deduplicate
    } catch (err) {
        console.error('Skill discovery error:', err);
        return [];
    }
};

/**
 * Automates job applications based on keyword matching for a single student.
 */
exports.autoApply = async (student) => {
    if (!student.resumeUrl && (!student.skills || student.skills.length === 0)) return;

    try {
        let resumeText = "";
        if (student.resumeUrl) {
            resumeText = await exports.extractKeywords(student.resumeUrl);
        }

        const activeJobs = await Job.find({ isActive: true });

        // Normalize student skills from profile (handling possible comma-separated strings inside arrays)
        const profileSkills = (student.skills || [])
            .flatMap(s => s.split(','))
            .map(s => s.toLowerCase().trim())
            .filter(s => s);

        console.log(`[DEBUG] Auto-apply for ${student.name}. Profile Skills: [${profileSkills}]. Resume Text Length: ${resumeText.length}`);

        for (const job of activeJobs) {
            const existingApp = await Application.findOne({ student: student._id, job: job._id });
            if (existingApp && process.env.NODE_ENV !== 'test_matching') continue;

            let matchCount = 0;
            const matchedKeywords = [];

            const jobKeywords = (job.keywords || [])
                .flatMap(k => k.split(','))
                .map(k => k.toLowerCase().trim())
                .filter(k => k);

            jobKeywords.forEach(keyword => {
                // Check in profile skills (exact match or word boundary)
                const foundInProfile = profileSkills.includes(keyword);

                // Check in resume (substring check)
                const foundInResume = resumeText.includes(keyword);

                if (foundInProfile || foundInResume) {
                    matchCount++;
                    matchedKeywords.push(keyword);
                }
            });

            const score = jobKeywords.length > 0 ? (matchCount / jobKeywords.length) * 100 : 0;

            console.log(`[DEBUG] Job: ${job.title}. Match Count: ${matchCount}/${jobKeywords.length}. Score: ${score}%`);

            if (score >= 40) {
                const analysis = await aiController.analyzeResume(student.resumeUrl, job);

                await Application.create({
                    student: student._id,
                    job: job._id,
                    matchScore: Math.round(score),
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

                // Emit real-time notifications
                socketService.emitToUser(student._id.toString(), 'auto_applied', {
                    jobTitle: job.title,
                    company: job.company,
                    message: `You have been automatically applied to ${job.title} at ${job.company}!`
                });

                socketService.emitToUser(job.recruiter.toString(), 'new_application', {
                    jobTitle: job.title,
                    studentName: student.name,
                    message: `New AI-matched application received for ${job.title} from ${student.name}.`
                });

                console.log(`[AUTO] Applied Student ${student.name} to Job ${job.title} with score ${score}% (Matches: ${matchedKeywords.join(', ')})`);
            }
        }
    } catch (err) {
        console.error('Auto-apply background error:', err);
    }
};

/**
 * Automates job applications for all qualified students when a new job is posted.
 */
exports.applyAllStudentsToJob = async (job) => {
    try {
        const students = await User.find({ role: 'student', isProfileComplete: true });
        const jobKeywords = (job.keywords || [])
            .flatMap(k => k.split(','))
            .map(k => k.toLowerCase().trim())
            .filter(k => k);

        console.log(`[DEBUG] Reverse auto-apply for New Job: ${job.title}. Keywords: [${jobKeywords}]`);

        for (const student of students) {
            let resumeText = "";
            if (student.resumeUrl) {
                resumeText = await exports.extractKeywords(student.resumeUrl);
            }

            const profileSkills = (student.skills || [])
                .flatMap(s => s.split(','))
                .map(s => s.toLowerCase().trim())
                .filter(s => s);

            let matchCount = 0;

            jobKeywords.forEach(keyword => {
                const foundInProfile = profileSkills.includes(keyword);
                const foundInResume = resumeText.includes(keyword);
                if (foundInProfile || foundInResume) {
                    matchCount++;
                }
            });

            const score = jobKeywords.length > 0 ? (matchCount / jobKeywords.length) * 100 : 0;

            console.log(`[DEBUG] Student: ${student.name}. Score: ${score}%`);

            if (score >= 40) {
                const existingApp = await Application.findOne({ student: student._id, job: job._id });
                if (existingApp) continue;

                const analysis = await aiController.analyzeResume(student.resumeUrl, job);

                await Application.create({
                    student: student._id,
                    job: job._id,
                    matchScore: Math.round(score),
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

                // Emit real-time notifications
                socketService.emitToUser(student._id.toString(), 'auto_applied', {
                    jobTitle: job.title,
                    company: job.company,
                    message: `Great news! You were matched and auto-applied to the new ${job.title} opening at ${job.company}.`
                });

                socketService.emitToUser(job.recruiter.toString(), 'new_application', {
                    jobTitle: job.title,
                    studentName: student.name,
                    message: `New AI-matched application received for ${job.title} from ${student.name}.`
                });

                console.log(`[REVERSE-AUTO] Matched Student ${student.name} to New Job ${job.title} with score ${score}%`);
            }
        }
    } catch (err) {
        console.error('Reverse auto-apply background error:', err);
    }
};


