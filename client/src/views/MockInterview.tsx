import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  User,
  Bot,
  Send,
  BarChart3,
  BookOpen,
  Activity,
  Check,
  Flame,
  MessageSquare
} from 'lucide-react';

import { InterviewReport, UserProfile } from '../types';
import { startInterview, submitInterviewAnswer, finishInterview } from '../services/api';

interface MockInterviewProps {
  user: UserProfile | null;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const MockInterview: React.FC<MockInterviewProps> = ({ user, onShowToast }) => {
  // Session setup state
  const [interviewType, setInterviewType] = useState('Technical');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Software Engineer');
  const [difficulty, setDifficulty] = useState('Entry Level');
  const [questionCount, setQuestionCount] = useState(4);

  // In-session state
  const [inSession, setInSession] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(4);
  const [isFollowup, setIsFollowup] = useState(false);

  // Speech & Audio state
  const [isSpeaking, setIsSpeaking] = useState(false); // AI speaking via TTS
  const [isListening, setIsListening] = useState(false); // Candidate mic active
  const [candidateSpeech, setCandidateSpeech] = useState('');
  const [micSupported, setMicSupported] = useState(true);
  const [muted, setMuted] = useState(false);

  // Results & History
  const [finalReport, setFinalReport] = useState<InterviewReport | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([]);
  const [processingAnswer, setProcessingAnswer] = useState(false);

  // Web Speech API refs
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, []);

  // Text-To-Speech helper
  const speakAI = (text: string) => {
    if (muted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick English natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start Speech Recognition (STT)
  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onShowToast('Speech Recognition not supported in this browser. Please type your answer.', 'error');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        // Stop AI speech if speaking
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateSpeech(prev => {
          const base = prev ? prev + ' ' : '';
          return (base + transcript).trim();
        });
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          onShowToast('Microphone permission denied. You can type your answer below.', 'error');
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e: any) {
      console.error('STT Start Error:', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  };

  // Start interview session
  const handleStartInterview = async () => {
    setFinalReport(null);
    setConversationHistory([]);
    setProcessingAnswer(true);

    try {
      const res = await startInterview({
        interviewType,
        targetRole,
        difficulty,
        questionCount
      });

      setInSession(true);
      setInterviewId(res.interviewId);
      setCurrentQuestion(res.question);
      setQuestionIndex(res.questionIndex);
      setTotalQuestions(res.totalQuestions);
      setIsFollowup(false);

      setConversationHistory([
        { sender: 'ai', text: res.interviewerSpeech }
      ]);

      speakAI(res.interviewerSpeech);
      onShowToast('Interview started! Listen to the interviewer.', 'info');
    } catch (err: any) {
      onShowToast('Failed to start interview: ' + err.message, 'error');
    } finally {
      setProcessingAnswer(false);
    }
  };

  // Submit spoken/typed answer
  const handleSubmitAnswer = async () => {
    if (!interviewId || !candidateSpeech.trim() || processingAnswer) return;

    stopListening();
    setProcessingAnswer(true);

    const spokenText = candidateSpeech.trim();
    setConversationHistory(prev => [...prev, { sender: 'user', text: spokenText }]);
    setCandidateSpeech('');

    try {
      const res = await submitInterviewAnswer(interviewId, spokenText);

      if (res.isFinished && res.report) {
        setInSession(false);
        setFinalReport(res.report);
        speakAI(res.interviewerSpeech);
        onShowToast('Mock interview finished! Evaluation report ready.', 'success');
      } else {
        setIsFollowup(res.isFollowup);
        setCurrentQuestion(res.question || '');
        setQuestionIndex(res.questionIndex);

        setConversationHistory(prev => [
          ...prev,
          { sender: 'ai', text: res.interviewerSpeech }
        ]);

        speakAI(res.interviewerSpeech);
      }
    } catch (err: any) {
      onShowToast('Failed to process response: ' + err.message, 'error');
    } finally {
      setProcessingAnswer(false);
    }
  };

  const handleEndEarly = async () => {
    if (!interviewId) return;
    stopListening();
    setProcessingAnswer(true);

    try {
      const res = await finishInterview(interviewId);
      setInSession(false);
      setFinalReport(res.report);
      onShowToast('Interview concluded. Generating report.', 'info');
    } catch (err: any) {
      onShowToast('Error ending interview: ' + err.message, 'error');
    } finally {
      setProcessingAnswer(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Mode Switcher */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">AI Mock Interview Simulator</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
              Speech-to-Speech
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate realistic technical and HR placement interviews with live speech interaction, AI follow-ups, and speech delivery metrics.
          </p>
        </div>

        {inSession && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              title={muted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={handleEndEarly}
              className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-semibold border border-rose-500/30 transition"
            >
              End Interview Early
            </button>
          </div>
        )}
      </div>

      {/* VIEW A: INTERVIEW SETUP (when not in session and no final report) */}
      {!inSession && !finalReport && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
              <Mic className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Configure Your Mock Interview</h2>
            <p className="text-xs text-slate-400">
              Choose your round type, target role, and difficulty. The AI interviewer will interact naturally via speech.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Interview Round Type</label>
              <select
                value={interviewType}
                onChange={e => setInterviewType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value="Technical">Technical Round (DSA, OS, DBMS, Networks)</option>
                <option value="HR / Behavioral">HR & Behavioral (STAR Method, Culture)</option>
                <option value="Company-Specific">Company-Specific (Cognizant / TCS Pattern)</option>
                <option value="Mixed">Mixed Round (Technical + HR Scenario)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Software Development Engineer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value="Entry Level">Entry Level (College Fresher)</option>
                <option value="Associate">Associate Software Engineer (1-2 yrs)</option>
                <option value="Challenging">Challenging (Product Tech / FAANG style)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Number of Questions</label>
              <select
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value={3}>3 Questions (Quick 10-min calibration)</option>
                <option value={4}>4 Questions (Standard Campus Round)</option>
                <option value={6}>6 Questions (Deep Dive Technical)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={processingAnswer}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Enter AI Mock Interview Room</span>
          </button>
        </div>
      )}

      {/* VIEW B: ACTIVE INTERVIEW ROOM */}
      {inSession && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Video/Audio Simulator Canvas (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between min-h-[480px] shadow-2xl relative overflow-hidden">
            {/* Round & Progress Badges */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Session</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-300">{interviewType} Interview</span>
              </div>
              <div className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                Question {questionIndex + 1} of {totalQuestions} {isFollowup && '(Follow-up)'}
              </div>
            </div>

            {/* AI Avatar & Audio Waveform Center */}
            <div className="flex flex-col items-center justify-center my-8 z-10">
              <div className="relative">
                <div
                  className={`w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 via-cyan-500 to-blue-600 p-1 flex items-center justify-center shadow-2xl transition-transform ${
                    isSpeaking ? 'scale-110 shadow-cyan-500/40' : ''
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <Bot className="w-12 h-12 text-cyan-400" />
                  </div>
                </div>

                {/* Pulsing Audio Ripples when speaking */}
                {isSpeaking && (
                  <div className="absolute -inset-3 rounded-full border-2 border-cyan-400/40 animate-ping pointer-events-none" />
                )}
              </div>

              <div className="mt-4 text-center">
                <div className="text-sm font-bold text-white">AI Placement Interviewer</div>
                <div className="text-xs text-cyan-400 font-medium">
                  {isSpeaking ? 'Speaking...' : isListening ? 'Listening to your response...' : 'Ready for your answer'}
                </div>
              </div>

              {/* Animated Waveform Bars */}
              <div className="flex items-center gap-1.5 h-8 mt-4">
                {[12, 24, 32, 18, 28, 40, 20, 16, 30, 22].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isSpeaking
                        ? 'bg-cyan-400 animate-wave'
                        : isListening
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-slate-800'
                    }`}
                    style={{
                      height: (isSpeaking || isListening) ? `${h}px` : '6px',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Current Question Display */}
            <div className="z-10 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                {isFollowup ? 'AI Probing Follow-Up Question:' : 'Current Question:'}
              </span>
              <p className="text-xs sm:text-sm font-medium text-white leading-relaxed">
                "{currentQuestion}"
              </p>
            </div>

            {/* Speaking Controls & Mic Trigger */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Stop Mic (Finished Speaking)' : 'Click to Speak Answer'}</span>
                </button>

                <button
                  onClick={() => speakAI(currentQuestion)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
                  title="Repeat Question via Voice"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSubmitAnswer}
                disabled={processingAnswer || !candidateSpeech.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Submit & Next</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Live Transcript & Fallback Input (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Conversation Transcript
                </span>
                <span className="text-[10px] text-slate-500">Real-time Speech Recognition</span>
              </div>

              {/* History scroll */}
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                {conversationHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      item.sender === 'ai'
                        ? 'bg-slate-950 border border-slate-800 text-slate-300'
                        : 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-100'
                    }`}
                  >
                    <span className="font-bold text-[10px] block mb-1 text-slate-400 uppercase">
                      {item.sender === 'ai' ? 'Interviewer' : 'You (Candidate)'}
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Spoken text / typed text input box */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <label className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Your Spoken Answer (Live Transcript or Type):</span>
                {isListening && <span className="text-emerald-400 font-bold animate-pulse">● Recording Voice</span>}
              </label>
              <textarea
                rows={3}
                value={candidateSpeech}
                onChange={e => setCandidateSpeech(e.target.value)}
                placeholder="Click 'Speak' and talk, or type your answer here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: COMPREHENSIVE PERFORMANCE REPORT */}
      {finalReport && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>Interview Performance Evaluation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {interviewType} Interview Completed!
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Target: <strong className="text-white">{targetRole}</strong>. Here is your comprehensive breakdown across technical correctness, communication clarity, and confidence.
              </p>
            </div>

            {/* Overall Score Circle */}
            <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shrink-0">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-emerald-400">{finalReport.overallScore}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Overall Score</div>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-xs text-slate-300">
                <div>Pacing: <strong className="text-cyan-400">{finalReport.speechAnalysis?.averageWpm || 125} WPM</strong></div>
                <div>Fillers: <strong className="text-amber-400">{finalReport.speechAnalysis?.fillerWordsCount || 0} words</strong></div>
              </div>
            </div>
          </div>

          {/* 5 Subscore Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Technical Knowledge</div>
              <div className="text-xl font-bold text-white mt-1">{finalReport.scores.technicalKnowledge}%</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${finalReport.scores.technicalKnowledge}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Communication</div>
              <div className="text-xl font-bold text-white mt-1">{finalReport.scores.communication}%</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${finalReport.scores.communication}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Confidence</div>
              <div className="text-xl font-bold text-white mt-1">{finalReport.scores.confidence}%</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${finalReport.scores.confidence}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Problem Solving</div>
              <div className="text-xl font-bold text-white mt-1">{finalReport.scores.problemSolving}%</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${finalReport.scores.problemSolving}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-400">Answer Quality</div>
              <div className="text-xl font-bold text-white mt-1">{finalReport.scores.answerQuality}%</div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${finalReport.scores.answerQuality}%` }} />
              </div>
            </div>
          </div>

          {/* Speech Analysis & Strengths / Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Speech Delivery */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Speech Delivery & Pacing
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {finalReport.speechAnalysis?.feedback}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>• Speaking speed: <span className="text-white font-semibold">{finalReport.speechAnalysis?.averageWpm} words/min</span> (Target: 120-150)</div>
                <div>• Vocal clarity score: <span className="text-white font-semibold">{finalReport.speechAnalysis?.clarityScore}/100</span></div>
              </div>
            </div>

            {/* Strong Areas */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Candidate Strengths
              </h3>
              <ul className="space-y-1.5">
                {finalReport.strongAreas.map((st, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Areas for Improvement
              </h3>
              <ul className="space-y-1.5">
                {finalReport.areasForImprovement.map((imp, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question-by-Question Review with Sample Better Answers */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Question Review & AI Sample Answers</h3>

            <div className="space-y-4">
              {finalReport.questionReviews.map((rev, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-indigo-300">
                    Question {idx + 1}: {rev.question}
                  </div>
                  <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg">
                    <strong>Your Response:</strong> "{rev.candidateAnswer}"
                  </div>
                  <div className="text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                    <strong>Critique:</strong> {rev.critique}
                  </div>
                  <div className="text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20">
                    <strong>AI Sample Better Answer:</strong> {rev.sampleBetterAnswer}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setFinalReport(null)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
              >
                Start Another Mock Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
