'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckSquare,
  Target,
  Timer,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  Star,
  Plus,
  Trash2,
  Send,
  Moon,
  Sun,
  Zap,
  CalendarDays,
  Play,
  Pause,
  RotateCcw,
  Crown,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/lib/store';

type AppTab = 'dashboard' | 'tasks' | 'habits' | 'pomodoro' | 'ai' | 'settings';

const priorityColors: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const _emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    _emptySubscribe,
    () => true,
    () => false
  );
}

export function AppShell() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Habit form
  const [habitName, setHabitName] = useState('');
  const [habitIcon, setHabitIcon] = useState('🎯');
  const [habitColor, setHabitColor] = useState('#6d28d9');
  const [habitTarget, setHabitTarget] = useState(5);

  // AI chat
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  // Pomodoro tick
  useEffect(() => {
    if (!store.pomodoroRunning) return;
    const interval = setInterval(() => {
      store.tickPomodoro();
    }, 1000);
    return () => clearInterval(interval);
  }, [store.pomodoroRunning, store]);

  // Auto scroll AI chat
  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [store.aiMessages]);

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    store.addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      priority: taskPriority,
    });
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('medium');
  };

  const handleAddHabit = () => {
    if (!habitName.trim()) return;
    store.addHabit({
      name: habitName.trim(),
      icon: habitIcon,
      color: habitColor,
      targetDays: habitTarget,
    });
    setHabitName('');
    setHabitIcon('🎯');
    setHabitColor('#6d28d9');
    setHabitTarget(5);
  };

  const handleSendAI = useCallback(async () => {
    if (!aiInput.trim()) return;
    const userMsg = {
      id: Math.random().toString(36).substring(2),
      role: 'user' as const,
      content: aiInput.trim(),
      timestamp: new Date().toISOString(),
    };
    store.addAIMessage(userMsg);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          data: {
            message: aiInput.trim(),
            context: {
              tasks: store.tasks,
              habits: store.habits,
              level: store.level,
              xp: store.xp,
              streak: store.streak,
              userName: store.userName || 'User',
            },
          },
        }),
      });
      const data = await res.json();
      if (data.response) {
        store.addAIMessage({
          id: Math.random().toString(36).substring(2),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      store.addAIMessage({
        id: Math.random().toString(36).substring(2),
        role: 'assistant',
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, store]);

  const getToday = () => new Date().toISOString().split('T')[0];

  const completedTasks = store.tasks.filter((t) => t.completed).length;
  const totalTasks = store.tasks.length;
  const completedHabits = store.habits.filter((h) =>
    h.completedDates.includes(getToday())
  ).length;
  const totalHabits = store.habits.length;

  const sidebarItems: { id: AppTab; icon: typeof Sparkles; label: string }[] = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'habits', icon: Target, label: 'Habits' },
    { id: 'pomodoro', icon: Timer, label: 'Pomodoro' },
    { id: 'ai', icon: MessageSquare, label: 'AI Assistant' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const formatTime = (m: number, s: number) => {
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card p-4 shrink-0">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">flowd</span>
        </div>

        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-[#6d28d9]/10 text-[#6d28d9] dark:bg-[#a78bfa]/10 dark:text-[#a78bfa]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center text-white text-xs font-bold">
              {(store.userName || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{store.userName || 'User'}</p>
              <p className="text-xs text-muted-foreground">Level {store.level}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-2 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Zap className="size-3 text-[#f59e0b]" />
              {store.xp} / {store.level * 100} XP
            </span>
            <span className="flex items-center gap-1">
              <Flame className="size-3 text-[#ef4444]" />
              {store.streak} streak
            </span>
          </div>
          <div className="px-2">
            <Progress value={(store.xp % 100)} className="h-1.5" />
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card glass">
        <div className="flex items-center justify-around py-2">
          {sidebarItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeTab === item.id
                  ? 'text-[#6d28d9] dark:text-[#a78bfa]'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="size-5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 glass border-b px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold gradient-text">flowd</span>
            </div>
            <h1 className="text-lg font-semibold capitalize lg:ml-0 ml-4">
              {activeTab === 'ai' ? 'AI Assistant' : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {store.isPro && (
              <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20 text-xs">
                <Crown className="size-3 mr-1" /> Pro
              </Badge>
            )}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="size-8"
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => store.setView('landing')}
              className="size-8"
              title="Back to home"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {/* ========== DASHBOARD ========== */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Welcome */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold">
                      Welcome back, {store.userName || 'there'} 👋
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Here&apos;s your productivity overview for today.
                    </p>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#6d28d9]/10 dark:bg-[#a78bfa]/10 flex items-center justify-center">
                          <CheckSquare className="size-5 text-[#6d28d9] dark:text-[#a78bfa]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {completedTasks}/{totalTasks}
                          </p>
                          <p className="text-xs text-muted-foreground">Tasks done</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
                          <Target className="size-5 text-[#f59e0b]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {completedHabits}/{totalHabits}
                          </p>
                          <p className="text-xs text-muted-foreground">Habits today</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
                          <Flame className="size-5 text-[#ef4444]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{store.streak}</p>
                          <p className="text-xs text-muted-foreground">Day streak</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                          <Star className="size-5 text-[#10b981]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">Lv.{store.level}</p>
                          <p className="text-xs text-muted-foreground">{store.xp} XP</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Tasks */}
                {store.tasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {store.tasks.slice(-5).reverse().map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <button
                              onClick={() => store.toggleTask(task.id)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                task.completed
                                  ? 'bg-[#10b981] border-[#10b981]'
                                  : 'border-muted-foreground/30'
                              }`}
                            >
                              {task.completed && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {/* ========== TASKS ========== */}
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Add Task */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add New Task</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="What needs to be done?"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      rows={2}
                    />
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Priority:</span>
                        {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setTaskPriority(p)}
                            className={`text-xs px-2.5 py-1 rounded-full capitalize transition-all ${
                              taskPriority === p
                                ? priorityColors[p] + ' ring-2 ring-offset-1 ring-current'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <Button
                        onClick={handleAddTask}
                        className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white"
                        disabled={!taskTitle.trim()}
                      >
                        <Plus className="size-4 mr-1" /> Add Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Task List */}
                <div className="space-y-2">
                  {store.tasks.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <CheckSquare className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No tasks yet. Add one above!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    store.tasks.map((task) => (
                      <Card key={task.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => store.toggleTask(task.id)}
                              className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                task.completed
                                  ? 'bg-[#10b981] border-[#10b981]'
                                  : 'border-muted-foreground/30 hover:border-[#6d28d9]'
                              }`}
                            >
                              {task.completed && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </p>
                                {task.aiSuggested && (
                                  <Badge className="text-xs bg-[#6d28d9]/10 text-[#6d28d9] border-[#6d28d9]/20 dark:bg-[#a78bfa]/10 dark:text-[#a78bfa] dark:border-[#a78bfa]/20">
                                    AI
                                  </Badge>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                              )}
                              {task.aiReasoning && (
                                <p className="text-xs text-[#6d28d9] dark:text-[#a78bfa] mt-1">💡 {task.aiReasoning}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => store.deleteTask(task.id)}
                                className="size-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ========== HABITS ========== */}
            {activeTab === 'habits' && (
              <motion.div
                key="habits"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Add Habit */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add New Habit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Habit name"
                        value={habitName}
                        onChange={(e) => setHabitName(e.target.value)}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Icon:</span>
                        <div className="flex gap-1">
                          {['🎯', '📚', '🏃', '💧', '🧘', '✍️', '🎵', '💪'].map((icon) => (
                            <button
                              key={icon}
                              onClick={() => setHabitIcon(icon)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                                habitIcon === icon
                                  ? 'bg-[#6d28d9]/10 ring-1 ring-[#6d28d9]'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Target days/week:</span>
                        <Input
                          type="number"
                          min={1}
                          max={7}
                          value={habitTarget}
                          onChange={(e) => setHabitTarget(parseInt(e.target.value) || 5)}
                          className="w-16 h-8 text-sm"
                        />
                      </div>
                      <Button
                        onClick={handleAddHabit}
                        className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white"
                        disabled={!habitName.trim()}
                      >
                        <Plus className="size-4 mr-1" /> Add Habit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Habit Grid */}
                {store.habits.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Target className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No habits yet. Start building streaks!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {store.habits.map((habit) => {
                      const doneToday = habit.completedDates.includes(getToday());
                      return (
                        <Card key={habit.id} className={doneToday ? 'border-[#10b981]/30' : ''}>
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{habit.icon}</span>
                                <div>
                                  <p className="font-medium text-sm">{habit.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {habit.targetDays}x per week
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => store.toggleHabitToday(habit.id)}
                                className={`w-10 h-6 rounded-full transition-all relative ${
                                  doneToday ? 'bg-[#10b981]' : 'bg-muted'
                                }`}
                              >
                                <div
                                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                                    doneToday ? 'left-5' : 'left-1'
                                  }`}
                                />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame className="size-4 text-[#f59e0b]" />
                              <span className="text-sm font-semibold">{habit.streak}</span>
                              <span className="text-xs text-muted-foreground">day streak</span>
                            </div>
                            {/* Week dots */}
                            <div className="flex gap-1.5 mt-3">
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                                const date = new Date();
                                const diff = date.getDay() === 0 ? 6 : date.getDay() - 1 - i;
                                date.setDate(date.getDate() - diff);
                                const dateStr = date.toISOString().split('T')[0];
                                const isDone = habit.completedDates.includes(dateStr);
                                const isFuture = i > (date.getDay() === 0 ? 6 : date.getDay() - 1);
                                return (
                                  <div key={day} className="flex flex-col items-center gap-1">
                                    <span className="text-xs text-muted-foreground">{day}</span>
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                        isFuture
                                          ? 'bg-muted/30'
                                          : isDone
                                          ? 'bg-[#10b981] text-white'
                                          : 'bg-muted'
                                      }`}
                                    >
                                      {isDone ? '✓' : ''}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ========== POMODORO ========== */}
            {activeTab === 'pomodoro' && (
              <motion.div
                key="pomodoro"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <Card className="max-w-md mx-auto text-center">
                  <CardContent className="p-8">
                    <Badge
                      className={`mb-4 ${
                        store.pomodoroMode === 'work'
                          ? 'bg-[#6d28d9]/10 text-[#6d28d9] border-[#6d28d9]/20 dark:bg-[#a78bfa]/10 dark:text-[#a78bfa] dark:border-[#a78bfa]/20'
                          : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                      }`}
                    >
                      {store.pomodoroMode === 'work' ? 'Focus Time' : 'Break Time'}
                    </Badge>

                    <div className="text-6xl font-bold tracking-tight mb-2 font-mono">
                      {formatTime(store.pomodoroMinutes, store.pomodoroSeconds)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-8">
                      {store.pomodoroMode === 'work'
                        ? 'Stay focused. You got this!'
                        : 'Relax and recharge.'}
                    </p>

                    {/* Circular progress */}
                    <div className="relative w-48 h-48 mx-auto mb-8">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-muted/30"
                        />
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          strokeWidth="6"
                          strokeLinecap="round"
                          className="text-[#6d28d9] dark:text-[#a78bfa]"
                          strokeDasharray={`${2 * Math.PI * 90}`}
                          strokeDashoffset={`${
                            2 *
                            Math.PI *
                            90 *
                            (1 -
                              (store.pomodoroMode === 'work'
                                ? (25 * 60 - store.pomodoroMinutes * 60 - store.pomodoroSeconds) /
                                  (25 * 60)
                                : (5 * 60 - store.pomodoroMinutes * 60 - store.pomodoroSeconds) /
                                  (5 * 60)))
                          }`}
                          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6d28d9]/5 to-[#a78bfa]/5 dark:from-[#a78bfa]/5 dark:to-[#c4b5fd]/5 flex items-center justify-center">
                          {store.pomodoroMode === 'work' ? (
                            <Timer className="size-8 text-[#6d28d9] dark:text-[#a78bfa]" />
                          ) : (
                            <CalendarDays className="size-8 text-[#10b981]" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={store.resetPomodoro}
                        className="size-12"
                      >
                        <RotateCcw className="size-5" />
                      </Button>
                      <Button
                        onClick={
                          store.pomodoroRunning ? store.pausePomodoro : store.startPomodoro
                        }
                        className={`size-16 rounded-full ${
                          store.pomodoroRunning
                            ? 'bg-[#f59e0b] hover:bg-[#d97706] text-white'
                            : 'bg-[#6d28d9] hover:bg-[#5b21b6] text-white'
                        }`}
                      >
                        {store.pomodoroRunning ? (
                          <Pause className="size-6" />
                        ) : (
                          <Play className="size-6 ml-0.5" />
                        )}
                      </Button>
                      <div className="size-12" />
                    </div>
                  </CardContent>
                </Card>

                {/* Session info */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-[#6d28d9] dark:text-[#a78bfa]">
                        {store.level}
                      </p>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-[#f59e0b]">{store.xp}</p>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-[#ef4444]">{store.streak}</p>
                      <p className="text-xs text-muted-foreground">Streak</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* ========== AI ASSISTANT ========== */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex flex-col h-[calc(100vh-10rem)]"
              >
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4" ref={aiScrollRef}>
                  {store.aiMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Flowd AI Assistant</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Ask me anything about productivity, task planning, habit building, or optimizing your workflow.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {[
                          'Plan my day',
                          'Suggest new habits',
                          'How can I focus better?',
                          'Review my tasks',
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setAiInput(suggestion);
                            }}
                            className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    store.aiMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center shrink-0 mt-1">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-[#6d28d9] text-white rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}
                        >
                          {msg.content}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1 text-xs font-bold">
                            {(store.userName || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {aiLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#a78bfa] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.15s]" />
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.3s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Ask Flowd AI anything..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendAI()}
                    className="flex-1"
                    disabled={aiLoading}
                  />
                  <Button
                    onClick={handleSendAI}
                    className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white shrink-0"
                    disabled={!aiInput.trim() || aiLoading}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ========== SETTINGS ========== */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6 max-w-lg"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Name</label>
                      <Input
                        placeholder="Your name"
                        value={store.userName}
                        onChange={(e) => store.setUserName(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Subscription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium text-sm">
                          {store.isPro ? 'Pro Plan' : 'Free Plan'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {store.isPro
                            ? 'Unlimited AI, habits, and team features'
                            : '5 AI plans/day, 3 habits'}
                        </p>
                      </div>
                      <Button
                        variant={store.isPro ? 'outline' : 'default'}
                        className={
                          store.isPro ? '' : 'bg-[#6d28d9] hover:bg-[#5b21b6] text-white'
                        }
                        onClick={() => store.setIsPro(!store.isPro)}
                      >
                        {store.isPro ? 'Downgrade' : 'Upgrade to Pro'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Clear all data? This cannot be undone.')) {
                          store.clearAIMessages();
                          store.setView('landing');
                        }
                      }}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Clear All Data
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
