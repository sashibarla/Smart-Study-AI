import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  UploadCloud,
  FileText,
  Video,
  Flame,
  CheckSquare,
  Calendar,
  MessageSquareQuote,
  BarChart3,
  FolderArchive,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assistant', label: 'AI Study Assistant', icon: Bot, badge: 'AI' },
    { to: '/upload', label: 'Upload Material', icon: UploadCloud },
    { to: '/summaries', label: 'Summaries & Notes', icon: FileText },
    { to: '/video-summarizer', label: 'Video Summarizer', icon: Video, badge: 'Smart' },
    { to: '/important-points', label: 'Important Points', icon: Flame, badge: 'Exam' },
    { to: '/quiz', label: 'AI Quiz Generator', icon: CheckSquare },
    { to: '/study-planner', label: 'Study Planner', icon: Calendar },
    { to: '/pdf-chat', label: 'Chat with PDF', icon: MessageSquareQuote },
    { to: '/progress', label: 'Progress & Analytics', icon: BarChart3 },
    { to: '/materials', label: 'Materials Library', icon: FolderArchive },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header for Sidebar */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">Smart Study AI</h2>
            <p className="text-[10px] text-slate-400 font-medium">CSE Companion v1.0</p>
          </div>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Core Modules</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/70 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        item.badge === 'AI'
                          ? 'bg-purple-100 text-purple-700'
                          : item.badge === 'Exam'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-brand-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-600" />}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Support / Pro Tip Banner */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-brand-50 via-indigo-50/50 to-purple-50 border border-brand-100 text-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-brand-500 text-white text-[10px] font-bold">PRO TIP</span>
            <span className="text-[11px] font-bold text-slate-800">Exam Mode</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Generate quizzes directly from uploaded lecture PDFs for 2x faster recall!
          </p>
        </div>
      </aside>
    </>
  );
};
