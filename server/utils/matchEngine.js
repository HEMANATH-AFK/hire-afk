/**
 * CORE INTELLIGENCE - Smart Matching Engine
 * Score = Skill Match (60%) + Resume Keywords (20%) + Profile Completeness (10%) + Experience/Projects (10%)
 */

exports.calculateSmartScore = (student, job, resumeText) => {
    let finalScore = 0;

    const jobKeywords = (job.keywords || [])
        .flatMap(k => k.split(','))
        .map(k => k.toLowerCase().trim())
        .filter(k => k);

    const prioritySkills = (job.prioritySkills || [])
        .flatMap(k => k.split(','))
        .map(k => k.toLowerCase().trim())
        .filter(k => k);

    if (jobKeywords.length === 0) return 0; // cannot match without job requirements

    // Calculate total possible weight for skills
    // Regular skills = weight 1, Priority skills = weight 2
    const totalPotentialWeight = jobKeywords.length + prioritySkills.length;

    // 1. Skill Match (60%)
    const profileSkills = (student.skills || [])
        .flatMap(s => s.split(','))
        .map(s => s.toLowerCase().trim())
        .filter(s => s);

    let profileMatchWeight = 0;
    jobKeywords.forEach(keyword => {
        const isMatch = profileSkills.some(ps => ps.includes(keyword) || keyword.includes(ps));
        if (isMatch) {
            profileMatchWeight += 1;
            // If it's also a priority skill, add another 1 (total 2)
            if (prioritySkills.includes(keyword)) {
                profileMatchWeight += 1;
            }
        }
    });

    const skillScore = (profileMatchWeight / totalPotentialWeight) * 60;
    finalScore += skillScore;

    // 2. Resume Keywords (20%)
    let resumeMatchWeight = 0;
    if (resumeText) {
        const lowerResume = resumeText.toLowerCase();
        jobKeywords.forEach(keyword => {
            if (lowerResume.includes(keyword)) {
                resumeMatchWeight += 1;
                if (prioritySkills.includes(keyword)) {
                    resumeMatchWeight += 1;
                }
            }
        });
    }
    const resumeScore = (resumeMatchWeight / totalPotentialWeight) * 20;
    finalScore += resumeScore;

    // 3. Profile Completeness (10%)
    // Weight heavily by standard requirements
    let completenessFactors = 0;
    let maxFactors = 5;
    if (student.profilePic) completenessFactors++;
    if (student.description) completenessFactors++;
    if (student.mobile) completenessFactors++;
    if (student.resumeUrl) completenessFactors++;
    if (student.skills && student.skills.length > 0) completenessFactors++;

    const completenessScore = (completenessFactors / maxFactors) * 10;
    finalScore += completenessScore;

    // 4. Experience & Projects (10%)
    // Has the student added any work history or projects?
    let portfolioFactors = 0;
    const maxPortfolio = 2; // 1 for exp, 1 for projects
    if (student.experience && student.experience.length > 0) portfolioFactors++;
    if (student.projects && student.projects.length > 0) portfolioFactors++;

    const portfolioScore = (portfolioFactors / maxPortfolio) * 10;
    finalScore += portfolioScore;

    console.log(`[SMART MATCH] Student: ${student.name} | Job: ${job.title}`);
    console.log(`   - Skill Match (60%): ${skillScore.toFixed(2)}`);
    console.log(`   - Resume Text (20%): ${resumeScore.toFixed(2)}`);
    console.log(`   - Completeness(10%): ${completenessScore.toFixed(2)}`);
    console.log(`   - Experience (10%): ${portfolioScore.toFixed(2)}`);
    console.log(`   = Total Score: ${Math.round(finalScore)}%`);

    return Math.round(finalScore);
};
