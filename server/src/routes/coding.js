import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.js';
import { executeCode } from '../services/codeRunner.js';
import { analyzeCodeSubmission } from '../services/aiService.js';

export const codingRouter = Router();

// List all problems
codingRouter.get('/problems', (req, res) => {
  const problems = db.prepare(`
    SELECT id, slug, title, difficulty, category, companies_json 
    FROM coding_problems 
    ORDER BY id ASC
  `).all();

  const formatted = problems.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    category: p.category,
    companies: JSON.parse(p.companies_json || '[]')
  }));

  res.json({ success: true, problems: formatted });
});

// Get single problem by slug
codingRouter.get('/problems/:slug', (req, res) => {
  const p = db.prepare('SELECT * FROM coding_problems WHERE slug = ?').get(req.params.slug);
  if (!p) return res.status(404).json({ error: 'Problem not found.' });

  res.json({
    success: true,
    problem: {
      id: p.id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      category: p.category,
      companies: JSON.parse(p.companies_json || '[]'),
      description: p.description,
      constraints: p.constraints,
      examples: JSON.parse(p.examples_json || '[]'),
      starterCode: JSON.parse(p.starter_code_json || '{}'),
      optimalSolution: p.optimal_solution_json ? JSON.parse(p.optimal_solution_json) : null,
      hints: JSON.parse(p.hints_json || '[]'),
      visibleTestCases: JSON.parse(p.test_cases_json || '[]').filter(tc => !tc.hidden)
    }
  });
});

// Run code (visible test cases + custom input)
codingRouter.post('/run', async (req, res) => {
  try {
    const { slug, language, code, customInput } = req.body;
    const p = db.prepare('SELECT * FROM coding_problems WHERE slug = ?').get(slug);
    if (!p) return res.status(404).json({ error: 'Problem not found.' });

    let testCases = JSON.parse(p.test_cases_json || '[]').filter(tc => !tc.hidden);

    if (customInput) {
      testCases = [{ input: customInput, expected: null, hidden: false }];
    }

    const execResult = await executeCode({ language, code, testCases });
    res.json({ success: true, ...execResult });
  } catch (err) {
    res.status(500).json({ error: 'Execution failed: ' + err.message });
  }
});

// Submit code (all test cases including hidden + AI analysis)
codingRouter.post('/submit', async (req, res) => {
  try {
    const { slug, language, code, userId = 'default-user' } = req.body;
    const p = db.prepare('SELECT * FROM coding_problems WHERE slug = ?').get(slug);
    if (!p) return res.status(404).json({ error: 'Problem not found.' });

    const allTestCases = JSON.parse(p.test_cases_json || '[]');
    const execResult = await executeCode({ language, code, testCases: allTestCases });

    // Run AI Code Analysis
    const aiAnalysis = await analyzeCodeSubmission(p, language, code, execResult);

    // Save submission
    const submissionId = 'sub-' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO coding_submissions (id, user_id, problem_id, language, code, status, passed_count, total_count, runtime_ms, ai_analysis_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      submissionId,
      userId,
      p.id,
      language,
      code,
      execResult.status,
      execResult.passedCount || 0,
      execResult.totalCount || allTestCases.length,
      execResult.runtimeMs || 0,
      JSON.stringify(aiAnalysis)
    );

    // Record activity
    const isAccepted = execResult.status === 'Accepted';
    db.prepare(`
      INSERT INTO activities (id, user_id, module, action, description, score)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'act-' + crypto.randomUUID(),
      userId,
      'coding',
      isAccepted ? 'Problem Solved' : 'Submission Attempted',
      `${isAccepted ? 'Accepted' : 'Attempted'} "${p.title}" in ${language} (${execResult.runtimeMs}ms)`,
      isAccepted ? 100 : 50
    );

    res.json({
      success: true,
      submissionId,
      ...execResult,
      aiAnalysis
    });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed: ' + err.message });
  }
});

// Coding statistics
codingRouter.get('/stats', (req, res) => {
  const userId = req.query.userId || 'default-user';

  const totalProblems = db.prepare('SELECT count(*) as count FROM coding_problems').get().count;

  const solvedRows = db.prepare(`
    SELECT DISTINCT problem_id FROM coding_submissions 
    WHERE user_id = ? AND status = 'Accepted'
  `).all(userId);

  const attemptedRows = db.prepare(`
    SELECT DISTINCT problem_id FROM coding_submissions 
    WHERE user_id = ?
  `).all(userId);

  const recentSubmissions = db.prepare(`
    SELECT s.*, p.title as problem_title, p.difficulty, p.category 
    FROM coding_submissions s
    JOIN coding_problems p ON s.problem_id = p.id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
    LIMIT 10
  `).all(userId);

  res.json({
    success: true,
    stats: {
      totalProblems,
      solvedCount: solvedRows.length,
      attemptedCount: attemptedRows.length,
      accuracy: attemptedRows.length > 0 ? Math.round((solvedRows.length / attemptedRows.length) * 100) : 100,
      recentSubmissions: recentSubmissions.map(s => ({
        ...s,
        aiAnalysis: s.ai_analysis_json ? JSON.parse(s.ai_analysis_json) : null
      }))
    }
  });
});
