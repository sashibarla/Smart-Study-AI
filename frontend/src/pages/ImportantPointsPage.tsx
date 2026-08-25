import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Star,
  Bookmark,
  Calculator,
  HelpCircle,
  CheckCircle2,
  Circle,
  Sparkles,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { ImportantPointItem } from '../types';
import { useToast } from '../components/Toast';

export const ImportantPointsPage: React.FC = () => {
  const [points, setPoints] = useState<ImportantPointItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const subjects = ['All', 'Database Management Systems', 'Operating Systems', 'Computer Networks', 'Artificial Intelligence'];

  const categories = [
    { id: 'All', label: 'All Items', icon: Filter },
    { id: 'priority_topic', label: '🔥 High Priority Topics', icon: Flame },
    { id: 'definition', label: '⭐ Definitions', icon: Star },
    { id: 'concept', label: '📌 Key Concepts', icon: Bookmark },
    { id: 'formula', label: '🧮 Formulas & Syntax', icon: Calculator },
    { id: 'expected_question', label: '❓ Expected Exam Qs', icon: HelpCircle },
  ];

  useEffect(() => {
    fetchPoints();
  }, [selectedSubject, selectedCategory, selectedPriority]);

  const fetchPoints = async () => {
    setIsLoading(true);
    try {
      const res = await api.getImportantPoints(
        selectedSubject !== 'All' ? selectedSubject : undefined,
        selectedCategory !== 'All' ? selectedCategory : undefined,
        selectedPriority !== 'All' ? selectedPriority : undefined
      );
      setPoints(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompleted = async (point: ImportantPointItem) => {
    try {
      const updated = await api.togglePointStatus(point.id, { is_completed: !point.is_completed });
      setPoints((prev) => prev.map((p) => (p.id === point.id ? updated : p)));
      if (!point.is_completed) {
        showToast(`Marked "${point.topic}" as reviewed!`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRevision = async (point: ImportantPointItem) => {
    try {
      const updated = await api.togglePointStatus(point.id, { in_revision_queue: !point.in_revision_queue });
      setPoints((prev) => prev.map((p) => (p.id === point.id ? updated : p)));
      showToast(
        !point.in_revision_queue
          ? `Added "${point.topic}" to your last-minute revision queue!`
          : `Removed from revision queue`,
        'info'
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Exam Oriented Focus
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Important Exam Points & High-Yield Topics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            AI-extracted definitions, core mechanisms, formulas, and expected semester questions.
          </p>
        </div>

        <button
          onClick={() => navigate('/quiz')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Quiz from Points</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Subject Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority 🔥</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Points Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : points.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-400 text-sm">
          No exam points found matching your current filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {points.map((pt) => (
            <div
              key={pt.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                pt.is_completed
                  ? 'bg-slate-50 border-slate-200/80 opacity-75'
                  : 'bg-white border-slate-100 shadow-sm hover:border-brand-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Card Top Pill */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        pt.category === 'priority_topic'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : pt.category === 'definition'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : pt.category === 'formula'
                          ? 'bg-blue-50 text-brand-700 border border-brand-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {pt.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">• {pt.subject}</span>
                  </div>

                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    {pt.priority}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-base text-slate-900 ${pt.is_completed ? 'line-through text-slate-400' : ''}`}>
                  {pt.topic}
                </h3>

                {/* Explanation */}
                <p className="text-xs text-slate-600 font-normal mt-2 leading-relaxed">
                  {pt.explanation}
                </p>

                {/* Formula Box if any */}
                {pt.formula_or_syntax && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 text-brand-300 font-mono text-xs overflow-x-auto">
                    <code>{pt.formula_or_syntax}</code>
                  </div>
                )}
              </div>

              {/* Bottom Toggles */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleCompleted(pt)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {pt.is_completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                  <span>{pt.is_completed ? 'Completed' : 'Mark as Done'}</span>
                </button>

                <button
                  onClick={() => handleToggleRevision(pt)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    pt.in_revision_queue
                      ? 'bg-amber-100 text-amber-900 font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {pt.in_revision_queue ? '⚡ In Revision Queue' : '+ Add to Revision'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
