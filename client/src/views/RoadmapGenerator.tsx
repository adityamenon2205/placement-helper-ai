import React, { useState, useEffect, useRef } from 'react';
import {
  GitFork,
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  Code2,
  Check,
  ChevronRight,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  Layers,
  Flag,
  Calendar,
  Sliders
} from 'lucide-react';
import html2canvas from 'html2canvas';

import { RoadmapData, RoadmapNode, UserProfile } from '../types';
import { fetchRoadmap, generateRoadmap, updateRoadmapNodeStatus } from '../services/api';

interface RoadmapGeneratorProps {
  user: UserProfile | null;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ user, onShowToast }) => {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [goal, setGoal] = useState('Cognizant 10-Day Technical & Placement Preparation');
  const [duration, setDuration] = useState('10 Days');
  const [level, setLevel] = useState('Intermediate');
  const [dailyTime, setDailyTime] = useState('3 Hours/Day');
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  const flowchartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const res = await fetchRoadmap();
      if (res.roadmap) {
        setRoadmap(res.roadmap);
        setGoal(res.roadmap.goal);
        setDuration(res.roadmap.duration);
        setLevel(res.roadmap.level);
        if (res.roadmap.nodes.length > 0) {
          setSelectedNode(res.roadmap.nodes[0]);
        }
      }
    } catch (err) {
      console.warn('Using default roadmap state');
    }
  };

  const handleGenerate = async (targetGoal?: string) => {
    const finalGoal = targetGoal || goal;
    if (!finalGoal.trim()) return;

    setGenerating(true);
    try {
      const res = await generateRoadmap({
        goal: finalGoal,
        duration,
        level,
        targetRole: user?.target_role || 'Software Engineer',
        targetCompany: user?.target_company || 'Cognizant'
      });
      setRoadmap(res.roadmap);
      if (res.roadmap.nodes.length > 0) setSelectedNode(res.roadmap.nodes[0]);
      onShowToast('Personalized roadmap flowchart generated!', 'success');
    } catch (err: any) {
      onShowToast('Generation failed: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleNode = async (nodeId: string, currentStatus: string) => {
    if (!roadmap) return;
    const nextStatus = currentStatus === 'completed'
      ? 'in_progress'
      : currentStatus === 'in_progress'
      ? 'pending'
      : 'completed';

    try {
      const res = await updateRoadmapNodeStatus(roadmap.id, nodeId, nextStatus);
      const updatedNodes = roadmap.nodes.map(n => n.id === nodeId ? { ...n, status: nextStatus as any } : n);
      setRoadmap({ ...roadmap, nodes: updatedNodes, progressPct: res.progressPct });

      if (selectedNode?.id === nodeId) {
        setSelectedNode({ ...selectedNode, status: nextStatus as any });
      }

      onShowToast(`Milestone marked as ${nextStatus.replace('_', ' ')}!`, 'success');
    } catch (err: any) {
      onShowToast('Failed to update node status: ' + err.message, 'error');
    }
  };

  // ACTUAL IMAGE GENERATION & DOWNLOAD (PNG)
  const handleDownloadImage = async () => {
    if (!flowchartRef.current || !roadmap) return;
    setDownloadingImage(true);
    onShowToast('Exporting high-resolution roadmap image...', 'info');

    try {
      const element = flowchartRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.2,
        useCORS: true,
        backgroundColor: '#090d16',
        logging: false
      });

      const imgUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');

      const roleClean = (user?.target_role || roadmap.title || 'Placement')
        .replace(/\s+/g, '_');
      const filename = `${roleClean}_Roadmap.png`;

      link.download = filename;
      link.href = imgUrl;
      link.click();

      onShowToast(`Downloaded: ${filename}`, 'success');
    } catch (err: any) {
      console.error('Image export error:', err);
      onShowToast('Failed to export image: ' + err.message, 'error');
    } finally {
      setDownloadingImage(false);
    }
  };

  const presetGoals = [
    { label: 'Cognizant 10-Day Sprint', goal: 'Prepare for Cognizant technical rounds in 10 days', duration: '10 Days' },
    { label: 'Cybersecurity Placement', goal: 'Prepare for Cybersecurity Analyst & Security Engineer campus roles', duration: '60 Days' },
    { label: '3-Month SDE Mastery', goal: 'Master Data Structures, Algorithms, System Design & Full Stack', duration: '3 Months' },
    { label: 'AI & ML Engineer Track', goal: 'Learn Machine Learning, Deep Learning, and Python AI algorithms', duration: '6 Weeks' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Flowchart & Roadmap Generator</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 font-semibold">
                Interactive Canvas
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Visual sequence of prerequisites, topics, projects, practice problems, and placement milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerate()}
              disabled={generating}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Formulating...' : 'Regenerate'}</span>
            </button>

            {/* DOWNLOAD ROADMAP AS IMAGE */}
            <button
              onClick={handleDownloadImage}
              disabled={downloadingImage || !roadmap}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center gap-2 transition hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingImage ? 'Rendering...' : 'Download Roadmap as PNG'}</span>
            </button>
          </div>
        </div>

        {/* Goal Input & Config Filters */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. I want to become a cybersecurity engineer / 10 days for Cognizant..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={generating || !goal.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shrink-0"
            >
              Generate Visual Roadmap
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Quick Tracks:</span>
            {presetGoals.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setGoal(p.goal);
                  setDuration(p.duration);
                  handleGenerate(p.goal);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Parameters row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Target Timeline</label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="10 Days">10 Days (Sprint)</option>
                <option value="30 Days">30 Days (1 Month)</option>
                <option value="60 Days">60 Days (2 Months)</option>
                <option value="90 Days">90 Days (3 Months)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Current Skill Level</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Daily Study Time</label>
              <select
                value={dailyTime}
                onChange={e => setDailyTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="2 Hours/Day">2 Hours/Day</option>
                <option value="3 Hours/Day">3 Hours/Day</option>
                <option value="5 Hours/Day">5+ Hours/Day</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Overall Roadmap Completion</label>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${roadmap?.progressPct || 28}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-purple-400">{roadmap?.progressPct || 28}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Flowchart & Node Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: The Visual Flowchart Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between px-2 mb-2 text-xs text-slate-400">
            <span>Visual Flowchart Sequence (Click node to inspect & toggle status)</span>
            <span className="text-purple-400 font-medium">Arrow Direction: Fundamentals &rarr; Offer</span>
          </div>

          {/* Flowchart container for HTML2Canvas */}
          <div
            ref={flowchartRef}
            className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#090d16] to-[#0d121f] border border-slate-800 shadow-2xl space-y-6"
          >
            {/* Title Header on Image */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                  Placement Helper AI • Visual Flowchart
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {roadmap?.title || 'Placement Preparation Flowchart'}
                </h2>
                <div className="text-xs text-slate-400">
                  Target: {user?.target_company || 'Top Tech'} • Duration: {roadmap?.duration || '10 Days'}
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 text-xs font-bold">
                  {roadmap?.progressPct || 28}% Completed
                </span>
              </div>
            </div>

            {/* Nodes Sequence */}
            <div className="space-y-4">
              {roadmap?.nodes.map((node, index) => {
                const isSelected = selectedNode?.id === node.id;
                const isCompleted = node.status === 'completed';
                const isInProgress = node.status === 'in_progress';

                return (
                  <React.Fragment key={node.id}>
                    {/* Node Box */}
                    <div
                      onClick={() => setSelectedNode(node)}
                      className={`relative p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10 scale-[1.01]'
                          : isCompleted
                          ? 'bg-slate-900/90 border-emerald-500/40'
                          : isInProgress
                          ? 'bg-slate-900/90 border-purple-500/40'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {/* Stage Number Badge */}
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isInProgress
                                ? 'bg-purple-600 text-white animate-pulse'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                                {node.stage}
                              </span>
                              <span className="text-[10px] text-slate-500">•</span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {node.duration}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-white mt-0.5">
                              {node.title}
                            </h3>

                            {/* Topics Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {node.topics.map((t, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Status Toggle Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleNode(node.id, node.status);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                              : isInProgress
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/40 hover:bg-purple-900'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {node.status.replace('_', ' ')}
                        </button>
                      </div>
                    </div>

                    {/* Connecting Arrow between nodes */}
                    {index < (roadmap.nodes.length - 1) && (
                      <div className="flex justify-center my-1">
                        <div className="flex flex-col items-center">
                          <div className="w-0.5 h-3 bg-gradient-to-b from-purple-500/60 to-purple-400/20" />
                          <ArrowDown className="w-4 h-4 text-purple-400/80 -my-1" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Final Goal Trophy Node */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Final Milestone</div>
                  <div className="text-sm font-bold text-white">Campus Placement Offer Cleared! 🎯</div>
                </div>
              </div>
              <span className="text-xs text-emerald-300 font-semibold">Ready for Day 1</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Node Detail Drawer (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Milestone Details
              </span>
              {selectedNode && (
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  selectedNode.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : selectedNode.status === 'in_progress'
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {selectedNode.status.replace('_', ' ')}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-purple-400 font-mono font-bold uppercase">
                    {selectedNode.stage} • {selectedNode.duration}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedNode.title}
                  </h3>
                </div>

                {/* Topics */}
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Curated Subtopics</span>
                  </div>
                  <ul className="space-y-1">
                    {selectedNode.topics.map((t, idx) => (
                      <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practice Requirement */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Hands-on Practice Requirement</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedNode.practice}
                  </p>
                </div>

                {/* Recommended Resources */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Recommended Guides & Sheets</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedNode.resources}
                  </p>
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleToggleNode(selectedNode.id, selectedNode.status)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md"
                >
                  {selectedNode.status === 'completed'
                    ? 'Mark In Progress'
                    : selectedNode.status === 'in_progress'
                    ? 'Mark as Completed (+15 pts)'
                    : 'Start This Milestone'}
                </button>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-500">
                Select a milestone node to inspect topics and resources.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
