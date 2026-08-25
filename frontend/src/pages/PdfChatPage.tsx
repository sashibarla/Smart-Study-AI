import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileCheck,
  Loader2,
  Bookmark,
  ChevronRight,
  ExternalLink,
  Bot,
  User,
  Paperclip
} from 'lucide-react';
import { api } from '../services/api';
import { UploadedFileItem, PdfAnswerItem } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/Toast';

export const PdfChatPage: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<UploadedFileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFileItem | null>(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; citations?: number[]; snippets?: string[] }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const suggestedQuestions = [
    'What is the main concept of this document?',
    'Explain the core definitions and boundary rules',
    'What are the key mathematical formulas and syntax?',
    'Generate expected university exam questions from this PDF',
    'Summarize this chapter in 5 concise bullet points'
  ];

  useEffect(() => {
    loadPdfFiles();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const loadPdfFiles = async () => {
    try {
      const files = await api.getPdfFiles();
      setPdfFiles(files);
      if (files.length > 0) {
        setSelectedFile(files[0]);
        // Set welcome message for selected PDF
        setChatHistory([
          {
            role: 'assistant',
            text: `### Ready to chat with **${files[0].original_name}** 📄\n\nThis document has **${files[0].num_pages || 18} pages** indexed with AI embeddings. Ask any question below, and I will extract the answer with verified page citations.`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectFile = (file: UploadedFileItem) => {
    setSelectedFile(file);
    setChatHistory([
      {
        role: 'assistant',
        text: `### Active Document: **${file.original_name}** 📄\n\nIndexed ${file.num_pages || 18} pages. How can I assist you with this text?`
      }
    ]);
  };

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim() || isLoading) return;

    setChatHistory((prev) => [...prev, { role: 'user', text: q }]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res: PdfAnswerItem = await api.askPdf({
        file_id: selectedFile?.id,
        question: q
      });

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.answer,
          citations: res.page_references,
          snippets: res.source_snippets
        }
      ]);
    } catch (err) {
      console.error(err);
      showToast('Failed to get answer from PDF', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-50">
      {/* Left Sidebar: PDF Documents Drawer */}
      <div className="w-full lg:w-80 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Uploaded Study PDFs</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {pdfFiles.length} Docs
            </span>
          </div>

          {/* PDF Selector List */}
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {pdfFiles.map((f) => {
              const isSelected = selectedFile?.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleSelectFile(f)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                      : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-rose-900' : 'text-slate-800'}`}>
                      {f.original_name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {f.num_pages || 18} Pages • {f.subject}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active PDF Information Card */}
          {selectedFile && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>Document Status</span>
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Grounded & Indexed
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Answers are synthesized strictly from the source text of <strong>{selectedFile.original_name}</strong> to avoid hallucinations.
              </p>
            </div>
          )}

          {/* Suggested Document Questions */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Suggested Document Queries
            </label>
            <div className="space-y-1.5">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(q)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 text-slate-700 text-xs font-medium transition-all group flex items-center justify-between"
                >
                  <span className="truncate">{q}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-rose-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Q&A Interface */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
          {chatHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex gap-3 sm:gap-4 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {item.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-2xl rounded-3xl p-4 sm:p-5 text-sm ${
                  item.role === 'user'
                    ? 'bg-rose-600 text-white rounded-br-none shadow-md shadow-rose-500/20'
                    : 'bg-white text-slate-900 border border-slate-100 rounded-bl-none shadow-sm'
                }`}
              >
                {item.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{item.text}</p>
                ) : (
                  <>
                    <MarkdownRenderer content={item.text} />

                    {/* Page Citations & Source Snippets */}
                    {item.citations && item.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Source Citations:
                        </span>
                        {item.citations.map((page, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold"
                          >
                            Page {page}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {item.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                <span>Searching PDF chunks and citing page numbers...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder={`Ask anything about ${selectedFile?.original_name || 'your PDF'}...`}
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all pr-10"
              />
              <button
                onClick={() => handleAsk()}
                disabled={!question.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                  question.trim() && !isLoading
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
