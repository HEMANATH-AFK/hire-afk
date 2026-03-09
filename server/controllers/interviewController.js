const Interview = require('../models/Interview');
const Job = require('../models/Job');

exports.generateInterview = async (req, res) => {
    const { jobId } = req.body;
    try {
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const keywords = (job.keywords || []).flatMap(k => k.split(',')).map(k => k.trim()).filter(k => k !== "");
        const primarySkill = keywords[0] || 'Software Development';
        const secondarySkill = keywords[1] || 'Problem Solving';
        const jobTitle = job.title.toLowerCase();

        // Intelligence Engine: Specialized question pools
        const questionPool = {
            technical: [
                `Can you describe the internal architecture of ${primarySkill}? How does it handle memory management or state under heavy load?`,
                `In ${primarySkill}, what are the most common performance bottlenecks you've encountered and how did you profile/optimize them?`,
                `Explain a complex technical challenge you solved using ${primarySkill}. Specifically, why was this the right tool for that problem vs alternatives?`,
                `If you had to scale an application built with ${primarySkill} and ${keywords[2] || 'distributed systems'}, what would be your strategy for data consistency?`
            ],
            academic: [
                `How do the core principles of Data Structures and Algorithms apply to the way you write production-level ${primarySkill} code?`,
                `At a lower level, how does the Operating System manage the processes created by your ${primarySkill} applications?`,
                `Explain the time complexity of the most efficient search/sort algorithm you've used in a project involving ${secondarySkill}.`,
                `In your studies, what foundational concept (like Networking protocols or Database Normalization) has been most useful when working with ${primarySkill}?`
            ],
            behavioral: [
                `Given your interest in ${job.company}, how would you navigate a technical disagreement with a senior architect regarding ${primarySkill} implementation?`,
                `Describe a time you had to learn a 'core study' concept outside your usual curriculum to solve a task. How did you validate your learning?`
            ]
        };

        // Randomly pick unique questions from the pool to avoid repetition
        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const questions = [
            // 1. Technical Depth
            { text: getRandom(questionPool.technical), type: 'Technical Depth' },
            // 2. Academic/Foundational Connection
            { text: getRandom(questionPool.academic), type: 'CS Fundamentals' },
            // 3. Application Specialized
            { text: `For a ${job.title} role at ${job.company}, how would you implement a robust testing strategy for a ${primarySkill} module?`, type: 'Engineering' },
            // 4. Secondary Skill Deep Dive
            { text: `Explain how you utilize ${secondarySkill} in conjunction with ${primarySkill} to ensure system scalability.`, type: 'Technical' },
            // 5. Behavioral/Cultural
            { text: getRandom(questionPool.behavioral), type: 'HR/Behavioral' }
        ];

        const interview = await Interview.create({
            student: req.user.id,
            job: jobId,
            questions
        });

        res.status(201).json(interview);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.submitAnswer = async (req, res) => {
    const { interviewId, questionIndex, answer } = req.body;
    try {
        const interview = await Interview.findById(interviewId).populate('job');
        if (!interview) return res.status(404).json({ message: 'Interview not found' });

        const question = interview.questions[questionIndex];
        const lowAnswer = answer.toLowerCase();

        // Nuanced Scoring & Feedback Engine
        let feedback = "";
        let score = 0;

        // 1. Length & Engagement Check
        if (answer.length < 30) {
            feedback = "Your response is too brief. In a real interview, you should provide specific examples and use the STAR method (Situation, Task, Action, Result).";
            score = 3;
        } else if (answer.length > 250) {
            feedback = "Excellent depth! You've provided a comprehensive explanation which shows your commitment to the topic.";
            score = 9;
        } else {
            feedback = "Good response. Try to relate this more specifically to foundational CS concepts or past project outcomes.";
            score = 7;
        }

        // 2. Technical Keyword Depth Check (Simulated Intelligence)
        const depthKeywords = ['scaling', 'architecture', 'efficiency', 'optimization', 'complexity', 'trade-off', 'security', 'latency', 'asynchronous', 'normalization'];
        const wordCount = depthKeywords.filter(w => lowAnswer.includes(w)).length;

        if (wordCount >= 2) {
            feedback += " I noticed you mentioned key technical concepts like " + depthKeywords.filter(w => lowAnswer.includes(w)).slice(0, 2).join(' and ') + ", which adds significant credibility to your profile.";
            score = Math.min(10, score + 1);
        }

        interview.responses.push({
            questionIndex,
            answer,
            feedback,
            score
        });

        if (interview.responses.length === interview.questions.length) {
            interview.status = 'completed';
            const totalScore = interview.responses.reduce((sum, r) => sum + r.score, 0);
            interview.overallScore = Math.round((totalScore / (interview.questions.length * 10)) * 100);
        }

        await interview.save();
        res.json(interview);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ student: req.user.id }).populate('job');
        res.json(interviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
