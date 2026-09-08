import React from 'react';
import {
  Sparkles,
  MessageSquareCode,
  FileText,
  GitFork,
  Code2,
  Mic,
  ArrowRight,
  TrendingUp,
  Clock,
  Target,
  Flame,
} from 'lucide-react';
import { UserProfile, UnifiedReadiness, ActivityItem } from '../types';

interface DashboardProps {
  user: UserProfile | null;
  readiness: UnifiedReadiness | null;
  activities: ActivityItem[];
  onNavigate: (view: string, context?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  readiness,
  activities,
  onNavigate
}) => {
  const overall = readiness?.overall || 72;
  const dsa = readiness?.dsa || 65;
  const tech = readiness?.technicalKnowledge || 80;
  const resume = readiness?.resume || 90;
  const comm = readiness?.communication || 68;
  const mock = readiness?.mockInterviews || 74;

  const moduleCards = [
    {
      id: 'chatbot',
      title: 'AI Placement Chatbot',
      subtitle: '24/7 Personalized Placement Mentor',
      description: 'Ask deep technical questions across DSA, OS, DBMS, Networks, OOP, or request complete 10-day company-specific placement plans.',
      icon: MessageSquareCode,
      tag: 'Module 1',
      badge: 'Mentor Online',
      actionText: 'Launch Chatbot',
      gradient: 'from-[#1C7F9E] to-[#2597BB]'
    },
    {
      id: 'resume',
      title: 'AI Resume Builder',
      subtitle: 'ATS Optimization & Real PDF Export',
      description: 'Craft high-scoring, ATS-optimized resumes with Google XYZ bullet rewrites, live multi-template preview, and real PDF generation.',
      icon: FileText,
      tag: 'Module 2',
      badge: `${resume}% ATS Score`,
      actionText: 'Build & Export PDF',
      gradient: 'from-[#105689] to-[#156BA8]'
    },
    {
      id: 'roadmap',
      title: 'Roadmap Flowchart Generator',
      subtitle: 'Visual Milestone Flowcharts',
      description: 'Transform goals into interactive node graphs with prerequisites, time estimates, milestones, and high-resolution image export.',
      icon: GitFork,
      tag: 'Module 3',
      badge: 'Flowchart Ready',
      actionText: 'Generate Roadmap',
      gradient: 'from-[#E58319] to-[#F99D38]'
    },
    {
      id: 'coding',
      title: 'Technical Interview Simulator',
      subtitle: 'LeetCode-Style Online Coding Environment',
      description: 'Solve algorithmic challenges in Monaco Editor with sandboxed execution across Python, JS, C++, Java, and instant AI complexity feedback.',
      icon: Code2,
      tag: 'Module 4',
      badge: '4 Languages',
      actionText: 'Start Coding Practice',
      gradient: 'from-[#C42609] to-[#FC4B2A]'
    },
    {
      id: 'interview',
      title: 'AI Mock Interview',
      subtitle: 'Speech-to-Speech Voice Simulation',
      description: 'Experience real-time speech interviews with live AI questions, dynamic follow-ups, tone & filler-word detection, and detailed reports.',
      icon: Mic,
      tag: 'Module 5',
      badge: 'Live Audio',
      actionText: 'Start Mock Interview',
      gradient: 'from-[#16667F] to-[#2597BB]'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Target Banner (Teal & Deep Blue branding) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#16667F] via-[#1C7F9E] to-[#156BA8] text-white p-6 md:p-8 shadow-xl border border-[#16667F]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#F99D38] text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 fill-[#F99D38] animate-pulse" />
              <span className="text-white/90">Campus Placement Sprint • {user?.prep_timeline || '10 Days Left'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Aditya'}! 👋
            </h1>
            <p className="text-white/85 text-sm sm:text-base mt-2 max-w-2xl">
              Targeting <span className="text-[#F99D38] font-bold">{user?.target_company || 'Cognizant / Top Tech'}</span> for <span className="text-white font-semibold">{user?.target_role || 'Software Development Engineer'}</span>.
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigate('interview')}
                className="px-3.5 py-2 rounded-xl bg-[#FC4B2A] hover:bg-[#E03E1E] text-white text-xs font-bold shadow-md shadow-[#FC4B2A]/30 transition flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Prepare for Interview</span>
              </button>
              <button
                onClick={() => onNavigate('resume')}
                className="px-3.5 py-2 rounded-xl bg-[#156BA8] hover:bg-[#105689] text-white text-xs font-bold shadow-md shadow-[#156BA8]/20 transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Build My Resume</span>
              </button>
              <button
                onClick={() => onNavigate('roadmap')}
                className="px-3.5 py-2 rounded-xl bg-[#2597BB] hover:bg-[#1C7F9E] text-white text-xs font-bold shadow-md shadow-[#2597BB]/20 transition flex items-center gap-1.5"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Generate Roadmap</span>
              </button>
              <button
                onClick={() => onNavigate('coding')}
                className="px-3.5 py-2 rounded-xl bg-[#156BA8] hover:bg-[#105689] text-white text-xs font-bold shadow-md shadow-[#156BA8]/20 transition flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Practice Coding</span>
              </button>
              <button
                onClick={() => onNavigate('chatbot', { prompt: `I have a ${user?.target_company || 'Cognizant'} technical interview in 10 days and I know Python and basic cybersecurity. Give me a structured plan.` })}
                className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition flex items-center gap-1.5"
              >
                <MessageSquareCode className="w-3.5 h-3.5 text-[#F99D38]" />
                <span>10-Day Plan</span>
              </button>
            </div>
          </div>

          {/* Overall Readiness Gauge (Coral & Warm Orange highlight) */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-black/20 border border-white/20 shadow-xl shrink-0 min-w-[200px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
              Overall Readiness
            </div>
            <div className="relative flex items-center justify-center my-2">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#FC4B2A] transition-all duration-1000 ease-out"
                  strokeDasharray={`${overall}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-white">{overall}%</span>
                <div className="text-[9px] text-[#F99D38] font-bold">PLACEMENT</div>
              </div>
            </div>
            <div className="text-xs font-semibold text-[#F99D38] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-white">Interview Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Breakdown Bars (Palette mapping) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E6CD8A]/60 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[#545F6D]">DSA</span>
            <span className="text-xs font-bold text-[#FC4B2A]">{dsa}%</span>
          </div>
          <div className="w-full h-2 bg-[#EDE4D3] rounded-full overflow-hidden">
            <div className="h-full bg-[#FC4B2A] rounded-full transition-all duration-500" style={{ width: `${dsa}%` }} />
          </div>
          <div className="text-[10px] text-[#545F6D] mt-1.5">Algorithmic Mastery</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6CD8A]/60 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[#545F6D]">Technical Knowledge</span>
            <span className="text-xs font-bold text-[#156BA8]">{tech}%</span>
          </div>
          <div className="w-full h-2 bg-[#EDE4D3] rounded-full overflow-hidden">
            <div className="h-full bg-[#156BA8] rounded-full transition-all duration-500" style={{ width: `${tech}%` }} />
          </div>
          <div className="text-[10px] text-[#545F6D] mt-1.5">CS Core, OS & DBMS</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6CD8A]/60 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[#545F6D]">Resume</span>
            <span className="text-xs font-bold text-[#2597BB]">{resume}%</span>
          </div>
          <div className="w-full h-2 bg-[#EDE4D3] rounded-full overflow-hidden">
            <div className="h-full bg-[#2597BB] rounded-full transition-all duration-500" style={{ width: `${resume}%` }} />
          </div>
          <div className="text-[10px] text-[#545F6D] mt-1.5">ATS Optimization</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6CD8A]/60 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[#545F6D]">Communication</span>
            <span className="text-xs font-bold text-[#F99D38]">{comm}%</span>
          </div>
          <div className="w-full h-2 bg-[#EDE4D3] rounded-full overflow-hidden">
            <div className="h-full bg-[#F99D38] rounded-full transition-all duration-500" style={{ width: `${comm}%` }} />
          </div>
          <div className="text-[10px] text-[#545F6D] mt-1.5">Pace & Clarity</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6CD8A]/60 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[#545F6D]">Mock Interviews</span>
            <span className="text-xs font-bold text-[#156BA8]">{mock}%</span>
          </div>
          <div className="w-full h-2 bg-[#EDE4D3] rounded-full overflow-hidden">
            <div className="h-full bg-[#156BA8] rounded-full transition-all duration-500" style={{ width: `${mock}%` }} />
          </div>
          <div className="text-[10px] text-[#545F6D] mt-1.5">Live Voice Sim</div>
        </div>
      </div>

      {/* 5 Prominent Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1C2530]">5 Core Placement Modules</h2>
            <p className="text-xs text-[#545F6D]">Launch any module directly with complete state synchronization.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {moduleCards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative p-6 rounded-2xl bg-white border border-[#E6CD8A]/70 hover:border-[#2597BB] transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5EFE6] text-[#156BA8] border border-[#E6CD8A]">
                      {card.badge}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase font-bold text-[#156BA8] tracking-wider">
                    {card.tag}
                  </span>
                  <h3 className="text-lg font-bold text-[#1C2530] mt-0.5 group-hover:text-[#156BA8] transition-colors">
                    {card.title}
                  </h3>
                  <div className="text-xs font-medium text-[#1C7F9E] mt-0.5">{card.subtitle}</div>
                  <p className="text-xs text-[#545F6D] mt-2.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6CD8A]/40">
                  <button
                    onClick={() => onNavigate(card.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#156BA8] group-hover:bg-[#105689] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Activities & Placement Sprint Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity Feed */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#F5EFE6] border border-[#E6CD8A]/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#156BA8]" />
              <h3 className="text-base font-bold text-[#1C2530]">Recent Activities</h3>
            </div>
            <span className="text-xs text-[#545F6D]">Live preparation history</span>
          </div>

          <div className="space-y-3">
            {activities && activities.length > 0 ? (
              activities.slice(0, 5).map(act => (
                <div
                  key={act.id}
                  className="flex items-start justify-between p-3.5 rounded-xl bg-white border border-[#E6CD8A]/50 hover:border-[#2597BB] transition shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E6CD8A] flex items-center justify-center shrink-0 mt-0.5">
                      {act.module === 'coding' && <Code2 className="w-4 h-4 text-[#FC4B2A]" />}
                      {act.module === 'resume' && <FileText className="w-4 h-4 text-[#156BA8]" />}
                      {act.module === 'roadmap' && <GitFork className="w-4 h-4 text-[#F99D38]" />}
                      {act.module === 'interview' && <Mic className="w-4 h-4 text-[#2597BB]" />}
                      {act.module === 'chatbot' && <MessageSquareCode className="w-4 h-4 text-[#1C7F9E]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1C2530]">{act.action}</div>
                      <div className="text-xs text-[#545F6D] mt-0.5">{act.description}</div>
                    </div>
                  </div>
                  {act.score !== undefined && act.score !== null && (
                    <span className="text-xs font-extrabold text-[#FC4B2A] bg-[#FC4B2A]/10 px-2 py-0.5 rounded border border-[#FC4B2A]/20 shrink-0">
                      {act.score} pts
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#545F6D] text-xs">No recent activities yet. Start a module above!</div>
            )}
          </div>
        </div>

        {/* Right: Daily Placement Preparation Checklist */}
        <div className="p-6 rounded-2xl bg-[#F5EFE6] border border-[#E6CD8A]/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-[#2597BB]" />
              <h3 className="text-base font-bold text-[#1C2530]">Today's Placement Goals</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E6CD8A]/50 cursor-pointer hover:bg-white/80 transition shadow-sm">
                <input type="checkbox" defaultChecked className="mt-1 rounded text-[#156BA8] focus:ring-0 border-[#E6CD8A]" />
                <div className="text-xs">
                  <div className="font-semibold line-through text-[#8A95A5]">Review Two Pointers & Hashing</div>
                  <div className="text-[11px] text-[#8A95A5]">Solved Two Sum in Python</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E6CD8A]/50 cursor-pointer hover:bg-white/80 transition shadow-sm">
                <input type="checkbox" defaultChecked className="mt-1 rounded text-[#156BA8] focus:ring-0 border-[#E6CD8A]" />
                <div className="text-xs">
                  <div className="font-semibold line-through text-[#8A95A5]">Audit Resume ATS Score</div>
                  <div className="text-[11px] text-[#8A95A5]">Achieved 88/100 ATS match</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E6CD8A]/50 cursor-pointer hover:bg-white/80 transition shadow-sm">
                <input type="checkbox" className="mt-1 rounded text-[#156BA8] focus:ring-0 border-[#E6CD8A]" />
                <div className="text-xs">
                  <div className="font-bold text-[#1C2530]">Solve "Coin Change" (DP)</div>
                  <div className="text-[11px] text-[#545F6D]">High-frequency Cognizant question</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E6CD8A]/50 cursor-pointer hover:bg-white/80 transition shadow-sm">
                <input type="checkbox" className="mt-1 rounded text-[#156BA8] focus:ring-0 border-[#E6CD8A]" />
                <div className="text-xs">
                  <div className="font-bold text-[#1C2530]">Take 1 Voice Mock Interview</div>
                  <div className="text-[11px] text-[#545F6D]">Technical round calibration</div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E6CD8A]/50">
            <button
              onClick={() => onNavigate('coding')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FC4B2A] hover:bg-[#E03E1E] text-white text-xs font-bold transition shadow-sm"
            >
              Complete Next Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
