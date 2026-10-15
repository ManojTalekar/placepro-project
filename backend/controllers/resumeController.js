const { pool } = require('../config/db');
const pdf = require('pdf-parse');

// ===== SKILL DATABASE for matching =====
const SKILL_KEYWORDS = {
  programming: ['java', 'python', 'javascript', 'c++', 'c#', 'typescript', 'kotlin', 'swift', 'go', 'rust', 'php', 'ruby', 'scala', 'r', 'matlab'],
  web: ['react', 'angular', 'vue', 'html', 'css', 'node.js', 'nodejs', 'express', 'django', 'flask', 'spring', 'spring boot', 'next.js', 'bootstrap', 'tailwind'],
  database: ['mysql', 'postgresql', 'mongodb', 'sqlite', 'oracle', 'sql server', 'redis', 'cassandra', 'dynamodb', 'firebase'],
  cloud: ['aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'devops'],
  data: ['machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'data analysis', 'data science', 'tableau', 'power bi'],
  tools: ['git', 'github', 'gitlab', 'jira', 'agile', 'scrum', 'postman', 'linux', 'bash', 'rest api', 'graphql', 'microservices', 'mvc'],
  mobile: ['android', 'ios', 'react native', 'flutter', 'xamarin'],
  other: ['communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking', 'project management']
};

// Extract all skills from text
const extractSkillsFromText = (text) => {
  const textLower = text.toLowerCase();
  const foundSkills = new Set();
  for (const category of Object.values(SKILL_KEYWORDS)) {
    for (const skill of category) {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    }
  }
  return [...foundSkills];
};

// Analyze match between resume skills and job description
const analyzeMatch = (resumeSkills, jobDescription, studentDbSkills) => {
  const jobSkills = extractSkillsFromText(jobDescription);
  const allStudentSkills = new Set([
    ...resumeSkills.map(s => s.toLowerCase()),
    ...studentDbSkills.map(s => s.toLowerCase())
  ]);

  const matchingSkills = jobSkills.filter(skill => allStudentSkills.has(skill.toLowerCase()));
  const missingSkills = jobSkills.filter(skill => !allStudentSkills.has(skill.toLowerCase()));
  const matchScore = jobSkills.length > 0 ? Math.round((matchingSkills.length / jobSkills.length) * 100) : 0;

  // Generate recommendations
  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(`Learn or practice: ${missingSkills.slice(0, 5).join(', ')}`);
  }
  if (matchScore < 50) {
    recommendations.push('Your profile needs significant improvement for this role. Focus on the missing technical skills.');
  } else if (matchScore < 75) {
    recommendations.push('You have a moderate match. Work on the missing skills to strengthen your application.');
  } else {
    recommendations.push('Great match! Polish your resume to highlight the matching skills prominently.');
  }
  if (!resumeSkills.includes('git') && !allStudentSkills.has('git')) {
    recommendations.push('Consider adding version control knowledge (Git/GitHub) - it is widely expected.');
  }

  return { matchScore, matchingSkills, missingSkills, jobSkillsFound: jobSkills, recommendations };
};

// POST /api/resume/analyze
const analyzeResume = async (req, res) => {
  const { drive_id, job_description, job_title } = req.body;
  try {
    const [sp] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Student profile not found.' });
    const studentId = sp[0].id;

    // Get student's skills from DB
    const [dbSkills] = await pool.query('SELECT skill_name FROM student_skills WHERE student_id = ?', [studentId]);
    const studentDbSkills = dbSkills.map(s => s.skill_name);

    // Get job description - either from drive or provided directly
    let finalJobDesc = job_description || '';
    let finalJobTitle = job_title || 'Custom Job';
    let finalDriveId = drive_id || null;

    if (drive_id) {
      const [drives] = await pool.query('SELECT * FROM placement_drives WHERE id = ?', [drive_id]);
      if (drives.length > 0) {
        finalJobDesc = drives[0].job_description + ' ' + drives[0].required_skills;
        finalJobTitle = drives[0].title;
      }
    }

    // Get latest resume text if available
    let resumeText = '';
    let resumeId = null;
    const [resumes] = await pool.query(
      'SELECT * FROM resumes WHERE student_id = ? ORDER BY is_primary DESC, upload_date DESC LIMIT 1',
      [studentId]
    );

    // Extract skills from custom resume text if provided, otherwise from profile bio and skills
    const customResumeText = req.body.resume_text;
    const profileText = (customResumeText && customResumeText.trim().length > 0)
      ? `${customResumeText} ${studentDbSkills.join(' ')}`
      : `${sp[0].bio || ''} ${studentDbSkills.join(' ')}`;
    const resumeSkills = extractSkillsFromText(profileText);

    const { matchScore, matchingSkills, missingSkills, jobSkillsFound, recommendations } = analyzeMatch(resumeSkills, finalJobDesc, studentDbSkills);

    // Resume completeness check
    const completeness = {
      has_contact: !!(sp[0].phone || sp[0].linkedin_url),
      has_education: !!(sp[0].college && sp[0].department),
      has_skills: studentDbSkills.length > 0,
      has_projects: false,
      has_certifications: false,
      has_resume: resumes.length > 0
    };
    const [[{ projCount }]] = await pool.query('SELECT COUNT(*) as projCount FROM student_projects WHERE student_id = ?', [studentId]);
    const [[{ certCount }]] = await pool.query('SELECT COUNT(*) as certCount FROM student_certifications WHERE student_id = ?', [studentId]);
    completeness.has_projects = projCount > 0;
    completeness.has_certifications = certCount > 0;

    const completenessScore = Math.round((Object.values(completeness).filter(Boolean).length / Object.keys(completeness).length) * 100);

    // Save analysis to DB
    const analysisResult = { completeness, completenessScore, jobSkillsFound };
    if (resumes.length > 0) resumeId = resumes[0].id;

    const [saved] = await pool.query(
      `INSERT INTO resume_analyses (student_id, resume_id, drive_id, job_title, job_description_analyzed, match_score, matching_skills, missing_skills, recommendations, analysis_result)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, resumeId, finalDriveId, finalJobTitle, finalJobDesc.substring(0, 2000),
        matchScore, JSON.stringify(matchingSkills), JSON.stringify(missingSkills),
        JSON.stringify(recommendations), JSON.stringify(analysisResult)]
    );

    res.json({
      success: true,
      analysis: {
        id: saved.insertId,
        jobTitle: finalJobTitle,
        matchScore,
        matchingSkills,
        missingSkills,
        recommendations,
        completeness,
        completenessScore,
        studentSkills: studentDbSkills,
        jobSkillsFound
      }
    });
  } catch (err) {
    console.error('Resume analysis error:', err);
    res.status(500).json({ success: false, message: 'Analysis failed. Server error.' });
  }
};

// GET /api/resume/history
const getAnalysisHistory = async (req, res) => {
  try {
    const [sp] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const [history] = await pool.query(
      'SELECT * FROM resume_analyses WHERE student_id = ? ORDER BY analyzed_at DESC LIMIT 20',
      [sp[0].id]
    );
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/resume/skill-gap/:driveId
const getSkillGap = async (req, res) => {
  const { driveId } = req.params;
  try {
    const [sp] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (sp.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const [drives] = await pool.query('SELECT * FROM placement_drives WHERE id = ?', [driveId]);
    if (drives.length === 0) return res.status(404).json({ success: false, message: 'Drive not found.' });

    const [dbSkills] = await pool.query('SELECT skill_name, skill_type, proficiency FROM student_skills WHERE student_id = ?', [sp[0].id]);
    const studentSkills = dbSkills.map(s => s.skill_name.toLowerCase());

    const drive = drives[0];
    const requiredSkillsText = drive.required_skills || '';
    const requiredSkills = extractSkillsFromText(requiredSkillsText + ' ' + drive.job_description);

    const matchingSkills = requiredSkills.filter(s => studentSkills.includes(s.toLowerCase()));
    const missingSkills = requiredSkills.filter(s => !studentSkills.includes(s.toLowerCase()));
    const matchPercentage = requiredSkills.length > 0 ? Math.round((matchingSkills.length / requiredSkills.length) * 100) : 0;

    const learningPriorities = missingSkills.map((skill, idx) => ({
      skill,
      priority: idx < 3 ? 'high' : idx < 6 ? 'medium' : 'low',
      suggestion: `Learn ${skill} through online courses, practice problems, and projects.`
    }));

    res.json({
      success: true,
      skillGap: {
        drive: { id: drive.id, title: drive.title, company_id: drive.company_id },
        studentSkills: dbSkills,
        requiredSkills,
        matchingSkills,
        missingSkills,
        matchPercentage,
        learningPriorities
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { analyzeResume, getAnalysisHistory, getSkillGap };
