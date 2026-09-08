import React from 'react';
import {
  LayoutDashboard,
  MessageSquareCode,
  FileText,
  GitFork,
  Code2,
  Mic,
  User,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isOpen,
  onClose
}) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'chatbot', label: 'AI Placement Chatbot', icon: MessageSquareCode, badge: 'Module 1' },
    { id: 'resume', label: 'AI Resume Builder', icon: FileText, badge: 'Module 2' },
    { id: 'roadmap', label: 'Roadmap Generator', icon: GitFork, badge: 'Module 3' },
    { id: 'coding', label: 'Technical Interview', icon: Code2, badge: 'Module 4' },
    { id: 'interview', label: 'AI Mock Interview', icon: Mic, badge: 'Module 5' },
  ];

  const systemNavItems = [
    { id: 'profile', label: 'Profile & Targets', icon: User },
    { id: 'settings', label: 'Settings & API Key', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#F5EFE6] border-r border-[#E6CD8A]/60 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile title */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E6CD8A]/60 lg:hidden">
            <span className="font-bold text-sm text-[#1C2530]">Menu</span>
            <button onClick={onClose} className="text-[#156BA8] hover:text-[#0E466F] text-xs font-semibold">Close</button>
          </div>

          {/* Placement Modules section */}
          <div>
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#156BA8] mb-2">
              Placement Modules
            </div>
            <nav className="space-y-1">
              {mainNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#2597BB] text-white shadow-sm font-semibold'
                        : 'text-[#156BA8] hover:text-[#0E466F] hover:bg-[#EDE4D3] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#156BA8]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#F99D38]/20 text-[#C46700]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Account & Preferences */}
          <div>
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#156BA8] mb-2">
              Account & Config
            </div>
            <nav className="space-y-1">
              {systemNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#2597BB] text-white shadow-sm font-semibold'
                        : 'text-[#156BA8] hover:text-[#0E466F] hover:bg-[#EDE4D3] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#156BA8]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Banner (Deep Blue card with Coral CTA) */}
        <div className="p-3.5 rounded-xl bg-[#156BA8] text-white shadow-md border border-[#0E466F]">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-[#F99D38]" />
            <span className="text-xs font-bold">Accelerated Sprint</span>
          </div>
          <p className="text-[11px] text-white/80 leading-relaxed mb-3">
            Targeting Cognizant & Tier-1 Tech. Day 3 of 10 sprint in progress.
          </p>
          <button
            onClick={() => handleSelect('coding')}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#FC4B2A] hover:bg-[#E03E1E] text-white text-xs font-bold shadow transition"
          >
            <span>Resume Daily Practice</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
};
