import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import {
  Code2,
  Play,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Cpu,
  ChevronDown,
  Layers,
  HelpCircle,
  RotateCcw,
  Maximize2,
  Terminal,
  Activity,
  Award,
  BookOpen
} from 'lucide-react';

import { CodingProblem, SubmissionResult, UserProfile } from '../types';
import { fetchProblems, fetchProblemDetails, runCode, submitCode, fetchCodingStats } from '../services/api';

interface CodingEnvironmentProps {
  user: UserProfile | null;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const CodingEnvironment: React.FC<CodingEnvironmentProps> = ({ user, onShowToast }) => {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('two-sum');
  const [currentProblem, setCurrentProblem] = useState<CodingProblem | null>(null);

  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'hints' | 'solution'>('description');
  const [bottomTab, setBottomTab] = useState<'testcases' | 'console' | 'ai-audit'>('testcases');

  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);

  const [executing, setExecuting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<SubmissionResult | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadProblems();
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      loadProblemDetails(selectedSlug);
    }
  }, [selectedSlug]);

  // Update starter code when language or problem changes
  useEffect(() => {
    if (currentProblem && currentProblem.starterCode) {
      const starter = currentProblem.starterCode[language] || '';
      setCode(starter);
    }
  }, [currentProblem, language]);

  const loadProblems = async () => {
    try {
      const list = await fetchProblems();
      setProblems(list);
    } catch (err) {
      console.warn('Failed to load problems:', err);
    }
  };

  const loadProblemDetails = async (slug: string) => {
    try {
      const prob = await fetchProblemDetails(slug);
      setCurrentProblem(prob);
      setRunResult(null);
    } catch (err) {
      console.warn('Failed to load problem detail:', err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetchCodingStats();
      setStats(res.stats);
    } catch (err) {}
  };

  const handleRun = async () => {
    if (!currentProblem || executing || submitting) return;
    setExecuting(true);
    setBottomTab('console');

    try {
      let custom = undefined;
      if (useCustomInput && customInput.trim()) {
        try {
          custom = JSON.parse(customInput);
        } catch {
          custom = customInput;
        }
      }

      const res = await runCode(currentProblem.slug, language, code, custom);
      setRunResult(res);

      if (res.status === 'Accepted') {
        onShowToast(`Test cases passed! (${res.passedCount}/${res.totalCount})`, 'success');
      } else {
        onShowToast(`${res.status}: ${res.error || 'Check your logic'}`, 'error');
      }
    } catch (err: any) {
      onShowToast('Execution failed: ' + err.message, 'error');
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem || executing || submitting) return;
    setSubmitting(true);
    setBottomTab('ai-audit');

    try {
      const res = await submitCode(currentProblem.slug, language, code);
      setRunResult(res);
      loadStats();

      if (res.status === 'Accepted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        onShowToast(`🎉 Solution Accepted! (${res.runtimeMs}ms)`, 'success');
      } else {
        onShowToast(`Submission result: ${res.status}`, 'error');
      }
    } catch (err: any) {
      onShowToast('Submission failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (currentProblem && currentProblem.starterCode) {
      setCode(currentProblem.starterCode[language] || '');
      onShowToast('Starter code restored.', 'info');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Bar: Problem Selector, Language, Run/Submit */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Code2 className="w-4 h-4" />
          </div>

          {/* Problem Selector Dropdown */}
          <select
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
          >
            {problems.map(p => (
              <option key={p.slug} value={p.slug}>
                {p.title} ({p.difficulty}) — {p.category}
              </option>
            ))}
          </select>

          {currentProblem && (
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
              currentProblem.difficulty === 'Easy'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                : currentProblem.difficulty === 'Medium'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                : 'bg-rose-950 text-rose-300 border border-rose-500/30'
            }`}>
              {currentProblem.difficulty}
            </span>
          )}
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {(['python', 'javascript', 'cpp', 'java'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg uppercase font-mono font-bold text-[11px] transition ${
                  language === lang ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : lang}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetCode}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset code to starter boilerplate"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Run Code */}
          <button
            onClick={handleRun}
            disabled={executing || submitting}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Play className={`w-3.5 h-3.5 text-amber-400 ${executing ? 'animate-spin' : ''}`} />
            <span>{executing ? 'Running...' : 'Run Code'}</span>
          </button>

          {/* Submit Solution */}
          <button
            onClick={handleSubmit}
            disabled={executing || submitting}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition hover:scale-105"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Submit & AI Audit'}</span>
          </button>
        </div>
      </div>

      {/* Split Panels: Left (Problem Statement) & Right (Monaco Editor & Console) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL: 5 cols */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col bg-slate-950/60 overflow-hidden">
          {/* Subtabs */}
          <div className="flex px-4 pt-2 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-2 px-3 border-b-2 transition ${
                activeTab === 'description' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`pb-2 px-3 border-b-2 transition flex items-center gap-1 ${
                activeTab === 'hints' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>Hints</span>
              <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-300">
                {currentProblem?.hints?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`pb-2 px-3 border-b-2 transition flex items-center gap-1 ${
                activeTab === 'solution' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Optimal Approach</span>
            </button>
          </div>

          {/* Left Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            {currentProblem && activeTab === 'description' && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-white">{currentProblem.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400">Category: <strong className="text-slate-300">{currentProblem.category}</strong></span>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <span>Asked at:</span>
                      {currentProblem.companies.map((c, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description Body */}
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentProblem.description}
                </div>

                {/* Examples */}
                {currentProblem.examples && currentProblem.examples.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Examples</h3>
                    {currentProblem.examples.map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-1">
                        <div className="text-slate-400"><strong className="text-indigo-400">Input:</strong> {ex.input}</div>
                        <div className="text-slate-400"><strong className="text-emerald-400">Output:</strong> {ex.output}</div>
                        {ex.explanation && (
                          <div className="text-slate-400 text-[11px] font-sans pt-1">
                            <strong>Explanation:</strong> {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {currentProblem.constraints && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Constraints</h3>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                      {currentProblem.constraints.split('\n').map((c, i) => (
                        <div key={i}>• {c}</div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {currentProblem && activeTab === 'hints' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progressive Hints</h3>
                {currentProblem.hints && currentProblem.hints.length > 0 ? (
                  currentProblem.hints.map((hint, idx) => (
                    <details key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 cursor-pointer group">
                      <summary className="font-semibold text-indigo-300 flex items-center justify-between">
                        <span>Hint {idx + 1}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-2 text-slate-400 leading-relaxed">{hint}</p>
                    </details>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No hints available for this problem.</p>
                )}
              </div>
            )}

            {currentProblem && activeTab === 'solution' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Optimal Solution: {currentProblem.optimalSolution?.approach}
                  </div>
                  <div className="flex gap-4 text-xs font-mono">
                    <span className="text-slate-300">Time: <strong className="text-emerald-400">{currentProblem.optimalSolution?.timeComplexity}</strong></span>
                    <span className="text-slate-300">Space: <strong className="text-indigo-400">{currentProblem.optimalSolution?.spaceComplexity}</strong></span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentProblem.optimalSolution?.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: 7 cols (Monaco Editor on top, Test Results / Console / AI on bottom) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
          {/* Monaco Editor Container (65% height) */}
          <div className="flex-1 min-h-[300px] border-b border-slate-800 relative">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : language === 'java' ? 'java' : 'python'}
              theme="vs-dark"
              value={code}
              onChange={val => setCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Bottom Testcases / Console / AI Audit Drawer (35% height) */}
          <div className="h-64 bg-slate-950/90 flex flex-col overflow-hidden">
            {/* Drawer Tab Headers */}
            <div className="flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 text-xs font-semibold">
              <div className="flex gap-4">
                <button
                  onClick={() => setBottomTab('testcases')}
                  className={`py-2 border-b-2 transition ${
                    bottomTab === 'testcases' ? 'border-amber-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setBottomTab('console')}
                  className={`py-2 border-b-2 transition flex items-center gap-1.5 ${
                    bottomTab === 'console' ? 'border-amber-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution Output</span>
                  {runResult && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      runResult.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {runResult.status}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setBottomTab('ai-audit')}
                  className={`py-2 border-b-2 transition flex items-center gap-1.5 ${
                    bottomTab === 'ai-audit' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Solution Analyzer</span>
                </button>
              </div>

              {runResult?.runtimeMs !== undefined && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{runResult.runtimeMs}ms</span>
                </div>
              )}
            </div>

            {/* Bottom Content Area */}
            <div className="flex-1 overflow-y-auto p-4 text-xs">
              {/* TAB: TEST CASES */}
              {bottomTab === 'testcases' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {currentProblem?.visibleTestCases?.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTestIndex(idx);
                          setUseCustomInput(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          !useCustomInput && selectedTestIndex === idx
                            ? 'bg-slate-800 text-white border border-slate-700'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setUseCustomInput(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        useCustomInput ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      Custom Input
                    </button>
                  </div>

                  {!useCustomInput && currentProblem?.visibleTestCases && currentProblem.visibleTestCases[selectedTestIndex] && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono space-y-1">
                      <div className="text-slate-400">
                        <strong className="text-indigo-400">Input:</strong> {JSON.stringify(currentProblem.visibleTestCases[selectedTestIndex].input)}
                      </div>
                      <div className="text-slate-400">
                        <strong className="text-emerald-400">Expected:</strong> {JSON.stringify(currentProblem.visibleTestCases[selectedTestIndex].expected)}
                      </div>
                    </div>
                  )}

                  {useCustomInput && (
                    <div>
                      <textarea
                        rows={3}
                        value={customInput}
                        onChange={e => setCustomInput(e.target.value)}
                        placeholder='Enter custom input (e.g. {"nums": [1,2,3], "target": 5})'
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CONSOLE OUTPUT */}
              {bottomTab === 'console' && (
                <div className="space-y-3 font-mono">
                  {runResult ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          runResult.status === 'Accepted'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        }`}>
                          {runResult.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Passed {runResult.passedCount}/{runResult.totalCount} Test Cases
                        </span>
                      </div>

                      {/* Test case breakdown cards */}
                      {runResult.results && runResult.results.length > 0 && (
                        <div className="space-y-2">
                          {runResult.results.map((r, i) => (
                            <div
                              key={i}
                              className={`p-2.5 rounded-lg border text-xs ${
                                r.passed ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold">
                                  Test Case #{i + 1} {r.hidden ? '(Hidden Edge Case)' : ''}
                                </span>
                                {r.passed ? (
                                  <span className="text-emerald-400 font-bold">Passed</span>
                                ) : (
                                  <span className="text-rose-400 font-bold">Failed</span>
                                )}
                              </div>
                              <div>Input: {JSON.stringify(r.input)}</div>
                              <div>Expected: {JSON.stringify(r.expected)}</div>
                              <div>Actual: {JSON.stringify(r.actual)}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {runResult.stdout && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-900 text-slate-300">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Standard Output:</span>
                          <pre className="text-xs">{runResult.stdout}</pre>
                        </div>
                      )}

                      {runResult.error && (
                        <div className="mt-2 p-2.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/30">
                          <span className="text-rose-400 block text-[10px] uppercase font-bold">Error Traceback:</span>
                          <pre className="text-xs whitespace-pre-wrap">{runResult.error}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs py-4 text-center">
                      Click "Run Code" to execute test cases or "Submit" for full verification & AI audit.
                    </div>
                  )}
                </div>
              )}

              {/* TAB: AI SOLUTION ANALYZER */}
              {bottomTab === 'ai-audit' && (
                <div className="space-y-3 font-sans">
                  {runResult?.aiAnalysis ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                        <div>
                          <div className="text-xs font-bold text-indigo-300">Code Quality Score</div>
                          <div className="text-xl font-extrabold text-white">
                            {runResult.aiAnalysis.codeQualityScore}/100
                          </div>
                        </div>
                        <div className="text-right text-xs font-mono space-y-0.5">
                          <div>Time: <strong className="text-amber-400">{runResult.aiAnalysis.timeComplexity}</strong></div>
                          <div>Space: <strong className="text-cyan-400">{runResult.aiAnalysis.spaceComplexity}</strong></div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <strong>Correctness Feedback:</strong> {runResult.aiAnalysis.correctnessFeedback}
                      </div>

                      {/* Optimizations */}
                      {runResult.aiAnalysis.optimizations && (
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                            Optimization Opportunities
                          </span>
                          <ul className="space-y-1">
                            {runResult.aiAnalysis.optimizations.map((opt, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>{opt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Alternative Approaches */}
                      {runResult.aiAnalysis.alternativeApproaches && (
                        <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <strong>Alternative Approach:</strong> {runResult.aiAnalysis.alternativeApproaches}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs py-4 text-center">
                      Submit your solution to trigger the AI Code Quality & Complexity Analyzer.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
