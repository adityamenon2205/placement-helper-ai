import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { initDB } from './db/database.js';
import { chatRouter } from './routes/chat.js';
import { resumeRouter } from './routes/resume.js';
import { roadmapRouter } from './routes/roadmap.js';
import { codingRouter } from './routes/coding.js';
import { interviewRouter } from './routes/interview.js';
import { progressRouter } from './routes/progress.js';
import { settingsRouter } from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or server dir
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & Tables
initDB();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/coding', codingRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/progress', progressRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Placement Helper AI Backend',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Placement Helper AI Server listening on http://localhost:${PORT}`);
});
