const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyLogo: { type: String },
    description: { type: String, required: true },
    keywords: [String], // Skills required
    prioritySkills: [String], // Skills that carry 2x weight
    location: { type: String },
    salary: { type: String },
    vacancies: { type: Number, default: 1 },
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], default: 'Full-time' },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
