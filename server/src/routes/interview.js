import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.js';
import { generateInterviewQuestionOrFollowup, generateInterviewReport } from '../services/aiService.js';

export const interviewRouter = Router();

// In-memory active interview sessions store
const activeInterviews = new Map();

// Start new mock interview session
interviewRouter.post('/start', async (req, res) => {
  try {
    const {
      interviewType = 'Technical',
      targetRole = 'Software Engineer',
      difficulty = 'Entry Level',
      questionCount = 4,
      userId = 'default-user'
    } = req.body;

    const interviewId = 'int-' + crypto.randomUUID();

    const initialResult = await generateInterviewQuestionOrFollowup({
      interviewType,
      targetRole,
      difficulty,
      questionIndex: 0,
      previousQuestions: [],
      candidateAnswer: null
    });

    const sessionData = {
      id: interviewId,
      userId,
      interviewType,
      targetRole,
      difficulty,
      questionCount,
      currentIndex: 0,
      questions: [initialResult.nextQuestion || initialResult.interviewerSpeech],
      responses: [],
      currentQuestion: initialResult.nextQuestion || initialResult.interviewerSpeech,
      startTime: Date.now()
    };

    activeInterviews.set(interviewId, sessionData);

    res.json({
      success: true,
      interviewId,
      interviewerSpeech: initialResult.interviewerSpeech,
      question: initialResult.nextQuestion || initialResult.interviewerSpeech,
      questionIndex: 0,
      totalQuestions: questionCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start interview: ' + err.message });
  }
});

// Submit candidate answer (handles dynamic follow-up OR next question)
interviewRouter.post('/answer', async (req, res) => {
  try {
    const { interviewId, candidateAnswer } = req.body;
    const session = activeInterviews.get(interviewId);
    if (!session) return res.status(404).json({ error: 'Active interview session not found.' });

    // Store response
    session.responses.push({
      question: session.currentQuestion,
      candidateAnswer,
      timestamp: Date.now()
    });

    // Check if we need follow-up or should proceed
    const followUpResult = await generateInterviewQuestionOrFollowup({
      interviewType: session.interviewType,
      targetRole: session.targetRole,
      difficulty: session.difficulty,
      questionIndex: session.currentIndex,
      previousQuestions: session.questions,
      candidateAnswer
    });

    if (followUpResult.isFollowup) {
      // Dynamic follow-up question
      session.currentQuestion = followUpResult.interviewerSpeech;
      session.questions.push(followUpResult.interviewerSpeech);

      return res.json({
        success: true,
        isFollowup: true,
        isFinished: false,
        interviewerSpeech: followUpResult.interviewerSpeech,
        question: followUpResult.interviewerSpeech,
        questionIndex: session.currentIndex,
        totalQuestions: session.questionCount
      });
    }

    // Advance to next question or conclude
    session.currentIndex += 1;

    if (session.currentIndex >= session.questionCount) {
      // Interview complete!
      const report = await generateInterviewReport({
        responses: session.responses,
        targetRole: session.targetRole,
        interviewType: session.interviewType
      });

      // Save to database
      db.prepare(`
        INSERT INTO mock_interviews (id, user_id, title, interview_type, target_role, difficulty, question_count, overall_score, report_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        session.id,
        session.userId,
        `${session.interviewType} Interview (${session.targetRole})`,
        session.interviewType,
        session.targetRole,
        session.difficulty,
        session.questionCount,
        report.overallScore,
        JSON.stringify(report)
      );

      // Record activity
      db.prepare(`
        INSERT INTO activities (id, user_id, module, action, description, score)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'act-' + crypto.randomUUID(),
        session.userId,
        'interview',
        'Mock Interview Finished',
        `Completed ${session.interviewType} Interview. Overall Score: ${report.overallScore}/100`,
        report.overallScore
      );

      activeInterviews.delete(interviewId);

      return res.json({
        success: true,
        isFinished: true,
        interviewerSpeech: `Thank you for completing this interview! You did well. I have prepared your comprehensive evaluation report.`,
        report
      });
    }

    // Next question
    const nextQ = followUpResult.nextQuestion || `Question ${session.currentIndex + 1}`;
    session.currentQuestion = nextQ;
    session.questions.push(nextQ);

    res.json({
      success: true,
      isFollowup: false,
      isFinished: false,
      interviewerSpeech: followUpResult.interviewerSpeech,
      question: nextQ,
      questionIndex: session.currentIndex,
      totalQuestions: session.questionCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process answer: ' + err.message });
  }
});

// Finish interview early and get report
interviewRouter.post('/finish', async (req, res) => {
  try {
    const { interviewId } = req.body;
    const session = activeInterviews.get(interviewId);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const report = await generateInterviewReport({
      responses: session.responses,
      targetRole: session.targetRole,
      interviewType: session.interviewType
    });

    db.prepare(`
      INSERT INTO mock_interviews (id, user_id, title, interview_type, target_role, difficulty, question_count, overall_score, report_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      session.id,
      session.userId,
      `${session.interviewType} Interview (${session.targetRole})`,
      session.interviewType,
      session.targetRole,
      session.difficulty,
      session.responses.length,
      report.overallScore,
      JSON.stringify(report)
    );

    activeInterviews.delete(interviewId);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to finalize interview: ' + err.message });
  }
});

// Get previous interview history
interviewRouter.get('/history', (req, res) => {
  const userId = req.query.userId || 'default-user';
  const rows = db.prepare('SELECT * FROM mock_interviews WHERE user_id = ? ORDER BY created_at DESC').all(userId);

  res.json({
    success: true,
    interviews: rows.map(r => ({
      ...r,
      report: r.report_json ? JSON.parse(r.report_json) : null
    }))
  });
});
