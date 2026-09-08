export interface UserProfile {
  id: string;
  name: string;
  email: string;
  target_role: string;
  target_company: string;
  prep_timeline: string;
  current_level: string;
  college: string;
  branch: string;
}

export interface UnifiedReadiness {
  overall: number;
  dsa: number;
  technicalKnowledge: number;
  resume: number;
  communication: number;
  mockInterviews: number;
}

export interface ActivityItem {
  id: string;
  user_id: string;
  module: 'chatbot' | 'resume' | 'roadmap' | 'coding' | 'interview';
  action: string;
  description: string;
  score?: number;
  created_at: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    portfolio?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    cgpa: string;
    coursework: string;
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
    coreCS: string[];
  };
  experience: Array<{
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string[];
  }>;
  projects: Array<{
    title: string;
    techStack: string[];
    liveUrl?: string;
    githubUrl?: string;
    bullets: string[];
  }>;
  certifications: string[];
  achievements: string[];
  customization?: {
    template: 'modern' | 'classic' | 'minimal' | 'tech';
    font: string;
    fontSize: string;
    spacing: string;
    margins: string;
    accentColor: string;
  };
}

export interface ATSFeedback {
  score: number;
  grade: string;
  summary: string;
  strengths: string[];
  suggestions: string[];
  keywordMatch: {
    present: string[];
    missing: string[];
  };
}

export interface RoadmapNode {
  id: string;
  title: string;
  stage: string;
  duration: string;
  status: 'completed' | 'in_progress' | 'pending';
  topics: string[];
  practice: string;
  resources: string;
}

export interface RoadmapData {
  id: string;
  title: string;
  goal: string;
  duration: string;
  level: string;
  targetRole: string;
  targetCompany?: string;
  nodes: RoadmapNode[];
  progressPct: number;
  updatedAt?: string;
}

export interface CodingProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  companies: string[];
  description?: string;
  constraints?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  starterCode?: Record<string, string>;
  optimalSolution?: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
  };
  hints?: string[];
  visibleTestCases?: Array<{ input: any; expected: any }>;
}

export interface SubmissionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compilation Error' | 'Time Limit Exceeded';
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  results: Array<{
    testIndex: number;
    passed: boolean;
    input: any;
    expected: any;
    actual: any;
    hidden?: boolean;
    error?: string;
  }>;
  stdout?: string;
  error?: string;
  aiAnalysis?: {
    timeComplexity: string;
    spaceComplexity: string;
    codeQualityScore: number;
    correctnessFeedback: string;
    edgeCasesChecked: string[];
    optimizations: string[];
    alternativeApproaches: string;
  };
}

export interface InterviewReport {
  overallScore: number;
  scores: {
    technicalKnowledge: number;
    communication: number;
    confidence: number;
    problemSolving: number;
    answerQuality: number;
  };
  speechAnalysis: {
    averageWpm: number;
    fillerWordsCount: number;
    clarityScore: number;
    feedback: string;
  };
  strongAreas: string[];
  areasForImprovement: string[];
  recommendedTopics: string[];
  questionReviews: Array<{
    question: string;
    candidateAnswer: string;
    critique: string;
    sampleBetterAnswer: string;
  }>;
}
