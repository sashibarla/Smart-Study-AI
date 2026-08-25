import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Trash2,
  RotateCcw,
  BookOpen,
  CheckSquare,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { StudyScheduleItem, ScheduleDayItem } from '../types';
import { useToast } from '../components/Toast';

export const StudyPlannerPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<StudyScheduleItem | null>(null);
  const [selectedView, setSelectedView] = useState<'daily' | 'weekly' | 'calendar'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // New plan form
  const [planTitle, setPlanTitle] = useState('Semester Exam Preparation Timetable');
  const [dailyHours, setDailyHours] = useState(4.0);
  const [preferredTime, setPreferredTime] = useState('Evening (4 PM - 8 PM)');
  const [subjectsList, setSubjectsList] = useState([
    { subject_name: 'Database Management Systems', exam_date: '2026-08-25', difficulty: 'Hard' },
    { subject_name: 'Operating Systems', exam_date: '2026-08-28', difficulty: 'Medium' },
    { subject_name: 'Computer Networks', exam_date: '2026-08-30', difficulty: 'Medium' }
  ]);

  const { showToast } = useToast();

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const plan = await api.getCurrentStudyPlan();
      setCurrentPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubjectRow = () => {
    setSubjectsList((prev) => [
      ...prev,
      { subject_name: 'Artificial Intelligence', exam_date: '2026-09-05', difficulty: 'Medium' }
    ]);
  };

  const handleRemoveSubjectRow = (index: number) => {
    setSubjectsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGeneratePlan = async () => {
    if (subjectsList.length === 0) {
      showToast('Please add at least one subject and exam date', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const plan = await api.generateStudyPlan({
        title: planTitle,
        daily_available_hours: dailyHours,
        preferred_study_time: preferredTime,
        subjects: subjectsList
      });
      setCurrentPlan(plan);
      showToast('Generated personalized study timetable!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate study plan', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSlot = async (taskId: string, currentStatus: boolean) => {
    try {
      await api.toggleScheduleTask(taskId, !currentStatus);
      if (currentPlan) {
        const updatedDays = currentPlan.schedule.map((day) => ({
          ...day,
          slots: day.slots.map((slot) => (slot.id === taskId ? { ...slot, is_completed: !currentStatus } : slot))
        }));
        setCurrentPlan({ ...currentPlan, schedule: updatedDays });
      }
      showToast(!currentStatus ? 'Slot marked as completed! (+45m)' : 'Slot unchecked', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate completion percentage
  let totalTasks = 0;
  let completedTasks = 0;
  if (currentPlan?.schedule) {
    currentPlan.schedule.forEach((d) => {
      d.slots?.forEach((s) => {
        totalTasks++;
        if (s.is_completed) completedTasks++;
      });
    });
  }
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Spaced Repetition Scheduler
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Personalized Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Automatic day-wise timetable generated from your exam dates with spaced revision & practice quiz blocks.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <button
            onClick={() => setSelectedView('daily')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedView === 'daily' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setSelectedView('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedView === 'weekly' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setSelectedView('calendar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedView === 'calendar' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Progress & Target Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-lg">
            {completionPercentage}%
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Overall Plan Progress</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {completedTasks} of {totalTasks} study sessions completed
            </p>
            <div className="w-48 sm:w-64 bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            🎯 Target: 4.0 Hours Daily
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
            📅 {currentPlan?.total_days || 14} Days to Exams
          </span>
        </div>
      </div>

      {/* Plan Configurator */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Customize Exam Target & Study Parameters</span>
          </h3>
          <button
            onClick={handleAddSubjectRow}
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1.5 rounded-xl border border-brand-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Daily Available Study Hours</label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value={2.0}>2.0 Hours / Day</option>
              <option value={3.0}>3.0 Hours / Day</option>
              <option value={4.0}>4.0 Hours / Day (Recommended)</option>
              <option value={6.0}>6.0 Hours / Day (Intensive)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Preferred Study Window</label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="Morning (8 AM - 12 PM)">Morning (8:00 AM – 12:00 PM)</option>
              <option value="Afternoon (1 PM - 5 PM)">Afternoon (1:00 PM – 5:00 PM)</option>
              <option value="Evening (4 PM - 8 PM)">Evening (4:00 PM – 8:00 PM)</option>
            </select>
          </div>
        </div>

        {/* Subjects list rows */}
        <div className="space-y-2 pt-2">
          <label className="block text-[11px] font-bold uppercase text-slate-400">Exam Targets & Difficulty</label>
          {subjectsList.map((sub, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <input
                type="text"
                value={sub.subject_name}
                onChange={(e) => {
                  const updated = [...subjectsList];
                  updated[idx].subject_name = e.target.value;
                  setSubjectsList(updated);
                }}
                className="flex-1 min-w-[180px] bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900"
                placeholder="Subject Name"
              />
              <input
                type="date"
                value={sub.exam_date}
                onChange={(e) => {
                  const updated = [...subjectsList];
                  updated[idx].exam_date = e.target.value;
                  setSubjectsList(updated);
                }}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900"
              />
              <select
                value={sub.difficulty}
                onChange={(e) => {
                  const updated = [...subjectsList];
                  updated[idx].difficulty = e.target.value;
                  setSubjectsList(updated);
                }}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {subjectsList.length > 1 && (
                <button
                  onClick={() => handleRemoveSubjectRow(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3">
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Optimized Schedule</span>
          </button>
        </div>
      </div>

      {/* Timetable Schedule Display */}
      {currentPlan?.schedule && currentPlan.schedule.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            📅 {currentPlan.title} ({currentPlan.start_date} to {currentPlan.end_date})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentPlan.schedule.map((day) => (
              <div
                key={day.day_number}
                className={`p-5 rounded-3xl border transition-all ${
                  day.is_today
                    ? 'bg-gradient-to-b from-brand-50/50 to-white border-brand-300 shadow-md ring-2 ring-brand-400/20'
                    : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Day {day.day_number} • {day.day_name}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{day.date}</h3>
                  </div>
                  {day.is_today && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-600 text-white shadow-sm">
                      Today
                    </span>
                  )}
                </div>

                {/* Slots for this day */}
                <div className="space-y-2.5">
                  {day.slots?.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        slot.is_completed
                          ? 'bg-slate-50 border-slate-200 opacity-70'
                          : 'bg-slate-50/70 border-slate-100 hover:border-brand-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            slot.task_type.includes('Quiz')
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {slot.task_type}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2 mt-1.5">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{slot.subject}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{slot.topic}</p>
                        </div>
                        <button
                          onClick={() => handleToggleSlot(slot.id, slot.is_completed)}
                          className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors"
                        >
                          {slot.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-400 text-sm">
          No schedule generated yet. Click "Generate Optimized Schedule" above!
        </div>
      )}
    </div>
  );
};
