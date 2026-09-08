import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.js';
import { generateRoadmapFlowchart } from '../services/aiService.js';

export const roadmapRouter = Router();

// Get active roadmap
roadmapRouter.get('/', (req, res) => {
  const userId = req.query.userId || 'default-user';
  const row = db.prepare('SELECT * FROM roadmaps WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1').get(userId);
  if (!row) {
    return res.status(404).json({ error: 'No roadmap found.' });
  }

  res.json({
    success: true,
    roadmap: {
      id: row.id,
      title: row.title,
      goal: row.goal,
      duration: row.duration,
      level: row.level,
      targetRole: row.target_role,
      targetCompany: row.target_company,
      nodes: JSON.parse(row.nodes_json),
      progressPct: row.progress_pct,
      updatedAt: row.updated_at
    }
  });
});

// Generate new roadmap
roadmapRouter.post('/generate', async (req, res) => {
  try {
    const {
      goal,
      duration = '10 Days',
      level = 'Intermediate',
      targetRole = 'Software Engineer',
      targetCompany = 'Cognizant',
      userId = 'default-user'
    } = req.body;

    if (!goal || !goal.trim()) {
      return res.status(400).json({ error: 'Goal is required.' });
    }

    const nodes = await generateRoadmapFlowchart(goal, duration, level, targetRole, targetCompany);

    const completedCount = nodes.filter(n => n.status === 'completed').length;
    const progressPct = Math.round((completedCount / (nodes.length || 1)) * 100);

    const roadmapId = 'rdm-' + crypto.randomUUID();
    const title = `${targetCompany || 'Tech'} — ${targetRole} (${duration}) Roadmap`;

    db.prepare(`
      INSERT INTO roadmaps (id, user_id, title, goal, duration, level, target_role, target_company, nodes_json, progress_pct)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      roadmapId,
      userId,
      title,
      goal,
      duration,
      level,
      targetRole,
      targetCompany,
      JSON.stringify(nodes),
      progressPct
    );

    // Record activity
    db.prepare(`
      INSERT INTO activities (id, user_id, module, action, description, score)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('act-' + crypto.randomUUID(), userId, 'roadmap', 'Roadmap Created', `Generated ${duration} roadmap for "${goal}"`, progressPct);

    res.json({
      success: true,
      roadmap: {
        id: roadmapId,
        title,
        goal,
        duration,
        level,
        targetRole,
        targetCompany,
        nodes,
        progressPct
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate roadmap: ' + err.message });
  }
});

// Update node status
roadmapRouter.put('/:id/node', (req, res) => {
  try {
    const roadmapId = req.params.id;
    const { nodeId, status } = req.body;

    const row = db.prepare('SELECT * FROM roadmaps WHERE id = ?').get(roadmapId);
    if (!row) return res.status(404).json({ error: 'Roadmap not found.' });

    const nodes = JSON.parse(row.nodes_json);
    const targetNode = nodes.find(n => n.id === nodeId);
    if (targetNode) {
      targetNode.status = status;
    }

    const completedCount = nodes.filter(n => n.status === 'completed').length;
    const progressPct = Math.round((completedCount / (nodes.length || 1)) * 100);

    db.prepare(`
      UPDATE roadmaps 
      SET nodes_json = ?, progress_pct = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(nodes), progressPct, roadmapId);

    res.json({ success: true, nodes, progressPct });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update node: ' + err.message });
  }
});
