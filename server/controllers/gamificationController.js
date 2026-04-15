const User = require('../models/User');

const AVAILABLE_CHALLENGES = [
    { id: 'daily_login', title: 'Daily Explorer', description: 'Log in daily to maintain your streak.', xp: 10 },
    { id: 'profile_complete', title: 'Identity Verified', description: 'Complete your profile to 100%.', xp: 50 },
    { id: 'first_job_applied', title: 'First Step', description: 'Apply for your very first job.', xp: 20 },
    { id: 'resume_upload', title: 'Ready for Battle', description: 'Upload your first resume.', xp: 15 },
    { id: 'five_applications', title: 'Persistent Hunter', description: 'Apply for 5 different jobs.', xp: 100 }
];

const awardXP = async (userId, amount, challengeId = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        if (challengeId) {
            if (user.completedChallenges.includes(challengeId)) return; // Already completed
            user.completedChallenges.push(challengeId);
        }

        user.xp += amount;
        
        // Calculate new level (1 level per 100 XP, max level 10)
        let newLevel = Math.floor(user.xp / 100) + 1;
        if (newLevel > 10) newLevel = 10;
        
        user.level = newLevel;
        await user.save();
        return { xp: user.xp, level: user.level };
    } catch (err) {
        console.error("Error awarding XP:", err);
    }
};

const updateStreak = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const now = new Date();
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
        
        if (!lastLogin) {
            user.streakCount = 1;
            user.lastLoginDate = now;
            await awardXP(userId, 10, 'daily_login');
        } else {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
            const diffTime = Math.abs(today - lastLoginDay);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays === 1) {
                user.streakCount += 1;
                user.lastLoginDate = now;
                await awardXP(userId, 10, 'daily_login'); // Award for login if it's been a day
            } else if (diffDays > 1) {
                user.streakCount = 1;
                user.lastLoginDate = now;
                await awardXP(userId, 10, 'daily_login');
            }
        }
        await user.save();
    } catch (err) {
        console.error("Error updating streak:", err);
    }
};

exports.awardXP = awardXP;
exports.updateStreak = updateStreak;

exports.getGamificationStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('xp level streakCount completedChallenges');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({
            xp: user.xp,
            level: user.level,
            streakCount: user.streakCount,
            completedChallenges: user.completedChallenges,
            xpToNextLevel: user.level < 10 ? (user.level * 100) - user.xp : 0,
            challenges: AVAILABLE_CHALLENGES.map(c => ({
                ...c,
                completed: user.completedChallenges.includes(c.id)
            }))
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
