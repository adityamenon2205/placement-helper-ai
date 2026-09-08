import { UserProfile, UnifiedReadiness, ActivityItem, ResumeData, ATSFeedback, RoadmapData, CodingProblem, SubmissionResult, InterviewReport } from '../types';

const API_BASE = '/api';

export async function fetchProgress(): Promise<{ user: UserProfile; readiness: UnifiedReadiness; activities: ActivityItem[] }> {
  const res = await fetch(`${API_BASE}/progress`);
  if (!res.ok) throw new Error('Failed to load progress data');
  return res.json();
}

// Chat API
export async function sendChatMessage(content: string, sessionId?: string): Promise<{ reply: string; sessionId: string; source: string; structuredPlan?: any }> {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, sessionId })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function fetchChatMessages(sessionId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`);
  if (!res.ok) throw new Error('Failed to load messages');
  const data = await res.json();
  return data.messages;
}

export async function clearChatSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/chat/sessions/${sessionId}/clear`, { method: 'POST' });
}

// Resume API
export async function fetchResume(): Promise<{ resume: { id: string; title: string; template: string; data: ResumeData; atsScore: number; atsFeedback: ATSFeedback } }> {
  const res = await fetch(`${API_BASE}/resume`);
  if (!res.ok) throw new Error('Failed to load resume');
  return res.json();
}

export async function saveResume(resumeData: ResumeData, template = 'modern', title = 'My Resume'): Promise<{ success: boolean; resumeId: string }> {
  const res = await fetch(`${API_BASE}/resume/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: resumeData, template, title })
  });
  if (!res.ok) throw new Error('Failed to save resume');
  return res.json();
}

export async function analyzeResume(resumeData: ResumeData, targetRole?: string, targetCompany?: string): Promise<ATSFeedback> {
  const res = await fetch(`${API_BASE}/resume/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData, targetRole, targetCompany })
  });
  if (!res.ok) throw new Error('Failed to analyze resume');
  const data = await res.json();
  return data.feedback;
}

export async function improveBullet(bullet: string, role?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/resume/improve-bullet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bullet, role })
  });
  if (!res.ok) throw new Error('Failed to improve bullet');
  const data = await res.json();
  return data.improved;
}

export async function parseRawResume(rawText: string): Promise<ResumeData> {
  const res = await fetch(`${API_BASE}/resume/parse-raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText })
  });
  if (!res.ok) throw new Error('Failed to parse raw resume');
  const data = await res.json();
  return data.parsed;
}

// Roadmap API
export async function fetchRoadmap(): Promise<{ roadmap: RoadmapData }> {
  const res = await fetch(`${API_BASE}/roadmap`);
  if (!res.ok) throw new Error('Failed to load roadmap');
  return res.json();
}

export async function generateRoadmap(params: { goal: string; duration?: string; level?: string; targetRole?: string; targetCompany?: string }): Promise<{ roadmap: RoadmapData }> {
  const res = await fetch(`${API_BASE}/roadmap/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to generate roadmap');
  return res.json();
}

export async function updateRoadmapNodeStatus(roadmapId: string, nodeId: string, status: string): Promise<{ progressPct: number }> {
  const res = await fetch(`${API_BASE}/roadmap/${roadmapId}/node`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeId, status })
  });
  if (!res.ok) throw new Error('Failed to update roadmap node');
  return res.json();
}

// Coding API
export async function fetchProblems(): Promise<CodingProblem[]> {
  const res = await fetch(`${API_BASE}/coding/problems`);
  if (!res.ok) throw new Error('Failed to load problems');
  const data = await res.json();
  return data.problems;
}

export async function fetchProblemDetails(slug: string): Promise<CodingProblem> {
  const res = await fetch(`${API_BASE}/coding/problems/${slug}`);
  if (!res.ok) throw new Error('Failed to load problem');
  const data = await res.json();
  return data.problem;
}

export async function runCode(slug: string, language: string, code: string, customInput?: any): Promise<SubmissionResult> {
  const res = await fetch(`${API_BASE}/coding/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, language, code, customInput })
  });
  if (!res.ok) throw new Error('Failed to run code');
  return res.json();
}

export async function submitCode(slug: string, language: string, code: string): Promise<SubmissionResult> {
  const res = await fetch(`${API_BASE}/coding/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, language, code })
  });
  if (!res.ok) throw new Error('Failed to submit code');
  return res.json();
}

export async function fetchCodingStats(): Promise<any> {
  const res = await fetch(`${API_BASE}/coding/stats`);
  if (!res.ok) throw new Error('Failed to fetch coding stats');
  return res.json();
}

// Interview API
export async function startInterview(config: { interviewType: string; targetRole: string; difficulty: string; questionCount: number }): Promise<{ interviewId: string; interviewerSpeech: string; question: string; questionIndex: number; totalQuestions: number }> {
  const res = await fetch(`${API_BASE}/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to start interview');
  return res.json();
}

export async function submitInterviewAnswer(interviewId: string, candidateAnswer: string): Promise<{ isFollowup: boolean; isFinished: boolean; interviewerSpeech: string; question?: string; questionIndex: number; totalQuestions: number; report?: InterviewReport }> {
  const res = await fetch(`${API_BASE}/interview/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interviewId, candidateAnswer })
  });
  if (!res.ok) throw new Error('Failed to submit answer');
  return res.json();
}

export async function finishInterview(interviewId: string): Promise<{ report: InterviewReport }> {
  const res = await fetch(`${API_BASE}/interview/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interviewId })
  });
  if (!res.ok) throw new Error('Failed to finish interview');
  return res.json();
}

// Settings API
export async function fetchSettings(): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateProfile(profile: Partial<UserProfile>): Promise<{ user: UserProfile }> {
  const res = await fetch(`${API_BASE}/settings/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function saveApiKey(apiKey: string): Promise<{ message: string; geminiConfigured: boolean }> {
  const res = await fetch(`${API_BASE}/settings/api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save API key');
  }
  return res.json();
}
