const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    reason: { type: String, required: true }, // e.g., "Selling courses"
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
