import { create } from 'zustand';
import type { Task, Habit, AIMessage, ViewType, PomodoroMode } from '@/lib/types';

interface AppState {
  // Navigation
  view: ViewType;
  setView: (view: ViewType) => void;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  userName: string;
  setUserName: (n: string) => void;
  goals: string[];
  setGoals: (g: string[]) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => void;
  toggleHabitToday: (id: string) => void;

  // Pomodoro
  pomodoroMinutes: number;
  pomodoroSeconds: number;
  pomodoroRunning: boolean;
  pomodoroMode: PomodoroMode;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;

  // AI
  aiMessages: AIMessage[];
  addAIMessage: (msg: AIMessage) => void;
  clearAIMessages: () => void;

  // Gamification
  streak: number;
  xp: number;
  level: number;
  addXP: (amount: number) => void;

  // Pro tier
  isPro: boolean;
  setIsPro: (v: boolean) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Load from localStorage
function loadState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(`flowd_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveState(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`flowd_${key}`, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation
  view: 'landing',
  setView: (view) => set({ view }),

  // Onboarding
  onboardingComplete: false,
  setOnboardingComplete: (v) => {
    set({ onboardingComplete: v });
    saveState('onboardingComplete', v);
  },
  userName: '',
  setUserName: (n) => {
    set({ userName: n });
    saveState('userName', n);
  },
  goals: [] as string[],
  setGoals: (g) => {
    set({ goals: g });
    saveState('goals', g);
  },

  // Tasks
  tasks: [] as Task[],
  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    const tasks = [...get().tasks, newTask];
    set({ tasks });
    saveState('tasks', tasks);
    get().addXP(10);
  },
  toggleTask: (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    set({ tasks });
    saveState('tasks', tasks);
    const task = tasks.find((t) => t.id === id);
    if (task?.completed) {
      get().addXP(25);
    }
  },
  deleteTask: (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    saveState('tasks', tasks);
  },

  // Habits
  habits: [] as Habit[],
  addHabit: (habit) => {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      streak: 0,
      completedDates: [],
    };
    const habits = [...get().habits, newHabit];
    set({ habits });
    saveState('habits', habits);
  },
  toggleHabitToday: (id) => {
    const today = getToday();
    const habits = get().habits.map((h) => {
      if (h.id !== id) return h;
      const completedToday = h.completedDates.includes(today);
      if (completedToday) {
        return {
          ...h,
          completedDates: h.completedDates.filter((d) => d !== today),
          streak: Math.max(0, h.streak - 1),
        };
      } else {
        return {
          ...h,
          completedDates: [...h.completedDates, today],
          streak: h.streak + 1,
        };
      }
    });
    set({ habits });
    saveState('habits', habits);
    get().addXP(15);
  },

  // Pomodoro
  pomodoroMinutes: 25,
  pomodoroSeconds: 0,
  pomodoroRunning: false,
  pomodoroMode: 'work' as PomodoroMode,
  startPomodoro: () => set({ pomodoroRunning: true }),
  pausePomodoro: () => set({ pomodoroRunning: false }),
  resetPomodoro: () =>
    set({
      pomodoroMinutes: 25,
      pomodoroSeconds: 0,
      pomodoroRunning: false,
      pomodoroMode: 'work' as PomodoroMode,
    }),
  tickPomodoro: () => {
    const { pomodoroMinutes, pomodoroSeconds, pomodoroMode } = get();
    if (pomodoroSeconds > 0) {
      set({ pomodoroSeconds: pomodoroSeconds - 1 });
    } else if (pomodoroMinutes > 0) {
      set({ pomodoroMinutes: pomodoroMinutes - 1, pomodoroSeconds: 59 });
    } else {
      // Switch mode
      if (pomodoroMode === 'work') {
        set({ pomodoroMode: 'break', pomodoroMinutes: 5, pomodoroSeconds: 0 });
        get().addXP(50);
      } else {
        set({ pomodoroMode: 'work', pomodoroMinutes: 25, pomodoroSeconds: 0 });
      }
    }
  },

  // AI
  aiMessages: [] as AIMessage[],
  addAIMessage: (msg) => {
    const aiMessages = [...get().aiMessages, msg];
    set({ aiMessages });
  },
  clearAIMessages: () => set({ aiMessages: [] }),

  // Gamification
  streak: 0,
  xp: 0,
  level: 1,
  addXP: (amount) => {
    const currentXP = get().xp + amount;
    const newLevel = Math.floor(currentXP / 100) + 1;
    set({ xp: currentXP, level: newLevel, streak: get().streak + 1 });
    saveState('xp', currentXP);
    saveState('streak', get().streak + 1);
  },

  // Pro
  isPro: false,
  setIsPro: (v) => {
    set({ isPro: v });
    saveState('isPro', v);
  },
}));

// Hydration: load persisted state from localStorage on mount
if (typeof window !== 'undefined') {
  const state = useStore.getState();
  const tasks = loadState<Task[]>('tasks', []);
  const habits = loadState<Habit[]>('habits', []);
  const onboardingComplete = loadState<boolean>('onboardingComplete', false);
  const userName = loadState<string>('userName', '');
  const goals = loadState<string[]>('goals', []);
  const streak = loadState<number>('streak', 0);
  const xp = loadState<number>('xp', 0);
  const isPro = loadState<boolean>('isPro', false);

  useStore.setState({
    tasks,
    habits,
    onboardingComplete,
    userName,
    goals,
    streak,
    xp,
    level: Math.floor(xp / 100) + 1,
    isPro,
  });
}
