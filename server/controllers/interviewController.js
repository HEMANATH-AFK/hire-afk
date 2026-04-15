const Interview = require('../models/Interview');
const Job = require('../models/Job');
const { GoogleGenAI } = require('@google/genai');
const { awardXP } = require('./gamificationController');

exports.generateInterview = async (req, res) => {
    const { jobId } = req.body;
    try {
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const keywords = (job.keywords || []).flatMap(k => k.split(',')).map(k => k.trim()).filter(k => k !== "");
        const primarySkill = keywords[0] || 'Software Development';
        const secondarySkill = keywords[1] || 'Problem Solving';
        const jobTitle = job.title;

        let questions = [];

        // Attempt Real AI Layer if configured
        if (process.env.GEMINI_API_KEY) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const prompt = `You are an expert technical interviewer hiring for a ${jobTitle} at ${job.company}.
Required skills: ${keywords.join(', ')}.

Generate exactly 5 distinct, highly-specific interview questions that test these exact skills and general engineering/behavioral competence.
Respond heavily structured in JSON format ONLY:
[
  { "text": "Question 1 text...", "type": "Technical Depth" },
  { "text": "Question 2 text...", "type": "CS Fundamentals" },
  { "text": "Question 3 text...", "type": "Engineering" },
  { "text": "Question 4 text...", "type": "Technical" },
  { "text": "Question 5 text...", "type": "HR/Behavioral" }
]`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                
                let responseText = response.text || "";
                responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                questions = JSON.parse(responseText);
            } catch (err) {
                console.error("Gemini Interview Gen Error (falling back to mock):", err.message);
            }
        }

        // Fallback or if API failed
        if (!questions || questions.length === 0) {
            const questionPool = {
                technical: [
                    `Can you describe the internal architecture of ${primarySkill}? How does it handle memory management or state under heavy load?`,
                    `In ${primarySkill}, what are the most common performance bottlenecks you've encountered and how did you profile/optimize them?`
                ],
                academic: [
                    `How do the core principles of Data Structures and Algorithms apply to the way you write production-level ${primarySkill} code?`,
                    `At a lower level, how does the Operating System manage the processes created by your ${primarySkill} applications?`
                ],
                behavioral: [
                    `Given your interest in ${job.company}, how would you navigate a technical disagreement with a senior architect regarding ${primarySkill}?`
                ]
            };
            const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
            questions = [
                { text: getRandom(questionPool.technical), type: 'Technical Depth' },
                { text: getRandom(questionPool.academic), type: 'CS Fundamentals' },
                { text: `For a ${jobTitle} role at ${job.company}, how would you implement a robust testing strategy for a ${primarySkill} module?`, type: 'Engineering' },
                { text: `Explain how you utilize ${secondarySkill} in conjunction with ${primarySkill} to ensure system scalability.`, type: 'Technical' },
                { text: getRandom(questionPool.behavioral), type: 'HR/Behavioral' }
            ];
        }

        const interview = await Interview.create({
            student: req.user.id,
            job: jobId,
            questions: questions.slice(0, 5) // ensure exactly 5
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
        
        let feedback = "";
        let score = 0;

        // Attempt Real AI Layer
        if (process.env.GEMINI_API_KEY) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const prompt = `You are evaluating a candidate's answer to this interview question.
Question: "${question.text}"
Candidate's Answer: "${answer}"

Evaluate their answer on a scale of 1 to 10 based on depth, correctness, and adherence to the STAR method if applicable.
Output exactly this JSON structure (no markdown blocks):
{
  "feedback": "Your constructive 2-3 sentence feedback talking directly to the user...",
  "score": 8
}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                let responseText = response.text || "";
                responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                
                const aiData = JSON.parse(responseText);
                feedback = aiData.feedback || "Good effort.";
                score = aiData.score || 5;
            } catch (err) {
                console.error("Gemini Grading Error (falling back to mock):", err.message);
            }
        }

        // Mock Fallback processing
        if (!feedback) {
            const lowAnswer = answer.toLowerCase();
            if (answer.length < 30) {
                feedback = "Your response is too brief. In a real interview, you should provide specific examples and use the STAR method.";
                score = 3;
            } else if (answer.length > 250) {
                feedback = "Excellent depth! You've provided a comprehensive explanation which shows your commitment to the topic.";
                score = 9;
            } else {
                feedback = "Good response. Try to relate this more specifically to foundational CS concepts or past project outcomes.";
                score = 7;
            }

            const depthKeywords = ['scaling', 'architecture', 'efficiency', 'optimization', 'complexity', 'trade-off', 'security', 'latency', 'asynchronous', 'normalization'];
            const wordCount = depthKeywords.filter(w => lowAnswer.includes(w)).length;
            if (wordCount >= 2) {
                feedback += " Good use of technical terminology.";
                score = Math.min(10, score + 1);
            }
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
            awardXP(req.user.id, 75, 'interview_practice').catch(console.error);
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
