import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/Toast';

import { LandingPage } from './views/LandingPage';
import { Dashboard } from './views/Dashboard';
import { Chatbot } from './views/Chatbot';
import { ResumeBuilder } from './views/ResumeBuilder';
import { RoadmapGenerator } from './views/RoadmapGenerator';
import { CodingEnvironment } from './views/CodingEnvironment';
import { MockInterview } from './views/MockInterview';
import { Profile } from './views/Profile';
import { Settings } from './views/Settings';

import { UserProfile, UnifiedReadiness, ActivityItem } from './types';
import { fetchProgress, fetchSettings } from './services/api';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [readiness, setReadiness] = useState<UnifiedReadiness | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [aiConfigured, setAiConfigured] = useState<boolean>(false);
  const [chatbotPrompt, setChatbotPrompt] = useState<string | undefined>(undefined);

  useEffect(() => {
    refreshProgress();
    checkAiStatus();
  }, []);

  const refreshProgress = async () => {
    try {
      const data = await fetchProgress();
      setUser(data.user);
      setReadiness(data.readiness);
      setActivities(data.activities || []);
    } catch (err) {
      console.warn('Could not load initial progress:', err);
    }
  };

  const checkAiStatus = async () => {
    try {
      const settings = await fetchSettings();
      if (settings?.aiStatus) {
        setAiConfigured(settings.aiStatus.geminiConfigured);
      }
    } catch (err) {}
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleNavigate = (view: string, context?: any) => {
    if (view === 'chatbot' && context?.prompt) {
      setChatbotPrompt(context.prompt);
    } else {
      setChatbotPrompt(undefined);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh readiness in the background whenever navigating to dashboard
    if (view === 'dashboard') {
      refreshProgress();
    }
  };

  if (activeView === 'landing') {
    return (
      <>
        <LandingPage onEnterApp={handleNavigate} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C2530] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        user={user}
        readiness={readiness}
        aiConfigured={aiConfigured}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeView={activeView}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeView === 'dashboard' && (
              <Dashboard
                user={user}
                readiness={readiness}
                activities={activities}
                onNavigate={handleNavigate}
              />
            )}

            {activeView === 'chatbot' && (
              <Chatbot
                user={user}
                onNavigate={handleNavigate}
                initialPrompt={chatbotPrompt}
              />
            )}

            {activeView === 'resume' && (
              <ResumeBuilder
                user={user}
                onShowToast={showToast}
              />
            )}

            {activeView === 'roadmap' && (
              <RoadmapGenerator
                user={user}
                onShowToast={showToast}
              />
            )}

            {activeView === 'coding' && (
              <CodingEnvironment
                user={user}
                onShowToast={showToast}
              />
            )}

            {activeView === 'interview' && (
              <MockInterview
                user={user}
                onShowToast={showToast}
              />
            )}

            {activeView === 'profile' && (
              <Profile
                user={user}
                onProfileUpdated={updatedUser => {
                  setUser(updatedUser);
                  refreshProgress();
                }}
                onShowToast={showToast}
              />
            )}

            {activeView === 'settings' && (
              <Settings
                onShowToast={showToast}
                onApiKeyUpdated={configured => setAiConfigured(configured)}
              />
            )}
          </div>
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
export default App;
