const Skill = require('../models/Skill');

exports.getSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ name: 1 });
        res.json(skills.map(s => s.name)); // Returning just the array of names
    } catch (err) {
        console.error(`[ERROR] getSkills failed: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
};

exports.addSkills = async (skillsArray) => {
    if (!skillsArray || !Array.isArray(skillsArray) || skillsArray.length === 0) return;
    
    try {
        const normalized = skillsArray
            .map(s => s.trim().toLowerCase())
            .filter(s => s !== '');

        if (normalized.length === 0) return;

        // Use Set to remove duplicates in the current payload
        const uniqueSkills = [...new Set(normalized)];
        
        const operations = uniqueSkills.map(skill => ({
            updateOne: {
                filter: { name: skill },
                update: { $setOnInsert: { name: skill } },
                upsert: true
            }
        }));

        await Skill.bulkWrite(operations);
    } catch (err) {
        console.error(`[ERROR] bulk AddSkills failed: ${err.message}`);
    }
};
