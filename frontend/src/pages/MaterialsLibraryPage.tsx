import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderArchive,
  Search,
  FileText,
  Video,
  Music,
  Trash2,
  Sparkles,
  CheckSquare,
  MessageSquareQuote,
  Filter,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { UploadedFileItem } from '../types';
import { useToast } from '../components/Toast';

export const MaterialsLibraryPage: React.FC = () => {
  const [materials, setMaterials] = useState<UploadedFileItem[]>([]);
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const subjects = ['All', 'Database Management Systems', 'Operating Systems', 'Computer Networks', 'Artificial Intelligence'];

  const typeFilters = [
    { id: 'All', label: 'All Files' },
    { id: 'pdf', label: '📄 PDFs & Books' },
    { id: 'video', label: '🎥 Video Lectures' },
    { id: 'audio', label: '🎧 Audio Sessions' },
  ];

  useEffect(() => {
    fetchMaterials();
  }, [filterType, selectedSubject, searchQuery]);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMaterials(
        filterType !== 'All' ? filterType : undefined,
        selectedSubject !== 'All' ? selectedSubject : undefined,
        searchQuery || undefined
      );
      setMaterials(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}" from your library?`)) return;
    try {
      await api.deleteMaterial(id);
      showToast(`Deleted "${name}"`, 'success');
      fetchMaterials();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete material', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Knowledge Repository
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Materials Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Search, review AI summaries, take quizzes, and chat with all your uploaded curriculum materials.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your study materials..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {typeFilters.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === t.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-400 text-sm">
          No study materials found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-brand-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0">
                    {mat.file_type === 'video' ? (
                      <Video className="w-6 h-6 text-indigo-600" />
                    ) : mat.file_type === 'audio' ? (
                      <Music className="w-6 h-6 text-amber-600" />
                    ) : (
                      <FileText className="w-6 h-6 text-rose-600" />
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(mat.id, mat.name || mat.original_name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                  {mat.subject}
                </span>

                <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-2 leading-snug">
                  {mat.name || mat.original_name}
                </h3>

                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  {mat.file_type.toUpperCase()} •{' '}
                  {mat.file_size ? `${(mat.file_size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB'}
                  {mat.num_pages ? ` • ${mat.num_pages} Pages` : ''}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate('/summaries')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-bold transition-colors"
                >
                  Notes
                </button>
                <button
                  onClick={() => navigate('/quiz')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
                >
                  Quiz
                </button>
                {mat.file_type === 'pdf' && (
                  <button
                    onClick={() => navigate('/pdf-chat')}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                  >
                    Ask PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
