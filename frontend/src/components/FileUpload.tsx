import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, Film, Music, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './Toast';

interface FileUploadProps {
  onSuccess?: (fileData: any) => void;
  defaultSubject?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onSuccess, defaultSubject = 'Database Management Systems' }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState(defaultSubject);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'analyzing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [uploadedResult, setUploadedResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const subjectsList = [
    'Database Management Systems',
    'Operating Systems',
    'Computer Networks',
    'Artificial Intelligence',
    'Machine Learning',
    'Data Structures & Algorithms',
    'Software Engineering',
    'Cyber Security & Cryptography',
    'General Studies'
  ];

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const validExts = ['.pdf', '.mp4', '.avi', '.mov', '.mp3', '.wav', '.docx', '.txt'];
    if (!validExts.includes(ext)) {
      showToast(`Unsupported file type (${ext}). Please select PDF, MP4, MP3, WAV, DOCX, or TXT.`, 'error');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      showToast('File exceeds 100MB limit.', 'error');
      return;
    }
    setSelectedFile(file);
    setStatus('idle');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Please select a study material file first.', 'error');
      return;
    }

    setStatus('uploading');
    setProgress(25);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('subject', subject);

    try {
      setTimeout(() => {
        setStatus('processing');
        setProgress(60);
      }, 600);

      setTimeout(() => {
        setStatus('analyzing');
        setProgress(85);
      }, 1200);

      const result = await api.uploadMaterial(formData);
      setProgress(100);
      setStatus('completed');
      setUploadedResult(result);
      showToast(`Successfully analyzed '${selectedFile.name}'!`, 'success');
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error('[Upload error]', error);
      setStatus('failed');
      showToast(error.response?.data?.detail || 'Failed to upload and analyze file', 'error');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-rose-500" />;
    if (['mp4', 'avi', 'mov'].includes(ext || '')) return <Film className="w-8 h-8 text-indigo-500" />;
    if (['mp3', 'wav'].includes(ext || '')) return <Music className="w-8 h-8 text-amber-500" />;
    return <File className="w-8 h-8 text-brand-500" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
      {/* Subject Selector */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Select Subject Domain
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        >
          {subjectsList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-brand-500 bg-brand-50/50 scale-[0.99]'
            : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.mp4,.avi,.mov,.mp3,.wav,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-slate-100 rounded-2xl">
              {getFileIcon(selectedFile.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to change
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Drag & drop your study material here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports <strong className="text-slate-600">PDF, MP4, MP3, WAV, DOCX, TXT</strong> (Up to 100MB)
              </p>
            </div>
            <button
              type="button"
              className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Browse Files
            </button>
          </div>
        )}
      </div>

      {/* Processing Status & Progress Bar */}
      {status !== 'idle' && (
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : status === 'failed' ? (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              ) : (
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
              )}
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {status === 'uploading' && 'Uploading Material...'}
                {status === 'processing' && 'Extracting Audio & Content...'}
                {status === 'analyzing' && 'AI Structuring Summaries & Exam Points...'}
                {status === 'completed' && 'Analysis Complete!'}
                {status === 'failed' && 'Upload Failed'}
              </span>
            </div>
            <span className="text-xs font-bold text-brand-600">{progress}%</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                status === 'completed' ? 'bg-emerald-500' : status === 'failed' ? 'bg-rose-500' : 'bg-brand-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {status === 'completed' ? (
          <div className="flex flex-wrap gap-2.5 w-full">
            <button
              onClick={() => navigate('/summaries')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>View Generated Summary</span>
            </button>
            <button
              onClick={() => navigate('/quiz')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Take Quiz from this Material</span>
            </button>
            <button
              onClick={() => navigate('/pdf-chat')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
            >
              <span>Chat with Doc</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleUpload}
            disabled={!selectedFile || status === 'uploading' || status === 'processing' || status === 'analyzing'}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              !selectedFile || status !== 'idle'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/25 hover:scale-[1.01]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload & Run AI Analysis</span>
          </button>
        )}
      </div>
    </div>
  );
};
