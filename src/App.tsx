/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, Quadrant, Priority, ProjectTemplate, FocusMode, Habit, QuadrantCategory } from './types';
import { FocusAudioSynthesizer } from './utils/audio';
import { DEFAULT_TEMPLATES } from './utils/templates';
import { MockDevice } from './components/MockDevice';
import { WidgetPlayground } from './components/WidgetPlayground';
import { TaskDrawer } from './components/TaskDrawer';
import { TaskQuadrant } from './components/TaskQuadrant';
import { CalendarView } from './components/CalendarView';
import { PomodoroHub } from './components/PomodoroHub';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  CheckSquare, 
  Bookmark, 
  Grid2X2, 
  Clock3, 
  Lock, 
  Unlock, 
  Flame, 
  ArrowRightLeft, 
  BadgeAlert, 
  Layers, 
  Sparkles,
  RefreshCw,
  FolderOpen,
  Sun,
  Moon,
  Settings,
  X,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';

const INITIAL_TASKS: Task[] = [
  {
    id: 'init-1',
    title: '联调真机实况窗显示延迟 (Live Capsule)',
    description: '真机退回后台时，通知常驻胶囊状态栏更新间隔漂移必须保持在1秒以内。',
    isCompleted: false,
    priority: 'HIGH',
    quadrant: 1,
    tags: ['技术', '优化'],
    dueDate: new Date().toISOString().split('T')[0],
    subtasks: [
      { id: 'sub-1-1', title: '测试 backgroundTaskManager 唤醒包', isCompleted: true },
      { id: 'sub-1-2', title: '验证 Live View Kit 卡片胶囊状态切换 API', isCompleted: false }
    ],
    dependencies: [],
    focusMinutes: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 'init-2',
    title: '生成符合 NEXT 规范的桌面自适应图标',
    description: '异形拉伸裁切符合华为 AppGallery 上架审核规范标准。',
    isCompleted: false,
    priority: 'HIGH',
    quadrant: 2,
    tags: ['政策', '审核'],
    dueDate: new Date().toISOString().split('T')[0],
    subtasks: [
      { id: 'sub-2-1', title: '上传 SVG 独立背景层与前景 logo 层', isCompleted: false }
    ],
    dependencies: [],
    focusMinutes: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'init-3',
    title: '修复 CSS 隔空手势组件滑动误触',
    description: '解决手部距离屏幕10cm由于快慢速挥动引起的误触回调。',
    isCompleted: true,
    priority: 'MEDIUM',
    quadrant: 3,
    tags: ['工作', '缺陷'],
    dueDate: new Date().toISOString().split('T')[0],
    subtasks: [],
    dependencies: [],
    focusMinutes: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: 'init-4',
    title: '小艺管家语音控制对接意图框架 (Intent Framework)',
    description: '通过语音语义智能拦截识别待办时间描述直接写库。',
    isCompleted: false,
    priority: 'LOW',
    quadrant: 4,
    tags: ['日常', 'AI'],
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    subtasks: [],
    dependencies: ['init-1'], // Depends on live updates completing
    focusMinutes: 0,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_HABITS: Habit[] = [
  { id: 'h-1', title: '每日晨跑 5 公里', createdAt: new Date().toISOString(), completedDates: [] },
  { id: 'h-2', title: '阅读一章技术文档或书籍', createdAt: new Date().toISOString(), completedDates: [] },
  { id: 'h-3', title: '保持 25 分钟脑部番茄专注', createdAt: new Date().toISOString(), completedDates: [new Date().toISOString().split('T')[0]] }
];

const DEFAULT_QUADRANTS: QuadrantCategory[] = [
  {
    id: 1,
    title: '重要且紧急',
    description: '立即处理、期限任务',
    color: 'from-rose-50 to-rose-100/50 hover:bg-rose-100/40 border-rose-200/60 dark:from-rose-950/20 dark:to-rose-800/10 dark:border-rose-900/30',
    badgeClass: 'bg-rose-500 text-white',
    accentColor: 'text-rose-600'
  },
  {
    id: 2,
    title: '重要不紧急',
    description: '规划开发、职业日常',
    color: 'from-amber-50 to-amber-100/50 hover:bg-amber-100/40 border-amber-200/60 dark:from-amber-950/20 dark:to-amber-800/10 dark:border-amber-900/30',
    badgeClass: 'bg-amber-500 text-gray-950',
    accentColor: 'text-amber-700'
  },
  {
    id: 3,
    title: '紧急不重要',
    description: '无关事务、流程琐事',
    color: 'from-blue-50 to-blue-100/50 hover:bg-blue-100/40 border-blue-200/60 dark:from-blue-950/20 dark:to-blue-800/10 dark:border-blue-900/30',
    badgeClass: 'bg-blue-500 text-white',
    accentColor: 'text-blue-600'
  },
  {
    id: 4,
    title: '不重又不急',
    description: '阅读碎片、杂项整理',
    color: 'from-gray-50 to-gray-100/50 hover:bg-gray-100/45 border-gray-200/60 dark:from-zinc-900/40 dark:to-zinc-800/20 dark:border-zinc-850',
    badgeClass: 'bg-gray-500 text-white',
    accentColor: 'text-gray-600'
  }
];

const QUADRANT_PRESET_DESIGNS = [
  {
    color: 'from-rose-50 to-rose-100/50 hover:bg-rose-100/40 border-rose-200/60 dark:from-rose-950/20 dark:to-rose-800/10 dark:border-rose-900/30',
    badgeClass: 'bg-rose-500 text-white border border-rose-400/20',
    accentColor: 'text-rose-600',
    label: '蔷薇红 (Rose/Red)'
  },
  {
    color: 'from-amber-50 to-amber-100/50 hover:bg-amber-100/40 border-amber-200/60 dark:from-amber-950/20 dark:to-amber-800/10 dark:border-amber-900/30',
    badgeClass: 'bg-amber-500 text-gray-950 border border-amber-400/20',
    accentColor: 'text-amber-700',
    label: '琥珀橙 (Orange/Amber)'
  },
  {
    color: 'from-blue-50 to-blue-100/50 hover:bg-blue-100/40 border-blue-200/60 dark:from-blue-950/20 dark:to-blue-800/10 dark:border-blue-900/30',
    badgeClass: 'bg-blue-500 text-white border border-blue-400/20',
    accentColor: 'text-blue-600',
    label: '静谧蓝 (Sky Blue)'
  },
  {
    color: 'from-emerald-50 to-emerald-100/50 hover:bg-emerald-100/40 border-emerald-200/60 dark:from-emerald-950/20 dark:to-emerald-800/10 dark:border-emerald-900/30',
    badgeClass: 'bg-emerald-500 text-white border border-emerald-400/20',
    accentColor: 'text-emerald-600',
    label: '翡翠绿 (Green/Emerald)'
  },
  {
    color: 'from-violet-50 to-violet-100/50 hover:bg-violet-100/40 border-violet-200/60 dark:from-violet-950/20 dark:to-violet-800/10 dark:border-violet-900/30',
    badgeClass: 'bg-violet-500 text-white border border-violet-400/20',
    accentColor: 'text-violet-600',
    label: '紫罗兰 (Violet/Purple)'
  },
  {
    color: 'from-teal-50 to-teal-100/50 hover:bg-teal-100/40 border-teal-200/60 dark:from-teal-950/20 dark:to-teal-800/10 dark:border-teal-900/30',
    badgeClass: 'bg-[#007DFF] text-white border border-blue-400/20',
    accentColor: 'text-[#007DFF]',
    label: '晨曦蓝 (Cyan/Teal)'
  },
  {
    color: 'from-gray-50 to-gray-100/50 hover:bg-gray-100/45 border-gray-200/60 dark:from-zinc-900/40 dark:to-zinc-800/20 dark:border-zinc-850',
    badgeClass: 'bg-gray-500 text-white border border-gray-400/20',
    accentColor: 'text-gray-600',
    label: '深空灰 (Slate Gray)'
  }
];

export default function App() {
  // Theme dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('hm_dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hm_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Navigation tabs and layout states
  const [isHomeScreen, setIsHomeScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'LIST' | 'QUADRANT' | 'CALENDAR' | 'POMODORO' | 'TEMPLATES'>('LIST');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Tasks and Templates Persistence
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [quadrantCategories, setQuadrantCategories] = useState<QuadrantCategory[]>([]);

  // Settings inputs
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newQuadTitle, setNewQuadTitle] = useState('');
  const [newQuadDescription, setNewQuadDescription] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PRIORITY_DESC' | 'PRIORITY_ASC' | 'DUE_DATE_ASC' | 'DUE_DATE_DESC'>('DEFAULT');
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [filterDueDate, setFilterDueDate] = useState<'ALL' | 'HAS_DUE_DATE' | 'NO_DUE_DATE'>('ALL');

  // Interactive Clipboard Bubble simulation
  const [clipboardAlert, setClipboardAlert] = useState<string | null>(null);

  // Focus Timer States
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [focusMode, setFocusMode] = useState<FocusMode>('POMODORO');
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(undefined);

  // Drawer / Editing panel states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize singular audio synthesizer ref to prevent duplicated sound assets
  const audioSynthRef = useRef<FocusAudioSynthesizer | null>(null);
  const stopwatchIntervalRef = useRef<number | null>(null);

  // Initialize data on mount
  useEffect(() => {
    // Lazy instance of FocusAudioSynthesizer
    if (!audioSynthRef.current) {
      audioSynthRef.current = new FocusAudioSynthesizer();
    }

    // Load Local Tasks
    const localTasks = localStorage.getItem('hm_next_todos_tasks');
    if (localTasks) {
      try {
        setTasks(JSON.parse(localTasks));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem('hm_next_todos_tasks', JSON.stringify(INITIAL_TASKS));
    }

    // Load Local Templates
    const localTemplates = localStorage.getItem('hm_next_todos_templates');
    if (localTemplates) {
      try {
        setTemplates(JSON.parse(localTemplates));
      } catch (e) {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } else {
      setTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem('hm_next_todos_templates', JSON.stringify(DEFAULT_TEMPLATES));
    }

    // Load Local Habits
    const localHabits = localStorage.getItem('hm_next_todos_habits');
    if (localHabits) {
      try {
        setHabits(JSON.parse(localHabits));
      } catch (e) {
        setHabits(INITIAL_HABITS);
      }
    } else {
      setHabits(INITIAL_HABITS);
      localStorage.setItem('hm_next_todos_habits', JSON.stringify(INITIAL_HABITS));
    }

    // Load Local Quadrants
    const localQuadrants = localStorage.getItem('hm_next_todos_quadrants');
    if (localQuadrants) {
      try {
        setQuadrantCategories(JSON.parse(localQuadrants));
      } catch (e) {
        setQuadrantCategories(DEFAULT_QUADRANTS);
      }
    } else {
      setQuadrantCategories(DEFAULT_QUADRANTS);
      localStorage.setItem('hm_next_todos_quadrants', JSON.stringify(DEFAULT_QUADRANTS));
    }

    // Core HarmonyOS Quick Clipboard Trigger simulation
    const clipboardTimer = setTimeout(() => {
      setClipboardAlert('今晚8点召集核心团队会议：联调自适应202%矢量SVG前景背景流转');
    }, 4500);

    return () => {
      clearTimeout(clipboardTimer);
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, []);

  // Save tasks helper
  const handleSaveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('hm_next_todos_tasks', JSON.stringify(updatedTasks));
  };

  // Save habits helper
  const handleSaveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    localStorage.setItem('hm_next_todos_habits', JSON.stringify(updatedHabits));
  };

  // Save quadrant categories helper
  const handleSaveQuadrants = (updatedQuads: QuadrantCategory[]) => {
    setQuadrantCategories(updatedQuads);
    localStorage.setItem('hm_next_todos_quadrants', JSON.stringify(updatedQuads));
  };

  // Timer clock ticketing
  useEffect(() => {
    if (isRunning && !isPaused) {
      stopwatchIntervalRef.current = window.setInterval(() => {
        if (focusMode === 'STOPWATCH') {
          // stopwatch counts upwards
          setTimeRemaining(prev => {
            const next = prev - 1;
            if (next <= 0) {
              handleSessionCompleted();
              return 0;
            }
            return next;
          });
        } else {
          // countdown counts downwards
          setTimeRemaining(prev => {
            if (prev <= 1) {
              handleSessionCompleted();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
        stopwatchIntervalRef.current = null;
      }
    }

    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [isRunning, isPaused, focusMode]);

  // Session focused trigger completion
  const handleSessionCompleted = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Synthesize satisfying alarm Chime wave representing Linear Haptic bells
    if (audioSynthRef.current) {
      audioSynthRef.current.synthesizeHapticChime();
    }

    // Accumulate task focusing minutes
    if (activeTaskId) {
      const minutesSpent = Math.max(1, Math.round(totalDuration / 60));
      const updated = tasks.map(t => {
        if (t.id === activeTaskId) {
          return { ...t, focusMinutes: (t.focusMinutes || 0) + minutesSpent };
        }
        return t;
      });
      handleSaveTasks(updated);
    }

    alert('🏆 极简专注达成！恭喜完美完结一个高效时间周期，线性振动钟声已响起。');
  };

  // 1. Task Operations (Basic CRUD & features)
  const handleToggleComplete = (id: string) => {
    // Find if task is locked by unfinished dependencies
    const targetTask = tasks.find(t => t.id === id);
    if (targetTask && !targetTask.isCompleted && targetTask.dependencies.length > 0) {
      const pendingDeps = tasks.filter(t => targetTask.dependencies.includes(t.id) && !t.isCompleted);
      if (pendingDeps.length > 0) {
        alert(`🔒 任务锁定：需要先完成它的前置任务依赖: "${pendingDeps[0].title}"`);
        return;
      }
    }

    const updated = tasks.map(t => {
      if (t.id === id) {
        // Play click indicator audio haptic chime
        if (audioSynthRef.current && !t.isCompleted) {
          audioSynthRef.current.synthesizeHapticChime();
        }
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    });
    handleSaveTasks(updated);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).map(s => {
          if (s.id === subtaskId) {
            if (audioSynthRef.current && !s.isCompleted) {
              audioSynthRef.current.synthesizeHapticChime();
            }
            return { ...s, isCompleted: !s.isCompleted };
          }
          return s;
        });
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    });
    handleSaveTasks(updated);
  };

  const handleUpdateTaskQuadrant = (taskId: string, targetQuadrant: Quadrant) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        if (t.quadrant === targetQuadrant) return t;
        // Optionally play haptic sound on successful drop
        if (audioSynthRef.current) {
          audioSynthRef.current.synthesizeHapticChime();
        }
        const newPriority: Priority = targetQuadrant === 1 ? 'HIGH' : targetQuadrant === 2 ? 'MEDIUM' : 'LOW';
        return {
          ...t,
          quadrant: targetQuadrant,
          priority: newPriority
        };
      }
      return t;
    });
    handleSaveTasks(updated);
  };

  const handleAddTask = (quadrant: Quadrant = 2) => {
    setEditingTask(null);
    setIsDrawerOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDrawerOpen(true);
  };

  const handleDeleteTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = tasks.filter(t => t.id !== id);
    // Remove deleted references from dependency trees too to prevent orphaned state
    const cleaned = updated.map(t => ({
      ...t,
      dependencies: t.dependencies.filter(depId => depId !== id)
    }));
    handleSaveTasks(cleaned);
  };

  const handleSaveDrawerTask = (savedTask: Task) => {
    const exists = tasks.find(t => t.id === savedTask.id);
    if (exists) {
      handleSaveTasks(tasks.map(t => t.id === savedTask.id ? savedTask : t));
    } else {
      handleSaveTasks([savedTask, ...tasks]);
    }
  };

  // A complete clear completed historical records (一键清理历史, P0)
  const handleClearCompletedHistory = () => {
    if (window.confirm('您确定要清空所有已完成的历史任务吗？这可以帮助您保持列表清爽。')) {
      const updated = tasks.filter(t => !t.isCompleted);
      handleSaveTasks(updated);
    }
  };

  // Habit management handlers
  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) return;
    const newHabit: Habit = {
      id: 'habit-' + Date.now(),
      title: newHabitTitle.trim(),
      createdAt: new Date().toISOString(),
      completedDates: []
    };
    const updated = [...habits, newHabit];
    handleSaveHabits(updated);
    setNewHabitTitle('');
    if (audioSynthRef.current) {
      audioSynthRef.current.synthesizeHapticChime();
    }
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    handleSaveHabits(updated);
    if (audioSynthRef.current) {
      audioSynthRef.current.synthesizeHapticChime();
    }
  };

  const handleToggleHabitToday = (habitId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const exists = h.completedDates.includes(todayStr);
        let newCompletedDates;
        if (exists) {
          newCompletedDates = h.completedDates.filter(d => d !== todayStr);
        } else {
          newCompletedDates = [...h.completedDates, todayStr];
          if (audioSynthRef.current) {
            audioSynthRef.current.synthesizeSuccessChime();
          }
        }
        return { ...h, completedDates: newCompletedDates };
      }
      return h;
    });
    handleSaveHabits(updated);
  };

  // Quadrant management handlers
  const handleAddQuadrant = () => {
    if (!newQuadTitle.trim()) return;
    const nextId = quadrantCategories.length > 0 ? Math.max(...quadrantCategories.map(c => c.id)) + 1 : 1;
    const preset = QUADRANT_PRESET_DESIGNS[selectedPresetIndex];
    const newCat: QuadrantCategory = {
      id: nextId,
      title: `${nextId}. ${newQuadTitle.trim()}`,
      description: newQuadDescription.trim() || '自定义日常象限',
      color: preset.color,
      badgeClass: preset.badgeClass,
      accentColor: preset.accentColor
    };
    const updated = [...quadrantCategories, newCat];
    handleSaveQuadrants(updated);
    setNewQuadTitle('');
    setNewQuadDescription('');
    if (audioSynthRef.current) {
      audioSynthRef.current.synthesizeHapticChime();
    }
  };

  const handleDeleteQuadrant = (id: number) => {
    if (quadrantCategories.length <= 1) {
      alert('必须至少保留一个四象限分组！');
      return;
    }
    if (window.confirm('确定要删除此象限吗？其下的所有待办任务将自动转移至第一个象限。')) {
      const updated = quadrantCategories.filter(c => c.id !== id);
      const remainingId = updated[0].id;
      const updatedTasks = tasks.map(t => {
        if (t.quadrant === id) {
          return { ...t, quadrant: remainingId };
        }
        return t;
      });
      handleSaveTasks(updatedTasks);
      handleSaveQuadrants(updated);
      if (audioSynthRef.current) {
        audioSynthRef.current.synthesizeHapticChime();
      }
    }
  };

  const renderTaskCard = (t: Task) => {
    // Calculate if blocked
    let isBlocked = false;
    let blockingTaskTitle = '';
    if (t.dependencies.length > 0) {
      const pending = tasks.find(dep => t.dependencies.includes(dep.id) && !dep.isCompleted);
      if (pending) {
        isBlocked = true;
        blockingTaskTitle = pending.title;
      }
    }

    // Define priority border classes
    let borderClass = 'border-l-4 border-l-gray-300';
    let chipColor = 'bg-gray-100 text-gray-650';
    if (t.priority === 'HIGH') {
      borderClass = 'border-l-4 border-l-rose-500';
      chipColor = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 font-black animate-pulse';
    } else if (t.priority === 'MEDIUM') {
      borderClass = 'border-l-4 border-l-amber-500';
      chipColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 font-bold';
    } else if (t.priority === 'LOW') {
      borderClass = 'border-l-4 border-l-blue-400';
      chipColor = 'bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-450';
    }

    return (
      <div
        id={`task-item-${t.id}`}
        key={t.id}
        className={`group/task relative bg-white dark:bg-[#1C1C1E] rounded-3xl border border-gray-150/40 dark:border-zinc-800 p-4 transition-all shadow-2xs ${borderClass} ${
          t.isCompleted ? 'bg-gray-50/70 border-l-gray-300/40 opacity-70' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Tick Checkbox */}
            <button
              id={`btn-task-tick-${t.id}`}
              onClick={() => handleToggleComplete(t.id)}
              className="mt-0.5 cursor-pointer flex-shrink-0 transition-transform active:scale-95"
            >
              {t.isCompleted ? (
                <CheckCircle2 size={18} className="fill-emerald-50 text-emerald-600 dark:fill-emerald-950/20" />
              ) : isBlocked ? (
                <Lock size={18} className="text-amber-500/80 animate-pulse" />
              ) : (
                <Circle size={18} className="text-gray-350 dark:text-zinc-650 hover:text-gray-500" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <h3 className={`text-xs font-semibold leading-tight flex items-center gap-1.5 ${
                t.isCompleted ? 'line-through text-gray-400 dark:text-zinc-600 font-normal shadow-none' : 'text-gray-800 dark:text-gray-200'
              }`}>
                <span className="truncate">{t.title}</span>
                {isBlocked && (
                  <span className="text-[8.5px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded-sm font-extrabold flex items-center gap-0.5">
                    依赖锁中
                  </span>
                )}
              </h3>

              {/* Metadatas flow bottom */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[8.5px] bg-gray-100 dark:bg-zinc-800/80 text-gray-500 dark:text-zinc-400 px-2.5 py-0.2 rounded-full font-bold">
                  第 {t.quadrant} 象限
                </span>
                <span className={`text-[8.5px] px-2.5 py-0.2 rounded-full font-semibold ${chipColor}`}>
                  {t.priority} 优先级
                </span>
                {t.tags.map((tag, i) => (
                  <span key={i} className="text-[9px] text-gray-400 dark:text-zinc-600 font-mono">
                    #{tag}
                  </span>
                ))}
                {t.focusMinutes > 0 && (
                  <span className="text-[8.5px] bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 px-2 py-0.2 rounded-full font-extrabold">
                    🎯 已专注 {t.focusMinutes} 分钟
                  </span>
                )}
                {t.dueDate && (
                  <span className="text-[8.5px] bg-indigo-50 dark:bg-[#2C2C2E] text-indigo-500 dark:text-indigo-400 px-2 py-0.2 rounded-full font-semibold">
                    📅 {t.dueDate}
                  </span>
                )}
              </div>

              {isBlocked && (
                <p className="text-[10px] text-amber-600 mt-1.5 leading-normal font-medium flex items-center gap-1 bg-amber-50/50 p-1 rounded-lg">
                  <AlertTriangle size={11} />
                  <span>需要先完成前置待办："{blockingTaskTitle}" 才能解除锁定。</span>
                </p>
              )}
            </div>
          </div>

          {/* Right side floating quick control toolbox */}
          <div className="flex items-center space-x-1.5 pl-1.5 opacity-100 transition-opacity flex-shrink-0">
            <button
              id={`btn-task-focus-${t.id}`}
              onClick={() => handleStartFocusOnTask(t.id)}
              disabled={t.isCompleted}
              title="针对此任务快速开启番茄专注"
              className="p-1 px-2 text-[10px] bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all font-bold disabled:opacity-40 cursor-pointer"
            >
              专注
            </button>
            <button
              id={`btn-task-edit-${t.id}`}
              onClick={() => handleEditTask(t)}
              className="p-1.5 bg-gray-100 dark:bg-[#2C2C2E] hover:bg-gray-200 text-gray-600 dark:text-zinc-400 rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 size={11} />
            </button>
            <button
              id={`btn-task-del-${t.id}`}
              onClick={(e) => handleDeleteTask(t.id, e)}
              className="p-1.5 bg-gray-100 dark:bg-[#2C2C2E] hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 text-gray-400 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Full-width Subtasks Completion box */}
        {t.subtasks && t.subtasks.length > 0 && (
          <div className="mt-3.5 space-y-2 bg-gray-50/70 dark:bg-[#2C2C2E]/40 p-3 rounded-2xl border border-gray-150/10 dark:border-zinc-800 w-full animate-fade-in">
            <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-zinc-500 font-bold mb-1 pl-0.5">
              <span>子步骤拆解 ({t.subtasks.filter(s => s.isCompleted).length} / {t.subtasks.length} 已完成)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {t.subtasks.map(sub => (
                <div 
                  key={sub.id} 
                  onClick={(e) => { e.stopPropagation(); handleToggleSubtask(t.id, sub.id); }}
                  className="flex items-center gap-2.5 p-1 hover:bg-gray-100/50 dark:hover:bg-zinc-700/50 rounded-lg cursor-pointer transition-colors"
                >
                  <span className="flex-shrink-0">
                    {sub.isCompleted ? (
                      <CheckCircle2 size={13} className="fill-emerald-50 text-emerald-600" />
                    ) : (
                      <Circle size={13} className="text-gray-350 dark:text-zinc-650 hover:text-gray-500" />
                    )}
                  </span>
                  <span className={`text-[10.5px] leading-snug flex-1 font-semibold ${sub.isCompleted ? 'line-through text-gray-400 dark:text-zinc-600 font-normal' : 'text-gray-700 dark:text-gray-200'}`}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200/80 dark:bg-zinc-700 h-1 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-500 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${(t.subtasks.filter(s => s.isCompleted).length / t.subtasks.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // 2. Templates Management (P2, Project templates setup)
  const handleSaveAsTemplate = (name: string, description: string, blueprint: Task) => {
    const newTemplate: ProjectTemplate = {
      id: 'template-' + Date.now(),
      name,
      description,
      tasks: [
        {
          title: blueprint.title,
          description: blueprint.description,
          priority: blueprint.priority,
          quadrant: blueprint.quadrant,
          tags: blueprint.tags,
          subtasks: blueprint.subtasks.map(s => s.title)
        }
      ]
    };
    const updatedTemplates = [newTemplate, ...templates];
    setTemplates(updatedTemplates);
    localStorage.setItem('hm_next_todos_templates', JSON.stringify(updatedTemplates));
    alert('💾 成功保存到本地项目预设模板，稍后可一键克隆导入。');
  };

  const handleImportTemplate = (tplId: string) => {
    const template = templates.find(t => t.id === tplId);
    if (!template) return;

    const newTasks: Task[] = template.tasks.map((bt, index) => ({
      id: 'task-tpl-' + Date.now() + '-' + index,
      title: bt.title,
      description: bt.description,
      isCompleted: false,
      priority: bt.priority,
      quadrant: bt.quadrant,
      tags: [...bt.tags, template.name.substring(0, 4)],
      dueDate: new Date().toISOString().split('T')[0],
      subtasks: bt.subtasks.map((title, subidx) => ({
        id: `sub-init-tpl-${subidx}-${Date.now()}`,
        title,
        isCompleted: false
      })),
      dependencies: [],
      focusMinutes: 0,
      createdAt: new Date().toISOString()
    }));

    handleSaveTasks([...newTasks, ...tasks]);
    setActiveTab('LIST');
    setIsHomeScreen(false);
    alert(`⚡️ 已成功导入「${template.name}」中的 ${newTasks.length} 个任务！`);
  };

  const handleDeleteTemplate = (tplId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tplId === 'hm-release' || tplId === 'weekly-efficiency' || tplId === 'travel-packing') {
      alert('系统内置标准模板无法被清除。');
      return;
    }
    const filtered = templates.filter(t => t.id !== tplId);
    setTemplates(filtered);
    localStorage.setItem('hm_next_todos_templates', JSON.stringify(filtered));
  };

  // 3. Focus Timer trigger controllers
  const handleStartFocusOnTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setFocusMode('POMODORO');
    setTotalDuration(25 * 60);
    setTimeRemaining(25 * 60);
    setIsRunning(true);
    setIsPaused(false);
    setIsHomeScreen(false);
    setActiveTab('POMODORO');
  };

  const handleStartTimer = (duration: number, mode: FocusMode, taskId?: string) => {
    setFocusMode(mode);
    setTotalDuration(duration);
    setTimeRemaining(duration);
    setActiveTaskId(taskId);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
  };

  // Pasteboard / Clipboard simulated automatic import (剪贴板智能气泡 NLP, P1)
  const handleImportClipboardText = () => {
    if (!clipboardAlert) return;

    // Simple parser: Set Important & Urgent as tomorrow target
    const parsedTask: Task = {
      id: 'task-clip-' + Date.now(),
      title: '一键生成的待办：' + clipboardAlert,
      description: '导入自仿真系统剪贴板备忘录气泡。',
      isCompleted: false,
      priority: 'HIGH',
      quadrant: 1, // Automatic VIP classification
      tags: ['剪贴板', '会议'],
      dueDate: new Date().toISOString().split('T')[0],
      subtasks: [],
      dependencies: [],
      focusMinutes: 0,
      createdAt: new Date().toISOString()
    };

    handleSaveTasks([parsedTask, ...tasks]);
    setClipboardAlert(null);
    setActiveTab('LIST');
    alert('🎯 剪贴板带有地理代办事宜解析成功，极简待办卡片已一键添加至【第I象限】中！');
  };

  // Compute tag clouds
  const tagCloudSet = useMemo(() => {
    const rawTags = new Set<string>();
    tasks.forEach(t => t.tags.forEach(tag => rawTags.add(tag)));
    return Array.from(rawTags);
  }, [tasks]);

  // Filters and sorts computed list
  const filteredTasks = useMemo(() => {
    // 1. Filter
    const result = tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'ALL' || t.tags.includes(selectedTag);
      const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
      
      let matchesDueDate = true;
      if (filterDueDate === 'HAS_DUE_DATE') {
        matchesDueDate = !!t.dueDate;
      } else if (filterDueDate === 'NO_DUE_DATE') {
        matchesDueDate = !t.dueDate;
      }

      return matchesSearch && matchesTag && matchesPriority && matchesDueDate;
    });

    // Priority numerical mapping helper
    const getPriorityVal = (p: Priority): number => {
      switch (p) {
        case 'HIGH': return 3;
        case 'MEDIUM': return 2;
        case 'LOW': return 1;
        default: return 0;
      }
    };

    // 2. Sort
    if (sortBy === 'PRIORITY_DESC') {
      result.sort((a, b) => getPriorityVal(b.priority) - getPriorityVal(a.priority));
    } else if (sortBy === 'PRIORITY_ASC') {
      result.sort((a, b) => getPriorityVal(a.priority) - getPriorityVal(b.priority));
    } else if (sortBy === 'DUE_DATE_ASC') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else if (sortBy === 'DUE_DATE_DESC') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      });
    }

    return result;
  }, [tasks, searchQuery, selectedTag, sortBy, filterPriority, filterDueDate]);

  const todayStr = useMemo(() => {
    // Return today's date in YYYY-MM-DD
    return new Date().toISOString().split('T')[0];
  }, []);

  const overdueTasks = useMemo(() => {
    return filteredTasks.filter(t => !t.isCompleted && t.dueDate && t.dueDate < todayStr);
  }, [filteredTasks, todayStr]);

  const todayTasks = useMemo(() => {
    return filteredTasks.filter(t => t.dueDate === todayStr || !t.dueDate);
  }, [filteredTasks, todayStr]);

  const futureTasks = useMemo(() => {
    return filteredTasks.filter(t => t.dueDate && t.dueDate > todayStr);
  }, [filteredTasks, todayStr]);

  const filteredHabits = useMemo(() => {
    // Only show habits when selecting default 'ALL' tag or matching the query search
    if (selectedTag !== 'ALL') return [];
    return habits.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [habits, searchQuery, selectedTag]);

  // Live countdown label
  const formatTimerLabel = () => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div id="full-page" className={`min-h-screen py-8 px-4 flex items-center justify-center font-sans tracking-tight transition-colors duration-300 ${darkMode ? 'dark bg-[#121214] text-[#E5E5E7]' : 'bg-[#F0F2F5] text-gray-800'}`}>
      
      {/* HarmonyOS Mock Hardware Frame */}
      <MockDevice
        isTimerActive={isRunning}
        timerLabel={formatTimerLabel()}
        isPaused={isPaused}
        timerTitle={tasks.find(t => t.id === activeTaskId)?.title || '极简专注'}
        onPauseToggle={handlePauseToggle}
        onStopTimer={handleStopTimer}
        isHomeScreen={isHomeScreen}
        onToggleHomeScreen={() => setIsHomeScreen(!isHomeScreen)}
        clipboardItem={clipboardAlert}
        onImportClipboard={handleImportClipboardText}
        onClearClipboard={() => setClipboardAlert(null)}
      >
        {isHomeScreen ? (
          // DESKTOP HOMESCREEN WIDGET PLAYGROUND
          <WidgetPlayground
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            isTimerActive={isRunning}
            isPaused={isPaused}
            timerLabel={formatTimerLabel()}
            activeTaskId={activeTaskId}
            onStartFocusOnTask={handleStartFocusOnTask}
            onPauseFocus={handlePauseToggle}
            onStopFocus={handleStopTimer}
            onOpenFullApp={() => setIsHomeScreen(false)}
          />
        ) : (
          // THE APP CORE FULL SCREEN
          <div id="app-viewport" className="flex-1 flex flex-col justify-between overflow-hidden bg-[#EDEFF2] h-full">
            
            {/* Nav Header Row */}
            <div className="px-5 pt-3.5 pb-2.5 bg-white/70 backdrop-blur-md border-b border-gray-200/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-[#007DFF] text-base font-sans tracking-tight">ZenFlow</span>
                  {isRunning && (
                    <div className="bg-[#E8F3FF] px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-100/30 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#007DFF]" />
                      <span className="text-[9.5px] font-bold text-[#007DFF] font-mono">
                        专注中: {formatTimerLabel()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-extrabold hidden sm:inline">2026年5月27日 星期三</span>
                  
                  {/* Settings Icon integrating templates & dark mode style switches */}
                  <button
                    id="btn-header-settings-toggle"
                    onClick={() => setIsSettingsOpen(true)}
                    title="系统设置与项目模版导入"
                    className="p-1 px-2.5 text-[10.5px] font-bold text-[#007DFF] bg-[#E8F3FF] dark:bg-[#007DFF]/10 hover:bg-blue-100 rounded-xl transition-all border border-[#007DFF]/10 flex items-center gap-1 cursor-pointer"
                  >
                    <Settings size={12} className="animate-spin-slow text-[#007DFF]" />
                    <span>设置</span>
                  </button>
                </div>
              </div>

              {/* Advanced search and tagging filters */}
              {(activeTab === 'LIST' || activeTab === 'QUADRANT') && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {/* Search box */}
                  <div className="flex-1 relative flex items-center bg-gray-100/80 hover:bg-gray-100 rounded-2xl p-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#007DFF]/15 transition-all border border-gray-150/10">
                    <Search size={13} className="text-gray-400 ml-2" />
                    <input
                      id="input-search-query"
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="搜索具体待办任务名称..."
                      className="w-full bg-transparent focus:outline-none border-0 p-0.5 text-xs text-gray-700"
                    />
                  </div>

                  {/* Horizontal tags filter scroll */}
                  <div id="tags-filter-scroller" className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5 max-w-sm">
                    <button
                      id="btn-filter-tag-all"
                      onClick={() => setSelectedTag('ALL')}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        selectedTag === 'ALL' 
                          ? 'bg-[#1A1A1A] dark:bg-zinc-800 text-white font-black' 
                          : 'bg-gray-100 dark:bg-zinc-900/30 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800 font-bold'
                      }`}
                    >
                      全部
                    </button>
                    {tagCloudSet.map((tag, idx) => (
                      <button
                        id={`btn-filter-tag-${idx}`}
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg whitespace-nowrap transition-colors flex items-center gap-0.5 cursor-pointer ${
                          selectedTag === tag 
                            ? 'bg-[#007DFF] text-white font-black' 
                            : 'bg-gray-100 dark:bg-zinc-900/30 text-gray-650 dark:text-gray-305 hover:bg-gray-200 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Tag size={8} />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Viewport Inner Section */}
            <div id="viewport-pane-scroller" className="flex-1 p-4 overflow-y-auto max-h-[515px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  {/* TAB 1: ALL LIST VIEW WITH SWIPE ACTION LOOK */}
                  {activeTab === 'LIST' && (
                    <div id="view-tab-list" className="space-y-4 pb-12">
                      
                      {/* Bento Highlight Metrics cards */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white/80 dark:bg-zinc-900/40 p-3 rounded-2xl border border-gray-150/10 dark:border-zinc-800/20 backdrop-blur-md flex flex-col justify-between h-[64px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-extrabold text-[#007DFF]">今日完结率</span>
                            <Sparkles size={11} className="text-[#007DFF]" />
                          </div>
                          <div className="flex items-end justify-[#007DFF] justify-between">
                            <span className="text-sm font-black text-gray-950 dark:text-gray-50 font-sans tracking-tight">
                              {tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0}%
                            </span>
                            <span className="text-[8.5px] text-gray-400 font-bold">
                              {tasks.filter(t => t.isCompleted).length} / {tasks.length} 已清
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/80 dark:bg-zinc-900/40 p-3 rounded-2xl border border-gray-150/10 dark:border-zinc-800/20 backdrop-blur-md flex flex-col justify-between h-[64px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-extrabold text-[#007DFF]">专注统计</span>
                            <Clock3 size={11} className="text-[#007DFF]" />
                          </div>
                          <div className="flex items-end justify-between">
                            <span className="text-sm font-black text-gray-950 dark:text-gray-50 font-sans tracking-tight">
                              {tasks.reduce((sum, t) => sum + (t.focusMinutes || 0), 0)} min
                            </span>
                            <span className="text-[8.5px] text-gray-400 font-bold animate-pulse">
                              累计番茄
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Create Task Button card */}
                      <button
                        id="btn-trigger-add-task"
                        onClick={() => handleAddTask(2)}
                        className="w-full bg-white dark:bg-[#1C1C1E] border border-dashed border-gray-200 dark:border-zinc-805 hover:border-gray-400 dark:hover:border-zinc-700 p-3 rounded-2xl flex items-center justify-center space-x-2 text-gray-400 hover:text-gray-650 transition-colors cursor-pointer shadow-3xs"
                      >
                        <Plus size={14} />
                        <span className="text-[11px] font-bold leading-none">快速添加待办事项</span>
                      </button>

                      {/* Interactive Sorting & Filtering Dropdowns */}
                      <div id="task-list-controls" className="bg-[#FAFAFB] dark:bg-zinc-900/40 border border-gray-150/15 dark:border-zinc-800/15 rounded-3xl p-3 flex flex-col gap-2.5 shadow-3xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-black tracking-widest text-[#007DFF] uppercase flex items-center gap-1">
                            <SlidersHorizontal size={10} />
                            筛选与视图排序
                          </span>
                          {(sortBy !== 'DEFAULT' || filterPriority !== 'ALL' || filterDueDate !== 'ALL') && (
                            <button
                              id="btn-clear-filters"
                              onClick={() => {
                                setSortBy('DEFAULT');
                                setFilterPriority('ALL');
                                setFilterDueDate('ALL');
                              }}
                              className="text-[9.5px] font-bold text-gray-400 hover:text-rose-500 hover:underline transition-colors cursor-pointer flex items-center gap-0.5"
                            >
                              <span>重置筛选条件</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {/* Sort Selector */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[8.5px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase flex items-center gap-0.5 pl-0.5">
                              <ArrowUpDown size={8} />
                              排序规则
                            </label>
                            <select
                              id="select-sort-by"
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value as any)}
                              className="w-full bg-white dark:bg-[#252529] border border-gray-150/30 dark:border-zinc-800 rounded-xl p-1.5 px-2 text-[10px] font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#007DFF]/20"
                            >
                              <option value="DEFAULT">默认排序 (创建时间)</option>
                              <option value="PRIORITY_DESC">按优先级 (高 → 低)</option>
                              <option value="PRIORITY_ASC">按优先级 (低 → 高)</option>
                              <option value="DUE_DATE_ASC">截止时间 (最接近优先)</option>
                              <option value="DUE_DATE_DESC">截止时间 (最晚优先)</option>
                            </select>
                          </div>

                          {/* Priority Filter */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[8.5px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase pl-0.5 animate-pulse">
                              优先级过滤
                            </label>
                            <select
                              id="select-filter-priority"
                              value={filterPriority}
                              onChange={(e) => setFilterPriority(e.target.value as any)}
                              className="w-full bg-white dark:bg-[#252529] border border-gray-150/30 dark:border-zinc-800 rounded-xl p-1.5 px-2 text-[10px] font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#007DFF]/20"
                            >
                              <option value="ALL">全部优先级</option>
                              <option value="HIGH">🔴 高优先级</option>
                              <option value="MEDIUM">🟡 中优先级</option>
                              <option value="LOW">🔵 低优先级</option>
                            </select>
                          </div>

                          {/* Due Date Filter */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[8.5px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase pl-0.5">
                              截止日期筛选
                            </label>
                            <select
                              id="select-filter-due-date"
                              value={filterDueDate}
                              onChange={(e) => setFilterDueDate(e.target.value as any)}
                              className="w-full bg-white dark:bg-[#252529] border border-gray-150/30 dark:border-zinc-800 rounded-xl p-1.5 px-2 text-[10px] font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#007DFF]/20"
                            >
                              <option value="ALL">全部截止日</option>
                              <option value="HAS_DUE_DATE">📅 仅含截止时间</option>
                              <option value="NO_DUE_DATE">⚪仅无截止时间</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* --- Section 1: 已过期未完成的任务列表 (Red Accent) --- */}
                      {overdueTasks.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 pl-1">
                            <AlertTriangle size={12} className="text-rose-500 animate-pulse" />
                            <h4 className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">已过期未完成 ({overdueTasks.length})</h4>
                          </div>
                          <div className="space-y-2.5">
                            {overdueTasks.map(renderTaskCard)}
                          </div>
                        </div>
                      )}

                      {/* --- Section 2: 当日任务列表 (Blue Accent) --- */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 pl-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#007DFF] animate-ping" />
                          <h4 className="text-[10px] font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-widest">今日聚焦待办 ({todayTasks.length})</h4>
                        </div>
                        {todayTasks.length === 0 ? (
                          <div className="p-4 bg-white/40 dark:bg-zinc-805/20 rounded-2xl border border-gray-150/10 dark:border-zinc-800 text-center text-gray-400 dark:text-zinc-600 font-medium text-[10px]">
                            今天没有安排任务，点击上方按钮注入新待办
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {todayTasks.map(renderTaskCard)}
                          </div>
                        )}
                      </div>

                      {/* --- Section 3: 习惯列表 (Green Accent) --- */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 pl-1">
                          <RefreshCw size={11} className="text-emerald-500 animate-spin-slow" />
                          <h4 className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">每日习惯习惯对齐 ({filteredHabits.filter(h => h.completedDates.includes(todayStr)).length} / {filteredHabits.length})</h4>
                        </div>
                        {filteredHabits.length === 0 ? (
                          <div className="p-4 bg-white/40 dark:bg-zinc-805/20 rounded-2xl border border-gray-150/10 dark:border-zinc-800 text-center text-gray-400 dark:text-zinc-650 text-[10px] font-medium leading-relaxed">
                            暂列无习惯。您可以在右上方【偏好设置】中添加或去除当前习惯库
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2">
                            {filteredHabits.map(h => {
                              const isCompletedToday = h.completedDates.includes(todayStr);
                              return (
                                <div key={h.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-150/40 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-all shadow-3xs">
                                  <div className="flex items-center gap-3">
                                    <button
                                      id={`btn-habitcheck-${h.id}`}
                                      onClick={() => handleToggleHabitToday(h.id)}
                                      className="cursor-pointer transition-all active:scale-90"
                                    >
                                      {isCompletedToday ? (
                                        <CheckCircle2 size={16} className="fill-emerald-55 text-emerald-600 dark:fill-emerald-950/20" />
                                      ) : (
                                        <Circle size={16} className="text-gray-350 dark:text-zinc-600 hover:text-gray-500" />
                                      )}
                                    </button>
                                    <span className={`text-[11px] font-bold ${isCompletedToday ? 'line-through text-gray-400 dark:text-zinc-550 font-normal' : 'text-gray-800 dark:text-gray-200'}`}>
                                      {h.title}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8.5px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-extrabold">
                                      🔥 累计已打卡 {h.completedDates.length} 天
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* --- Section 4: 其他未来时间的任务列表 (Purple Accent) --- */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 pl-1">
                          <FolderOpen size={11} className="text-indigo-505 text-indigo-505 text-indigo-500" />
                          <h4 className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">后续安排任务 ({futureTasks.length})</h4>
                        </div>
                        {futureTasks.length === 0 ? (
                          <div className="p-4 bg-white/40 dark:bg-zinc-805/20 rounded-2xl border border-gray-150/10 dark:border-zinc-800 text-center text-gray-400 dark:text-zinc-600 font-medium text-[10px]">
                            后续无多余时间代办安排
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {futureTasks.map(renderTaskCard)}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 2: FOUR QUADRANT VIEWS */}
                  {activeTab === 'QUADRANT' && (
                    <div id="view-tab-quadrant" className="h-full">
                      <TaskQuadrant
                        tasks={filteredTasks}
                        onToggleComplete={handleToggleComplete}
                        onEditTask={handleEditTask}
                        onToggleSubtask={handleToggleSubtask}
                        onUpdateTaskQuadrant={handleUpdateTaskQuadrant}
                        quadrantCategories={quadrantCategories}
                        onAddTaskInQuadrant={(q) => {
                          const customTask: Task = {
                            id: 'task-' + Date.now(),
                            title: '',
                            description: '',
                            isCompleted: false,
                            priority: q === 1 ? 'HIGH' : q === 2 ? 'MEDIUM' : 'LOW',
                            quadrant: q,
                            tags: ['工作'],
                            dueDate: new Date().toISOString().split('T')[0],
                            subtasks: [],
                            dependencies: [],
                            focusMinutes: 0,
                            createdAt: new Date().toISOString()
                          };
                          setEditingTask(customTask);
                          setIsDrawerOpen(true);
                        }}
                      />
                    </div>
                  )}

                  {/* TAB 3: CALENDAR VIEW */}
                  {activeTab === 'CALENDAR' && (
                    <div id="view-tab-calendar" className="h-full bg-white rounded-[2rem] p-4.5 shadow-2xs border border-gray-100">
                      <CalendarView
                        tasks={tasks}
                        onEditTask={handleEditTask}
                        selectedDate={selectedDate}
                        onSelectDate={(date) => {
                          setSelectedDate(date);
                          // Trigger mini modal or alert that they've picked date
                        }}
                      />
                    </div>
                  )}

                  {/* TAB 4: POMORODO HUB FOCUS VIEW */}
                  {activeTab === 'POMODORO' && (
                    <div id="view-tab-pomodoro" className="h-full">
                      <PomodoroHub
                        tasks={tasks}
                        isRunning={isRunning}
                        isPaused={isPaused}
                        timeRemaining={timeRemaining}
                        totalDuration={totalDuration}
                        focusMode={focusMode}
                        activeTaskId={activeTaskId}
                        onStartTimer={handleStartTimer}
                        onPauseToggle={handlePauseToggle}
                        onStopTimer={handleStopTimer}
                        onLinkTask={(taskId) => setActiveTaskId(taskId || undefined)}
                        audioSynth={audioSynthRef.current!}
                      />
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Segments Tabs Board */}
            <div id="app-bottom-nav" className="bg-white/80 backdrop-blur-md px-4 py-2 border-t border-gray-200/40 grid grid-cols-4 gap-0.5 text-center select-none z-10 w-full">
              {[
                { id: 'LIST' as const, name: '待办', icon: <CheckSquare size={16} /> },
                { id: 'QUADRANT' as const, name: '四象限', icon: <Grid2X2 size={16} /> },
                { id: 'CALENDAR' as const, name: '日历', icon: <Calendar size={16} /> },
                { id: 'POMODORO' as const, name: '专注', icon: <Clock3 size={16} /> }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    id={`btn-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsHomeScreen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-1 px-2.5 rounded-2xl cursor-pointer hover:bg-gray-100/50 transition-colors ${
                      isActive 
                        ? 'text-[#007DFF] font-black' 
                        : 'text-gray-400 hover:text-gray-600 font-bold'
                    }`}
                  >
                    <div className={isActive ? 'scale-105 transition-transform' : ''}>
                      {tab.icon}
                    </div>
                    <span className="text-[9.5px] mt-0.5 tracking-wider font-extrabold">{tab.name}</span>
                  </button>
                );
              })}
            </div>

          </div>
        )}
      </MockDevice>

      {/* ZenFlow Clean Settings Modal Triggered from Header */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1C1C1E] border border-gray-150/20 dark:border-zinc-800 rounded-[2rem] w-full max-w-md p-5 shadow-2xl relative overflow-hidden text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <Settings className="text-[#007DFF] animate-spin-slow" size={15} />
                  <h3 className="text-xs font-black text-gray-950 dark:text-gray-50">ZenFlow 智能偏好设置</h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto no-scrollbar">
                {/* 1. Theme style switcher integrated to settings */}
                <div className="space-y-1.5">
                  <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase block">显示色彩风格</span>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-[#252529] p-1 rounded-xl border border-gray-150/10">
                    <button
                      onClick={() => setDarkMode(false)}
                      className={`p-2 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        !darkMode
                          ? 'bg-white text-[#007DFF] border border-blue-100/30 shadow-2xs'
                          : 'bg-transparent text-gray-400 text-opacity-80'
                      }`}
                    >
                      <Sun size={11} />
                      <span>日间常态</span>
                    </button>
                    <button
                      onClick={() => setDarkMode(true)}
                      className={`p-2 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        darkMode
                          ? 'bg-[#1C1C1E] text-[#007DFF] border border-zinc-700/60 shadow-2xs'
                          : 'bg-transparent text-gray-400 text-opacity-80'
                      }`}
                    >
                      <Moon size={11} />
                      <span>舒适深色</span>
                    </button>
                  </div>
                </div>

                {/* 2. Tasks cleaning helper integrated inside settings */}
                <div className="space-y-1.5">
                  <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase block">快捷存储管家</span>
                  <button
                    onClick={() => {
                      handleClearCompletedHistory();
                      setIsSettingsOpen(false);
                    }}
                    className="w-full p-2.5 bg-rose-50 hover:bg-rose-100/60 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-200/20 dark:border-rose-500/10 font-bold rounded-xl text-[10.5px] text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>清理所有已完成待办历史</span>
                  </button>
                </div>

                {/* 3. Settings of Habits list */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase block">打卡习惯库管理</span>
                  {/* Habit Add Inline form */}
                  <div className="flex gap-1.5">
                    <input
                      id="input-settings-new-habit"
                      type="text"
                      value={newHabitTitle}
                      onChange={e => setNewHabitTitle(e.target.value)}
                      placeholder="例如：每日背单词 10 个"
                      className="flex-1 p-2 bg-gray-50 dark:bg-[#252529] border border-gray-150/20 dark:border-zinc-800 rounded-xl text-[10px] text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                    <button
                      id="btn-settings-add-habit-trigger"
                      onClick={handleAddHabit}
                      className="px-3 bg-[#007DFF] text-white hover:bg-blue-600 font-bold rounded-xl text-[10px] transition-colors cursor-pointer"
                    >
                      新增习惯
                    </button>
                  </div>
                  {/* List of Habits */}
                  {habits.length > 0 ? (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto no-scrollbar pt-1">
                      {habits.map(h => (
                        <div key={h.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#252529] rounded-xl border border-gray-155/10 text-[10px] text-gray-700 dark:text-gray-200">
                          <span className="truncate font-semibold">{h.title}</span>
                          <button
                            onClick={() => handleDeleteHabit(h.id)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-600 transition-colors rounded-sm cursor-pointer ml-2 flex-shrink-0"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[8.5px] text-gray-400 dark:text-zinc-650 italic pl-1">暂无习惯，快在上方输入定制一个吧</p>
                  )}
                </div>

                {/* 4. Settings of dynamic Quadrants categories */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase block">个性化四象限扩充</span>
                  
                  {/* Color presets selection row */}
                  <div className="space-y-1 pb-1">
                    <span className="text-[8.5px] text-gray-400 dark:text-gray-500 block">色彩风格轮廓线预设</span>
                    <div className="flex items-center space-x-2 bg-gray-50 dark:bg-[#252529] p-1.5 rounded-xl border border-gray-150/5">
                      {QUADRANT_PRESET_DESIGNS.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPresetIndex(idx)}
                          className={`w-4 h-4 rounded-full border transition-all ${p.color} ${
                            selectedPresetIndex === idx 
                              ? 'ring-2 ring-offset-2 ring-[#007DFF] scale-110' 
                              : 'border-transparent opacity-80'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Input form */}
                  <div className="space-y-1.5">
                    <input
                      id="input-new-quadrant-title"
                      type="text"
                      value={newQuadTitle}
                      onChange={e => setNewQuadTitle(e.target.value)}
                      placeholder="极速象限名，例如：无脑琐碎小事"
                      className="w-full p-2 bg-gray-50 dark:bg-[#252529] border border-gray-150/20 dark:border-zinc-800 rounded-xl text-[10px] text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                    <div className="flex gap-1.5">
                      <input
                        id="input-new-quadrant-desc"
                        type="text"
                        value={newQuadDescription}
                        onChange={e => setNewQuadDescription(e.target.value)}
                        placeholder="象限的精细定义或边界描述"
                        className="flex-1 p-2 bg-gray-50 dark:bg-[#252529] border border-gray-150/20 dark:border-zinc-800 rounded-xl text-[10px] text-gray-80s dark:text-gray-200 focus:outline-none"
                      />
                      <button
                        id="btn-settings-add-quadrant"
                        onClick={handleAddQuadrant}
                        className="px-3 bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl text-[10px] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        添增该象限
                      </button>
                    </div>
                  </div>

                  {/* Existing dynamic quadrant list */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar pt-1">
                    {quadrantCategories.map(qc => (
                      <div key={qc.id} className="flex items-start justify-between p-2.5 bg-gray-50 dark:bg-[#252529] rounded-xl border border-gray-155/10 text-[10px] text-gray-750 dark:text-gray-300 gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full inline-block ${qc.color}`} />
                            <span className="truncate">{qc.title}</span>
                          </p>
                          <p className="text-[8.5px] text-gray-405 dark:text-zinc-500 mt-0.5 leading-snug">{qc.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteQuadrant(qc.id)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-500 transition-colors rounded-sm cursor-pointer flex-shrink-0"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Standard checklist Templates integrated inside settings */}
                <div className="space-y-2">
                  <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase block">项目预设模板库</span>
                  <div id="settings-templates-container" className="space-y-2">
                    {templates.map(tpl => (
                      <div
                        id={`settings-tpl-${tpl.id}`}
                        key={tpl.id}
                        className="p-2.5 bg-gray-50 dark:bg-[#252529] rounded-xl border border-gray-150/40 dark:border-zinc-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[10px] font-bold text-gray-800 dark:text-gray-[#EAEAEB] truncate">{tpl.name}</h4>
                          <p className="text-[8.5px] text-gray-400 dark:text-gray-500 truncate mt-0.5 leading-tight">{tpl.description}</p>
                        </div>
                        <button
                          id={`btn-settings-import-tpl-${tpl.id}`}
                          onClick={() => {
                            handleImportTemplate(tpl.id);
                            setIsSettingsOpen(false);
                          }}
                          className="px-2.5 py-1 text-[9px] font-bold text-[#007DFF] bg-[#E8F3FF] dark:bg-[#007DFF]/10 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex-shrink-0"
                        >
                          导入
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-850 flex items-center justify-between text-[8px] text-gray-400 font-mono font-bold leading-none">
                <span>ZenFlow v1.8 • Style Bento</span>
                <span>HarmonyOS NEXT Design</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bottom Sliding Bottom Drawer Panel */}
      <TaskDrawer
        isOpen={isDrawerOpen}
        task={editingTask}
        allTasks={tasks}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveDrawerTask}
        onSaveAsTemplate={handleSaveAsTemplate}
      />
    </div>
  );
}
