/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, Quadrant, Priority, ProjectTemplate, FocusMode, Habit, QuadrantCategory } from './types';
import { FocusAudioSynthesizer } from './utils/audio';
import { Storage } from './utils/storage';
import { DEFAULT_TEMPLATES } from './utils/templates';
import { WidgetPlayground } from './components/WidgetPlayground';
import { TaskDrawer } from './components/TaskDrawer';
import { TaskQuadrant } from './components/TaskQuadrant';
import { CalendarView } from './components/CalendarView';
import { PomodoroHub } from './components/PomodoroHub';
import { motion, AnimatePresence } from 'motion/react';
import { getLocalISODate } from './utils/date';
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
  Clipboard,
  Sun,
  Moon,
  Settings,
  X,
  ArrowUpDown,
  SlidersHorizontal,
  Mic,
  MicOff,
  Mail,
  Loader,
  Send
} from 'lucide-react';

const INITIAL_TASKS: Task[] = [
  {
    id: 'guide-task-1',
    title: '了解如何使用四象限分配任务优先级',
    description: '通过拖拽或者点击编辑，你可以将任务分配到不同的象限，从而更好地管理你的时间和精力。',
    isCompleted: false,
    priority: 'HIGH',
    quadrant: 1,
    tags: ['新手引导', '重要'],
    dueDate: getLocalISODate(),
    subtasks: [],
    dependencies: [],
    focusMinutes: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: 'guide-task-2',
    title: '尝试进行一次 25 分钟的番茄专注',
    description: '点击右侧的番茄钟图标，或者在底部菜单切换到专注模式，开始你的第一次番茄钟。专注能够帮你大幅提高效率！',
    isCompleted: false,
    priority: 'MEDIUM',
    quadrant: 2,
    tags: ['新手引导', '专注'],
    dueDate: getLocalISODate(),
    subtasks: [],
    dependencies: [],
    focusMinutes: 0,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_HABITS: Habit[] = [
  {
    id: 'guide-habit-1',
    title: '每天早晨喝一杯温水',
    createdAt: new Date().toISOString(),
    completedDates: [],
    periodType: 'DAILY',
    startDate: getLocalISODate(),
    endDate: '2099-12-31'
  }
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
    return Storage.getItem('hm_dark_mode') === 'true';
  });

  useEffect(() => {
    Storage.setItem('hm_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Navigation tabs and layout states
  const [isHomeScreen, setIsHomeScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'LIST' | 'HABIT' | 'QUADRANT' | 'CALENDAR' | 'POMODORO' | 'TEMPLATES'>('LIST');
  const [selectedDate, setSelectedDate] = useState(() => getLocalISODate());

  const [showHabitsTab, setShowHabitsTab] = useState<boolean>(() => {
    return Storage.getItem('hm_show_habits_tab') !== 'false';
  });
  const [showQuadrantsTab, setShowQuadrantsTab] = useState<boolean>(() => {
    return Storage.getItem('hm_show_quadrants_tab') !== 'false';
  });
  const [showPomodoroTab, setShowPomodoroTab] = useState<boolean>(() => {
    return Storage.getItem('hm_show_pomodoro_tab') !== 'false';
  });
  const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(false);
  const [groupByTagCluster, setGroupByTagCluster] = useState<boolean>(() => {
    return Storage.getItem('hm_group_by_tag_cluster') === 'true';
  });

  // Focus Custom Settings State
  const [customFocusTitle, setCustomFocusTitle] = useState('');

  // Habits form states for direct habit custom creation in Menu
  const [newHabitTitleVal, setNewHabitTitleVal] = useState('');
  const [newHabitPeriod, setNewHabitPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [newHabitStart, setNewHabitStart] = useState(() => getLocalISODate());
  const [newHabitEnd, setNewHabitEnd] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3); // 3 months default
    return getLocalISODate(d);
  });
  const [selectedWeeklyDays, setSelectedWeeklyDays] = useState<number[]>([]);
  const [selectedMonthlyDays, setSelectedMonthlyDays] = useState<number[]>([]);

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

  // Voice Speech Parsing State
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

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
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isConfirmClearModalOpen, setIsConfirmClearModalOpen] = useState(false);
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Initialize singular audio synthesizer ref to prevent duplicated sound assets
  const audioSynthRef = useRef<FocusAudioSynthesizer | null>(null);
  const stopwatchIntervalRef = useRef<number | null>(null);

  // 导航历史：支持鸿蒙左滑返回手势
  type TabType = 'LIST' | 'HABIT' | 'QUADRANT' | 'CALENDAR' | 'POMODORO' | 'TEMPLATES';
  const navigateTo = (tab: TabType) => {
    if (tab === activeTab) return;
    // 写入浏览器历史，让 ArkWeb 的 backward() 可以感知
    history.pushState({ tab }, '', `#${tab.toLowerCase()}`);
    setActiveTab(tab);
  };

  // 监听浏览器 popstate 事件（鸿蒙左滑触发 controller.backward() 时会产生）
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // 优先关闭弹窗/抽屉
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        setEditingTask(null);
        // 阻止实际的页面后退，重新 push 当前状态
        history.pushState({ tab: activeTab }, '', `#${activeTab.toLowerCase()}`);
        return;
      }
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        history.pushState({ tab: activeTab }, '', `#${activeTab.toLowerCase()}`);
        return;
      }
      if (isTemplateModalOpen) {
        setIsTemplateModalOpen(false);
        return;
      }
      if (isConfirmClearModalOpen) {
        setIsConfirmClearModalOpen(false);
        return;
      }
      if (isAddHabitModalOpen) {
        setIsAddHabitModalOpen(false);
        history.pushState({ tab: activeTab }, '', `#${activeTab.toLowerCase()}`);
        return;
      }
      if (isFeedbackModalOpen) {
        setIsFeedbackModalOpen(false);
        return;
      }
      // 回退到上一个 Tab
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab as TabType);
      } else {
        // 历史栈已空，回到默认首页
        setActiveTab('LIST');
      }
    };

    window.addEventListener('popstate', handlePopState);
    // 初始化当前页面的历史状态
    history.replaceState({ tab: activeTab }, '', `#${activeTab.toLowerCase()}`);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab, isDrawerOpen, isSettingsOpen, isTemplateModalOpen, isAddHabitModalOpen, isConfirmClearModalOpen, isFeedbackModalOpen]);

  // Initialize data on mount
  useEffect(() => {
    // Clear old prototype mock data (v2 flush)
    if (!Storage.getItem('hm_next_v3_cleared')) {
      Storage.clear();
      Storage.setItem('hm_next_v3_cleared', 'true');
    }

    // Lazy instance of FocusAudioSynthesizer
    if (!audioSynthRef.current) {
      audioSynthRef.current = new FocusAudioSynthesizer();
    }

    // Load Local Tasks
    const localTasks = Storage.getItem('hm_next_todos_tasks');
    if (localTasks) {
      try {
        setTasks(JSON.parse(localTasks));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
      Storage.setItem('hm_next_todos_tasks', JSON.stringify(INITIAL_TASKS));
    }

    // Load Local Templates
    const localTemplates = Storage.getItem('hm_next_todos_templates');
    if (localTemplates) {
      try {
        setTemplates(JSON.parse(localTemplates));
      } catch (e) {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } else {
      setTemplates(DEFAULT_TEMPLATES);
      Storage.setItem('hm_next_todos_templates', JSON.stringify(DEFAULT_TEMPLATES));
    }

    // Load Local Habits
    const localHabits = Storage.getItem('hm_next_todos_habits');
    if (localHabits) {
      try {
        setHabits(JSON.parse(localHabits));
      } catch (e) {
        setHabits(INITIAL_HABITS);
      }
    } else {
      setHabits(INITIAL_HABITS);
      Storage.setItem('hm_next_todos_habits', JSON.stringify(INITIAL_HABITS));
    }

    // Load Local Quadrants
    const localQuadrants = Storage.getItem('hm_next_todos_quadrants');
    if (localQuadrants) {
      try {
        setQuadrantCategories(JSON.parse(localQuadrants));
      } catch (e) {
        setQuadrantCategories(DEFAULT_QUADRANTS);
      }
    } else {
      setQuadrantCategories(DEFAULT_QUADRANTS);
      Storage.setItem('hm_next_todos_quadrants', JSON.stringify(DEFAULT_QUADRANTS));
    }


    // 暴露全局方法供鸿蒙原生层处理卡片 router action 跳转意图
    (window as any).__handleCardAction = (payloadStr: string) => {
      try {
        const payload = JSON.parse(payloadStr);
        if (payload && payload.params && payload.params.action) {
          const action = payload.params.action;
          if (action === 'startPomodoro') {
            window.dispatchEvent(new CustomEvent('startPomodoroAction'));
          } else if (action === 'viewTask') {
            setActiveTab('LIST');
          } else if (action === 'addTask') {
            setActiveTab('LIST');
            setIsDrawerOpen(true);
          } else if (action === 'openPomodoro') {
            setActiveTab('POMODORO');
          } else if (action === 'viewHabit') {
            setActiveTab('HABIT');
          }
        }
      } catch (e) {
        console.error('Failed to parse card action payload:', e);
      }
    };

    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, []);

  // Save tasks helper
  const handleSaveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    Storage.setItem('hm_next_todos_tasks', JSON.stringify(updatedTasks));
  };

  // Save habits helper
  const handleSaveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    Storage.setItem('hm_next_todos_habits', JSON.stringify(updatedHabits));
  };

  // Save quadrant categories helper
  const handleSaveQuadrants = (updatedQuads: QuadrantCategory[]) => {
    setQuadrantCategories(updatedQuads);
    Storage.setItem('hm_next_todos_quadrants', JSON.stringify(updatedQuads));
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
    
    // Call native API to cancel ongoing notification and show completion
    if ((window as any).hmNotification) {
      (window as any).hmNotification.cancelPomodoroNotification(true);
    }
    
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

  // ========== NLP 语义智能解析引擎 ==========
  // 从自然语言文本中提取：时间、日期、优先级、标签、标题
  const nlpParseText = (text: string) => {
    const now = new Date();
    let dueDate = getLocalISODate(now); // Default today
    let dueTime = ''; // HH:MM format
    let quadrant: Quadrant = 2;
    let priority: Priority = 'MEDIUM';
    const tags: string[] = [];
    
    // ---- 1. 解析优先级/象限 ----
    if (text.includes('重要且紧急') || text.includes('紧急且重要') || text.includes('p0') || text.includes('P0') || (text.includes('重要') && text.includes('紧急'))) {
      quadrant = 1; priority = 'HIGH';
    } else if (text.includes('重要')) {
      quadrant = 2; priority = 'HIGH';
    } else if (text.includes('紧急')) {
      quadrant = 3; priority = 'MEDIUM';
    } else if (text.includes('不重要') || text.includes('无所谓') || text.includes('日常') || text.includes('空闲')) {
      quadrant = 4; priority = 'LOW';
    }

    // ---- 2. 解析日期 ----
    if (text.includes('明天') || text.includes('次日')) {
      const d = new Date(now); d.setDate(d.getDate() + 1);
      dueDate = getLocalISODate(d);
    } else if (text.includes('后天')) {
      const d = new Date(now); d.setDate(d.getDate() + 2);
      dueDate = getLocalISODate(d);
    } else if (text.includes('大后天')) {
      const d = new Date(now); d.setDate(d.getDate() + 3);
      dueDate = getLocalISODate(d);
    } else if (text.includes('下周')) {
      // 解析下周几
      const weekDayMatch = text.match(/下周([一二三四五六日天])/);
      if (weekDayMatch) {
        const weekMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
        const targetDay = weekMap[weekDayMatch[1]];
        const d = new Date(now);
        const currentDay = d.getDay();
        let daysUntil = (targetDay - currentDay + 7) % 7 + 7; // 保证是下周
        d.setDate(d.getDate() + daysUntil);
        dueDate = getLocalISODate(d);
      } else {
        const d = new Date(now); d.setDate(d.getDate() + 7);
        dueDate = getLocalISODate(d);
      }
    } else if (text.includes('下个月') || text.includes('下月')) {
      const d = new Date(now); d.setMonth(d.getMonth() + 1);
      dueDate = getLocalISODate(d);
    } else {
      // 解析 周几/星期几
      const weekDayMatch = text.match(/(?:这?(?:周|星期))([一二三四五六日天])/);
      if (weekDayMatch) {
        const weekMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
        const targetDay = weekMap[weekDayMatch[1]];
        const d = new Date(now);
        const currentDay = d.getDay();
        let daysUntil = (targetDay - currentDay + 7) % 7;
        if (daysUntil === 0) daysUntil = 7; // 如果是今天，则指下周
        d.setDate(d.getDate() + daysUntil);
        dueDate = getLocalISODate(d);
      }
      // 解析 M月D日 格式
      const dateMatch = text.match(/(\d{1,2})月(\d{1,2})[日号]/);
      if (dateMatch) {
        const month = parseInt(dateMatch[1]) - 1;
        const day = parseInt(dateMatch[2]);
        const d = new Date(now.getFullYear(), month, day);
        if (d < now) d.setFullYear(d.getFullYear() + 1); // 过去的日期默认明年
        dueDate = getLocalISODate(d);
      }
    }

    // ---- 3. 解析时间（精确到小时/分钟） ----
    // 匹配 "下午3点" "晚上8点30" "上午10点" "今晚8点" "3:30" "15:00" 等
    const timePatterns = [
      // "下午3点半" "上午10点15"
      /(?:今天?|明天?|后天?)?\s*(?:凌晨|早上|上午|中午|下午|傍晚|晚上|今晚|夜里)(\d{1,2})(?:点|时)(半|\d{1,2})?(?:分)?/,
      // "3点半" "8点" "10点15分"
      /(\d{1,2})(?:点|时)(半|\d{1,2})?(?:分)?/,
      // "15:30" "8:00"
      /(\d{1,2}):(\d{2})/
    ];

    let parsedHour = -1;
    let parsedMinute = 0;
    
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        parsedHour = parseInt(match[1]);
        if (match[2] === '半') {
          parsedMinute = 30;
        } else if (match[2]) {
          parsedMinute = parseInt(match[2]);
        }
        
        // 判断是否需要 +12 小时（下午/晚上）
        const hasPM = /下午|傍晚|晚上|今晚|夜里/.test(text);
        const hasAM = /凌晨|早上|上午/.test(text);
        const hasNoon = /中午/.test(text);
        
        if (hasPM && parsedHour < 12) {
          parsedHour += 12;
        } else if (hasNoon && parsedHour === 12) {
          // 12 stays 12
        } else if (hasAM && parsedHour === 12) {
          parsedHour = 0;
        } else if (!hasPM && !hasAM && !hasNoon && parsedHour < 7) {
          // 无上下文但时间 < 7，可能是下午
          parsedHour += 12;
        }
        
        dueTime = `${String(parsedHour).padStart(2, '0')}:${String(parsedMinute).padStart(2, '0')}`;
        break;
      }
    }

    // ---- 4. 解析标签 ----
    if (text.includes('工作') || text.includes('开会') || text.includes('会议') || text.includes('汇报')) tags.push('工作');
    if (text.includes('学习') || text.includes('阅读') || text.includes('看书') || text.includes('复习') || text.includes('背单词')) tags.push('学习');
    if (text.includes('代码') || text.includes('技术') || text.includes('联调') || text.includes('接口') || text.includes('开发') || text.includes('bug') || text.includes('调试')) tags.push('技术');
    if (text.includes('运动') || text.includes('跑步') || text.includes('健身') || text.includes('游泳') || text.includes('瑜伽')) tags.push('健康');
    if (text.includes('买') || text.includes('购物') || text.includes('超市') || text.includes('快递')) tags.push('生活');
    if (text.includes('医院') || text.includes('看病') || text.includes('体检') || text.includes('挂号')) tags.push('健康');

    // ---- 5. 清洗标题：移除时间/优先级等修饰语 ----
    const stripPatterns = [
      /今天|明天|后天|大后天|下周[一二三四五六日天]?|下个?月|这?(?:周|星期)[一二三四五六日天]/g,
      /(?:凌晨|早上|上午|中午|下午|傍晚|晚上|今晚|夜里)?\d{1,2}(?:点|时)(?:半|\d{1,2})?(?:分)?/g,
      /\d{1,2}:\d{2}/g,
      /\d{1,2}月\d{1,2}[日号]/g,
      /重要且紧急|紧急且重要|重要|紧急|不重要|p0|P0/g,
      /🔴|🟡|🔵|🎙️/g
    ];
    
    let title = text;
    for (const p of stripPatterns) {
      title = title.replace(p, '');
    }
    title = title.replace(/\s+/g, ' ').trim();
    if (title.length < 2) title = text.trim();

    return { title, dueDate, dueTime, quadrant, priority, tags };
  };

  const parseAndAddTask = (text: string, source: 'voice' | 'clipboard' | 'manual' = 'voice') => {
    if (!text || !text.trim()) return;

    const { title, dueDate, dueTime, quadrant, priority, tags } = nlpParseText(text);
    
    // 根据来源添加来源标签
    const sourceTags = source === 'clipboard' ? ['剪贴板'] : source === 'voice' ? ['语音解析'] : [];
    const allTags = [...new Set([...sourceTags, ...tags])];
    
    const sourceEmoji = source === 'clipboard' ? '📋' : source === 'voice' ? '🎙️' : '✏️';

    const newTask: Task = {
      id: `task-${source}-` + Date.now(),
      title: title,
      description: `${sourceEmoji} 智能解析录入："${text}"${dueTime ? `\n⏰ 提醒时间: ${dueTime}` : ''}`,
      isCompleted: false,
      priority: priority,
      quadrant: quadrant,
      tags: allTags,
      dueDate: dueDate,
      subtasks: [],
      dependencies: [],
      focusMinutes: 0,
      createdAt: new Date().toISOString()
    };

    const updatedTasksList = [newTask, ...tasks];
    setTasks(updatedTasksList);
    Storage.setItem('hm_next_todos_tasks', JSON.stringify(updatedTasksList));

    // Toast notification
    const timeInfo = dueTime ? ` ⏰ ${dueTime}` : '';
    setClipboardAlert(`${sourceEmoji} 解析成功：\n「${title}」\n📅 ${dueDate}${timeInfo}\n🎯 第${quadrant}象限 (${priority === 'HIGH' ? '🔴高' : priority === 'MEDIUM' ? '🟡中' : '🔵低'}优先级)`);
    
    if (audioSynthRef.current) {
      audioSynthRef.current.synthesizeSuccessChime();
    }
    
    return newTask;
  };

  const handleStartVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setClipboardAlert('您的浏览器暂不支持原生语音输入 API，已为您开启手动文本智能解析。');
      const simulatedText = window.prompt('请输入代办内容（说点什么，比如：“明天下午三点跟进真机联调 重要且紧急”）：', '明天下午三点真机联调 🔴重要且紧急');
      if (simulatedText) {
        parseAndAddTask(simulatedText);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsVoiceRecording(true);
        setVoiceTranscript('正在倾听您的指令...');
        if (audioSynthRef.current) {
          audioSynthRef.current.synthesizeHapticChime();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsVoiceRecording(false);
        // Fallback prompt input on error/unallowed micro permission
        const simulatedText = window.prompt('语音启动受限，可手动输入文字解析，格式如：“明天下午跟进代码 重要且紧急”', '明天下午跟进代码 🔴重要且紧急');
        if (simulatedText) {
          parseAndAddTask(simulatedText);
        }
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setVoiceTranscript(resultText);
          parseAndAddTask(resultText);
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsVoiceRecording(false);
    }
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
    const updated = tasks.filter(t => !t.isCompleted);
    handleSaveTasks(updated);
    setIsConfirmClearModalOpen(false);
  };

  // Habit management handlers
  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) return;
    const newHabit: Habit = {
      id: 'habit-' + Date.now(),
      title: newHabitTitle.trim(),
      createdAt: new Date().toISOString(),
      completedDates: [],
      periodType: 'DAILY',
      startDate: getLocalISODate(),
      endDate: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        return getLocalISODate(d);
      })()
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
    const todayStr = getLocalISODate();
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
      <motion.div
        id={`task-item-${t.id}`}
        key={t.id}
        layout="position"
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ 
          opacity: t.isCompleted ? 0.6 : 1, 
          scale: t.isCompleted ? 0.98 : 1,
          y: 0 
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.92, 
          y: -10,
          transition: { duration: 0.2, ease: "easeOut" } 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 26, 
          mass: 0.6,
          opacity: { duration: 0.2 }
        }}
        className={`group/task relative bg-white dark:bg-[#1C1C1E] rounded-3xl border border-gray-150/40 dark:border-zinc-800 p-4 transition-all shadow-2xs ${borderClass} ${
          t.isCompleted ? 'bg-gray-50/70 border-l-gray-300/40' : ''
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

        {/* Metadatas flow bottom */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-gray-100/50 dark:border-zinc-800/20 w-full">
          {showQuadrantsTab && (
            <span className="text-[8.5px] bg-gray-100 dark:bg-zinc-800/80 text-gray-500 dark:text-zinc-400 px-2.5 py-0.2 rounded-full font-bold">
              第 {t.quadrant} 象限
            </span>
          )}
          <span className={`text-[8.5px] px-2.5 py-0.2 rounded-full font-semibold ${chipColor}`}>
            {t.priority} 优先级
          </span>
          {t.tags.map((tag, i) => (
            <span key={i} className="text-[9px] text-gray-400 dark:text-zinc-650 font-mono">
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

        {/* Full-width Subtasks Completion box */}
        {t.subtasks && t.subtasks.length > 0 && (
          <div className="mt-3.5 space-y-2 bg-gray-50/70 dark:bg-[#2C2C2E]/40 p-3 rounded-2xl border border-gray-150/10 dark:border-zinc-800 w-full animate-fade-in">
            <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-zinc-500 font-bold mb-1 pl-0.5">
              <span>子步骤拆解 ({t.subtasks.filter(s => s.isCompleted).length} / {t.subtasks.length} 已完成)</span>
            </div>
            <div className="space-y-1.5 w-full">
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
      </motion.div>
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
    Storage.setItem('hm_next_todos_templates', JSON.stringify(updatedTemplates));
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
      dueDate: getLocalISODate(),
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
    navigateTo('LIST');
    setIsHomeScreen(false);
    alert(`⚡️ 已成功导入「${template.name}」中的 ${newTasks.length} 个任务！`);
  };

  const handleDeleteTemplate = (tplId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = templates.filter(t => t.id !== tplId);
    setTemplates(filtered);
    Storage.setItem('hm_next_todos_templates', JSON.stringify(filtered));
  };

  // 3. Focus Timer trigger controllers
  const getFocusTitle = (taskId?: string, customTitle?: string) => {
    if (customTitle) return customTitle;
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      return task ? task.title : '专注任务';
    }
    return '自律专注中';
  };

  const handleStartFocusOnTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setFocusMode('POMODORO');
    setTotalDuration(25 * 60);
    setTimeRemaining(25 * 60);
    setIsRunning(true);
    setIsPaused(false);
    setIsHomeScreen(false);
    navigateTo('POMODORO');
    
    // 触发鸿蒙原生常驻通知/实况窗
    if ((window as any).hmNotification) {
      (window as any).hmNotification.startPomodoroLiveView(getFocusTitle(taskId), 25);
    }
  };

  const handleStartTimer = (duration: number, mode: FocusMode, taskId?: string, customTitle?: string) => {
    setFocusMode(mode);
    setTotalDuration(duration);
    setTimeRemaining(duration);
    setActiveTaskId(taskId);
    setCustomFocusTitle(customTitle || '');
    setIsRunning(true);
    setIsPaused(false);
    
    if ((window as any).hmNotification && mode !== 'STOPWATCH') {
      (window as any).hmNotification.startPomodoroLiveView(getFocusTitle(taskId, customTitle), Math.ceil(duration / 60));
    }
  };

  useEffect(() => {
    const handleStartPomodoroEvent = () => {
      setActiveTab('POMODORO');
      handleStartTimer(25 * 60, 'POMODORO');
    };
    window.addEventListener('startPomodoroAction', handleStartPomodoroEvent);
    return () => {
      window.removeEventListener('startPomodoroAction', handleStartPomodoroEvent);
    };
  }, []);

  const handlePauseToggle = () => {
    const nextPausedState = !isPaused;
    setIsPaused(nextPausedState);
    
    if ((window as any).hmNotification && focusMode !== 'STOPWATCH') {
      (window as any).hmNotification.updatePomodoroStatus(getFocusTitle(activeTaskId, customFocusTitle), timeRemaining, nextPausedState);
    }
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    
    if ((window as any).hmNotification) {
      (window as any).hmNotification.cancelPomodoroNotification(false);
    }
  };

  // Pasteboard / Clipboard 智能解析导入 (真实 NLP 解析, P1)
  const handleImportClipboardText = () => {
    if (!clipboardAlert) return;
    
    // 使用 NLP 引擎解析剪贴板文本
    const newTask = parseAndAddTask(clipboardAlert, 'clipboard');
    setClipboardAlert(null);
    navigateTo('LIST');
    if (newTask) {
      // 清除上面 parseAndAddTask 设置的 clipboardAlert（因为它设了成功提示）
      // 给用户一个简短的确认
      setTimeout(() => setClipboardAlert(null), 3000);
    }
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
    return getLocalISODate();
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

  const tagClusters = useMemo(() => {
    const grouped: { [tag: string]: Task[] } = {};
    filteredTasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tg => {
          const trimmed = tg.trim();
          if (trimmed) {
            if (!grouped[trimmed]) {
              grouped[trimmed] = [];
            }
            grouped[trimmed].push(task);
          }
        });
      } else {
        const noTagLabel = '未分类待办';
        if (!grouped[noTagLabel]) {
          grouped[noTagLabel] = [];
        }
        grouped[noTagLabel].push(task);
      }
    });
    return Object.entries(grouped)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([tagName, taskList]) => ({ tagName, taskList }));
  }, [filteredTasks]);

  const filteredHabits = useMemo(() => {
    // 习惯打卡不受标签过滤影响，仅受搜索关键词筛选
    // 修复：点击标签时不过滤「今日自律追踪」内容
    return habits.filter(h => {
      const matchesSearch = searchQuery
        ? h.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesSearch;
    });
  }, [habits, searchQuery]);

  // Live countdown label
  const formatTimerLabel = () => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div id="full-page" className={`h-screen w-screen flex items-center justify-center font-sans tracking-tight transition-colors duration-300 overflow-hidden ${darkMode ? 'dark bg-[#121214] text-[#E5E5E7]' : 'bg-[#F0F2F5] text-gray-800'}`}>
      
      {/* Fully responsive embedded app viewport container */}
      <div 
        id="app-embedded-container"
        className={`w-full h-full relative flex flex-col md:max-w-2xl lg:max-w-4xl md:h-[94vh] md:rounded-[2.25rem] md:shadow-2xl md:border transition-all overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${
          darkMode 
            ? 'bg-[#1C1C1E] border-zinc-800/80 md:shadow-black/40' 
            : 'bg-[#EDEFF2] border-gray-200/50 md:shadow-gray-300/40'
        }`}
      >
        {/* Play matching clipboard paste banner inside embedded viewport */}
        {clipboardAlert && (
          <div id="paste-alert-bubble" className="absolute top-14 left-6 right-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl p-2.5 border border-blue-150/35 dark:border-zinc-800 shadow-xl z-50 transition-all flex items-center justify-between animate-fade-in animate-bounce">
            <div className="flex items-center space-x-2 bg-transparent text-left">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#007DFF]">
                <Clipboard size={14} />
              </div>
              <div className="min-w-0 bg-transparent flex flex-col text-left">
                <span className="block text-[9px] text-gray-400 dark:text-zinc-500 font-extrabold uppercase">检测到剪贴板有时间待办</span>
                <p className="text-xs text-gray-755 dark:text-gray-200 font-semibold truncate max-w-[150px] md:max-w-[280px] leading-tight">{clipboardAlert}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 bg-transparent flex-shrink-0">
              <button
                id="paste-btn-close"
                onClick={() => setClipboardAlert(null)}
                className="p-1 px-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 text-[10px] font-bold cursor-pointer transition-colors"
              >
                忽略
              </button>
              <button
                id="paste-btn-apply"
                onClick={handleImportClipboardText}
                className="p-1 px-2.5 rounded-lg bg-[#007DFF] text-white hover:bg-[#0066CC] dark:bg-blue-600 dark:hover:bg-blue-700 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-all"
              >
                <Plus size={10} />
                导入
              </button>
            </div>
          </div>
        )}

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
          <div id="app-viewport" className="flex-1 flex flex-col justify-between overflow-hidden bg-[#EDEFF2] dark:bg-[#121214] h-full relative">
            
            {/* Nav Header Row */}
            <div className="px-5 pt-3.5 pb-2.5 bg-white/70 backdrop-blur-md border-b border-gray-200/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-[#007DFF] text-base font-sans tracking-tight">ZenFlow</span>
                  {isRunning && (
                    <div 
                      onClick={() => setActiveTab('POMODORO')}
                      className="bg-[#E8F3FF] px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-100/30 animate-pulse cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#007DFF]" />
                      <span className="text-[9.5px] font-bold text-[#007DFF] font-mono">
                        专注中: {formatTimerLabel()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-extrabold hidden sm:inline">2026年5月27日 星期三</span>
                  
                  {/* Feedback Entry Button */}
                  <button
                    id="btn-header-feedback-toggle"
                    onClick={() => setIsFeedbackModalOpen(true)}
                    title="产品意见与建议"
                    className="w-8 h-8 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-[#1f1e33] rounded-xl transition-all border border-indigo-500/10 flex items-center justify-center cursor-pointer relative"
                  >
                    <Mail size={14} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white dark:border-[#1C1C1E]"></span>
                  </button>

                  {/* Template Import Button */}
                  <button
                    id="btn-header-templates-toggle"
                    onClick={() => setIsTemplateModalOpen(true)}
                    title="快捷模板快速导入"
                    className="w-8 h-8 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-[#153e20] rounded-xl transition-all border border-emerald-500/10 flex items-center justify-center cursor-pointer"
                  >
                    <Bookmark size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </button>

                  {/* Settings Icon integrating templates & dark mode style switches */}
                  <button
                    id="btn-header-settings-toggle"
                    onClick={() => setIsSettingsOpen(true)}
                    title="系统设置"
                    className="w-8 h-8 text-[#007DFF] bg-[#E8F3FF] dark:bg-[#007DFF]/10 hover:bg-blue-100 rounded-xl transition-all border border-[#007DFF]/10 flex items-center justify-center cursor-pointer"
                  >
                    <Settings size={14} className="animate-spin-slow text-[#007DFF]" />
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
            <div id="viewport-pane-scroller" className="flex-1 p-4 overflow-y-auto no-scrollbar">
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

                      {/* Toggle Filters & Sorting */}
                      <div className="flex items-center justify-between px-1">
                        <button
                          id="btn-toggle-filters-panel"
                          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-[#007DFF] transition-colors cursor-pointer"
                        >
                          <SlidersHorizontal size={12} className={isFiltersExpanded ? 'text-[#007DFF]' : 'text-gray-400'} />
                          <span>{isFiltersExpanded ? '收起 筛选与排序面板 ▴' : '展开 筛选与排序面板 ▾'}</span>
                          {(sortBy !== 'DEFAULT' || filterPriority !== 'ALL' || filterDueDate !== 'ALL') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007DFF] animate-pulse" />
                          )}
                        </button>

                        <button
                          id="btn-toggle-tag-clustering"
                          onClick={() => {
                            const newVal = !groupByTagCluster;
                            setGroupByTagCluster(newVal);
                            Storage.setItem('hm_group_by_tag_cluster', String(newVal));
                            if (audioSynthRef.current) {
                              audioSynthRef.current.synthesizeHapticChime();
                            }
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
                            groupByTagCluster
                              ? 'bg-[#E8F3FF] dark:bg-blue-950/40 text-[#007DFF] dark:text-blue-450 border-blue-200/20 shadow-3xs'
                              : 'bg-gray-50 dark:bg-zinc-900/30 text-gray-500 dark:text-zinc-500 border-gray-150/15'
                          }`}
                        >
                          <Tag size={10} className={groupByTagCluster ? 'text-[#007DFF]' : 'text-gray-400'} />
                          <span>{groupByTagCluster ? '📂 标签群组视图: 开启' : '📁 按时间维度分类'}</span>
                        </button>
                      </div>

                      {/* Interactive Sorting & Filtering Dropdowns */}
                      <AnimatePresence>
                        {isFiltersExpanded && (
                          <motion.div
                            id="task-list-controls"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-[#FAFAFB] dark:bg-zinc-900/40 border border-gray-150/15 dark:border-zinc-800/15 rounded-3xl p-3 flex flex-col gap-2.5 shadow-3xs overflow-hidden"
                          >
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
                                <label className="text-[8.5px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase pl-0.5">
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
                                  <option value="NO_DUE_DATE">⚪ 仅无截止时间</option>
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* --- Sections Layout Switcher --- */}
                      {groupByTagCluster ? (
                        /* --- SECTION LAYER: Tag Cluster View (标签群组聚类视图) --- */
                        <div className="space-y-4 animate-fade-in text-left">
                          {tagClusters.length === 0 ? (
                            <div className="p-8 bg-white/40 dark:bg-zinc-805/20 rounded-3xl border border-gray-150/10 dark:border-zinc-800 text-center text-gray-400 dark:text-zinc-650 text-xs font-semibold animate-fade-in">
                              📇 暂无任何满足条件的任务标签聚类
                            </div>
                          ) : (
                            tagClusters.map(({ tagName, taskList }) => {
                              const isUnclassified = tagName === '未分类待办';
                              return (
                                <div key={tagName} className="space-y-2">
                                  <div className="flex items-center justify-between pl-1 bg-transparent pr-1">
                                    <div className="flex items-center gap-1.5 bg-transparent">
                                      {isUnclassified ? (
                                        <FolderOpen size={11} className="text-gray-400" />
                                      ) : (
                                        <Tag size={11} className="text-[#007DFF] dark:text-blue-400 animate-pulse" />
                                      )}
                                      <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${isUnclassified ? 'text-gray-400 dark:text-zinc-500' : 'text-[#007DFF] dark:text-blue-400'}`}>
                                        {tagName}
                                      </h4>
                                      <span className="text-[8.5px] font-extrabold bg-gray-100 dark:bg-zinc-800/80 text-gray-500 dark:text-zinc-400 px-1.5 py-0.2 rounded-full">
                                        {taskList.length} 个待办
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2.5">
                                    <AnimatePresence mode="popLayout">
                                      {taskList.map(renderTaskCard)}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              );
                            })
                          )}

                          {/* Keep habits on cluster layout as well under its dedicated section */}
                          {filteredHabits.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-gray-150/15 dark:border-zinc-800/20">
                              <div className="flex items-center gap-1.5 pl-1">
                                <Flame className="text-orange-500 animate-pulse" size={11} />
                                <h4 className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest">今日自律追踪 ({filteredHabits.filter(h => !h.completedDates.includes(todayStr)).length} 待办)</h4>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {filteredHabits.map(h => {
                                  const isCompletedToday = h.completedDates.includes(todayStr);
                                  return (
                                    <div key={h.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-150/40 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-all shadow-3xs">
                                      <div className="flex items-center gap-3 bg-transparent text-left">
                                        <button
                                          id={`btn-habitcheck-clustered-${h.id}`}
                                          onClick={() => handleToggleHabitToday(h.id)}
                                          className="cursor-pointer transition-all active:scale-90"
                                        >
                                          {isCompletedToday ? (
                                            <CheckCircle2 size={16} className="fill-emerald-50 text-emerald-600 dark:fill-emerald-950/20" />
                                          ) : (
                                            <Circle size={16} className="text-gray-350 dark:text-zinc-600 hover:text-gray-500" />
                                          )}
                                        </button>
                                        <span className={`text-[11px] font-bold ${isCompletedToday ? 'line-through text-gray-400 dark:text-zinc-550 font-normal' : 'text-gray-800 dark:text-gray-200'}`}>
                                          {h.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 bg-transparent">
                                        <span className="text-[8.5px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                          🔥 累计 {h.completedDates.length} 天
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* --- DEFAULT CHRONOLOGICAL DIMENSION VIEWS --- */
                        <>
                          {/* --- Section 1: 已过期未完成的任务列表 (Red Accent) --- */}
                          {overdueTasks.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 pl-1">
                                <AlertTriangle size={12} className="text-rose-500 animate-pulse" />
                                <h4 className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">已过期未完成 ({overdueTasks.length})</h4>
                              </div>
                              <div className="space-y-2.5">
                                <AnimatePresence mode="popLayout">
                                  {overdueTasks.map(renderTaskCard)}
                                </AnimatePresence>
                              </div>
                            </div>
                          )}

                          {/* --- Section 2: 当日任务列表 (Blue Accent) --- */}
                          <div className="space-y-2">
                            {todayTasks.length === 0 ? (
                              <div className="p-4 bg-white/40 dark:bg-zinc-805/20 rounded-2xl border border-gray-150/10 dark:border-zinc-800 text-center text-gray-400 dark:text-zinc-650 text-[10px] font-semibold">
                                今日无代办安排（好好休息，或者添加新安排吧！）
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                <AnimatePresence mode="popLayout">
                                  {todayTasks.map(renderTaskCard)}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>

                          {/* --- Section 3: 每日习惯打卡追踪 (Orange Accent) --- */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 pl-1">
                              <Flame className="text-orange-500 animate-pulse" size={11} />
                              <h4 className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest">今日自律追踪 ({filteredHabits.filter(h => !h.completedDates.includes(todayStr)).length} 待办)</h4>
                            </div>
                            {filteredHabits.length === 0 ? (
                              <div className="p-4 bg-white/40 dark:bg-zinc-805/20 rounded-2xl border border-gray-150/10 dark:border-zinc-800 text-center text-gray-400 dark:text-zinc-650 text-[10px] font-medium leading-relaxed">
                                暂无习惯。您可以在下方或【习惯】看板配置每日计划
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                {filteredHabits.map(h => {
                                  const isCompletedToday = h.completedDates.includes(todayStr);
                                  return (
                                    <div key={h.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-150/40 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-all shadow-3xs">
                                      <div className="flex items-center gap-3 bg-transparent text-left">
                                        <button
                                          id={`btn-habitcheck-${h.id}`}
                                          onClick={() => handleToggleHabitToday(h.id)}
                                          className="cursor-pointer transition-all active:scale-90"
                                        >
                                          {isCompletedToday ? (
                                            <CheckCircle2 size={16} className="fill-emerald-50 text-emerald-600 dark:fill-emerald-950/20" />
                                          ) : (
                                            <Circle size={16} className="text-gray-350 dark:text-zinc-600 hover:text-gray-500" />
                                          )}
                                        </button>
                                        <span className={`text-[11px] font-bold ${isCompletedToday ? 'line-through text-gray-400 dark:text-zinc-550 font-normal' : 'text-gray-800 dark:text-gray-200'}`}>
                                          {h.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 bg-transparent">
                                        <span className="text-[8.5px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                          🔥 累计 {h.completedDates.length} 天
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
                              <FolderOpen size={11} className="text-indigo-500 animate-pulse" />
                              <h4 className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest font-sans">后续安排任务 ({futureTasks.length})</h4>
                            </div>
                            {futureTasks.length === 0 ? (
                              <div className="p-4 bg-white/40 dark:bg-zinc-805/20 rounded-2xl border border-gray-150/10 dark:border-zinc-800 text-center text-gray-400 dark:text-zinc-650 text-[10px] font-semibold">
                                后续无多余时间代办安排
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                <AnimatePresence mode="popLayout">
                                  {futureTasks.map(renderTaskCard)}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                    </div>
                  )}

                  {/* TAB 1.5: HABITS养成中心 */}
                  {activeTab === 'HABIT' && (
                    <div id="view-tab-habit" className="space-y-4 pb-12 animate-fade-in">
                      {/* Trigger Button component for Popup Modal */}
                      <div className="flex justify-between items-center bg-white/95 dark:bg-zinc-900/50 p-3.5 rounded-3xl border border-gray-150/40 dark:border-zinc-800/45 shadow-2xs">
                        <div className="flex items-center gap-1.5 bg-transparent">
                          <Flame size={14} className="text-orange-500 animate-pulse" />
                          <h3 className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest">每日习惯打卡中心</h3>
                        </div>
                        <button
                          id="btn-trigger-add-habit-modal"
                          onClick={() => {
                            setIsAddHabitModalOpen(true);
                            if (audioSynthRef.current) {
                              audioSynthRef.current.synthesizeHapticChime();
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-3xs transition-all cursor-pointer active:scale-95 shrink-0"
                        >
                          <Plus size={11} className="stroke-[3]" />
                          <span>新建打卡习惯</span>
                        </button>
                      </div>

                      {/* 2. Habits Header & Progress stats summary */}
                      <div className="bg-white/95 dark:bg-zinc-900/50 p-4 rounded-3xl border border-gray-150/40 dark:border-zinc-800/45 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Flame size={16} className="text-orange-500 animate-pulse" />
                            <h3 className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest">每日习惯打卡中心</h3>
                          </div>
                          <span className="text-[10px] bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold">
                            今日完成 {habits.filter(h => h.completedDates.includes(todayStr)).length} / {habits.length}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: habits.length > 0
                                ? `${(habits.filter(h => h.completedDates.includes(todayStr)).length / habits.length) * 100}%`
                                : '0%'
                            }}
                            className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                          />
                        </div>

                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 leading-normal font-medium">
                          🌟 持续的力量：每天完成小小的打卡动作，点燃自我进化的火焰。点击打卡激发成功的系统音效吧！
                        </p>
                      </div>

                      {/* 3. Display habits list */}
                      <div className="space-y-2.5">
                        {habits.length === 0 ? (
                          <div id="habits-empty-state" className="bg-white/80 dark:bg-[#1C1C1E] p-8 rounded-3xl text-center border border-dashed border-gray-200 dark:border-zinc-850 space-y-2 select-none">
                            <Flame size={28} className="mx-auto text-gray-350 animate-pulse" />
                            <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-300">尚未定义打卡习惯</h4>
                            <p className="text-[9.5px] text-gray-400 max-w-xs mx-auto">
                              优秀的习惯是成功的基石。请在上方输入习惯名称并配置周期，开始每日的持之以恒打卡！
                            </p>
                          </div>
                        ) : (
                          habits.map(h => {
                            const isDoneToday = h.completedDates.includes(todayStr);
                            const totalDays = h.completedDates.length;
                            return (
                              <div
                                id={`view-habit-card-${h.id}`}
                                key={h.id}
                                className={`p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border transition-all shadow-3xs flex items-center justify-between gap-4 select-none hover:border-orange-500/20 ${
                                  isDoneToday 
                                    ? 'border-orange-500/20 bg-orange-50/5 dark:bg-orange-500/5' 
                                    : 'border-gray-150/40 dark:border-zinc-800'
                                }`}
                              >
                                <div className="min-w-0 flex-1 space-y-1 text-left">
                                  <h4 className={`text-xs font-bold transition-all ${
                                    isDoneToday ? 'line-through text-gray-400 dark:text-zinc-550' : 'text-gray-800 dark:text-gray-200'
                                  }`}>
                                    {h.title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[8.5px] text-gray-400 dark:text-zinc-500 font-extrabold">
                                    <span className="flex items-center gap-0.5">
                                      ✨ 累计打卡 <strong>{totalDays}</strong> 天
                                    </span>
                                    {h.periodType && (
                                      <span className="bg-gray-100 dark:bg-zinc-800 px-1 py-0.2 rounded font-bold text-orange-500">
                                        🔁 {h.periodType === 'DAILY' ? '天' : h.periodType === 'WEEKLY' ? '周' : '月'}
                                      </span>
                                    )}
                                    {h.periodType === 'WEEKLY' && h.weeklyDays && h.weeklyDays.length > 0 && (
                                      <span className="bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.2 rounded font-bold">
                                        📅 周：{h.weeklyDays.map(d => ['一', '二', '三', '四', '五', '六', '日'][d - 1]).join(', ')}
                                      </span>
                                    )}
                                    {h.periodType === 'MONTHLY' && h.monthlyDays && h.monthlyDays.length > 0 && (
                                      <span className="bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.2 rounded font-bold max-w-[160px] truncate" title={h.monthlyDays.map(d => `${d}号`).join(', ')}>
                                        📅 月：{h.monthlyDays.map(d => `${d}号`).join(', ')}
                                      </span>
                                    )}
                                    {h.startDate && h.endDate && (
                                      <span className="text-gray-400 dark:text-zinc-650 font-semibold">
                                        📅 {h.startDate} ~ {h.endDate}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Delete Habit button */}
                                  <button
                                    id={`btn-habit-delete-${h.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = habits.filter(x => x.id !== h.id);
                                      handleSaveHabits(updated);
                                      if (audioSynthRef.current) {
                                        audioSynthRef.current.synthesizeHapticChime();
                                      }
                                    }}
                                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-rose-50 dark:bg-zinc-850 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                                    title="删除此习惯"
                                  >
                                    <Trash2 size={11} />
                                  </button>

                                  {/* Mark/Complete Today Button */}
                                  <button
                                    id={`btn-habit-check-${h.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleHabitToday(h.id);
                                    }}
                                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all scale-100 active:scale-95 flex-shrink-0 cursor-pointer ${
                                      isDoneToday 
                                        ? 'bg-orange-500 text-white shadow-xs' 
                                        : 'bg-gray-100 dark:bg-[#252529] text-gray-400 hover:bg-orange-120 dark:hover:bg-orange-500/10 hover:text-orange-500'
                                    }`}
                                  >
                                    {isDoneToday ? (
                                      <Flame size={18} className="fill-white" />
                                    ) : (
                                      <Circle size={18} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })
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
                            dueDate: getLocalISODate(),
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
                    <div id="view-tab-calendar" className="h-full flex flex-col no-scrollbar">
                      <CalendarView
                        tasks={tasks}
                        onEditTask={handleEditTask}
                        onToggleComplete={handleToggleComplete}
                        selectedDate={selectedDate}
                        onSelectDate={(date) => {
                          setSelectedDate(date);
                        }}
                      />
                    </div>
                  )}

                  {/* TAB 4: POMORODO HUB FOCUS VIEW */}
                  {activeTab === 'POMODORO' && (
                    <div id="view-tab-pomodoro" className="h-full overflow-y-auto no-scrollbar pb-10">
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
                        customFocusTitle={customFocusTitle}
                        onSetCustomFocusTitle={setCustomFocusTitle}
                      />
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

             {/* Bottom Segments Tabs Board */}
             {(() => {
               const navTabs = [
                 { id: 'LIST' as const, name: '待办', icon: <CheckSquare size={16} />, visible: true },
                 { id: 'QUADRANT' as const, name: '四象限', icon: <Grid2X2 size={16} />, visible: showQuadrantsTab },
                 { id: 'HABIT' as const, name: '习惯', icon: <Flame size={16} />, visible: showHabitsTab },
                 { id: 'CALENDAR' as const, name: '日历', icon: <Calendar size={16} />, visible: true },
                 { id: 'POMODORO' as const, name: '专注', icon: <Clock3 size={16} />, visible: showPomodoroTab }
               ].filter(t => t.visible);

               const gridColsClass = 
                 navTabs.length === 5 ? 'grid-cols-5' :
                 navTabs.length === 4 ? 'grid-cols-4' :
                 navTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

               return (
                 <div id="app-bottom-nav" className={`bg-white/80 backdrop-blur-md px-4 py-2 border-t border-gray-200/40 grid ${gridColsClass} gap-0.5 text-center select-none z-10 w-full`}>
                   {navTabs.map(tab => {
                     const isActive = activeTab === tab.id;
                     return (
                       <button
                         id={`btn-tab-${tab.id}`}
                         key={tab.id}
                         onClick={() => {
                           navigateTo(tab.id);
                           setIsHomeScreen(false);
                         }}
                         className={`flex flex-col items-center justify-center p-1 px-1 rounded-2xl cursor-pointer hover:bg-gray-100/50 transition-colors ${
                           isActive 
                             ? 'text-[#007DFF] font-black' 
                             : 'text-gray-400 hover:text-gray-600 font-bold'
                         }`}
                       >
                         <div className={isActive ? 'scale-105 transition-transform text-[#007DFF]' : 'text-gray-400'}>
                           {tab.icon}
                         </div>
                         <span className="text-[9.5px] mt-0.5 tracking-wider font-extrabold">{tab.name}</span>
                       </button>
                     );
                   })}
                 </div>
               );
             })()}

          </div>
        )}

        {/* Floating Action Button (FAB) for quick task creation */}
        {['LIST', 'CALENDAR', 'QUADRANT'].includes(activeTab) && (
          <motion.button
            id="fab-quick-task-create"
            drag
            dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 150, bottom: 0 }}
            dragMomentum={false}
            onClick={() => {
              setIsHomeScreen(false);
              handleAddTask();
              if (audioSynthRef.current) {
                audioSynthRef.current.synthesizeHapticChime();
              }
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            title="快捷创建任务"
            className="absolute bottom-28 right-5 w-12 h-12 bg-[#007DFF] hover:bg-[#0066CC] dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center cursor-pointer z-30 border border-white/10"
          >
            <Plus size={22} className="stroke-[3]" />
          </motion.button>
        )}
      </div>

      {/* Template Import Modal triggered from header and widgets list */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1C1C1E] border border-gray-150/20 dark:border-zinc-800 rounded-[2rem] w-full max-w-sm p-5 shadow-2xl relative overflow-hidden text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <Bookmark className="text-emerald-500 animate-pulse" size={15} />
                  <h3 className="text-xs font-black text-gray-950 dark:text-gray-50 uppercase tracking-wider">高效模版一键导入</h3>
                </div>
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Template list wrapper */}
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 mb-3 pl-1 leading-normal font-semibold">
                💡 从下方精选的项目流模板库中点击一键克隆导入，极速构建您的今日敏捷待办工作流。
              </p>

              <div className="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar pb-2">
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-[10px]">
                    暂无可用模版，您可以在任何任务详情中点击「保存为模版」来添加自定义预设
                  </div>
                ) : (
                  templates.map(tpl => (
                    <div 
                      key={tpl.id}
                      className="p-4 bg-gray-50 dark:bg-[#252529] border border-gray-150/40 dark:border-zinc-800 rounded-3xl space-y-3 shadow-3xs hover:border-emerald-500/10 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-gray-800 dark:text-gray-150 uppercase tracking-wide">
                            {tpl.name}
                          </h4>
                          <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-extrabold">
                            🎒 含 {tpl.tasks.length} 项代办
                          </span>
                        </div>
                        <p className="text-[9.5px] text-gray-500 dark:text-zinc-400 mt-1 leading-normal font-medium">
                          {tpl.description || '无详细说明'}
                        </p>
                      </div>

                      {/* Display task blueprints inside first */}
                      <div className="space-y-1.5 border-t border-gray-150/30 dark:border-zinc-800/40 pt-2 pb-0.5">
                        {tpl.tasks.map((bt, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[9.5px] text-gray-450 dark:text-zinc-500 font-bold">
                            <span className="text-emerald-500">•</span>
                            <span className="text-gray-700 dark:text-zinc-350 line-clamp-1 flex-1 font-semibold">
                              {bt.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Import and deletion bar */}
                      <div className="flex gap-2 pt-1.5 border-t border-gray-150/20 dark:border-zinc-800/20">
                        <button
                          onClick={() => {
                            handleImportTemplate(tpl.id);
                            setIsTemplateModalOpen(false);
                            if (audioSynthRef.current) audioSynthRef.current.synthesizeSuccessChime();
                          }}
                          className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white rounded-xl text-[10px] font-extrabold transition-all shadow-3xs cursor-pointer text-center"
                        >
                          一键克隆导入这组任务
                        </button>
                        
                        <button
                          onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                          className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          清除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Habit Creation Modal */}
      <AnimatePresence>
        {isAddHabitModalOpen && (
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
              className="bg-white dark:bg-[#1C1C1E] border border-gray-150/20 dark:border-zinc-800 rounded-[2rem] w-full max-w-sm p-5 shadow-2xl relative overflow-hidden text-left space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 bg-transparent">
                  <Flame className="text-orange-500 animate-pulse" size={15} />
                  <h3 className="text-xs font-black text-gray-950 dark:text-gray-50 uppercase tracking-wider">创建自定义打卡习惯</h3>
                </div>
                <button
                  id="btn-close-habit-modal"
                  onClick={() => setIsAddHabitModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto no-scrollbar pr-0.5">
                {/* 1. Title Input */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">习惯名称</label>
                  <input
                    id="input-habit-title"
                    type="text"
                    value={newHabitTitleVal}
                    onChange={(e) => setNewHabitTitleVal(e.target.value)}
                    placeholder="输入习惯：例如每天阅读30分钟"
                    className="w-full bg-gray-50 dark:bg-[#252529] border border-gray-200/40 dark:border-zinc-800/80 rounded-xl p-2.5 text-[11px] font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500/20 transition-all font-sans"
                  />
                </div>

                {/* 2. Frequency Period */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">打卡频率</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-gray-50 dark:bg-[#252529] p-1 rounded-xl border border-gray-200/20 dark:border-zinc-800/40">
                    {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((period) => (
                      <button
                        id={`btn-habit-period-${period.toLowerCase()}`}
                        key={period}
                        type="button"
                        onClick={() => setNewHabitPeriod(period)}
                        className={`py-1.5 rounded-lg text-[9.5px] font-extrabold transition-all cursor-pointer ${
                          newHabitPeriod === period
                            ? 'bg-orange-500 text-white shadow-3xs'
                            : 'text-gray-400 hover:text-gray-650 hover:bg-gray-100 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        {period === 'DAILY' ? '按天' : period === 'WEEKLY' ? '按周' : '按月'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Conditional Weekly days selection */}
                {newHabitPeriod === 'WEEKLY' && (
                  <div className="space-y-1.5 animate-fade-in bg-orange-500/5 p-2 rounded-2xl border border-orange-500/10">
                    <label className="text-[8.5px] font-extrabold text-orange-650 dark:text-orange-400 uppercase tracking-widest pl-0.5 block">选择每周重复执行的天</label>
                    <div className="flex gap-1 justify-between bg-transparent">
                      {[1, 2, 3, 4, 5, 6, 7].map((wkDayNum) => {
                        const isSelected = selectedWeeklyDays.includes(wkDayNum);
                        return (
                          <button
                            id={`btn-habit-weekly-day-${wkDayNum}`}
                            key={wkDayNum}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedWeeklyDays(selectedWeeklyDays.filter(d => d !== wkDayNum));
                              } else {
                                setSelectedWeeklyDays([...selectedWeeklyDays, wkDayNum]);
                              }
                            }}
                            className={`w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                              isSelected
                                ? 'bg-orange-500 text-white font-extrabold'
                                : 'bg-white dark:bg-[#1C1C1E] border border-gray-150/40 dark:border-zinc-800 text-gray-500 hover:text-orange-500'
                            }`}
                          >
                            {['一', '二', '三', '四', '五', '六', '日'][wkDayNum - 1]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Conditional Monthly days selection */}
                {newHabitPeriod === 'MONTHLY' && (
                  <div className="space-y-1.5 animate-fade-in bg-orange-500/5 p-2.5 rounded-2xl border border-orange-500/10 text-left">
                    <label className="text-[8.5px] font-extrabold text-orange-650 dark:text-orange-400 uppercase tracking-widest pl-0.5 block">选择每月的几号打卡</label>
                    <div className="grid grid-cols-7 gap-1 max-h-[110px] overflow-y-auto no-scrollbar bg-white/70 dark:bg-[#1C1C1E]/50 p-1.5 rounded-xl border border-gray-150/30 dark:border-zinc-800/40">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((mthDayNum) => {
                        const isSelected = selectedMonthlyDays.includes(mthDayNum);
                        return (
                          <button
                            id={`btn-habit-monthly-day-${mthDayNum}`}
                            key={mthDayNum}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedMonthlyDays(selectedMonthlyDays.filter(d => d !== mthDayNum));
                              } else {
                                setSelectedMonthlyDays([...selectedMonthlyDays, mthDayNum]);
                              }
                            }}
                            className={`h-6 rounded-md text-[9px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-400 hover:text-orange-550'
                            }`}
                          >
                            {mthDayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Date Range Form Fields */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-extrabold text-gray-400 dark:text-zinc-550 uppercase tracking-wider pl-0.5">开始日期</label>
                    <input
                      id="input-habit-start-date"
                      type="date"
                      value={newHabitStart}
                      onChange={(e) => setNewHabitStart(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#252529] border border-gray-200/40 dark:border-zinc-805 rounded-xl p-1.5 text-[9px] font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] font-extrabold text-gray-400 dark:text-zinc-550 uppercase tracking-wider pl-0.5">结束日期</label>
                    <input
                      id="input-habit-end-date"
                      type="date"
                      value={newHabitEnd}
                      onChange={(e) => setNewHabitEnd(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#252529] border border-gray-200/40 dark:border-zinc-805 rounded-xl p-1.5 text-[9px] font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Confirm & Trigger Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-zinc-850 bg-transparent">
                <button
                  id="btn-habit-modal-cancel"
                  onClick={() => setIsAddHabitModalOpen(false)}
                  className="flex-1 py-2 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[11px] rounded-xl transition-colors cursor-pointer text-center"
                >
                  取消
                </button>
                <button
                  id="btn-habit-modal-confirm"
                  onClick={() => {
                    if (!newHabitTitleVal.trim()) return;
                    const nid = 'habit-' + Date.now();
                    const newHabit: Habit = {
                      id: nid,
                      title: newHabitTitleVal.trim(),
                      createdAt: new Date().toISOString(),
                      completedDates: [],
                      periodType: newHabitPeriod,
                      startDate: newHabitStart,
                      endDate: newHabitEnd,
                      weeklyDays: newHabitPeriod === 'WEEKLY' ? selectedWeeklyDays : undefined,
                      monthlyDays: newHabitPeriod === 'MONTHLY' ? selectedMonthlyDays : undefined
                    };
                    const updated = [...habits, newHabit];
                    handleSaveHabits(updated);
                    setNewHabitTitleVal('');
                    setSelectedWeeklyDays([]);
                    setSelectedMonthlyDays([]);
                    setIsAddHabitModalOpen(false);
                    if (audioSynthRef.current) {
                      audioSynthRef.current.synthesizeSuccessChime();
                    }
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl text-[11px] transition-colors cursor-pointer text-center shadow-md shadow-orange-500/10"
                >
                  确认添加
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

                {/* 1.5. Dynamic Bottom Tabs Toggle Settings */}
                <div className="space-y-1.5">
                  <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase block">动态底部功能菜单 (开启后显示，关闭后隐藏)</span>
                  <div className="bg-gray-50 dark:bg-[#252529] p-3 rounded-2xl border border-gray-150/10 space-y-2.5">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex flex-col">
                        <span className="text-[10.5px] font-extrabold text-gray-800 dark:text-gray-200">四象限功能</span>
                        <span className="text-[8.5px] text-gray-400">高效拆解并按紧急与重要程度安排待办</span>
                      </div>
                      <input
                        id="chk-settings-show-quadrants"
                        type="checkbox"
                        checked={showQuadrantsTab}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setShowQuadrantsTab(val);
                          Storage.setItem('hm_show_quadrants_tab', String(val));
                          if (audioSynthRef.current) audioSynthRef.current.synthesizeHapticChime();
                        }}
                        className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#007DFF] focus:ring-[#007DFF] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group border-t border-gray-150/30 dark:border-zinc-800/60 pt-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10.5px] font-extrabold text-gray-800 dark:text-gray-200">习惯打卡中心</span>
                        <span className="text-[8.5px] text-gray-400">追求每日高频小习惯，支持在独立打卡页记录打卡数</span>
                      </div>
                      <input
                        id="chk-settings-show-habits"
                        type="checkbox"
                        checked={showHabitsTab}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setShowHabitsTab(val);
                          Storage.setItem('hm_show_habits_tab', String(val));
                          if (audioSynthRef.current) audioSynthRef.current.synthesizeHapticChime();
                        }}
                        className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#007DFF] focus:ring-[#007DFF] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group border-t border-gray-150/30 dark:border-zinc-800/60 pt-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10.5px] font-extrabold text-gray-800 dark:text-gray-200">专注时钟功能</span>
                        <span className="text-[8.5px] text-gray-400">番茄聚焦、正向沙漏计时以及多维睡眠音频</span>
                      </div>
                      <input
                        id="chk-settings-show-pomodoro"
                        type="checkbox"
                        checked={showPomodoroTab}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setShowPomodoroTab(val);
                          Storage.setItem('hm_show_pomodoro_tab', String(val));
                          if (audioSynthRef.current) audioSynthRef.current.synthesizeHapticChime();
                        }}
                        className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#007DFF] focus:ring-[#007DFF] cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Tasks cleaning helper integrated inside settings */}
                <div className="space-y-1.5">
                  <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase block">快捷存储管家</span>
                  <button
                    onClick={() => {
                      setIsConfirmClearModalOpen(true);
                      setIsSettingsOpen(false);
                    }}
                    className="w-full p-2.5 bg-rose-50 hover:bg-rose-100/60 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-200/20 dark:border-rose-500/10 font-bold rounded-xl text-[10.5px] text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 size={11} />
                    <span>清理所有已完成待办历史</span>
                  </button>
                </div>

                {/* 3. Feedback Entry */}
                <div className="space-y-1.5 mt-2">
                  <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-500 uppercase block">意见反馈</span>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsFeedbackModalOpen(true);
                    }}
                    className="w-full p-2.5 bg-blue-50 hover:bg-blue-100/60 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-200/20 dark:border-blue-500/10 font-bold rounded-xl text-[10.5px] text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Mail size={11} />
                    <span>撰写意见反馈</span>
                  </button>
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

      <AnimatePresence>
        {isConfirmClearModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setIsConfirmClearModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-white dark:bg-[#1E1E20] rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">确认清理历史任务？</h3>
                  <p className="text-xs text-gray-500 mt-1">您确定要清空所有已完成的历史任务吗？这可以帮助您保持列表清爽，此操作不可撤销。</p>
                </div>
                <div className="flex w-full gap-3 pt-2">
                  <button
                    onClick={() => setIsConfirmClearModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleClearCompletedHistory}
                    className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    确认清理
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 意见反馈弹窗 Feedback Modal */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center p-0 sm:p-6"
            onClick={() => setIsFeedbackModalOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-[#F2F2F7] dark:bg-[#121214] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <h3 className="text-base font-extrabold tracking-tight">产品意见反馈</h3>
                </div>
                <button
                  onClick={() => {
                    setIsFeedbackModalOpen(false);
                    setFeedbackStatus('idle');
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/50 dark:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mb-4">
                <div className="space-y-4">
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                    您的每一个建议，都是我们不断进化的阶梯。请畅所欲言！
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">您的建议或遇到的问题 <span className="text-rose-500">*</span></label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="请详细描述您的建议或遇到的问题..."
                      className="w-full p-3.5 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007DFF]/50 resize-none h-32 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">联系方式 <span className="text-gray-400 font-normal lowercase">(选填)</span></label>
                    <input
                      type="text"
                      value={feedbackContact}
                      onChange={(e) => setFeedbackContact(e.target.value)}
                      placeholder="留下邮箱或微信号，方便我们回复您"
                      className="w-full p-3.5 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007DFF]/50 font-medium"
                    />
                  </div>
                </div>
              </div>

              {feedbackStatus === 'success' ? (
                <div className="w-full py-3.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl text-center shadow-inner flex items-center justify-center gap-2">
                  <CheckSquare size={18} />
                  发送成功，感谢您的反馈！
                </div>
              ) : (
                <button
                  disabled={feedbackStatus === 'sending'}
                  onClick={async () => {
                    if (!feedbackText.trim()) {
                      alert('请输入反馈内容');
                      return;
                    }
                    
                    setFeedbackStatus('sending');
                    
                    try {
                      // 使用 Web3Forms (免费无后端表单服务) 或 Webhook
                      // 替换 YOUR_ACCESS_KEY 为你在 web3forms.com 注册的真实 Key
                      const formData = new FormData();
                      formData.append("access_key", "433cce23-fba2-4a98-9cc4-f4a6ed5bfb22");
                      formData.append("subject", "ZenFlow App 意见反馈");
                      formData.append("message", feedbackText);
                      if (feedbackContact) {
                        formData.append("contact", feedbackContact);
                      }

                      // 模拟发送 (真实环境取消下方注释并使用真实Key)
                      await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        body: formData
                      });
                      
                      // 为了演示效果，设置一个 1.5 秒的延迟模拟网络请求
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      
                      setFeedbackStatus('success');
                      setFeedbackText('');
                      setFeedbackContact('');
                      
                      // 3秒后自动关闭
                      setTimeout(() => {
                        setIsFeedbackModalOpen(false);
                        setFeedbackStatus('idle');
                      }, 3000);
                      
                    } catch (error) {
                      setFeedbackStatus('error');
                      alert('发送失败，请检查网络连接。');
                    }
                  }}
                  className={`w-full py-3.5 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${
                    feedbackStatus === 'sending' 
                      ? 'bg-gray-300 dark:bg-zinc-700 text-gray-500 cursor-not-allowed' 
                      : feedbackStatus === 'error'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                      : 'bg-[#007DFF] hover:bg-[#0066CC] active:scale-[0.98] text-white shadow-blue-500/20'
                  }`}
                >
                  {feedbackStatus === 'sending' ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      正在发送中...
                    </>
                  ) : feedbackStatus === 'error' ? (
                    '发送失败，点击重试'
                  ) : (
                    <>
                      <Send size={16} />
                      直接提交反馈
                    </>
                  )}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bottom Sliding Bottom Drawer Panel */}
      <TaskDrawer
        isOpen={isDrawerOpen}
        task={editingTask}
        allTasks={tasks}
        isQuadrantsEnabled={showQuadrantsTab}
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
