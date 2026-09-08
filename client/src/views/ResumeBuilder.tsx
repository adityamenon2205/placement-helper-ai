import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Palette,
  Eye,
  Edit3,
  Wand2,
  TrendingUp,
  FileCode,
  Link2,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { ResumeData, ATSFeedback, UserProfile } from '../types';
import { fetchResume, saveResume, analyzeResume, improveBullet, parseRawResume } from '../services/api';

interface ResumeBuilderProps {
  user: UserProfile | null;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ user, onShowToast }) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'raw' | 'ats'>('editor');
  const [activeSection, setActiveSection] = useState<'personal' | 'summary' | 'education' | 'skills' | 'experience' | 'projects' | 'certifications' | 'achievements'>('personal');
  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal' | 'tech'>('modern');
  const [font, setFont] = useState('Inter');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [accentColor, setAccentColor] = useState('#156BA8');
  const [rawText, setRawText] = useState('');
  const [atsFeedback, setAtsFeedback] = useState<ATSFeedback | null>(null);
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [bulletOptimizerIndex, setBulletOptimizerIndex] = useState<{ type: 'project' | 'experience'; itemIdx: number; bulletIdx: number } | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const res = await fetchResume();
      if (res.resume && res.resume.data) {
        setResumeData(res.resume.data);
        if (res.resume.template) setTemplate(res.resume.template as any);
        if (res.resume.atsFeedback) setAtsFeedback(res.resume.atsFeedback);
      }
    } catch (err) {
      console.warn('Using default resume structure:', err);
    }
  };

  const handleSave = async () => {
    if (!resumeData) return;
    setSaving(true);
    try {
      await saveResume(resumeData, template, `${resumeData.personalInfo.fullName} Resume`);
      onShowToast('Resume saved successfully!', 'success');
    } catch (err: any) {
      onShowToast('Failed to save resume: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeATS = async () => {
    if (!resumeData) return;
    setAnalyzingAts(true);
    try {
      const feedback = await analyzeResume(resumeData, user?.target_role, user?.target_company);
      setAtsFeedback(feedback);
      setActiveTab('ats');
      onShowToast(`ATS Scan Completed! Score: ${feedback.score}/100`, 'success');
    } catch (err: any) {
      onShowToast('Failed to analyze ATS: ' + err.message, 'error');
    } finally {
      setAnalyzingAts(false);
    }
  };

  const handleOptimizeBullet = async (type: 'project' | 'experience', itemIdx: number, bulletIdx: number) => {
    if (!resumeData) return;
    setBulletOptimizerIndex({ type, itemIdx, bulletIdx });

    try {
      const currentBullet = type === 'project'
        ? resumeData.projects[itemIdx]?.bullets[bulletIdx]
        : resumeData.experience[itemIdx]?.highlights[bulletIdx];

      if (!currentBullet) return;

      const improved = await improveBullet(currentBullet, user?.target_role || 'Software Engineer');

      const updated = { ...resumeData };
      if (type === 'project') {
        updated.projects[itemIdx].bullets[bulletIdx] = improved;
      } else {
        updated.experience[itemIdx].highlights[bulletIdx] = improved;
      }
      setResumeData(updated);
      onShowToast('Bullet optimized with Google XYZ formula!', 'success');
    } catch (err: any) {
      onShowToast('Optimization failed: ' + err.message, 'error');
    } finally {
      setBulletOptimizerIndex(null);
    }
  };

  const handleParseRawText = async () => {
    if (!rawText.trim()) return;
    try {
      const parsed = await parseRawResume(rawText);
      setResumeData(prev => ({
        ...(prev || {}),
        ...parsed,
        education: parsed.education.length > 0 ? parsed.education : (prev?.education || []),
        projects: parsed.projects?.length ? parsed.projects : (prev?.projects || []),
        experience: parsed.experience?.length ? parsed.experience : (prev?.experience || [])
      } as ResumeData));
      setActiveTab('editor');
      onShowToast('Raw text imported and structured into resume!', 'success');
    } catch (err: any) {
      onShowToast('Parse error: ' + err.message, 'error');
    }
  };

  // ACTUAL PDF GENERATION & DOWNLOAD
  const handleDownloadPDF = async () => {
    if (!previewRef.current || !resumeData) return;
    setDownloadingPdf(true);
    onShowToast('Generating high-resolution PDF...', 'info');

    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const candidateName = (resumeData.personalInfo.fullName || 'Candidate')
        .replace(/\s+/g, '_');
      const filename = `${candidateName}_Resume.pdf`;

      pdf.save(filename);
      onShowToast(`Downloaded: ${filename}`, 'success');
    } catch (err: any) {
      console.error('PDF error:', err);
      onShowToast('Failed to generate PDF: ' + err.message, 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!resumeData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-[#8A95A5]">Loading resume builder...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E6CD8A]/60 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#1C2530]">AI Resume Builder</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#156BA8]/10 text-[#156BA8] border border-[#156BA8]/30 font-semibold">
              PDF Export Ready
            </span>
          </div>
          <p className="text-xs text-[#8A95A5] mt-1">
            Build ATS-compliant resumes with real-time feedback, Google XYZ action bullets, and instant PDF download.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ATS Analyzer Trigger */}
          <button
            onClick={handleAnalyzeATS}
            disabled={analyzingAts}
            className="px-3 py-2 rounded-xl bg-[#F5EFE6] hover:bg-[#EDE4D3] text-[#1C2530] text-xs font-semibold flex items-center gap-1.5 border border-[#E6CD8A]/60 transition"
          >
            <Wand2 className={`w-3.5 h-3.5 text-[#2597BB] ${analyzingAts ? 'animate-spin' : ''}`} />
            <span>{analyzingAts ? 'Scanning ATS...' : 'Run ATS Audit'}</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-[#F5EFE6] hover:bg-[#EDE4D3] text-[#1C2530] text-xs font-semibold flex items-center gap-1.5 border border-[#E6CD8A]/60 transition"
          >
            <Save className="w-3.5 h-3.5 text-[#156BA8]" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="px-4 py-2 rounded-xl bg-[#FC4B2A] hover:bg-[#E03E1E] text-white text-xs font-bold shadow-lg shadow-[#FC4B2A]/20 flex items-center gap-2 transition hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingPdf ? 'Rendering PDF...' : 'Download Resume as PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Form & Tools (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          {/* Subtabs: Editor | Raw Importer | ATS Report */}
          <div className="flex p-1 rounded-xl bg-[#F5EFE6] border border-[#E6CD8A]/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-2 rounded-lg transition ${
                activeTab === 'editor' ? 'bg-[#2597BB] text-white shadow' : 'text-[#545F6D] hover:text-[#1C2530]'
              }`}
            >
              Structured Editor
            </button>
            <button
              onClick={() => setActiveTab('ats')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'ats' ? 'bg-[#2597BB] text-white shadow' : 'text-[#545F6D] hover:text-[#1C2530]'
              }`}
            >
              <span>ATS Score</span>
              {atsFeedback && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#156BA8]/20 text-[#156BA8] font-bold">
                  {atsFeedback.score}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`flex-1 py-2 rounded-lg transition ${
                activeTab === 'raw' ? 'bg-[#2597BB] text-white shadow' : 'text-[#545F6D] hover:text-[#1C2530]'
              }`}
            >
              Import Raw Info
            </button>
          </div>

          {/* TAB 1: STRUCTURED EDITOR */}
          {activeTab === 'editor' && (
            <div className="rounded-2xl bg-white border border-[#E6CD8A]/60 p-5 space-y-5">
              {/* Section selector pills */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#E6CD8A]/60 text-xs">
                {(['personal', 'summary', 'education', 'skills', 'experience', 'projects', 'certifications', 'achievements'] as const).map(sec => (
                  <button
                    key={sec}
                    onClick={() => setActiveSection(sec)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                      activeSection === sec
                        ? 'bg-[#2597BB] text-white'
                        : 'bg-[#F5EFE6] text-[#545F6D] hover:text-[#1C2530]'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {/* Personal Info */}
              {activeSection === 'personal' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={e => setResumeData({
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Email</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={e => setResumeData({
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Phone</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.phone}
                        onChange={e => setResumeData({
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Location</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={e => setResumeData({
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">LinkedIn URL</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.linkedin || ''}
                        onChange={e => setResumeData({
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">GitHub URL</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.github || ''}
                        onChange={e => setResumeData({
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, github: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              {activeSection === 'summary' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Professional Summary</h3>
                    <button
                      onClick={() => {
                        const newSummary = `Goal-oriented Computer Science student with a solid foundation in Data Structures, Algorithms, and full-stack software development. Proven capability in building high-throughput APIs and real-time platforms, eager to bring algorithmic rigor and problem-solving excellence to ${user?.target_company || 'top engineering teams'}.`;
                        setResumeData({ ...resumeData, summary: newSummary });
                        onShowToast('AI Generated fresh summary!', 'success');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>AI Generate</span>
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={resumeData.summary}
                    onChange={e => setResumeData({ ...resumeData, summary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white leading-relaxed"
                  />
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Skills</h3>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Languages (comma-separated)</label>
                    <input
                      type="text"
                      value={resumeData.skills.languages.join(', ')}
                      onChange={e => setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Frameworks & Libraries</label>
                    <input
                      type="text"
                      value={resumeData.skills.frameworks.join(', ')}
                      onChange={e => setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, frameworks: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Developer Tools & Platforms</label>
                    <input
                      type="text"
                      value={resumeData.skills.tools.join(', ')}
                      onChange={e => setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, tools: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Databases</label>
                    <input
                      type="text"
                      value={resumeData.skills.databases.join(', ')}
                      onChange={e => setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, databases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Projects */}
              {activeSection === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Projects</h3>
                    <button
                      onClick={() => setResumeData({
                        ...resumeData,
                        projects: [
                          ...resumeData.projects,
                          {
                            title: 'New Project',
                            techStack: ['Python', 'FastAPI'],
                            bullets: ['Engineered scalable microservice handling concurrent requests with low latency.']
                          }
                        ]
                      })}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {resumeData.projects.map((proj, pIdx) => (
                    <div key={pIdx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={proj.title}
                          onChange={e => {
                            const updated = { ...resumeData };
                            updated.projects[pIdx].title = e.target.value;
                            setResumeData(updated);
                          }}
                          className="font-bold text-xs text-white bg-transparent border-b border-slate-700 pb-0.5 focus:border-indigo-500 outline-none w-2/3"
                        />
                        <button
                          onClick={() => {
                            const updated = { ...resumeData };
                            updated.projects.splice(pIdx, 1);
                            setResumeData(updated);
                          }}
                          className="text-rose-400 hover:text-rose-300 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Tech Stack (comma-separated)</label>
                        <input
                          type="text"
                          value={proj.techStack.join(', ')}
                          onChange={e => {
                            const updated = { ...resumeData };
                            updated.projects[pIdx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setResumeData(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                        />
                      </div>

                      {/* Bullet points with AI Optimizer */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 block">Bullet Points (Action Verb + Quantified Result)</label>
                        {proj.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1.5">
                            <textarea
                              rows={2}
                              value={b}
                              onChange={e => {
                                const updated = { ...resumeData };
                                updated.projects[pIdx].bullets[bIdx] = e.target.value;
                                setResumeData(updated);
                              }}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white"
                            />
                            <button
                              onClick={() => handleOptimizeBullet('project', pIdx, bIdx)}
                              disabled={bulletOptimizerIndex?.type === 'project' && bulletOptimizerIndex.itemIdx === pIdx && bulletOptimizerIndex.bulletIdx === bIdx}
                              className="px-2 py-1.5 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30 flex items-center gap-1 shrink-0 mt-1"
                              title="Transform with Google XYZ formula"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span>XYZ Fix</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Work Experience */}
              {activeSection === 'experience' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Work Experience & Internships</h3>
                    <button
                      onClick={() => setResumeData({
                        ...resumeData,
                        experience: [
                          ...resumeData.experience,
                          {
                            role: 'Software Engineering Intern',
                            company: 'Tech Corp',
                            location: 'Bengaluru, India',
                            startDate: 'Jun 2025',
                            endDate: 'Aug 2025',
                            highlights: ['Developed backend endpoints handling 20,000+ daily queries.']
                          }
                        ]
                      })}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Experience</span>
                    </button>
                  </div>

                  {resumeData.experience.map((exp, eIdx) => (
                    <div key={eIdx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={e => {
                            const updated = { ...resumeData };
                            updated.experience[eIdx].role = e.target.value;
                            setResumeData(updated);
                          }}
                          className="font-bold text-xs text-white bg-transparent border-b border-slate-700 pb-0.5 focus:border-indigo-500 outline-none"
                        />
                        <button
                          onClick={() => {
                            const updated = { ...resumeData };
                            updated.experience.splice(eIdx, 1);
                            setResumeData(updated);
                          }}
                          className="text-rose-400 hover:text-rose-300 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company}
                          onChange={e => {
                            const updated = { ...resumeData };
                            updated.experience[eIdx].company = e.target.value;
                            setResumeData(updated);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Dates"
                          value={`${exp.startDate} - ${exp.endDate}`}
                          onChange={e => {
                            const updated = { ...resumeData };
                            const parts = e.target.value.split('-');
                            updated.experience[eIdx].startDate = (parts[0] || '').trim();
                            updated.experience[eIdx].endDate = (parts[1] || '').trim();
                            setResumeData(updated);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1.5">
                        {exp.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-1.5">
                            <textarea
                              rows={2}
                              value={h}
                              onChange={e => {
                                const updated = { ...resumeData };
                                updated.experience[eIdx].highlights[hIdx] = e.target.value;
                                setResumeData(updated);
                              }}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white"
                            />
                            <button
                              onClick={() => handleOptimizeBullet('experience', eIdx, hIdx)}
                              className="px-2 py-1.5 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30 flex items-center gap-1 shrink-0 mt-1"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span>XYZ Fix</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Education, Certifications, Achievements tabs */}
              {activeSection === 'education' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Education Details</h3>
                  {resumeData.education.map((edu, edIdx) => (
                    <div key={edIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={e => {
                          const updated = { ...resumeData };
                          updated.education[edIdx].degree = e.target.value;
                          setResumeData(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-bold"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={e => {
                            const updated = { ...resumeData };
                            updated.education[edIdx].institution = e.target.value;
                            setResumeData(updated);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={edu.cgpa}
                          placeholder="CGPA"
                          onChange={e => {
                            const updated = { ...resumeData };
                            updated.education[edIdx].cgpa = e.target.value;
                            setResumeData(updated);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'certifications' && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Certifications</h3>
                  <textarea
                    rows={4}
                    value={resumeData.certifications.join('\n')}
                    onChange={e => setResumeData({
                      ...resumeData,
                      certifications: e.target.value.split('\n').filter(Boolean)
                    })}
                    placeholder="Enter one certification per line..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              )}

              {activeSection === 'achievements' && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Achievements</h3>
                  <textarea
                    rows={4}
                    value={resumeData.achievements.join('\n')}
                    onChange={e => setResumeData({
                      ...resumeData,
                      achievements: e.target.value.split('\n').filter(Boolean)
                    })}
                    placeholder="Enter one achievement per line..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ATS SCORE & AUDIT */}
          {activeTab === 'ats' && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {atsFeedback?.grade || 'A'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">ATS Compliance Score</h3>
                    <div className="text-[11px] text-slate-400">Role: {user?.target_role || 'Software Engineer'}</div>
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-400">
                  {atsFeedback?.score || 88}<span className="text-xs text-slate-400">/100</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {atsFeedback?.summary || 'Your resume demonstrates high technical keyword alignment and solid quantified achievement metrics.'}
              </p>

              {/* Strengths */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5">
                  Key Strengths
                </span>
                <div className="space-y-1.5">
                  {(atsFeedback?.strengths || [
                    'Quantified metrics in project bullets (e.g. 45k+ daily requests).',
                    'Strong DSA & Core CS coverage in skills section.'
                  ]).map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1.5">
                  Actionable Recommendations
                </span>
                <div className="space-y-1.5">
                  {(atsFeedback?.suggestions || [
                    'Incorporate 1-2 cloud infrastructure metrics (e.g. AWS S3 throughput or cost optimization).',
                    'Highlight experience with distributed caching (e.g. Redis).'
                  ]).map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RAW INFO IMPORTER */}
          {activeTab === 'raw' && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Paste Existing Resume / Raw Info</h3>
              <p className="text-xs text-slate-400">
                Paste your current LinkedIn profile, old resume, or project notes. Our AI parser will extract and populate the structured sections automatically.
              </p>
              <textarea
                rows={10}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste raw text here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono"
              />
              <button
                onClick={handleParseRawText}
                disabled={!rawText.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
              >
                AI Extract & Populate Resume
              </button>
            </div>
          )}

          {/* Template & Styling Toolbar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Template & Styling</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
              {(['modern', 'classic', 'minimal', 'tech'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`py-1.5 rounded-lg capitalize transition border ${
                    template === t
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Accent Color picker */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Accent Color</span>
              <div className="flex items-center gap-2">
                {['#2563eb', '#059669', '#7c3aed', '#ea580c', '#0f172a'].map(color => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 rounded-full border transition ${
                      accentColor === color ? 'ring-2 ring-white scale-110' : 'border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Resume Preview (7 cols) */}
        <div className="xl:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live PDF Canvas Preview (A4 Dimensions)</span>
            </span>
            <span>Template: <strong className="text-white capitalize">{template}</strong></span>
          </div>

          {/* Canvas A4 Sheet Container */}
          <div className="w-full max-w-[760px] bg-slate-800/40 p-3 sm:p-6 rounded-2xl border border-slate-800 overflow-x-auto shadow-2xl flex justify-center">
            {/* The Actual Rendered Resume Component for HTML2Canvas & Print */}
            <div
              ref={previewRef}
              style={{
                fontFamily: font === 'Inter' ? 'Inter, sans-serif' : 'serif',
                width: '100%',
                maxWidth: '680px',
                minHeight: '880px',
                backgroundColor: '#ffffff',
                color: '#111827',
                padding: '36px 40px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                borderRadius: '4px'
              }}
              className="text-[11px] leading-normal"
            >
              {/* Header */}
              <div className="border-b pb-3 mb-3" style={{ borderColor: accentColor }}>
                <div className="flex items-baseline justify-between">
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: template === 'minimal' ? '#111827' : accentColor }}
                  >
                    {resumeData.personalInfo.fullName || 'Aditya Menon'}
                  </h1>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {user?.target_role || 'Software Development Engineer'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-gray-600">
                  {resumeData.personalInfo.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5" />
                      {resumeData.personalInfo.email}
                    </span>
                  )}
                  {resumeData.personalInfo.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      {resumeData.personalInfo.phone}
                    </span>
                  )}
                  {resumeData.personalInfo.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {resumeData.personalInfo.location}
                    </span>
                  )}
                  {resumeData.personalInfo.github && (
                    <span className="flex items-center gap-1">
                      <Link2 className="w-2.5 h-2.5" />
                      {resumeData.personalInfo.github.replace('https://', '')}
                    </span>
                  )}
                  {resumeData.personalInfo.linkedin && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      {resumeData.personalInfo.linkedin.replace('https://', '')}
                    </span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {resumeData.summary && (
                <div className="mb-3">
                  <h2
                    className="text-[11px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: accentColor }}
                  >
                    Professional Summary
                  </h2>
                  <p className="text-gray-700 text-[10.5px] leading-relaxed">
                    {resumeData.summary}
                  </p>
                </div>
              )}

              {/* Education */}
              {resumeData.education && resumeData.education.length > 0 && (
                <div className="mb-3">
                  <h2
                    className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b pb-0.5"
                    style={{ color: accentColor, borderColor: '#e5e7eb' }}
                  >
                    Education
                  </h2>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="mb-1.5">
                      <div className="flex justify-between items-baseline font-bold text-gray-900 text-[11px]">
                        <span>{edu.degree}</span>
                        <span className="text-[10px] text-gray-600 font-normal">{edu.startDate} – {edu.endDate}</span>
                      </div>
                      <div className="flex justify-between text-gray-700 text-[10.5px]">
                        <span>{edu.institution}</span>
                        <span className="font-semibold text-gray-800">CGPA: {edu.cgpa}</span>
                      </div>
                      {edu.coursework && (
                        <div className="text-[9.5px] text-gray-500 mt-0.5">
                          <strong>Coursework:</strong> {edu.coursework}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Skills */}
              {resumeData.skills && (
                <div className="mb-3">
                  <h2
                    className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b pb-0.5"
                    style={{ color: accentColor, borderColor: '#e5e7eb' }}
                  >
                    Technical Skills
                  </h2>
                  <div className="text-[10px] space-y-0.5 text-gray-800">
                    <div>
                      <strong>Programming Languages:</strong> {resumeData.skills.languages.join(', ')}
                    </div>
                    <div>
                      <strong>Frameworks & Libraries:</strong> {resumeData.skills.frameworks.join(', ')}
                    </div>
                    <div>
                      <strong>Databases & Tools:</strong> {[...resumeData.skills.databases, ...resumeData.skills.tools].join(', ')}
                    </div>
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {resumeData.experience && resumeData.experience.length > 0 && (
                <div className="mb-3">
                  <h2
                    className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b pb-0.5"
                    style={{ color: accentColor, borderColor: '#e5e7eb' }}
                  >
                    Work Experience
                  </h2>
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between font-bold text-gray-900 text-[11px]">
                        <span>{exp.role} <span className="text-gray-600 font-normal">| {exp.company}</span></span>
                        <span className="text-[10px] text-gray-600 font-normal">{exp.startDate} – {exp.endDate}</span>
                      </div>
                      <ul className="list-disc ml-4 text-[10px] text-gray-700 space-y-0.5 mt-1">
                        {exp.highlights.map((hl, hIdx) => (
                          <li key={hIdx}>{hl}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resumeData.projects && resumeData.projects.length > 0 && (
                <div className="mb-3">
                  <h2
                    className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b pb-0.5"
                    style={{ color: accentColor, borderColor: '#e5e7eb' }}
                  >
                    Projects
                  </h2>
                  {resumeData.projects.map((proj, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between font-bold text-gray-900 text-[11px]">
                        <span>
                          {proj.title}
                          <span className="text-[10px] font-normal text-gray-500 ml-2">
                            ({proj.techStack.join(', ')})
                          </span>
                        </span>
                      </div>
                      <ul className="list-disc ml-4 text-[10px] text-gray-700 space-y-0.5 mt-0.5">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications & Achievements */}
              {(resumeData.certifications.length > 0 || resumeData.achievements.length > 0) && (
                <div>
                  <h2
                    className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b pb-0.5"
                    style={{ color: accentColor, borderColor: '#e5e7eb' }}
                  >
                    Certifications & Key Achievements
                  </h2>
                  <ul className="list-disc ml-4 text-[10px] text-gray-700 space-y-0.5">
                    {resumeData.certifications.map((c, i) => (
                      <li key={'cert-' + i}>{c}</li>
                    ))}
                    {resumeData.achievements.map((a, i) => (
                      <li key={'ach-' + i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
