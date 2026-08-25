import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Video, Music, File, Trash2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { api } from '../services/api';
import { UploadedFileItem } from '../types';
import { useToast } from '../components/Toast';

export const UploadPage: React.FC = () => {
  const [materials, setMaterials] = useState<UploadedFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const res = await api.getMaterials();
      setMaterials(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteMaterial(id);
      showToast(`Deleted "${name}"`, 'success');
      loadMaterials();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete file', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Upload Study Materials</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Upload PDF textbooks, lecture video recordings, audio notes, or doc files for instant AI summarization and quiz generation.
        </p>
      </div>

      {/* Upload Component */}
      <FileUpload onSuccess={() => loadMaterials()} />

      {/* Uploaded Materials Table */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Your Uploaded Materials ({materials.length})</h3>
            <p className="text-xs text-slate-400">Processed by AI and available for questions, summaries & quizzes</p>
          </div>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No materials uploaded yet. Use the drag & drop area above to upload your first lecture file.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">File Name</th>
                  <th className="pb-3 px-3">Subject</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Size</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100">
                          {m.file_type === 'video' ? (
                            <Video className="w-4 h-4 text-indigo-600" />
                          ) : m.file_type === 'audio' ? (
                            <Music className="w-4 h-4 text-amber-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-rose-600" />
                          )}
                        </div>
                        <span className="font-bold text-slate-900 max-w-[200px] sm:max-w-xs truncate">
                          {m.name || m.original_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{m.subject}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        {m.file_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {m.file_size ? `${(m.file_size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate('/summaries')}
                          className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px] transition-colors"
                        >
                          Notes
                        </button>
                        <button
                          onClick={() => navigate('/quiz')}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] transition-colors"
                        >
                          Quiz
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.name || m.original_name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
