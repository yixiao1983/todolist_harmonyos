/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task } from '../types';
import { Play, Pause, Square, CheckSquare, Sparkles, Timer, ArrowUpRight, FolderHeart, LayoutGrid, CheckCircle2, Circle } from 'lucide-react';

interface WidgetPlaygroundProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  isTimerActive: boolean;
  isPaused: boolean;
  timerLabel: string;
  activeTaskId?: string;
  onStartFocusOnTask: (taskId: string) => void;
  onPauseFocus: () => void;
  onStopFocus: () => void;
  onOpenFullApp: () => void;
}

export function WidgetPlayground({
  tasks,
  onToggleComplete,
  isTimerActive,
  isPaused,
  timerLabel,
  activeTaskId,
  onStartFocusOnTask,
  onPauseFocus,
  onStopFocus,
  onOpenFullApp
}: WidgetPlaygroundProps) {
  const [selectedWidgetTask, setSelectedWidgetTask] = useState(() => {
    const pending = tasks.filter(t => !t.isCompleted);
    return pending.length > 0 ? pending[0].id : '';
  });

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasksCount = tasks.filter(t => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const currentWidgetTask = tasks.find(t => t.id === selectedWidgetTask);

  return (
    <div 
      id="widget-wallpaper" 
      className="flex-1 bg-[#F1F3F5] p-5 flex flex-col justify-between h-full relative"
    >
      {/* Top Welcome Title */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-[#007DFF] tracking-wider block uppercase">HarmonyOS NEXT Desktop</span>
          <h3 className="text-sm font-black text-[#1A1A1A]">万能服务卡片工作区</h3>
        </div>
        <button
          id="btn-desktop-launch"
          onClick={onOpenFullApp}
          className="p-2 bg-[#007DFF] hover:bg-blue-600 active:scale-95 text-white text-xs rounded-2xl flex items-center gap-1 font-bold shadow-sm shadow-[#007DFF]/20 border border-transparent transition-all cursor-pointer"
        >
          <span>进入主屏</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Main Widgets Container Grid */}
      <div id="widgets-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 my-auto">
        
        {/* 1. 2x2 TodoList Universal Widget */}
        <div 
          id="widget-todo"
          className="bg-[#FAFAFA]/95 hover:bg-white/100 rounded-[2rem] border border-gray-100 shadow-xl p-4.5 flex flex-col justify-between h-[210px] transition-all duration-300 transform hover:scale-[1.01]"
        >
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center space-x-1.5">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <CheckSquare size={13} />
                </div>
                <h4 className="text-xs font-black text-gray-800">桌面待办 (2x2)</h4>
              </div>
              <span id="widget-prog" className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-1.5 py-0.2 rounded-full">
                已成 {progressPercent}%
              </span>
            </div>

            {/* Micro List items */}
            {pendingTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[11px] text-emerald-600 font-extrabold flex items-center justify-center gap-1">
                  <Sparkles size={11} /> All Tasks Done!
                </p>
                <p className="text-[10px] text-gray-400 mt-1">桌面清爽，已无待办</p>
              </div>
            ) : (
              <div id="widget-tasks" className="space-y-1.5">
                {pendingTasks.slice(0, 3).map(pt => (
                  <div
                    id={`widget-row-${pt.id}`}
                    key={pt.id}
                    title="桌面直接点击勾完成"
                    onClick={() => onToggleComplete(pt.id)}
                    className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-xl border border-gray-200/40 cursor-pointer transition-colors"
                  >
                    <button className="text-gray-400 hover:text-emerald-600 flex-shrink-0 cursor-pointer">
                      <Circle size={13} />
                    </button>
                    <span className="text-[11px] text-gray-700 font-semibold truncate flex-1">
                      {pt.title}
                    </span>
                    {pt.priority === 'HIGH' && (
                      <span className="text-[7.5px] bg-rose-50 text-rose-500 font-extrabold px-1 rounded-sm">高</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[9px] text-gray-400 border-t border-gray-150/40 pt-2 font-bold uppercase">
            <span>今日未完成: {pendingTasks.length} 项</span>
            <span className="font-mono">FORM: EXTENSION</span>
          </div>
        </div>

        {/* 2. 2x2 Pomodoro Focus Universal Widget */}
        <div 
          id="widget-focus"
          className="bg-white/95 hover:bg-white/100 rounded-[2rem] border border-gray-100 shadow-xl p-4.5 flex flex-col justify-between h-[210px] transition-all duration-300 transform hover:scale-[1.01]"
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-1.5">
                <div className="p-1.5 bg-rose-50/80 text-rose-500 rounded-lg animate-pulse">
                  <Timer size={13} />
                </div>
                <h4 className="text-xs font-black text-gray-800">番茄专注卡片 (2x2)</h4>
              </div>
              <span id="widget-timer-badge" className="text-[9px] bg-rose-50 text-rose-500 font-extrabold px-1.5 py-0.2 rounded-full">
                {isTimerActive ? '运行中' : '空闲'}
              </span>
            </div>

            {isTimerActive ? (
              // Active widget countdown dashboard
              <div className="text-center py-2 space-y-2">
                <p className="text-2xl font-black text-gray-800 font-mono tracking-widest">{timerLabel}</p>
                <div className="flex justify-center space-x-2">
                  <button
                    id="widget-btn-pause"
                    onClick={onPauseFocus}
                    className="p-1 px-3 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    {isPaused ? <Play size={10} /> : <Pause size={10} />}
                    {isPaused ? '启动' : '暂停'}
                  </button>
                  <button
                    id="widget-btn-stop"
                    onClick={onStopFocus}
                    className="p-1 px-3 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Square size={10} />
                    停止
                  </button>
                </div>
              </div>
            ) : (
              // Selection & trigger form
              <div className="space-y-2.5 pt-1.5">
                <div>
                  <label id="lbl-widget-select" className="text-[9px] font-extrabold text-gray-400 block mb-1 uppercase tracking-wider">关联任务快捷开启番茄钟</label>
                  {pendingTasks.length === 0 ? (
                    <div className="p-2 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <span className="text-[10px] text-gray-400">请先在待办主屏添加任务</span>
                    </div>
                  ) : (
                    <select
                      id="widget-select-task"
                      value={selectedWidgetTask}
                      onChange={e => setSelectedWidgetTask(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-1.5 text-[10.5px] font-semibold text-gray-700 focus:outline-none"
                    >
                      {pendingTasks.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  id="widget-btn-start"
                  onClick={() => selectedWidgetTask && onStartFocusOnTask(selectedWidgetTask)}
                  disabled={pendingTasks.length === 0}
                  className="w-full p-2 bg-[#007DFF] disabled:bg-gray-350 text-white rounded-xl hover:bg-blue-600 font-extrabold text-[10.5px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Play size={11} className="fill-white" />
                  开启 25 分钟番茄
                </button>
              </div>
            )}
          </div>

          {isTimerActive && activeTaskId ? (
            <p className="text-[9.5px] text-gray-400 font-bold truncate text-center uppercase">
              当前专注: {tasks.find(t => t.id === activeTaskId)?.title}
            </p>
          ) : (
            <div className="flex justify-between text-[9px] text-gray-400 border-t border-gray-150/40 pt-2 font-bold uppercase">
              <span>一键进入高速流</span>
              <span className="font-mono">FORM: LITE</span>
            </div>
          )}
        </div>

      </div>

      {/* Grid of Micro App Icons mimicking HarmonyOS */}
      <div id="desktop-dock" className="relative z-10 flex justify-center space-x-4 bg-white/60 p-2.5 rounded-[1.8rem] border border-gray-200/50 shadow-md backdrop-blur-md max-w-sm mx-auto">
        <button 
          onClick={onOpenFullApp} 
          className="flex flex-col items-center justify-center space-y-1 bg-[#FAFAFA] hover:bg-white p-2 rounded-2xl w-14 h-14 outline-none cursor-pointer border border-gray-150 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
            <CheckSquare size={13} />
          </div>
          <span className="text-[9px] text-gray-700 font-bold">待办清单</span>
        </button>

        <button 
          onClick={onOpenFullApp} 
          className="flex flex-col items-center justify-center space-y-1 bg-[#FAFAFA] hover:bg-white p-2 rounded-2xl w-14 h-14 outline-none cursor-pointer border border-gray-150 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-orange-400 text-white flex items-center justify-center">
            <Timer size={13} />
          </div>
          <span className="text-[9px] text-gray-700 font-bold">专注计时</span>
        </button>

        <div className="flex flex-col items-center justify-center space-y-1 bg-gray-155 p-2 rounded-2xl w-14 h-14 opacity-50">
          <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center">
            <FolderHeart size={13} />
          </div>
          <span className="text-[9px] text-gray-400 font-bold">小艺管家</span>
        </div>
      </div>
    </div>
  );
}
