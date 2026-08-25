import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Play,
  FileText,
  Sparkles,
  Download,
  CheckSquare,
  Clock,
  BookOpen,
  FileCheck,
  Zap,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { SummaryItem, UploadedFileItem } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/Toast';

export const VideoSummarizerPage: React.FC = () => {
  const [videoFiles, setVideoFiles] = useState<UploadedFileItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [currentSummary, setCurrentSummary] = useState<SummaryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const files = await api.getMaterials('video');
      setVideoFiles(files);
      if (files.length > 0) {
        setSelectedVideoId(files[0].id);
        fetchSummaryForVideo(files[0].id);
      } else {
        // Fetch default video summary
        const summaries = await api.getSummaries(undefined, 'video');
        if (summaries.length > 0) {
          setCurrentSummary(summaries[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummaryForVideo = async (fileId: number) => {
    setIsLoading(true);
    try {
      const res = await api.generateSummary({ file_id: fileId, subject: 'Operating Systems' });
      setCurrentSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessSampleLecture = async (topic: string, subject: string) => {
    setIsLoading(true);
    try {
      const res = await api.generateSummary({
        title: `${subject}: ${topic} Lecture Recording`,
        raw_text: `Comprehensive 45-minute lecture covering ${topic} in ${subject}. Detailed analysis of architecture, state diagrams, numerical algorithms, and university exam questions.`,
        subject: subject,
        video_url: `https://education.smartstudy.ai/lectures/${topic.toLowerCase().replace(/ /g, '_')}.mp4`
      });
      setCurrentSummary(res);
      showToast(`Processed "${topic}" lecture video!`, 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!currentSummary) return;
    const blob = new Blob([currentSummary.raw_markdown || currentSummary.overview], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSummary.title.replace(/ /g, '_')}_Summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Summary downloaded as Markdown!', 'success');
  };

  const handleCopy = () => {
    if (!currentSummary) return;
    navigator.clipboard.writeText(currentSummary.raw_markdown || currentSummary.overview);
    setIsCopied(true);
    showToast('Summary copied to clipboard', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Speech-To-Text & NLP Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Video Lecture Summarizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Convert long 1-hour university lectures into 5-minute structured notes, formulas, and practice quizzes.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <Video className="w-4 h-4" />
          <span>Upload New Video</span>
        </button>
      </div>

      {/* Quick Sample Demonstrations */}
      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Select or Process Video Lecture Demo
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleProcessSampleLecture('CPU Scheduling & SJF', 'Operating Systems')}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/70 transition-all"
          >
            🎬 OS: CPU Scheduling & Deadlocks (32 mins)
          </button>
          <button
            onClick={() => handleProcessSampleLecture('Normalization & ACID', 'Database Management Systems')}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-700 text-xs font-bold border border-brand-200/70 transition-all"
          >
            🎬 DBMS: BCNF & Concurrency Control (28 mins)
          </button>
          <button
            onClick={() => handleProcessSampleLecture('TCP 3-Way Handshake & CIDR', 'Computer Networks')}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200/70 transition-all"
          >
            🎬 CN: Subnetting & Routing (35 mins)
          </button>
        </div>
      </div>

      {/* Main Content: Stats & Summary Note */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">Converting Speech to Text & Structuring Notes...</h3>
          <p className="text-xs text-slate-400">Extracting key concepts, formulas, and expected exam definitions.</p>
        </div>
      ) : currentSummary ? (
        <div className="space-y-6">
          {/* Lecture Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Lecture Duration</p>
                <p className="text-sm font-black text-slate-900">32 mins 15s</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Est. Reading Time</p>
                <p className="text-sm font-black text-slate-900">{currentSummary.estimated_reading_time_mins || 5} mins</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Concepts Extracted</p>
                <p className="text-sm font-black text-slate-900">8 Key Topics</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Time Saved</p>
                <p className="text-sm font-black text-emerald-600 font-bold">84% Faster</p>
              </div>
            </div>
          </div>

          {/* Structured Note Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                    {currentSummary.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Auto-Synthesized Lecture Note</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {currentSummary.title}
                </h2>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadSummary}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .MD</span>
                </button>
                <button
                  onClick={() => navigate('/quiz')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Quiz</span>
                </button>
              </div>
            </div>

            {/* Markdown rendered summary */}
            <div className="space-y-6">
              <MarkdownRenderer content={currentSummary.raw_markdown || currentSummary.overview} />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-400 text-sm">
          Select a sample lecture recording above or upload a video file to generate smart notes.
        </div>
      )}
    </div>
  );
};
