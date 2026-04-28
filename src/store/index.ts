import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, User, UserPreferences, Theme, FontSize, Language } from '@/types';

// ─── App Settings Store ──────────────────────────────────────────
interface AppSettingsStore {
  theme: Theme;
  fontSize: FontSize;
  language: Language;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setLanguage: (lang: Language) => void;
}

export const useAppSettings = create<AppSettingsStore>()(
  persist(
    (set) => ({
      theme: 'default',
      fontSize: 'normal',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'elected-settings' }
  )
);

// ─── Auth Store ──────────────────────────────────────────────────
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// ─── Chat Store ──────────────────────────────────────────────────
interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  sessionId: string;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearMessages: () => void;
}

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  sessionId: generateSessionId(),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last && last.role === 'assistant') {
        messages[messages.length - 1] = { ...last, content, isStreaming: false };
      }
      return { messages };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  clearMessages: () => set({ messages: [], sessionId: generateSessionId() }),
}));

// ─── Quiz Store ──────────────────────────────────────────────────
import type { QuizQuestion, QuizResult, QuizCategory, Badge } from '@/types';

interface QuizStore {
  currentCategory: QuizCategory | null;
  currentQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  score: number;
  results: QuizResult[];
  badges: Badge[];
  isCompleted: boolean;
  setCategory: (category: QuizCategory) => void;
  setQuestions: (questions: QuizQuestion[]) => void;
  selectAnswer: (answerIndex: number) => void;
  nextQuestion: () => void;
  completeQuiz: (result: QuizResult) => void;
  resetQuiz: () => void;
  awardBadge: (badge: Badge) => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      currentCategory: null,
      currentQuestions: [],
      currentQuestionIndex: 0,
      selectedAnswer: null,
      score: 0,
      results: [],
      badges: [],
      isCompleted: false,
      setCategory: (currentCategory) => set({ currentCategory }),
      setQuestions: (currentQuestions) =>
        set({ currentQuestions, currentQuestionIndex: 0, score: 0, selectedAnswer: null, isCompleted: false }),
      selectAnswer: (selectedAnswer) => set({ selectedAnswer }),
      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
          selectedAnswer: null,
        })),
      completeQuiz: (result) =>
        set((state) => ({ results: [...state.results, result], isCompleted: true })),
      resetQuiz: () =>
        set({ currentQuestions: [], currentQuestionIndex: 0, selectedAnswer: null, score: 0, isCompleted: false }),
      awardBadge: (badge) =>
        set((state) => {
          const alreadyHas = state.badges.some((b) => b.id === badge.id);
          if (alreadyHas) return state;
          return { badges: [...state.badges, { ...badge, earnedAt: new Date() }] };
        }),
    }),
    { name: 'elected-quiz', partialize: (state) => ({ results: state.results, badges: state.badges }) }
  )
);

// ─── User Preferences Store ──────────────────────────────────────
interface PreferencesStore extends UserPreferences {
  notificationsEnabled: boolean;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      fontSize: 'normal',
      highContrast: false,
      language: 'en',
      notificationsEnabled: false,
      setPreference: (key, value) => set({ [key]: value } as Partial<PreferencesStore>),
    }),
    { name: 'elected-prefs' }
  )
);
