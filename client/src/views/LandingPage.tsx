import React from 'react';
import {
  Sparkles,
  MessageSquareCode,
  FileText,
  GitFork,
  Code2,
  Mic,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (view?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const modules = [
    {
      id: 'chatbot',
      name: 'AI Placement Chatbot',
      subtitle: '24/7 Placement Mentor',
      desc: 'Deep conceptual explanations across DSA, Core CS, System Design, HR rounds, and personalized day-by-day company prep plans.',
      icon: MessageSquareCode,
      color: 'from-blue-500 to-indigo-600',
      tag: 'Module 1'
    },
    {
      id: 'resume',
      name: 'AI Resume Builder',
      subtitle: 'Live ATS Optimizer & PDF',
      desc: 'Build recruiter-approved resumes with live previews, Google XYZ impact bullet rewrites, ATS scoring, and high-res vector PDF download.',
      icon: FileText,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Module 2'
    },
    {
      id: 'roadmap',
      name: 'Roadmap Flowchart Generator',
      subtitle: 'Visual Preparation Paths',
      desc: 'Turn target goals (e.g. Cybersecurity, SDE, Cloud) into structured interactive flowcharts with milestones and high-res image export.',
      icon: GitFork,
      color: 'from-purple-500 to-pink-600',
      tag: 'Module 3'
    },
    {
      id: 'coding',
      name: 'Technical Coding Environment',
      subtitle: 'LeetCode-Style Sandbox',
      desc: 'Practice high-frequency company interview problems in Monaco Editor with sandboxed execution in Python, JS, C++, Java & AI code complexity audits.',
      icon: Code2,
      color: 'from-amber-500 to-orange-600',
      tag: 'Module 4'
    },
    {
      id: 'interview',
      name: 'Speech-to-Speech Mock Interview',
      subtitle: 'Realistic Voice Simulator',
      desc: 'Simulate high-pressure technical & HR rounds with voice interaction, dynamic AI follow-ups, speaking pace & filler-word delivery analytics.',
      icon: Mic,
      color: 'from-cyan-500 to-blue-600',
      tag: 'Module 5'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-950 border-b border-indigo-500/20 py-2 px-4 text-center text-xs font-medium text-indigo-300">
        🚀 Built for 2026 Campus Placements, Off-Campus Drives & High-Growth Tech Internships
      </div>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Unified Placement Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.15]">
          Crack Your Dream Placement with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Intelligent AI Mentorship
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl leading-relaxed">
          From zero to placement offer: personalized preparation sprints, ATS-ready resumes with real PDF generation, interactive roadmaps, sandboxed multi-language coding, and real-time speech mock interviews.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => onEnterApp('dashboard')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all hover:scale-105"
          >
            <span>Launch Placement Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => onEnterApp('chatbot')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquareCode className="w-5 h-5 text-indigo-400" />
            <span>Try AI Mentor Chat</span>
          </button>
        </div>

        {/* Quick Highlights Pill Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full text-left">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Preparation Sprints</div>
              <div className="text-sm font-bold text-white">Company Specific</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Code Execution</div>
              <div className="text-sm font-bold text-white">Python, JS, C++, Java</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
            <Award className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Real File Exports</div>
              <div className="text-sm font-bold text-white">PDF & High-Res PNG</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Speech-to-Speech</div>
              <div className="text-sm font-bold text-white">Live Voice Analysis</div>
            </div>
          </div>
        </div>

        {/* 5 Prominent Modules Grid */}
        <div className="mt-20 w-full text-left">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">The 5 Unified Preparation Pillars</h2>
            <p className="text-slate-400 text-sm mt-2">Everything you need to clear screening, online coding tests, and technical & HR rounds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => onEnterApp(mod.id)}
                  className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {mod.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {mod.name}
                    </h3>
                    <div className="text-xs font-semibold text-indigo-400 mt-0.5">{mod.subtitle}</div>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-indigo-400">
                    <span>Explore Module</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}

            {/* Sixth card: Unified Placement Readiness */}
            <div
              onClick={() => onEnterApp('dashboard')}
              className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Central Core
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Placement Readiness Engine</h3>
                <div className="text-xs font-semibold text-indigo-400 mt-0.5">Real-Time Probability Meter</div>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  Synthesizes your coding submissions, resume ATS score, roadmap completions, and mock interview performance into a single readiness metric.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-300">
                <span>View My Readiness</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>Placement Helper AI &copy; 2026. Designed for engineering campus placements & software careers.</p>
      </footer>
    </div>
  );
};
