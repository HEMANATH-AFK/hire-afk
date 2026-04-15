const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student' },
    isApproved: { type: Boolean, default: false }, // For recruiters

    // Student Specific
    profilePic: { type: String },
    mobile: { type: String },
    description: { type: String },
    skills: [String],
    resumeUrl: { type: String },
    isProfileComplete: { type: Boolean, default: false },
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String
    }],
    projects: [{
        title: String,
        technologies: [String],
        description: String,
        link: String
    }],

    // Recruiter Specific
    company: { type: String },
    companyLogo: { type: String },

    // Gamification
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakCount: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    completedChallenges: [{ type: String }]
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});


module.exports = mongoose.model('User', userSchema);
