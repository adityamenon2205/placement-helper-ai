import { Router } from 'express';
import { db } from '../db/database.js';

export const progressRouter = Router();

// Get unified progress metrics and recent activities
progressRouter.get('/', (req, res) => {
  const userId = req.query.userId || 'default-user';

  // 1. Get user profile
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) || {
    name: 'Aditya Menon',
    target_role: 'Software Development Engineer',
    target_company: 'Cognizant / Tier-1 Tech',
    prep_timeline: '10 Days',
    current_level: 'Intermediate',
    college: 'National Institute of Technology',
    branch: 'Computer Science & Engineering'
  };

  // 2. Coding progress
  const solvedCount = db.prepare(`
    SELECT count(DISTINCT problem_id) as count FROM coding_submissions 
    WHERE user_id = ? AND status = 'Accepted'
  `).get(userId).count;
  const dsaScore = Math.min(100, Math.round((solvedCount / 5) * 100));

  // 3. Resume score
  const resume = db.prepare('SELECT ats_score FROM resumes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1').get(userId);
  const resumeScore = resume ? resume.ats_score : 85;

  // 4. Roadmap progress
  const roadmap = db.prepare('SELECT progress_pct FROM roadmaps WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1').get(userId);
  const roadmapScore = roadmap ? roadmap.progress_pct : 30;

  // 5. Mock Interview score
  const interview = db.prepare('SELECT overall_score, report_json FROM mock_interviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
  const mockScore = interview ? interview.overall_score : 78;

  let communicationScore = 72;
  if (interview && interview.report_json) {
    try {
      const rep = JSON.parse(interview.report_json);
      if (rep.scores?.communication) communicationScore = rep.scores.communication;
    } catch {}
  }

  // 6. Technical Knowledge score
  const techKnowledgeScore = Math.round((dsaScore * 0.5) + (roadmapScore * 0.5));

  // 7. Unified Placement Readiness Index (weighted)
  // DSA (25%), Technical Knowledge (20%), Resume (20%), Communication (15%), Mock Interviews (20%)
  const overallReadiness = Math.round(
    (dsaScore * 0.25) +
    (techKnowledgeScore * 0.20) +
    (resumeScore * 0.20) +
    (communicationScore * 0.15) +
    (mockScore * 0.20)
  );

  // 8. Recent activities
  const activities = db.prepare(`
    SELECT * FROM activities 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 10
  `).all(userId);

  res.json({
    success: true,
    user,
    readiness: {
      overall: Math.max(15, Math.min(99, overallReadiness)),
      dsa: dsaScore,
      technicalKnowledge: techKnowledgeScore,
      resume: resumeScore,
      communication: communicationScore,
      mockInterviews: mockScore
    },
    activities
  });
});
