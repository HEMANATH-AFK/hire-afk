const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    questions: [{
        text: String,
        type: { type: String, enum: ['Technical Depth', 'CS Fundamentals', 'Engineering', 'Technical', 'HR/Behavioral', 'Behavioral', 'Technical Deep Dive'] }
    }],
    responses: [{
        questionIndex: Number,
        answer: String,
        feedback: String,
        score: Number // 1-10
    }],
    overallScore: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
