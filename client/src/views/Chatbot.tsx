import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Code2,
  FileText,
  GitFork,
  Mic,
  Loader2,
  HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../services/api';
import { UserProfile } from '../types';

interface ChatbotProps {
  user: UserProfile | null;
  onNavigate: (view: string, context?: any) => void;
  initialPrompt?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  structuredPlan?: any;
}

export const Chatbot: React.FC<ChatbotProps> = ({ user, onNavigate, initialPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `### 👋 Welcome to Placement Helper AI Mentor!

I am your dedicated placement and technical interview mentor. I can help you with:

* **DSA & Problem Solving**: Array patterns, Trees, Dynamic Programming, Graphs, and Complexity analysis.
* **Core CS Subjects**: Operating Systems (Threads, Deadlocks, Paging), DBMS & SQL, Computer Networks, and OOP.
* **Company-Specific Prep**: Cognizant, TCS, Infosys, Amazon, Google, Microsoft, and startups.
* **HR & Behavioral Rounds**: Crafting high-impact answers using the STAR method.
* **Personalized Placement Sprints**: Tell me your target company and timeline, and I'll generate a day-by-day plan!

What would you like to focus on today?`,
      source: 'built-in-mentor'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    `I have a ${user?.target_company || 'Cognizant'} technical interview in 10 days and I know Python and basic cybersecurity. Give me a structured plan.`,
    `Explain Dijkstra's algorithm with code and complexity.`,
    `How do I answer: "Why should we hire you?" for a ${user?.target_role || 'Software Engineer'} role?`,
    `What are the most frequent DBMS and SQL questions asked in campus placements?`,
    `Explain the difference between TCP 3-way handshake and UDP.`
  ];

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendPrompt = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text);
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: res.reply,
        source: res.source,
        structuredPlan: res.structuredPlan
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `⚠️ Error communicating with AI mentor: ${err.message}. Please try again.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'cleared-welcome',
        role: 'assistant',
        content: 'Conversation cleared. How can I help you with your placement preparation today?',
        source: 'built-in-mentor'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] rounded-2xl bg-white border border-[#E6CD8A] overflow-hidden shadow-xl">
      {/* Top Bar (Teal Primary Header) */}
      <div className="px-6 py-3.5 bg-gradient-to-r from-[#16667F] via-[#1C7F9E] to-[#156BA8] text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">AI Placement Mentor</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold border border-white/30">
                Context Active
              </span>
            </div>
            <p className="text-[11px] text-white/80">
              Personalized for {user?.name || 'Aditya'} • {user?.target_company || 'Tech Companies'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Action Navigation Buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('coding')}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs flex items-center gap-1 transition border border-white/20"
              title="Practice Coding"
            >
              <Code2 className="w-3.5 h-3.5 text-[#F99D38]" />
              <span>Practice Coding</span>
            </button>
            <button
              onClick={() => onNavigate('resume')}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs flex items-center gap-1 transition border border-white/20"
              title="Build My Resume"
            >
              <FileText className="w-3.5 h-3.5 text-[#E6CD8A]" />
              <span>Resume</span>
            </button>
            <button
              onClick={() => onNavigate('interview')}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs flex items-center gap-1 transition border border-white/20"
              title="Start Mock Interview"
            >
              <Mic className="w-3.5 h-3.5 text-[#FC4B2A]" />
              <span>Mock Interview</span>
            </button>
          </div>

          <button
            onClick={handleClear}
            className="p-2 rounded-lg text-white/80 hover:text-[#FC4B2A] hover:bg-white/10 transition"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area (Light Beige/Cream Canvas) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FAF7F2]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.role === 'user'
                  ? 'bg-[#156BA8] text-white font-bold text-xs'
                  : 'bg-[#2597BB] text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`relative max-w-3xl rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#156BA8] text-white font-medium rounded-tr-sm'
                  : 'bg-white border border-[#E6CD8A] text-[#1C2530] rounded-tl-sm'
              }`}
            >
              {/* Copy message button */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between border-b border-[#E6CD8A]/60 pb-2 mb-2 text-[11px] text-[#545F6D]">
                  <span className="font-bold text-[#1C7F9E] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#F99D38]" />
                    <span>AI Placement Mentor</span>
                  </span>
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="p-1 rounded hover:bg-[#F5EFE6] text-[#545F6D] hover:text-[#156BA8] transition flex items-center gap-1"
                    title="Copy to clipboard"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-[#2597BB]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose max-w-none text-xs sm:text-sm prose-pre:bg-[#F5EFE6] prose-pre:text-[#1C2530] prose-pre:border prose-pre:border-[#E6CD8A] prose-headings:text-[#156BA8] prose-p:leading-relaxed prose-strong:text-[#FC4B2A]">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {/* Structured Plan Quick Action Callouts */}
              {msg.structuredPlan && (
                <div className="mt-4 pt-3 border-t border-[#E6CD8A] flex flex-wrap items-center justify-between gap-3 bg-[#F5EFE6] p-3 rounded-xl border border-[#F99D38]/50">
                  <div className="text-xs font-bold text-[#156BA8]">
                    💡 {msg.structuredPlan.actionPrompt || 'Start preparing for this plan right now:'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('coding')}
                      className="px-3 py-1 rounded-lg bg-[#FC4B2A] hover:bg-[#E03E1E] text-white text-xs font-bold flex items-center gap-1 shadow transition"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>Start Practice</span>
                    </button>
                    <button
                      onClick={() => onNavigate('roadmap')}
                      className="px-3 py-1 rounded-lg bg-[#2597BB] hover:bg-[#1C7F9E] text-white text-xs font-bold flex items-center gap-1 shadow transition"
                    >
                      <GitFork className="w-3 h-3" />
                      <span>View Roadmap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#2597BB] text-white flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-[#E6CD8A] p-4 rounded-2xl rounded-tl-sm text-xs text-[#545F6D] flex items-center gap-2.5 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-[#156BA8]" />
              <span>Thinking & formulating personalized placement strategy...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Carousel */}
      <div className="px-4 py-2 bg-[#F5EFE6] border-t border-[#E6CD8A] overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] font-bold uppercase text-[#156BA8] shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" />
          <span>Suggestions:</span>
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(prompt)}
            className="shrink-0 px-3 py-1 rounded-full bg-white hover:bg-[#EEF6FC] text-[#156BA8] hover:text-[#0E466F] text-xs border border-[#E6CD8A] hover:border-[#156BA8] transition whitespace-nowrap shadow-xs font-medium"
          >
            {prompt.length > 45 ? prompt.substring(0, 45) + '...' : prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendPrompt(input);
        }}
        className="p-3 sm:p-4 bg-white border-t border-[#E6CD8A] flex items-center gap-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask about DSA, OS, DBMS, HR questions, or ask for a Cognizant prep plan...`}
          className="flex-1 bg-[#FAF7F2] border border-[#E6CD8A] rounded-xl px-4 py-3 text-sm text-[#1C2530] placeholder-[#8A95A5] focus:outline-none focus:border-[#156BA8] focus:ring-1 focus:ring-[#156BA8]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-[#FC4B2A] hover:bg-[#E03E1E] disabled:opacity-50 text-white shadow-md shadow-[#FC4B2A]/20 transition shrink-0"
          title="Send message"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};
