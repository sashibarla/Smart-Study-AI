import axios from 'axios';
import {
  AuthResponse,
  User,
  UploadedFileItem,
  SummaryItem,
  ImportantPointItem,
  QuizItem,
  QuizResultItem,
  StudyScheduleItem,
  DashboardData,
  ProgressData,
  ChatMessageItem,
  PdfAnswerItem
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart_study_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  register: async (data: { email: string; full_name: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await apiClient.put<User>('/auth/update', data);
    return res.data;
  },

  // Upload
  uploadMaterial: async (formData: FormData): Promise<any> => {
    const res = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Summaries
  getSummaries: async (subject?: string, sourceType?: string): Promise<SummaryItem[]> => {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (sourceType) params.append('source_type', sourceType);
    const res = await apiClient.get<SummaryItem[]>(`/summaries?${params.toString()}`);
    return res.data;
  },

  getSummaryById: async (id: number): Promise<SummaryItem> => {
    const res = await apiClient.get<SummaryItem>(`/summaries/${id}`);
    return res.data;
  },

  generateSummary: async (data: { file_id?: number; raw_text?: string; title?: string; subject?: string; video_url?: string }): Promise<SummaryItem> => {
    const res = await apiClient.post<SummaryItem>('/summaries/generate', data);
    return res.data;
  },

  // Important Exam Points
  getImportantPoints: async (subject?: string, category?: string, priority?: string, inRevision?: boolean): Promise<ImportantPointItem[]> => {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);
    if (inRevision !== undefined) params.append('in_revision', String(inRevision));
    const res = await apiClient.get<ImportantPointItem[]>(`/important-points?${params.toString()}`);
    return res.data;
  },

  togglePointStatus: async (pointId: number, statusData: { is_completed?: boolean; in_revision_queue?: boolean }): Promise<ImportantPointItem> => {
    const res = await apiClient.patch<ImportantPointItem>(`/important-points/${pointId}/toggle`, statusData);
    return res.data;
  },

  // Quiz
  generateQuiz: async (data: { file_id?: number; subject?: string; topic?: string; quiz_type?: string; difficulty?: string; num_questions?: number; custom_content?: string }): Promise<QuizItem> => {
    const res = await apiClient.post<QuizItem>('/quiz/generate', data);
    return res.data;
  },

  getQuizzes: async (): Promise<QuizItem[]> => {
    const res = await apiClient.get<QuizItem[]>('/quiz/list');
    return res.data;
  },

  getQuizById: async (id: number): Promise<QuizItem> => {
    const res = await apiClient.get<QuizItem>(`/quiz/${id}`);
    return res.data;
  },

  submitQuiz: async (data: { quiz_id: number; answers: Record<string, string>; time_spent_seconds?: number }): Promise<QuizResultItem> => {
    const res = await apiClient.post<QuizResultItem>('/quiz/submit', data);
    return res.data;
  },

  // Study Planner
  getCurrentStudyPlan: async (): Promise<StudyScheduleItem> => {
    const res = await apiClient.get<StudyScheduleItem>('/study-plan/current');
    return res.data;
  },

  generateStudyPlan: async (data: { title?: string; daily_available_hours?: number; preferred_study_time?: string; subjects: Array<{ subject_name: string; exam_date: string; difficulty: string }> }): Promise<StudyScheduleItem> => {
    const res = await apiClient.post<StudyScheduleItem>('/study-plan/generate', data);
    return res.data;
  },

  toggleScheduleTask: async (taskId: string, isCompleted: boolean): Promise<any> => {
    const res = await apiClient.post('/study-plan/task/toggle', { task_id: taskId, is_completed: isCompleted });
    return res.data;
  },

  // Chat with PDF
  getPdfFiles: async (): Promise<UploadedFileItem[]> => {
    const res = await apiClient.get<UploadedFileItem[]>('/pdf/files');
    return res.data;
  },

  askPdf: async (data: { file_id?: number; question: string }): Promise<PdfAnswerItem> => {
    const res = await apiClient.post<PdfAnswerItem>('/pdf/ask', data);
    return res.data;
  },

  // AI Assistant Chat
  getChatHistory: async (sessionId: string = 'default'): Promise<ChatMessageItem[]> => {
    const res = await apiClient.get<ChatMessageItem[]>(`/chat/history?session_id=${sessionId}`);
    return res.data;
  },

  sendChatMessage: async (data: { message: string; session_id?: string; file_id?: number }): Promise<{ reply: string; session_id: string }> => {
    const res = await apiClient.post<{ reply: string; session_id: string }>('/chat/message', data);
    return res.data;
  },

  clearChat: async (sessionId: string = 'default'): Promise<any> => {
    const res = await apiClient.delete(`/chat/clear?session_id=${sessionId}`);
    return res.data;
  },

  // Dashboard & Progress
  getDashboardData: async (): Promise<DashboardData> => {
    const res = await apiClient.get<DashboardData>('/dashboard');
    return res.data;
  },

  getProgressData: async (): Promise<ProgressData> => {
    const res = await apiClient.get<ProgressData>('/progress');
    return res.data;
  },

  // Materials Library
  getMaterials: async (fileType?: string, subject?: string, search?: string): Promise<UploadedFileItem[]> => {
    const params = new URLSearchParams();
    if (fileType) params.append('file_type', fileType);
    if (subject) params.append('subject', subject);
    if (search) params.append('search', search);
    const res = await apiClient.get<UploadedFileItem[]>(`/materials?${params.toString()}`);
    return res.data;
  },

  deleteMaterial: async (fileId: number): Promise<any> => {
    const res = await apiClient.delete(`/materials/${fileId}`);
    return res.data;
  }
};
