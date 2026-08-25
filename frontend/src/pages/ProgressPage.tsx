import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  Award,
  Clock,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { ProgressData } from '../types';
import { StatCard } from '../components/StatCard';
import { useNavigate } from 'react-router-dom';

export const ProgressPage: React.FC = () => {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await api.getProgressData();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const streak = data?.study_streak_days || 7;
  const hours = data?.total_study_hours || 28.5;
  const topics = data?.topics_completed || 42;
  const quizAccuracy = data?.average_quiz_score || 86.0;

  const weeklyChart = data?.weekly_hours_chart || [
    { day: 'Mon', hours: 3.5, target: 4.0 },
    { day: 'Tue', hours: 4.2, target: 4.0 },
    { day: 'Wed', hours: 2.8, target: 4.0 },
    { day: 'Thu', hours: 5.0, target: 4.0 },
    { day: 'Fri', hours: 4.5, target: 4.0 },
    { day: 'Sat', hours: 6.0, target: 4.0 },
    { day: 'Sun', hours: 3.8, target: 4.0 },
  ];

  const subjectMastery = data?.subject_mastery || [
    { subject: 'Database Systems', mastery: 88, quizzes_taken: 4, status: 'Strong' },
    { subject: 'Operating Systems', mastery: 74, quizzes_taken: 3, status: 'Needs Revision' },
    { subject: 'Computer Networks', mastery: 82, quizzes_taken: 3, status: 'Good' },
    { subject: 'AI & Machine Learning', mastery: 91, quizzes_taken: 5, status: 'Mastered' },
  ];

  const maxHours = Math.max(...weeklyChart.map((d) => Math.max(d.hours, d.target)), 7);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-brand-700 border border-brand-200">
            Performance Analytics
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Study Progress & Performance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Visual metrics tracking your weekly study hours, quiz mastery trends, and subject retention.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Study Streak"
          value={`${streak} Days`}
          subtitle="Top 5% of active students"
          icon={Flame}
          color="rose"
        />
        <StatCard
          title="Average Quiz Score"
          value={`${quizAccuracy}%`}
          subtitle="Passing target: 75%"
          icon={Award}
          trend="+4% this wk"
          color="emerald"
        />
        <StatCard
          title="Topics Completed"
          value={topics}
          subtitle="Units & subtopics mastered"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Total Study Hours"
          value={`${hours}h`}
          subtitle="Semester total logged"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* AI Performance Recommendation */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-brand-50 via-indigo-50/50 to-purple-50 border border-brand-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-600 text-white flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">AI Diagnostic Insight</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 leading-relaxed">
              {data?.ai_advice ||
                'Your DBMS quiz accuracy is lower than your other subjects. Consider revising Normalization and Transactions before taking the upcoming practice test.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/important-points')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105 flex-shrink-0"
        >
          <span>Revise High-Yield Topics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Two Column Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Weekly Study Hours</h3>
                <p className="text-xs text-slate-400">Actual hours logged vs 4.0h daily goal</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Avg: 4.3h / day
              </span>
            </div>

            {/* Custom SVG/HTML Bar Visualization */}
            <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2">
              {weeklyChart.map((d, i) => {
                const heightPct = (d.hours / maxHours) * 100;
                const isOverTarget = d.hours >= d.target;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.hours}h
                    </span>
                    <div className="w-full bg-slate-100 rounded-2xl h-36 flex items-end p-1 relative">
                      {/* Target line */}
                      <div
                        className="absolute w-full border-t border-dashed border-slate-300 left-0"
                        style={{ bottom: `${(d.target / maxHours) * 100}%` }}
                      />
                      {/* Filled Bar */}
                      <div
                        className={`w-full rounded-xl transition-all duration-500 ${
                          isOverTarget
                            ? 'bg-gradient-to-t from-brand-600 to-brand-400 shadow-md shadow-brand-500/25'
                            : 'bg-gradient-to-t from-slate-400 to-slate-300'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Actual Hours
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 border-t-2 border-dashed border-slate-400 inline-block"></span> Daily Target (4.0h)
            </span>
          </div>
        </div>

        {/* Subject Mastery Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Subject Mastery Breakdown</h3>
                <p className="text-xs text-slate-400">Calculated from AI practice quiz performance</p>
              </div>
              <button
                onClick={() => navigate('/quiz')}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                + Take Quiz
              </button>
            </div>

            <div className="space-y-4">
              {subjectMastery.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.subject}</h4>
                      <p className="text-[10px] text-slate-400">{item.quizzes_taken} Quizzes Completed</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-brand-600">{item.mastery}%</span>
                      <span
                        className={`block text-[10px] font-bold ${
                          item.mastery >= 85
                            ? 'text-emerald-600'
                            : item.mastery >= 75
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.mastery >= 85 ? 'bg-emerald-500' : item.mastery >= 75 ? 'bg-brand-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              ⚡ Aim for <strong>85%+ mastery</strong> across all subjects before final exams.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
