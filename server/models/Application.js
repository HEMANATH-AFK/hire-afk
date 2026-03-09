const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    matchScore: { type: Number, default: 0 },
    analysis: {
        matchedSkills: [String],
        missingSkills: [String],
        summary: String
    },
    aiFeedback: {
        strengths: [String],
        weaknesses: [String],
        recommendations: [String],
        rawFeedback: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
