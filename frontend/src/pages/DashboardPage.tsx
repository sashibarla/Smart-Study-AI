import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  UploadCloud,
  CheckSquare,
  Award,
  Flame,
  Calendar,
  FileText,
  Video,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboardData();
      setData(res);
    } catch (err) {
      console.error('[Dashboard fetch error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await api.toggleScheduleTask(taskId, !currentStatus);
      if (!currentStatus) {
        showToast('Task completed! Progress updated.', 'success');
      }
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 rounded-3xl" />
          <div className="h-72 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  const stats = data?.statistics || {
    total_study_hours: 28.5,
    materials_uploaded: 4,
    quizzes_completed: 6,
    average_quiz_score: 86.0,
    current_study_streak: 7
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {data?.greeting || `Good morning, ${user?.full_name?.split(' ')[0] || 'Student'} 👋`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            You're on a <strong className="text-amber-600 font-bold">7-day study streak</strong>. Let's make today productive!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Material</span>
          </button>
          <button
            onClick={() => navigate('/assistant')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 5 Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Study Hours"
          value={`${stats.total_study_hours}h`}
          subtitle="Target: 30h / wk"
          icon={Clock}
          trend="+3.5h this wk"
          color="blue"
        />
        <StatCard
          title="Materials Uploaded"
          value={stats.materials_uploaded}
          subtitle="PDFs & Video lectures"
          icon={UploadCloud}
          color="purple"
        />
        <StatCard
          title="Quizzes Completed"
          value={stats.quizzes_completed}
          subtitle="Self-assessments"
          icon={CheckSquare}
          color="emerald"
        />
        <StatCard
          title="Avg Quiz Score"
          value={`${stats.average_quiz_score}%`}
          subtitle="Passing target: 75%"
          icon={Award}
          trend="Top 10%"
          color="amber"
        />
        <StatCard
          title="Study Streak"
          value={`${stats.current_study_streak} Days`}
          subtitle="Consistent learner"
          icon={Flame}
          color="rose"
        />
      </div>

      {/* AI Recommendation Banner */}
      {data?.ai_recommendation && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-50 via-indigo-50/60 to-purple-50 border border-brand-200/80 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-brand-600 text-white flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-900">
                Personalized AI Study Recommendation
              </h4>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-200/60 text-brand-800">
                Smart Analysis
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 leading-relaxed">
              {data.ai_recommendation}
            </p>
          </div>
          <button
            onClick={() => navigate('/important-points')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-brand-700 text-xs font-bold border border-brand-200 hover:bg-brand-50 transition-colors"
          >
            <span>Revise Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Middle Section: Today's Study Plan & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Study Plan (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-brand-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Today's Study Plan</h3>
                <p className="text-xs text-slate-400">Scheduled revision and practice slots</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/study-planner')}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <span>Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slots List */}
          <div className="space-y-3">
            {data?.today_schedule && data.today_schedule.length > 0 ? (
              data.today_schedule.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    task.is_completed
                      ? 'bg-slate-50 border-slate-200/70 opacity-75'
                      : 'bg-white border-slate-200/80 hover:border-brand-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => handleToggleTask(task.id, task.is_completed)}
                      className="text-slate-400 hover:text-brand-600 transition-colors"
                    >
                      {task.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-brand-600" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                          {task.start_time} – {task.end_time}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            task.task_type.includes('Quiz')
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {task.task_type}
                        </span>
                      </div>
                      <h4
                        className={`text-sm font-bold text-slate-900 mt-1 ${
                          task.is_completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.subject}: <span className="font-semibold text-slate-700">{task.topic}</span>
                      </h4>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    {task.task_type.includes('Quiz') ? (
                      <button
                        onClick={() => navigate('/quiz')}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
                      >
                        Start Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/summaries')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Open Notes
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No tasks scheduled for today. Generate a study timetable in Study Planner!
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Exams (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Upcoming Exams</h3>
                  <p className="text-xs text-slate-400">Target milestones & countdown</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {data?.upcoming_exams && data.upcoming_exams.length > 0 ? (
                data.upcoming_exams.map((exam) => (
                  <div key={exam.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 truncate max-w-[150px]">
                        {exam.subject_name}
                      </h4>
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        {exam.days_remaining} {exam.days_remaining === 1 ? 'day' : 'days'} left
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                        <span>Preparation Readiness</span>
                        <span className="text-brand-600 font-bold">{exam.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full transition-all"
                          style={{ width: `${exam.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No upcoming exams listed. Add exam dates in the Study Planner.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/important-points')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>Revise High-Priority Exam Points</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Study Materials */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Recent Materials</h3>
            <p className="text-xs text-slate-400">Uploaded lecture notes, PDFs, and video sessions</p>
          </div>
          <button
            onClick={() => navigate('/materials')}
            className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
          >
            <span>View All Materials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.recent_materials && data.recent_materials.length > 0 ? (
            data.recent_materials.map((mat) => (
              <div
                key={mat.id}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50/40 border border-slate-100 hover:border-brand-200 transition-all card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm">
                      {mat.file_type === 'video' ? (
                        <Video className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{mat.file_type}</span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{mat.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{mat.subject}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{mat.date}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate('/summaries')}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-brand-600 hover:text-white text-slate-700 text-[10px] font-bold border border-slate-200 transition-colors"
                      title="View AI Notes"
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => navigate('/quiz')}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-purple-600 hover:text-white text-purple-700 text-[10px] font-bold border border-slate-200 transition-colors"
                      title="Take Quiz"
                    >
                      Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-6 text-slate-400 text-xs">
              No materials uploaded yet. Click "Upload Material" to start!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
