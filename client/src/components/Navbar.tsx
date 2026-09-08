import React from 'react';
import { Sparkles, Bot, Menu, Zap } from 'lucide-react';
import { UnifiedReadiness, UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  readiness: UnifiedReadiness | null;
  aiConfigured: boolean;
  onNavigate: (view: string) => void;
  onToggleSidebar: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  readiness,
  aiConfigured,
  onNavigate,
  onToggleSidebar,
  activeView
}) => {
  const overall = readiness?.overall || 74;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[#16667F] bg-gradient-to-r from-[#16667F] via-[#1C7F9E] to-[#156BA8] text-white shadow-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FC4B2A] to-[#F99D38] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-[#F99D38] transition-colors">
                Placement Helper
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-white/20 text-white border border-white/30">
                AI OS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle & Right Status elements */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* AI Engine Status Badge */}
        <button
          onClick={() => onNavigate('settings')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-white/25 bg-white/15 text-white hover:bg-white/25 transition-all shadow-sm"
          title={aiConfigured ? 'Connected to Gemini 2.5 Flash API' : 'Using Built-in Placement Intelligence Engine. Click to configure API Key.'}
        >
          {aiConfigured ? (
            <>
              <Zap className="w-3.5 h-3.5 text-[#F99D38] fill-[#F99D38]" />
              <span className="font-semibold">Gemini 2.5 Flash</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5 text-white" />
              <span>Built-in Mentor AI</span>
            </>
          )}
        </button>

        {/* Unified Readiness Pill (Coral & Warm Orange highlight) */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/15 border border-white/20 hover:bg-black/25 cursor-pointer transition shadow-inner"
          title="Overall Placement Readiness Score"
        >
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-white/75 uppercase font-semibold tracking-wider">Placement Readiness</div>
            <div className="text-xs font-bold text-[#F99D38]">{user?.target_company || 'Tech Roles'}</div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FC4B2A] text-white px-2 py-0.5 rounded-lg font-bold text-xs shadow-sm">
            <span className="text-sm font-extrabold">{overall}%</span>
            <div className="w-2 h-2 rounded-full bg-[#F99D38] animate-pulse" />
          </div>
        </div>

        {/* Profile Avatar */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/10 transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FC4B2A] to-[#F99D38] flex items-center justify-center font-bold text-white text-xs shadow-md">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-white">{user?.name || 'Aditya Menon'}</div>
            <div className="text-[10px] text-white/80 truncate max-w-[120px]">{user?.target_role || 'SWE'}</div>
          </div>
        </button>
      </div>
    </header>
  );
};
