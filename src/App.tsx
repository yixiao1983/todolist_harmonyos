/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, Quadrant, Priority, ProjectTemplate, FocusMode } from './types';
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
  FolderOpen
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

export default function App() {
  // Navigation tabs and layout states
  const [isHomeScreen, setIsHomeScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'LIST' | 'QUADRANT' | 'CALENDAR' | 'POMODORO' | 'TEMPLATES'>('LIST');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Tasks and Templates Persistence
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

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

  // Filters computed list
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'ALL' || t.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [tasks, searchQuery, selectedTag]);

  // Live countdown label
  const formatTimerLabel = () => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div id="full-page" className="min-h-screen bg-[#F0F2F5] py-8 px-4 flex items-center justify-center font-sans tracking-tight text-gray-800">
      
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
            <div className="px-5 pt-3.5 pb-3 bg-white/70 backdrop-blur-md border-b border-gray-200/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#007DFF] text-base font-sans tracking-tight">鸿蒙 Todo</span>
                  <div className="bg-[#E8F3FF] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-blue-100/30">
                    <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#007DFF] animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-[10px] font-bold text-[#007DFF] font-mono">
                      {isRunning ? `番茄专注中: ${formatTimerLabel()}` : '沙漏番茄就绪'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 font-bold hidden sm:inline">2026年5月27日 星期三</span>
                  <button
                    id="btn-header-clean-history"
                    onClick={handleClearCompletedHistory}
                    title="一键清理已完成历史待办以保持清爽"
                    className="p-1 px-2.5 text-[10px] font-bold text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-gray-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={11} />
                    清理历史
                  </button>
                  <div className="w-6.5 h-6.5 rounded-full bg-[#007DFF] flex items-center justify-center text-white font-bold text-[10.5px] shadow-sm">JF</div>
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
                          ? 'bg-[#1A1A1A] text-white' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
                            ? 'bg-[#007DFF] text-white' 
                            : 'bg-gray-150/80 text-gray-600 hover:bg-gray-200'
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
            <div id="viewport-pane-scroller" className="flex-1 p-5 overflow-y-auto max-h-[440px]">
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
                    <div id="view-tab-list" className="space-y-4">
                      
                      {/* Create Task Button card */}
                      <button
                        id="btn-trigger-add-task"
                        onClick={() => handleAddTask(2)}
                        className="w-full bg-white border border-dashed border-gray-300 hover:border-gray-400 p-4 rounded-3xl flex items-center justify-center space-x-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Plus size={16} />
                        <span className="text-xs font-bold leading-none">添加新的待办事项 (P0)</span>
                      </button>

                      {filteredTasks.length === 0 ? (
                        <div className="text-center py-16 opacity-50">
                          <CheckSquare size={38} className="text-gray-300 mx-auto" />
                          <p className="text-[11px] text-gray-400 font-bold mt-2.5">无筛选匹配的聚焦待办，轻松无锁</p>
                        </div>
                      ) : (
                        <div id="tasks-list-grid" className="space-y-2.5">
                          {filteredTasks.map(t => {
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
                            let chipColor = 'bg-gray-100 text-gray-600';
                            if (t.priority === 'HIGH') {
                              borderClass = 'border-l-4 border-l-rose-500';
                              chipColor = 'bg-rose-50 text-rose-600 font-black animate-pulse';
                            } else if (t.priority === 'MEDIUM') {
                              borderClass = 'border-l-4 border-l-amber-500';
                              chipColor = 'bg-amber-50 text-amber-600 font-bold';
                            } else if (t.priority === 'LOW') {
                              borderClass = 'border-l-4 border-l-blue-400';
                              chipColor = 'bg-blue-50 text-blue-500';
                            }

                            return (
                              <div
                                id={`task-item-${t.id}`}
                                key={t.id}
                                className={`group/task relative bg-white rounded-3xl border border-gray-150/40 p-4 transition-all shadow-2xs ${borderClass} ${
                                  t.isCompleted ? 'bg-gray-50/70 border-l-gray-300/40 opacity-70' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                                    {/* Tick Checkbox */}
                                    <button
                                      id={`btn-task-tick-${t.id}`}
                                      onClick={() => handleToggleComplete(t.id)}
                                      className="mt-0.5 cursor-pointer flex-shrink-0 transition-transform active:scale-90"
                                    >
                                      {t.isCompleted ? (
                                        <CheckCircle2 size={18} className="fill-emerald-50 text-emerald-600" />
                                      ) : isBlocked ? (
                                        <Lock size={18} className="text-amber-500/80 animate-pulse" />
                                      ) : (
                                        <Circle size={18} className="text-gray-350 hover:text-gray-500" />
                                      )}
                                    </button>

                                    <div className="min-w-0 flex-1">
                                      <h3 className={`text-xs font-semibold leading-tight flex items-center gap-1.5 ${
                                        t.isCompleted ? 'line-through text-gray-400 font-normal shadow-none' : 'text-gray-800'
                                      }`}>
                                        <span className="truncate">{t.title}</span>
                                        {isBlocked && (
                                          <span className="text-[8.5px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded-sm font-extrabold flex items-center gap-0.5">
                                            依赖锁中
                                          </span>
                                        )}
                                      </h3>

                                      {/* Subtasks Completion bar */}
                                      {t.subtasks.length > 0 && (
                                        <div className="mt-2 space-y-1 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                          <div className="flex justify-between items-center text-[8.5px] text-gray-400 font-bold">
                                            <span>子步骤拆解 (Subtask progress)</span>
                                            <span>
                                              {t.subtasks.filter(s => s.isCompleted).length} / {t.subtasks.length} 已完成
                                            </span>
                                          </div>
                                          <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                                            <div 
                                              className="bg-emerald-500 h-1 rounded-full transition-all duration-300" 
                                              style={{ width: `${(t.subtasks.filter(s => s.isCompleted).length / t.subtasks.length) * 100}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Metadatas flow bottom */}
                                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                        <span className="text-[8.5px] bg-gray-100 text-gray-500 px-2.5 py-0.2 rounded-full font-bold">
                                          第 {t.quadrant} 象限
                                        </span>
                                        <span className={`text-[8.5px] px-2.5 py-0.2 rounded-full font-semibold ${chipColor}`}>
                                          {t.priority} 优先级
                                        </span>
                                        {t.tags.map((tag, i) => (
                                          <span key={i} className="text-[9px] text-gray-400 font-mono">
                                            #{tag}
                                          </span>
                                        ))}
                                        {t.focusMinutes > 0 && (
                                          <span className="text-[8.5px] bg-purple-50 text-purple-600 px-2 py-0.2 rounded-full font-extrabold">
                                            🎯 已专注 {t.focusMinutes} 分钟
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

                                  {/* Right side floating quick control toolbox on hover */}
                                  <div className="flex items-center space-x-1.5 pl-1.5 opacity-100 group-hover/task:opacity-100 transition-opacity flex-shrink-0">
                                    <button
                                      id={`btn-task-focus-${t.id}`}
                                      onClick={() => handleStartFocusOnTask(t.id)}
                                      disabled={t.isCompleted}
                                      title="针对此任务快速开启番茄专注"
                                      className="p-1 px-2 text-[10px] bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all font-bold disabled:opacity-40 cursor-pointer"
                                    >
                                      专注
                                    </button>
                                    <button
                                      id={`btn-task-edit-${t.id}`}
                                      onClick={() => handleEditTask(t)}
                                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors cursor-pointer"
                                    >
                                      <Edit3 size={11} />
                                    </button>
                                    <button
                                      id={`btn-task-del-${t.id}`}
                                      onClick={(e) => handleDeleteTask(t.id, e)}
                                      className="p-1.5 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-400 rounded-xl transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: FOUR QUADRANT VIEWS */}
                  {activeTab === 'QUADRANT' && (
                    <div id="view-tab-quadrant" className="h-full">
                      <TaskQuadrant
                        tasks={filteredTasks}
                        onToggleComplete={handleToggleComplete}
                        onEditTask={handleEditTask}
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

                  {/* TAB 5: SAVED PROJECT CHECKLIST TEMPLATES (P2) */}
                  {activeTab === 'TEMPLATES' && (
                    <div id="view-tab-templates" className="space-y-4">
                      
                      <div className="flex items-center gap-1.5 mb-2 pl-1">
                        <Bookmark size={15} className="text-emerald-500" />
                        <h4 className="text-xs font-black text-gray-700">项目清单预设模板 (One-click load templates, P2)</h4>
                      </div>

                      <div id="templates-grid" className="grid grid-cols-1 gap-3">
                        {templates.map(tpl => (
                          <div
                            id={`tpl-card-${tpl.id}`}
                            key={tpl.id}
                            onClick={() => handleImportTemplate(tpl.id)}
                            className="bg-white hover:bg-emerald-50/10 hover:border-emerald-250 p-4 rounded-3xl border border-gray-150/40 shadow-2xs transition-all hover:translate-y-[-1px] cursor-pointer text-left relative overflow-hidden group"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                                  <span>{tpl.name}</span>
                                  {tpl.id.startsWith('hm-') && (
                                    <span className="text-[8.5px] bg-blue-50 text-blue-600 px-1 rounded-sm font-bold">系统</span>
                                  )}
                                </h4>
                                <p className="text-[10.5px] text-gray-400 mt-1 lines-clamp-2 leading-relaxed">
                                  {tpl.description}
                                </p>
                              </div>
                              
                              {/* Quick Import Action Pill */}
                              <button
                                id={`btn-import-tpl-${tpl.id}`}
                                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-extrabold text-[10px] transition-colors flex-shrink-0 cursor-pointer"
                              >
                                一键导入
                              </button>
                            </div>

                            <div className="mt-3.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 font-bold">
                              <span>包含 {tpl.tasks.length} 项标准预设任务案例</span>
                              
                              {!tpl.id.startsWith('hm-') && (
                                <button
                                  id={`btn-del-tpl-${tpl.id}`}
                                  onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                                  className="text-[9px] text-gray-400 hover:text-rose-500 font-bold px-1.5 opacity-80"
                                >
                                  删除模版
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Segments Tabs Board */}
            <div id="app-bottom-nav" className="bg-white/80 backdrop-blur-md px-4 py-2 border-t border-gray-200/40 grid grid-cols-5 gap-0.5 text-center select-none z-10 w-full">
              {[
                { id: 'LIST' as const, name: '待办', icon: <CheckSquare size={16} /> },
                { id: 'QUADRANT' as const, name: '四象限', icon: <Grid2X2 size={16} /> },
                { id: 'CALENDAR' as const, name: '日历', icon: <Calendar size={16} /> },
                { id: 'POMODORO' as const, name: '专注', icon: <Clock3 size={16} /> },
                { id: 'TEMPLATES' as const, name: '模板', icon: <Bookmark size={16} /> }
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
