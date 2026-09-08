import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.js';
import { analyzeResumeATS, improveResumeBullet } from '../services/aiService.js';

export const resumeRouter = Router();

// Get resume
resumeRouter.get('/', (req, res) => {
  const userId = req.query.userId || 'default-user';
  const row = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1').get(userId);
  if (!row) {
    return res.status(404).json({ error: 'No resume found.' });
  }

  res.json({
    success: true,
    resume: {
      id: row.id,
      title: row.title,
      template: row.template,
      data: JSON.parse(row.data_json),
      atsScore: row.ats_score,
      atsFeedback: row.ats_feedback_json ? JSON.parse(row.ats_feedback_json) : null,
      updatedAt: row.updated_at
    }
  });
});

// Save or update resume
resumeRouter.post('/save', (req, res) => {
  try {
    const { userId = 'default-user', title, template = 'modern', data, atsScore, atsFeedback } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Resume data is required.' });
    }

    const existing = db.prepare('SELECT id FROM resumes WHERE user_id = ? LIMIT 1').get(userId);
    const resumeId = existing ? existing.id : 'res-' + crypto.randomUUID();

    if (existing) {
      db.prepare(`
        UPDATE resumes 
        SET title = ?, template = ?, data_json = ?, ats_score = COALESCE(?, ats_score), ats_feedback_json = COALESCE(?, ats_feedback_json), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        title || 'My Resume',
        template,
        JSON.stringify(data),
        atsScore !== undefined ? atsScore : null,
        atsFeedback ? JSON.stringify(atsFeedback) : null,
        resumeId
      );
    } else {
      db.prepare(`
        INSERT INTO resumes (id, user_id, title, template, data_json, ats_score, ats_feedback_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        resumeId,
        userId,
        title || 'My Resume',
        template,
        JSON.stringify(data),
        atsScore || 0,
        atsFeedback ? JSON.stringify(atsFeedback) : null
      );
    }

    res.json({ success: true, resumeId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save resume: ' + err.message });
  }
});

// Analyze resume for ATS score & feedback
resumeRouter.post('/analyze', async (req, res) => {
  try {
    const { resumeData, targetRole = 'Software Engineer', targetCompany = 'Tech Company', userId = 'default-user' } = req.body;
    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required.' });
    }

    const feedback = await analyzeResumeATS(resumeData, targetRole, targetCompany);

    // Update resume in database
    db.prepare(`
      UPDATE resumes 
      SET ats_score = ?, ats_feedback_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(feedback.score, JSON.stringify(feedback), userId);

    // Record activity
    db.prepare(`
      INSERT INTO activities (id, user_id, module, action, description, score)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('act-' + crypto.randomUUID(), userId, 'resume', 'ATS Resume Scan', `Analyzed resume for ${targetRole}. Score: ${feedback.score}/100`, feedback.score);

    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze resume: ' + err.message });
  }
});

// Improve bullet point
resumeRouter.post('/improve-bullet', async (req, res) => {
  try {
    const { bullet, role = 'Software Engineer' } = req.body;
    if (!bullet || !bullet.trim()) {
      return res.status(400).json({ error: 'Bullet text is required.' });
    }

    const improved = await improveResumeBullet(bullet, role);
    res.json({ success: true, improved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to optimize bullet: ' + err.message });
  }
});

// Parse raw resume text into structured fields
resumeRouter.post('/parse-raw', (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'Raw text required.' });

    // Extract basic details heuristically
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const githubMatch = rawText.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/);
    const linkedinMatch = rawText.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/);

    const parsed = {
      personalInfo: {
        fullName: lines[0] || 'Candidate',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        location: 'City, Country',
        github: githubMatch ? githubMatch[0] : '',
        linkedin: linkedinMatch ? linkedinMatch[0] : ''
      },
      summary: rawText.substring(0, 300) + '...',
      education: [],
      skills: {
        languages: ['Python', 'Java', 'C++', 'JavaScript'].filter(l => rawText.toLowerCase().includes(l.toLowerCase())),
        frameworks: ['React', 'Node.js', 'FastAPI'].filter(f => rawText.toLowerCase().includes(f.toLowerCase())),
        tools: ['Git', 'Docker', 'Linux'].filter(t => rawText.toLowerCase().includes(t.toLowerCase())),
        databases: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite'].filter(d => rawText.toLowerCase().includes(d.toLowerCase())),
        coreCS: ['DSA', 'OOP', 'DBMS', 'OS', 'Networks']
      }
    };

    res.json({ success: true, parsed });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse resume: ' + err.message });
  }
});
