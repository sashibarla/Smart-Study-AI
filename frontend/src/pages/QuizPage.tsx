import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Sparkles,
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  BookOpen,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { QuizItem, QuizResultItem, UploadedFileItem } from '../types';
import { useToast } from '../components/Toast';

export const QuizPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResultItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [files, setFiles] = useState<UploadedFileItem[]>([]);

  // Generation form state
  const [genSubject, setGenSubject] = useState('Database Management Systems');
  const [genTopic, setGenTopic] = useState('Normalization & Transactions');
  const [genDifficulty, setGenDifficulty] = useState('Medium');
  const [genQuizType, setGenQuizType] = useState('Mixed');
  const [genNumQuestions, setGenNumQuestions] = useState(5);
  const [genFileId, setGenFileId] = useState<number | undefined>(undefined);

  const { showToast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [quizzesList, filesList] = await Promise.all([
        api.getQuizzes(),
        api.getMaterials()
      ]);
      setQuizzes(quizzesList);
      setFiles(filesList);
      if (quizzesList.length > 0) {
        setActiveQuiz(quizzesList[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateNewQuiz = async () => {
    setIsGenerating(true);
    try {
      const newQuiz = await api.generateQuiz({
        subject: genSubject,
        topic: genTopic,
        difficulty: genDifficulty,
        quiz_type: genQuizType,
        num_questions: genNumQuestions,
        file_id: genFileId
      });
      setActiveQuiz(newQuiz);
      setSelectedAnswers({});
      setQuizResult(null);
      setCurrentQuestionIndex(0);
      showToast(`Generated ${newQuiz.questions.length}-question quiz on ${newQuiz.subject}!`, 'success');
      loadInitialData();
    } catch (err) {
      console.error(err);
      showToast('Failed to generate quiz', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: number, answerText: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [String(questionId)]: answerText
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const result = await api.submitQuiz({
        quiz_id: activeQuiz.id,
        answers: selectedAnswers,
        time_spent_seconds: 90
      });
      setQuizResult(result);
      if (result.percentage >= 80) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      showToast(`Quiz completed! Score: ${result.score}/${result.total_questions}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error submitting quiz', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
    setCurrentQuestionIndex(0);
  };

  const currentQ = activeQuiz?.questions[currentQuestionIndex];
  const totalQ = activeQuiz?.questions.length || 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Self-Assessment & Mastery
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          AI Quiz Generator & Practice Test
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Generate custom tests (MCQs, True/False, Fill in blanks, Short Answer) directly from your courses.
        </p>
      </div>

      {/* Quiz Configurator Accordion / Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Configure & Generate New Quiz</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Subject</label>
            <select
              value={genSubject}
              onChange={(e) => setGenSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="Database Management Systems">Database Systems (DBMS)</option>
              <option value="Operating Systems">Operating Systems (OS)</option>
              <option value="Computer Networks">Computer Networks (CN)</option>
              <option value="Artificial Intelligence">AI & Machine Learning</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Question Type</label>
            <select
              value={genQuizType}
              onChange={(e) => setGenQuizType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="Mixed">Mixed (All 4 Types)</option>
              <option value="MCQ">Multiple Choice (MCQ)</option>
              <option value="TrueFalse">True / False</option>
              <option value="FillBlank">Fill in the Blanks</option>
              <option value="ShortAnswer">Short Answer Conceptual</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Difficulty</label>
            <select
              value={genDifficulty}
              onChange={(e) => setGenDifficulty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="Easy">Easy (Fundamentals)</option>
              <option value="Medium">Medium (Standard Exam)</option>
              <option value="Hard">Hard (Deep Analytical)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Questions Count</label>
            <select
              value={genNumQuestions}
              onChange={(e) => setGenNumQuestions(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value={5}>5 Questions (Quick Test)</option>
              <option value={10}>10 Questions (Standard)</option>
              <option value={15}>15 Questions (Full Mock)</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end">
          <button
            onClick={handleGenerateNewQuiz}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all hover:scale-105"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate Custom Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Quiz Runner or Result View */}
      {quizResult ? (
        /* Quiz Result View */
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/25">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Quiz Completed!</h2>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="text-4xl font-black text-brand-600">
                {quizResult.score} / {quizResult.total_questions}
              </span>
              <span className="text-xl font-bold text-slate-400">({quizResult.percentage}%)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium mt-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              💡 {quizResult.ai_feedback}
            </p>
          </div>

          {/* Detailed Question Explanations Breakdown */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">
              Detailed Question Analysis & Explanations
            </h3>
            {quizResult.answers_breakdown.map((item, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border ${
                  item.is_correct ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {item.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Question {i + 1} • {item.topic}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5">{item.question}</h4>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.is_correct ? 'Correct (+1)' : 'Incorrect'}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1 pl-7">
                  <p className="text-slate-600">
                    <strong>Your Answer:</strong> <span className={item.is_correct ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{item.selected_answer || '(No answer provided)'}</span>
                  </p>
                  {!item.is_correct && (
                    <p className="text-slate-600">
                      <strong>Correct Answer:</strong> <span className="text-emerald-700 font-bold">{item.correct_answer}</span>
                    </p>
                  )}
                  <p className="text-slate-600 pt-1.5 border-t border-slate-200/60 mt-2">
                    <strong>Explanation:</strong> {item.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleRetryQuiz}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry This Quiz</span>
            </button>
            <button
              onClick={handleGenerateNewQuiz}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Another Test</span>
            </button>
          </div>
        </div>
      ) : activeQuiz && currentQ ? (
        /* Active Quiz Taking Interface */
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Progress Header */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>Question {currentQuestionIndex + 1} of {totalQ}</span>
              <span className="text-purple-600">{answeredCount}/{totalQ} Answered</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQ) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Box */}
          <div className="py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {currentQ.type.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-bold text-slate-400">• {currentQ.topic || activeQuiz.subject}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options && currentQ.options.length > 0 ? (
              currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[String(currentQ.id)] === opt;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, opt)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={selectedAnswers[String(currentQ.id)] || ''}
                  onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentQuestionIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-105"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all hover:scale-105"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-400 text-sm">
          No quiz selected. Click "Generate Custom Quiz" above to begin.
        </div>
      )}
    </div>
  );
};
