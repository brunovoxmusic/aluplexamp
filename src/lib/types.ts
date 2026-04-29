export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  completed: boolean;
  createdAt: string;
  aiSuggested?: boolean;
  aiReasoning?: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  completedDates: string[];
  targetDays: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type ViewType = 'landing' | 'app';
export type PomodoroMode = 'work' | 'break';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
