import React, { useState, useEffect } from 'react';
import { User, Target, Building, Calendar, Award, Save, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { updateProfile } from '../services/api';

interface ProfileProps {
  user: UserProfile | null;
  onProfileUpdated: (user: UserProfile) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onProfileUpdated, onShowToast }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: user?.name || 'Aditya Menon',
    email: user?.email || 'aditya.menon@example.com',
    target_role: user?.target_role || 'Software Development Engineer',
    target_company: user?.target_company || 'Cognizant / Tier-1 Tech',
    prep_timeline: user?.prep_timeline || '10 Days',
    current_level: user?.current_level || 'Intermediate',
    college: user?.college || 'National Institute of Technology',
    branch: user?.branch || 'Computer Science & Engineering'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        target_role: user.target_role,
        target_company: user.target_company,
        prep_timeline: user.prep_timeline,
        current_level: user.current_level,
        college: user.college,
        branch: user.branch
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(formData);
      onProfileUpdated(res.user);
      onShowToast('Placement Profile & Goals updated successfully!', 'success');
    } catch (err: any) {
      onShowToast('Failed to update profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg">
            {formData.name ? formData.name.charAt(0) : 'A'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Placement Profile & Targets</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              These settings tailor the AI Chatbot's prep sprints, ATS keyword scans, and mock interview questions.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          {/* Target Role */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Role</span>
            </label>
            <select
              value={formData.target_role || ''}
              onChange={e => setFormData({ ...formData, target_role: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            >
              <option value="Software Development Engineer">Software Development Engineer (SDE / SWE)</option>
              <option value="Cybersecurity Analyst / Engineer">Cybersecurity Analyst / Engineer</option>
              <option value="Data Scientist / AI Engineer">Data Scientist / AI Engineer</option>
              <option value="Site Reliability Engineer">Site Reliability Engineer (SRE / Cloud)</option>
              <option value="Associate Software Engineer">Associate Software Engineer (Campus Fresher)</option>
            </select>
          </div>

          {/* Target Company */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Company / Placement Drive</span>
            </label>
            <input
              type="text"
              value={formData.target_company || ''}
              onChange={e => setFormData({ ...formData, target_company: e.target.value })}
              placeholder="e.g. Cognizant, TCS Digital, Amazon, Google"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          {/* Preparation Timeline */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Preparation Timeline</span>
            </label>
            <select
              value={formData.prep_timeline || ''}
              onChange={e => setFormData({ ...formData, prep_timeline: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            >
              <option value="10 Days">10 Days (Emergency Placement Sprint)</option>
              <option value="30 Days">30 Days (1 Month Accelerated)</option>
              <option value="60 Days">60 Days (2 Months Comprehensive)</option>
              <option value="90 Days">90 Days (3 Months Full Track)</option>
            </select>
          </div>

          {/* Current Level */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Current Skill Level</span>
            </label>
            <select
              value={formData.current_level || ''}
              onChange={e => setFormData({ ...formData, current_level: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            >
              <option value="Beginner">Beginner (Starting DSA & Basic Syntax)</option>
              <option value="Intermediate">Intermediate (Comfortable with Python/C++ & Core CS)</option>
              <option value="Advanced">Advanced (300+ LeetCode solved, revising System Design)</option>
            </select>
          </div>

          {/* College */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">College / University</label>
            <input
              type="text"
              value={formData.college || ''}
              onChange={e => setFormData({ ...formData, college: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Engineering Branch / Degree</label>
            <input
              type="text"
              value={formData.branch || ''}
              onChange={e => setFormData({ ...formData, branch: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile & Update Placement Sprints'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
