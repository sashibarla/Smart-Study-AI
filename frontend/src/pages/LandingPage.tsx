import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Video,
  FileCheck,
  Calendar,
  CheckCircle,
  Brain,
  Shield,
  Layers,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Top Floating Glass Navigation */}
      <nav className="sticky top-0 z-50 glass-nav px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Smart Study</span>
              <span className="ml-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/20 via-indigo-400/20 to-purple-400/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          <span>Next-Generation AI Educational Companion</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Study Smarter. Revise Faster. <br />
          <span className="ai-gradient-text">Score Better.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Turn your lectures and study materials into concise smart notes, interactive quizzes, grounded answers, and personalized exam revision timetables.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-105 cursor-pointer"
          >
            <span>Start Studying Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('features-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            Explore Features
          </button>
        </div>

        {/* Hero Interactive Dashboard Visual Preview */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-3xl p-3 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200/50 shadow-2xl border border-white">
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-inner overflow-hidden text-left">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Alex Chen's Study Dashboard</h3>
                  <p className="text-xs text-slate-400">Database Systems & Operating Systems Exam Prep</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  🔥 7 Days Streak
                </span>
              </div>
            </div>

            {/* Dashboard Sample Mini Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400">AI Summary</span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">DBMS: Normalization (1NF to BCNF)</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">Decomposition eliminates redundancy and prevents insertion, deletion & update anomalies.</p>
                <div className="mt-3 flex items-center gap-2 text-blue-600 text-xs font-bold">
                  <span>Read 6 mins summary</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <span className="text-[11px] font-bold uppercase text-purple-600">Practice Quiz</span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">CPU Scheduling & Banker's Algorithm</h4>
                <p className="text-xs text-slate-500 mt-1">5 Questions • 80% Average Mastery</p>
                <div className="mt-3 flex items-center gap-2 text-purple-700 text-xs font-bold">
                  <span>Take practice test</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                <span className="text-[11px] font-bold uppercase text-amber-700">Today's Schedule</span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">04:00 PM — 05:00 PM</h4>
                <p className="text-xs text-slate-500 mt-1">Computer Networks: Subnetting & CIDR</p>
                <div className="mt-3 flex items-center gap-2 text-amber-800 text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>On Track for Final Exam</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section id="features-section" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Intelligent Modules
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">
            Everything you need to master your engineering curriculum
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            Engineered specifically to solve classroom lecture gaps, exam anxiety, and unorganized study materials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm card-hover">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Video Lecture Summarizer</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Upload long lecture recordings. Our pipeline extracts speech, generates structured notes, definitions, formulas, and key takeaways in minutes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm card-hover">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Interactive Quiz Generator</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Auto-generate Multiple Choice, True/False, Fill in the Blanks, and Short Answer tests with detailed feedback and topic breakdown.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm card-hover">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">High-Yield Exam Points</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Instantly extract High Priority Topics (🔥), Definitions (⭐), Formulas (🧮), and Expected Semester Questions (❓).
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm card-hover">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Personalized Study Planner</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Enter your subjects and exam dates. Our scheduling algorithm balances daily study hours with spaced repetition and practice exams.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm card-hover">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Chat with PDF & Citations</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Ask any question about your textbook or slides and get instant answers strictly grounded in the document with page references.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm card-hover">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Learning Analytics</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Track your weekly study hours, quiz mastery trends, study streak, and receive intelligent personalized study suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900">Smart Study AI Assistant</span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Smart Study AI. Designed for engineering students & competitive exam aspirants.
          </p>
        </div>
      </footer>
    </div>
  );
};
