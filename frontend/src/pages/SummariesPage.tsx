import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  CheckSquare,
  Clock,
  BookOpen,
  Filter,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { SummaryItem } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/Toast';

export const SummariesPage: React.FC = () => {
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<SummaryItem | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const subjects = ['All', 'Database Management Systems', 'Operating Systems', 'Computer Networks', 'Artificial Intelligence'];

  useEffect(() => {
    fetchSummaries();
  }, [selectedSubject]);

  const fetchSummaries = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSummaries(selectedSubject !== 'All' ? selectedSubject : undefined);
      setSummaries(res);
      if (res.length > 0) {
        setSelectedSummary(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!selectedSummary) return;
    navigator.clipboard.writeText(selectedSummary.raw_markdown || selectedSummary.overview);
    setIsCopied(true);
    showToast('Summary copied to clipboard', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedSummary) return;
    const blob = new Blob([selectedSummary.raw_markdown || selectedSummary.overview], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSummary.title.replace(/ /g, '_')}_Notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Notes downloaded as Markdown file!', 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              AI Smart Notes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Summaries & Comprehensive Revision Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Structured study notes containing key concepts, formal definitions, formulas, and examination takeaways.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span>Summarize New Material</span>
        </button>
      </div>

      {/* Main Layout: Left Summaries List, Right Active Document */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary Cards List */}
        <div className="space-y-4">
          {/* Subject Filter */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Filter Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {summaries.map((s) => {
              const isSelected = selectedSummary?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSummary(s)}
                  className={`w-full text-left p-4 rounded-3xl border transition-all ${
                    isSelected
                      ? 'bg-brand-50/70 border-brand-400 shadow-sm ring-1 ring-brand-400/30'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      {s.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {s.estimated_reading_time_mins || 5} mins
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                    {s.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {s.overview}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Summary Content */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          {selectedSummary ? (
            <div className="space-y-6">
              {/* Note Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                      {selectedSummary.subject}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ⏱️ {selectedSummary.estimated_reading_time_mins || 5} Mins Read
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {selectedSummary.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .MD</span>
                  </button>
                  <button
                    onClick={() => navigate('/quiz')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-105"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quiz Me</span>
                  </button>
                </div>
              </div>

              {/* Formatted Markdown */}
              <div>
                <MarkdownRenderer content={selectedSummary.raw_markdown || selectedSummary.overview} />
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-sm">
              No summary selected. Select a subject note on the left!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
