import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.js';
import { generatePlacementChatResponse } from '../services/aiService.js';

export const chatRouter = Router();

// List chat sessions
chatRouter.get('/sessions', (req, res) => {
  const userId = req.query.userId || 'default-user';
  const sessions = db.prepare('SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC').all(userId);
  res.json({ success: true, sessions });
});

// Create new chat session
chatRouter.post('/sessions', (req, res) => {
  const userId = req.body.userId || 'default-user';
  const title = req.body.title || 'Placement Preparation Chat';
  const id = 'chat-' + crypto.randomUUID();

  db.prepare('INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)').run(id, userId, title);
  res.json({ success: true, session: { id, title, user_id: userId } });
});

// Get messages for a session
chatRouter.get('/sessions/:id', (req, res) => {
  const sessionId = req.params.id;
  const messages = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC').all(sessionId);
  res.json({ success: true, messages });
});

// Send message & receive AI reply
chatRouter.post('/message', async (req, res) => {
  try {
    const { sessionId, content, userId = 'default-user' } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      // Create session if none passed
      activeSessionId = 'chat-' + crypto.randomUUID();
      db.prepare('INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)')
        .run(activeSessionId, userId, content.substring(0, 35) + '...');
    }

    // Save user message
    const userMsgId = 'msg-' + crypto.randomUUID();
    db.prepare('INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)')
      .run(userMsgId, activeSessionId, 'user', content);

    // Get conversation history
    const history = db.prepare('SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC').all(activeSessionId);

    // Get user profile for personalization
    const profile = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) || {};

    // Generate AI response
    const aiResult = await generatePlacementChatResponse(history, profile);

    // Save AI message
    const aiMsgId = 'msg-' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO chat_messages (id, session_id, role, content, action_type, action_payload_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      aiMsgId,
      activeSessionId,
      'assistant',
      aiResult.reply,
      aiResult.structuredPlan ? 'plan' : null,
      aiResult.structuredPlan ? JSON.stringify(aiResult.structuredPlan) : null
    );

    // Update session timestamp
    db.prepare('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(activeSessionId);

    // Log activity
    db.prepare(`
      INSERT INTO activities (id, user_id, module, action, description)
      VALUES (?, ?, ?, ?, ?)
    `).run('act-' + crypto.randomUUID(), userId, 'chatbot', 'Placement Chat', `Discussed: "${content.substring(0, 40)}..."`);

    res.json({
      success: true,
      sessionId: activeSessionId,
      reply: aiResult.reply,
      source: aiResult.source,
      structuredPlan: aiResult.structuredPlan
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process chat message: ' + err.message });
  }
});

// Clear messages in session
chatRouter.post('/sessions/:id/clear', (req, res) => {
  const sessionId = req.params.id;
  db.prepare('DELETE FROM chat_messages WHERE session_id = ?').run(sessionId);
  res.json({ success: true, message: 'Chat cleared.' });
});
