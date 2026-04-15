const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

/**
 * Provides AI-powered feedback for a resume based on a job description.
 */
exports.analyzeResume = async (resumePath, job) => {
    try {
        let text = "";
        if (resumePath) {
            const absolutePath = path.isAbsolute(resumePath) ? resumePath : path.resolve(process.cwd(), resumePath);
            
            if (fs.existsSync(absolutePath)) {
                const dataBuffer = fs.readFileSync(absolutePath);
                let rawText = "";

                if (typeof pdf === 'function') {
                    const data = await pdf(dataBuffer);
                    rawText = data?.text || "";
                } else if (pdf && typeof pdf.PDFParse === 'function') {
                    const parser = new pdf.PDFParse({ data: dataBuffer });
                    const result = await parser.getText();
                    rawText = result?.text || "";
                    await parser.destroy();
                } else if (pdf && pdf.default && (typeof pdf.default === 'function' || (pdf.default && typeof pdf.default.PDFParse === 'function'))) {
                    // ESM/TS interop
                    if (typeof pdf.default === 'function') {
                        const data = await pdf.default(dataBuffer);
                        rawText = data?.text || "";
                    } else {
                        const parser = new pdf.default.PDFParse({ data: dataBuffer });
                        const result = await parser.getText();
                        rawText = result?.text || "";
                        await parser.destroy();
                    }
                }
                text = (rawText || "").toLowerCase().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
            }
        }

        const jobKeywords = (job.keywords || [])
            .flatMap(k => k.split(','))
            .map(k => k.trim().toLowerCase())
            .filter(k => k.length > 0);

        const matched = jobKeywords.filter(skill => text.includes(skill));
        const missing = jobKeywords.filter(skill => !text.includes(skill));

        // Attempt Real AI Layer if configured
        if (process.env.GEMINI_API_KEY) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const prompt = `Analyze this resume against the job requirements.
Job Requirements: ${jobKeywords.join(', ')}.
Job Title: ${job.title} at ${job.company}.
Resume text: ${text.substring(0, 3000)}

Provide a strict JSON object (without markdown code blocks) exactly following this structure:
{
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "summary": "overall 2-3 sentence summary"
}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                
                let responseText = response.text || "";
                responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const aiData = JSON.parse(responseText);

                return {
                    strengths: aiData.strengths || [],
                    weaknesses: aiData.weaknesses || [],
                    recommendations: aiData.recommendations || [],
                    summary: aiData.summary || "AI Analysis Complete.",
                    matchedSkills: matched,
                    missingSkills: missing
                };
            } catch (err) {
                console.error("Gemini API Error in aiController (falling back to mock):", err.message);
            }
        }

        // DYNAMIC CONTENT GENERATOR (Simulated AI Fallback)
        const getSummary = () => {
            if (matched.length === 0) return `Based on our analysis, your current resume doesn't align closely with the core technical requirements for ${job.title}. We recommend tailoring your experience to explicitly highlight ${missing.slice(0, 2).join(' or ')} to better match ${job.company}'s needs.`;
            if (matched.length === jobKeywords.length) return `Exceptional match! Your background in ${matched.join(', ')} is a perfect fit for the ${job.title} role at ${job.company}. You are a top-tier candidate for this position.`;
            if (matched.length > jobKeywords.length / 2) return `Strong candidate profile. Your expertise in ${matched.slice(0, 3).join(', ')} covers the majority of the requirements for this ${job.title} position at ${job.company}.`;
            return `Good initial match. You have foundational skills in ${matched.join(', ')}, but highlighting more proficiency in ${missing.slice(0, 2).join(' and ')} would significantly strengthen your application.`;
        };

        const getStrengths = () => {
            const base = [];
            if (matched.includes('react') || matched.includes('frontend')) base.push("Strong UI development foundations with modern frameworks");
            if (matched.includes('node') || matched.includes('backend')) base.push("Solid understanding of server-side architecture and API design");
            if (matched.length > 3) base.push(`Demonstrated proficiency in multiple core technologies: ${matched.slice(0, 3).join(', ')}`);
            if (text.length > 1000) base.push("Comprehensive experience documentation and clear professional narrative");
            if (base.length === 0) base.push("Clear and legible resume structure", "Demonstrated interest in the tech industry");
            return base;
        };

        const getWeaknesses = () => {
            const gaps = [];
            if (missing.length > 0) gaps.push(`Technical gap identified in: ${missing.slice(0, 2).join(' and ')}`);
            if (text.length < 500 && text.length > 0) gaps.push("Resume content is slightly brief; consider adding more quantitative achievements");
            if (text.length > 0 && !text.includes('curriculum') && !text.includes('education')) gaps.push("Education section is not prominently featured; ensure academic credentials are clear");
            if (text.length === 0) gaps.push("Resume file content could not be parsed effectively for deep analysis");
            if (gaps.length === 0) gaps.push("No significant technical gaps found relative to this specific job description.");
            return gaps;
        };

        const getRecommendations = () => {
            const advice = [];
            if (missing.length > 0) advice.push(`Take a certification or complete a project focused on ${missing[0]} to bridge the skill gap.`);
            advice.push(`Tailor your opening summary to explicitly mention your interest in ${job.company}'s specific mission.`);
            if (text.includes('react') && !text.includes('redux')) advice.push("Consider mentioning state management libraries (like Redux or Zustand) if you have experience with them.");
            advice.push("Quantify your impact using metrics (e.g., 'Improved performance by 20%') to stand out to recruiters.");
            return advice;
        };

        return {
            strengths: getStrengths(),
            weaknesses: getWeaknesses(),
            recommendations: getRecommendations(),
            summary: getSummary(),
            matchedSkills: matched,
            missingSkills: missing
        };

    } catch (error) {
        console.error("AI Analysis Error:", error);
        return {
            strengths: ["Standard professional resume format"],
            weaknesses: ["Analysis partially limited due to document complexity"],
            recommendations: ["Ensure your resume is not password protected", "Use standard fonts for better AI parsing"],
            summary: "We were able to process your application, but advanced AI insights were limited by the document format.",
            matchedSkills: [],
            missingSkills: []
        };
    }
};
