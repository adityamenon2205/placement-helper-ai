import { Router } from 'express';
import { db } from '../db/database.js';
import { GoogleGenAI } from '@google/genai';
import { isGeminiConfigured } from '../services/aiService.js';

export const settingsRouter = Router();

// Get settings and status
settingsRouter.get('/', (req, res) => {
  const userId = req.query.userId || 'default-user';
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  res.json({
    success: true,
    user,
    aiStatus: {
      geminiConfigured: isGeminiConfigured(),
      activeModel: isGeminiConfigured() ? 'gemini-2.5-flash' : 'Built-in Placement Mentor Engine',
      hasEnvKey: Boolean(process.env.GEMINI_API_KEY)
    }
  });
});

// Update user profile
settingsRouter.post('/profile', (req, res) => {
  try {
    const {
      userId = 'default-user',
      name,
      email,
      target_role,
      target_company,
      prep_timeline,
      current_level,
      college,
      branch
    } = req.body;

    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          target_role = COALESCE(?, target_role),
          target_company = COALESCE(?, target_company),
          prep_timeline = COALESCE(?, prep_timeline),
          current_level = COALESCE(?, current_level),
          college = COALESCE(?, college),
          branch = COALESCE(?, branch),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, target_role, target_company, prep_timeline, current_level, college, branch, userId);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

// Save Gemini API key
settingsRouter.post('/api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      db.prepare("DELETE FROM app_settings WHERE key = 'gemini_api_key'").run();
      return res.json({ success: true, message: 'API key cleared.', geminiConfigured: false });
    }

    // Validate key with simple test call
    try {
      const ai = new GoogleGenAI({ apiKey });
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Ping test'
      });
    } catch (testErr) {
      return res.status(400).json({
        error: 'Invalid Gemini API Key: ' + (testErr.message || 'Verification failed')
      });
    }

    db.prepare(`
      INSERT INTO app_settings (key, value) 
      VALUES ('gemini_api_key', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(apiKey);

    res.json({ success: true, message: 'Gemini API Key successfully verified and saved!', geminiConfigured: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save API key: ' + err.message });
  }
});
