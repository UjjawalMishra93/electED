// ─── User Types ──────────────────────────────────────────────────
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  fontSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
  language: 'en' | 'es';
  notificationsEnabled: boolean;
}

// ─── Chat Types ──────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  isStreaming?: boolean;
}

export interface Source {
  label: string;
  url?: string;
}

export interface ChatSession {
  messages: ChatMessage[];
  sessionId: string;
}

// ─── Election Timeline Types ─────────────────────────────────────
export interface TimelineStage {
  id: string;
  name: string;
  slug: string;
  dateRange: string;
  startDate: Date;
  endDate: Date;
  description: string;
  keyActors: string[];
  citizenActions: string[];
  icon: string;
  isActive: boolean;
  isCompleted: boolean;
  order: number;
}

// ─── Voter Registration Types ────────────────────────────────────
export interface StateData {
  stateCode: string;
  stateName: string;
  registrationDeadline: string;
  onlineRegistration: boolean;
  sameDayRegistration: boolean;
  idRequirements: string[];
  eligibilityAge: number;
  registrationUrl: string;
  verificationUrl: string;
  earlyVotingStart: string;
  earlyVotingEnd: string;
}

// ─── Quiz Types ──────────────────────────────────────────────────
export type QuizCategory =
  | 'voting-process'
  | 'electoral-system'
  | 'rights-responsibilities'
  | 'election-history'
  | 'how-government-works';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  category: QuizCategory;
  score: number;
  totalQuestions: number;
  answeredAt: Date;
  timeSpent: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
  condition: string;
}

// ─── Election Facts (RAG) ─────────────────────────────────────────
export interface ElectionFact {
  id: string;
  topic: string;
  content: string;
  source: string;
  sourceUrl: string;
  lastUpdated: Date;
  tags: string[];
}

// ─── Analytics Types ─────────────────────────────────────────────
export interface AnalyticsEvent {
  eventType: string;
  sessionId: string;
  timestamp: Date;
  metadata: Record<string, string | number | boolean>;
}

// ─── API Response Types ───────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface ChatApiResponse {
  message: string;
  sources: Source[];
  sessionId: string;
}

// ─── App Settings ─────────────────────────────────────────────────
export type Theme = 'default' | 'high-contrast' | 'dark';
export type FontSize = 'normal' | 'large' | 'xl';
export type Language = 'en' | 'es';
