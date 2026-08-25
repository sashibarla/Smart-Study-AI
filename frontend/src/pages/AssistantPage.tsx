import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Paperclip,
  Trash2,
  Copy,
  RotateCcw,
  Bot,
  User,
  BookOpen,
  Check,
  Loader2,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessageItem, UploadedFileItem } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/Toast';

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | undefined>(undefined);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const suggestedPrompts = [
    'Explain Normalization & BCNF simply',
    'Give me important exam questions for DBMS',
    'Explain CPU Scheduling algorithms like I am a beginner',
    'What is the TCP 3-Way Handshake mechanism?',
    'Summarize ACID properties and provide examples'
  ];

  useEffect(() => {
    loadChatHistory();
    loadFiles();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatHistory('default');
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Welcome initial greeting
        setMessages([
          {
            role: 'assistant',
            content: `### Hello! I am your Smart Study AI Assistant 🎓\n\nI can help you understand complex engineering concepts, summarize lectures, formulate exam answers, and extract high-yield formulas.\n\n*Choose a suggested question below or ask anything about your courses!*`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadFiles = async () => {
    try {
      const res = await api.getMaterials();
      setFiles(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessageItem = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage({
        message: text,
        file_id: selectedFileId,
        session_id: 'default'
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      console.error(err);
      showToast('Error communicating with AI Assistant', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearChat('default');
      setMessages([
        {
          role: 'assistant',
          content: 'Chat history cleared. How can I assist you with your studies today?'
        }
      ]);
      showToast('Conversation cleared', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    showToast('Answer copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-50">
      {/* Left Sidebar: Context & Topics Drawer */}
      <div className="w-full lg:w-72 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Study Context</span>
            </div>
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Attach Study Material */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Active Context Material
            </label>
            <select
              value={selectedFileId || ''}
              onChange={(e) => setSelectedFileId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Subjects (General Knowledge)</option>
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.original_name.length > 28 ? f.original_name.slice(0, 28) + '...' : f.original_name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Prompt Chips */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Suggested Prompts
            </label>
            <div className="space-y-1.5">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50/70 border border-slate-100 hover:border-brand-200 text-slate-700 text-xs font-medium transition-all group flex items-center justify-between"
                >
                  <span className="truncate">{prompt}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Model Badge */}
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-50 to-indigo-50 border border-brand-100 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-brand-700 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Provider AI Engine</span>
          </div>
          Gemini 1.5 Flash / OpenAI & Built-in CSE Academic NLP Engine.
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50">
        {/* Chat Messages Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`group relative max-w-[85%] sm:max-w-2xl rounded-3xl p-4 sm:p-5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none shadow-md shadow-brand-500/20'
                    : 'bg-white text-slate-900 border border-slate-100 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <>
                    <MarkdownRenderer content={msg.content} />
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyMessage(msg.content, idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs flex items-center gap-1"
                        title="Copy Answer"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[11px]">{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span>AI Tutor is reasoning and synthesizing response...</span>
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
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask anything about your study material, exam questions, or formulas..."
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all pr-10"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                  inputText.trim() && !isLoading
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleRegenerate}
              title="Regenerate last response"
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors hidden sm:flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
