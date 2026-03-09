
const User = require('../models/User');
const fs = require('fs');
const { autoApply, autoExtractSkills } = require('./automationController');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateProfile = async (req, res) => {
    const { mobile, description, skills, name, email, company } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (mobile !== undefined) user.mobile = mobile;
        if (description !== undefined) user.description = description;
        if (company !== undefined) user.company = company;
        if (skills !== undefined) {
            user.skills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s) : skills;
        }

        if (req.files) {
            if (req.files.profilePic) {
                // Delete old profile pic if it exists and is different
                if (user.profilePic && fs.existsSync(user.profilePic)) {
                    try { fs.unlinkSync(user.profilePic); } catch (e) { console.error("Old file delete error:", e); }
                }
                user.profilePic = req.files.profilePic[0].path;
            }
            if (req.files.companyLogo) {
                // Delete old company logo if it exists
                if (user.companyLogo && fs.existsSync(user.companyLogo)) {
                    try { fs.unlinkSync(user.companyLogo); } catch (e) { console.error("Old file delete error:", e); }
                }
                user.companyLogo = req.files.companyLogo[0].path;
            }
            if (req.files.resume) {
                // Delete old resume if it exists
                if (user.resumeUrl && fs.existsSync(user.resumeUrl)) {
                    try { fs.unlinkSync(user.resumeUrl); } catch (e) { console.error("Old file delete error:", e); }
                }
                user.resumeUrl = req.files.resume[0].path;
            }
        }

        // Check for resume upload and trigger extraction
        if (req.files && req.files.resume) {
            const extractedSkills = await autoExtractSkills(user.resumeUrl);

            if (extractedSkills.length > 0) {
                // Merge and deduplicate
                const currentSkills = new Set(user.skills || []);
                extractedSkills.forEach(s => currentSkills.add(s));
                user.skills = Array.from(currentSkills);
            }
        }

        const isComplete = user.mobile && user.description && user.skills && user.skills.length > 0 && user.resumeUrl;
        user.isProfileComplete = !!isComplete;

        await user.save();

        if (user.isProfileComplete) {
            // Trigger Auto-Apply (intentional non-await to run in background)
            autoApply(user);
        }

        res.json(user);
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ message: err.message });
    }
};



