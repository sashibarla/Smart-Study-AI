import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Sparkles,
  Key,
  Save,
  CheckCircle2,
  Clock,
  Shield,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || 'Alex Chen');
  const [dailyHours, setDailyHours] = useState(user?.daily_study_hours || 4.0);
  const [preferredTime, setPreferredTime] = useState(user?.preferred_study_time || 'Evening (4 PM - 8 PM)');
  const [difficulty, setDifficulty] = useState(user?.difficulty_preference || 'Medium');
  const [notifications, setNotifications] = useState(user?.notifications_enabled ?? true);
  const [aiProvider, setAiProvider] = useState('auto');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser({
        full_name: fullName,
        daily_study_hours: dailyHours,
        preferred_study_time: preferredTime,
        difficulty_preference: difficulty,
        notifications_enabled: notifications
      });
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Account & System
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Manage your student profile, study schedule goals, and AI provider configurations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            <span>Student Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'student@smartstudy.ai'}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Study & Exam Preferences</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Daily Study Hours</label>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value={2.0}>2.0 Hours / Day</option>
                <option value={3.0}>3.0 Hours / Day</option>
                <option value={4.0}>4.0 Hours / Day (Default)</option>
                <option value={6.0}>6.0 Hours / Day</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Preferred Study Window</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Morning (8 AM - 12 PM)">Morning (8:00 AM – 12:00 PM)</option>
                <option value="Afternoon (1 PM - 5 PM)">Afternoon (1:00 PM – 5:00 PM)</option>
                <option value="Evening (4 PM - 8 PM)">Evening (4:00 PM – 8:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Target Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Easy">Easy (Concepts First)</option>
                <option value="Medium">Medium (University Exam)</option>
                <option value="Hard">Hard (Competitive Exam)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Provider Config */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Provider Integration</span>
            </h2>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Active & Connected
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Smart Study AI utilizes an automatic hybrid provider pipeline. External API keys can be supplied in <code>backend/.env</code> (GEMINI_API_KEY / OPENAI_API_KEY) or fallback to our pre-compiled high-yield academic NLP engine.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAiProvider('auto')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                aiProvider === 'auto'
                  ? 'bg-brand-50 border-brand-400 text-brand-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <p className="font-bold text-xs">✨ Auto (Recommended)</p>
              <p className="text-[10px] text-slate-500 mt-1">Uses best available connected model with offline backup</p>
            </button>

            <button
              type="button"
              onClick={() => setAiProvider('gemini')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                aiProvider === 'gemini'
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <p className="font-bold text-xs">💎 Google Gemini 1.5</p>
              <p className="text-[10px] text-slate-500 mt-1">Multi-modal flash processing</p>
            </button>

            <button
              type="button"
              onClick={() => setAiProvider('builtin')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                aiProvider === 'builtin'
                  ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <p className="font-bold text-xs">⚡ Smart Built-in NLP</p>
              <p className="text-[10px] text-slate-500 mt-1">Fast offline CSE knowledge base</p>
            </button>
          </div>
        </div>

        {/* Notifications & Toggles */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <span>Study & Exam Notifications</span>
          </h2>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <h4 className="font-bold text-xs text-slate-900">Daily Study Reminders & Streak Protection</h4>
              <p className="text-[11px] text-slate-500">Receive schedule countdown alerts 15 minutes before study slots</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all hover:scale-105"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
