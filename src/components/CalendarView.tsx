/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task } from '../types';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, CheckSquare, ListTodo, Layers, Sparkles } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onToggleComplete?: (id: string) => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

type CalendarLevel = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export function CalendarView({ tasks, onEditTask, onToggleComplete, selectedDate, onSelectDate }: CalendarViewProps) {
  const [currentLevel, setCurrentLevel] = useState<CalendarLevel>('MONTH');
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  
  // Pivot date management (defaulting to current date)
  const [pivotDate, setPivotDate] = useState(() => new Date());

  // Weekdays header
  const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
  const MONTHS_ZH = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const changePivotDate = (direction: 'back' | 'forward') => {
    const next = new Date(pivotDate);
    const step = direction === 'back' ? -1 : 1;
    if (currentLevel === 'DAY') {
      next.setDate(next.getDate() + step);
    } else if (currentLevel === 'WEEK') {
      next.setDate(next.getDate() + (step * 7));
    } else if (currentLevel === 'MONTH') {
      next.setMonth(next.getMonth() + step);
    } else {
      next.setFullYear(next.getFullYear() + step);
    }
    setPivotDate(next);
  };

  const jumpToToday = () => {
    const today = new Date();
    setPivotDate(today);
    onSelectDate(today.toISOString().split('T')[0]);
  };

  // Helper formats
  const formatYYYYMMDD = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const r = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${r}`;
  };

  const getDaysInMonthGrid = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth(); // 0-indexed
    
    // First day of current month
    const firstDay = new Date(y, m, 1);
    // Day of week of first day (0 = Sunday, we shift so 0 = Monday, ..., 6 = Sunday)
    let firstDayIndex = firstDay.getDay() - 1;
    if (firstDayIndex === -1) firstDayIndex = 6; // Sunday is index 6

    // Number of days in current month
    const daysInCurrentMonth = new Date(y, m + 1, 0).getDate();
    // Number of days in previous month
    const daysInLastMonth = new Date(y, m, 0).getDate();

    const daysGrid: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const todayStr = formatYYYYMMDD(new Date());

    // Backfill previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(y, m - 1, daysInLastMonth - i);
      daysGrid.push({
        date: d,
        isCurrentMonth: false,
        isToday: formatYYYYMMDD(d) === todayStr,
      });
    }

    // Fill current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(y, m, i);
      daysGrid.push({
        date: d,
        isCurrentMonth: true,
        isToday: formatYYYYMMDD(d) === todayStr,
      });
    }

    // Complement next month days to make grid standard 42 slots (6 weeks)
    const remaining = 42 - daysGrid.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(y, m + 1, i);
      daysGrid.push({
        date: d,
        isCurrentMonth: false,
        isToday: formatYYYYMMDD(d) === todayStr,
      });
    }

    return daysGrid;
  };

  const getWeekDaysArray = (date: Date) => {
    const currentDay = date.getDay(); // 0 is Sunday
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(date);
    monday.setDate(date.getDate() + distanceToMonday);

    const weekArr: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      weekArr.push(nextDay);
    }
    return weekArr;
  };

  // 1. Render DAY View: Hourly Timeline
  const renderDayView = () => {
    const dateStr = formatYYYYMMDD(pivotDate);
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);

    return (
      <div id="calendar-day-flow" className="flex flex-col bg-white rounded-3xl p-4 border border-gray-100">

        {dayTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-50">
            <ListTodo size={28} className="text-gray-300" />
            <p className="text-[11px] text-gray-400 mt-2 font-semibold">今日暂无行程，享受专注的一天吧</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayTasks.map(t => (
              <div 
                id={`day-task-${t.id}`}
                key={t.id}
                onClick={() => onEditTask(t)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all hover:translate-x-0.5 ${
                  t.isCompleted 
                    ? 'bg-gray-50 border-gray-150 text-gray-400' 
                    : t.priority === 'HIGH' 
                      ? 'bg-rose-50/50 border-rose-100 text-gray-800 hover:bg-rose-50' 
                      : 'bg-blue-50/30 border-blue-100 text-gray-800 hover:bg-blue-50/75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleComplete && onToggleComplete(t.id); }}
                      className={`shrink-0 w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all ${
                        t.isCompleted ? 'bg-gray-300 border-gray-300' : 'bg-transparent border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {t.isCompleted && <CheckSquare size={12} className="text-white" />}
                    </button>
                    <span className={`text-xs font-bold truncate ${t.isCompleted && 'line-through opacity-60'}`}>{t.title}</span>
                  </div>
                  <span className={`shrink-0 text-[9px] px-1.5 py-0.2 rounded-sm uppercase font-black ${
                    t.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-gray-400">
                  <span className="bg-gray-150 px-1.5 py-0.2 rounded-xs font-semibold">象限 {t.quadrant}</span>
                  {t.tags.map((tag, idx) => (
                    <span key={idx}>#{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 2. Render WEEK View: Monday to Sunday vertical top-down stack
  const renderWeekView = () => {
    const weekDays = getWeekDaysArray(pivotDate);
    return (
      <div id="calendar-week-flow" className="flex flex-col gap-1.5 pr-1 no-scrollbar">
        {weekDays.map((wd, i) => {
          const wdStr = formatYYYYMMDD(wd);
          const wdTasks = tasks.filter(t => t.dueDate === wdStr);
          const isToday = formatYYYYMMDD(new Date()) === wdStr;
          const isSelected = formatYYYYMMDD(pivotDate) === wdStr;

          return (
            <div
              id={`week-row-${wdStr}`}
              key={i}
              onClick={() => {
                setPivotDate(wd);
                onSelectDate(wdStr);
              }}
              className={`rounded-2xl p-2.5 flex items-center gap-3 border transition-all text-left cursor-pointer ${
                isSelected 
                  ? 'bg-gray-950 border-gray-950 text-white shadow-xs' 
                  : isToday 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-white text-gray-850 border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Day info marker on left */}
              <div className="flex flex-col items-center justify-center min-w-[42px] border-r border-gray-100/50 pr-2">
                <span className={`text-[9.5px] font-black ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                  周{WEEKDAYS[i]}
                </span>
                <span className="text-sm font-black font-mono mt-0.5 leading-none">{wd.getDate()}</span>
              </div>

              {/* Task list inside this weekday */}
              <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                {wdTasks.length === 0 ? (
                  <span className={`text-[10px] ${isSelected ? 'text-gray-500' : 'text-gray-300'} italic`}>暂无安排</span>
                ) : (
                  wdTasks.map(t => (
                    <div 
                      key={t.id} 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(t);
                      }}
                      className={`text-[10.5px] px-2 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all hover:scale-[1.01] ${
                        isSelected 
                          ? 'bg-white/15 text-white border-white/10 hover:bg-white/20' 
                          : t.isCompleted 
                            ? 'bg-gray-100 border-gray-200 text-gray-450 line-through' 
                            : t.priority === 'HIGH' 
                              ? 'bg-rose-50 text-rose-700 border-rose-100 font-bold' 
                              : 'bg-blue-50 text-blue-700 border-blue-100 font-bold'
                      }`}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleComplete && onToggleComplete(t.id); }}
                        className={`shrink-0 w-3.5 h-3.5 rounded-[4px] border-2 flex items-center justify-center transition-all ${
                          t.isCompleted ? 'bg-gray-400 border-gray-400' : 'bg-transparent border-current opacity-60 hover:opacity-100'
                        }`}
                      >
                        {t.isCompleted && <CheckSquare size={10} className="text-white" />}
                      </button>
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 3. Render MONTH View: 42 Days Grid & selected day tasks list
  const renderMonthView = () => {
    const days = getDaysInMonthGrid(pivotDate);
    const selectedDateStr = formatYYYYMMDD(pivotDate);
    const selectedDayTasks = tasks.filter(t => t.dueDate === selectedDateStr);

    return (
      <div id="calendar-view-container" className="h-full flex flex-col bg-gray-50/30 overflow-y-auto overflow-x-hidden relative">
        {/* Week Days Headers */}
        <div className="grid grid-cols-7 text-center mb-1 bg-gray-100/50 p-1 rounded-xl">
          {WEEKDAYS.map((wd, i) => (
            <span key={i} className="text-[10px] font-extrabold text-gray-400 py-1">{wd}</span>
          ))}
        </div>

        {/* Days Box */}
        <div id="month-grid-content" className="grid grid-cols-7 gap-1.5 flex-1">
          {days.map((item, idx) => {
            const dateStr = formatYYYYMMDD(item.date);
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const isSelected = dateStr === selectedDateStr;

            return (
              <button
                id={`month-day-${dateStr}`}
                key={idx}
                onClick={() => {
                  setPivotDate(item.date);
                  onSelectDate(dateStr);
                }}
                className={`relative rounded-xl p-1.5 border flex flex-col justify-between items-center text-center h-[46px] transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-gray-900 border-gray-900 text-white shadow-2xs z-10' 
                    : item.isToday 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : item.isCurrentMonth
                        ? 'bg-white text-gray-800 border-gray-100 hover:border-gray-250 hover:bg-gray-50/50'
                        : 'bg-transparent text-gray-350 border-transparent hover:border-gray-105'
                }`}
              >
                <span className={`text-[10.5px] font-black ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {item.date.getDate()}
                </span>
                
                {/* Visual heat indicator */}
                {dayTasks.length > 0 && (
                  <div className="flex items-center space-x-0.5 mt-0.5">
                    {dayTasks.slice(0, 3).map((t, idx) => (
                      <span 
                        key={idx} 
                        className={`w-1 h-1 rounded-full ${
                          t.isCompleted 
                            ? 'bg-emerald-500' 
                            : t.priority === 'HIGH' 
                              ? 'bg-rose-500' 
                              : 'bg-blue-400'
                        }`} 
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[6.5px] text-gray-400 font-extrabold font-mono">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected date task list (Refactored: borderless, layout integrated cleanly without an outer frame box) */}
        <div id="month-tasks-list" className="mt-3.5 text-left space-y-2 bg-transparent">
          <div className="flex items-center justify-between border-b border-gray-155 pb-1.5 mb-2 bg-transparent">
            <span className="text-[9.5px] font-bold text-gray-400">点击项目直接快捷编辑 ({selectedDayTasks.length} 个任务)</span>
          </div>

          {selectedDayTasks.length === 0 ? (
            <p className="text-[10px] text-gray-400 italic text-center py-2.5 font-bold">本日暂无安排，快去添加新日程吧</p>
          ) : (
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
              {selectedDayTasks.map(t => (
                <div
                  id={`month-task-item-${t.id}`}
                  key={t.id}
                  onClick={() => onEditTask(t)}
                  className={`p-2 rounded-xl text-[10px] font-bold border cursor-pointer transition-all hover:translate-x-0.5 hover:bg-gray-100 flex items-center justify-between gap-2 ${
                    t.isCompleted
                      ? 'bg-gray-100/60 border-gray-200 text-gray-450 line-through'
                      : t.priority === 'HIGH'
                        ? 'bg-rose-50 border-rose-100 text-gray-800'
                        : 'bg-white border-gray-150/50 text-gray-850'
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleComplete && onToggleComplete(t.id); }}
                      className={`shrink-0 w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-all ${
                        t.isCompleted ? 'bg-gray-400 border-gray-400' : t.priority === 'HIGH' ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      {t.isCompleted ? <CheckSquare size={10} className="text-white" /> : <div className={`w-1.5 h-1.5 rounded-full ${t.priority === 'HIGH' ? 'bg-rose-500' : 'bg-blue-500'}`} />}
                    </button>
                    <span className="truncate leading-tight">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[8px] font-black border border-gray-350/20 px-1 py-0.2 rounded bg-gray-50/80 text-gray-400 font-mono">
                      Q{t.quadrant}
                    </span>
                    <span className="text-[8.5px] font-bold text-gray-400">
                      {t.priority === 'HIGH' ? '高' : '低'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 4. Render YEAR View: Heatmap Trend
  const renderYearView = () => {
    // Generate Year months mock layout representing todo finished load (density chart)
    const currentYear = pivotDate.getFullYear();
    const monthsData = Array.from({ length: 12 }, (_, monthIndex) => {
      // Find tasks completed in this month
      const monthTasks = tasks.filter(t => {
        const d = new Date(t.dueDate);
        return d.getFullYear() === currentYear && d.getMonth() === monthIndex;
      });
      const completes = monthTasks.filter(t => t.isCompleted).length;
      return { index: monthIndex, total: monthTasks.length, completed: completes };
    });

    return (
      <div id="calendar-year-flow" className="flex flex-col bg-white rounded-3xl p-3 border border-gray-100/50">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles size={11} className="text-amber-500 shrink-0" />
          <h4 className="text-[10px] font-extrabold text-gray-700 font-sans">年度待办与专注力热力分布走势</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-2 flex-1">
          {monthsData.map((mon, i) => {
            // Calculate color density based on completes
            let densityColor = 'bg-gray-100 text-gray-400';
            if (mon.completed > 0 && mon.completed <= 2) densityColor = 'bg-blue-50 text-blue-700 border border-blue-105';
            else if (mon.completed > 2 && mon.completed <= 5) densityColor = 'bg-blue-150 text-blue-900 border border-blue-200';
            else if (mon.completed > 5) densityColor = 'bg-emerald-500 text-white shadow-2xs font-extrabold border border-emerald-600';

            return (
              <div 
                id={`year-month-tile-${i}`}
                key={i} 
                className="flex flex-col justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all text-left"
              >
                <div className="flex justify-between items-center bg-transparent">
                  <span className="text-[10px] font-black text-gray-750">{MONTHS_ZH[i]}</span>
                  {mon.total > 0 && (
                    <span className="text-[8.5px] font-black text-emerald-600">
                      {Math.round((mon.completed / mon.total) * 100)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1.5 mt-2 bg-transparent font-sans">
                  <div className={`text-[8px] px-1.5 py-0.5 rounded-lg text-center font-bold ${densityColor}`}>
                    {mon.completed} 完
                  </div>
                  <span className="text-[8.5px] font-bold text-gray-400 font-mono">总:{mon.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="calendar-view-container" className="space-y-3.5 h-full flex flex-col">
      {/* Refactored into a single header controls bar with a popup dropdown for dimension */}
      <div className="flex-none flex items-center justify-between bg-white dark:bg-zinc-900/60 p-2.5 rounded-[1.6rem] border border-gray-150/15 dark:border-zinc-800/40 shadow-3xs relative">
        <div className="flex items-center gap-1.5 relative bg-transparent">
          {/* Dropdown Toggle Button, styled to act as icon popup trigger */}
          <button
            id="btn-cal-level-dropdown-trigger"
            onClick={() => setShowLevelDropdown(!showLevelDropdown)}
            className="flex items-center gap-1.5 p-1 px-3 bg-[#E8F3FF] dark:bg-blue-900/10 hover:bg-[#D5EAFF] dark:hover:bg-blue-800/20 text-[#007DFF] font-black rounded-xl text-[11px] cursor-pointer transition-all border border-blue-105/20"
          >
            <Calendar size={13} className="stroke-[2.5]" />
            <span>
              {currentLevel === 'DAY' && '日视图'}
              {currentLevel === 'WEEK' && '周视图'}
              {currentLevel === 'MONTH' && '月视图'}
              {currentLevel === 'YEAR' && '年视图'}
            </span>
            <ChevronDown size={11} className="stroke-[3]" />
          </button>

          {/* Popover list options for dimension */}
          {showLevelDropdown && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10 bg-transparent" 
                onClick={() => setShowLevelDropdown(false)}
              />
              {/* Dropdown Menu */}
              <div className="absolute top-[35px] left-0 z-20 w-[120px] bg-white dark:bg-zinc-950 border border-gray-150/55 dark:border-zinc-800/80 rounded-2xl p-1.5 shadow-xl animate-fade-in text-left">
                {[
                  { lvl: 'DAY' as CalendarLevel, label: '日视图' },
                  { lvl: 'WEEK' as CalendarLevel, label: '周视图' },
                  { lvl: 'MONTH' as CalendarLevel, label: '月视图' },
                  { lvl: 'YEAR' as CalendarLevel, label: '年视图' }
                ].map(op => (
                  <button
                    key={op.lvl}
                    onClick={() => {
                      setCurrentLevel(op.lvl);
                      setShowLevelDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-[11px] font-bold rounded-xl text-left transition-colors cursor-pointer ${
                      currentLevel === op.lvl 
                        ? 'bg-[#E8F3FF] dark:bg-blue-950/20 text-[#007DFF]' 
                        : 'text-gray-650 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Compact date selector (Prev, Label, Next, Today) */}
        <div className="flex items-center space-x-1.5 bg-transparent">
          <button 
            id="btn-cal-prev"
            onClick={() => changePivotDate('back')}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 bg-transparent cursor-pointer text-gray-400 hover:text-gray-700 dark:text-zinc-500"
          >
            <ChevronLeft size={13} className="stroke-[2.5]" />
          </button>
          <span className="px-1 text-center text-[10.5px] font-extrabold text-gray-800 dark:text-gray-200 font-mono tracking-tight">
            {currentLevel === 'YEAR' && `${pivotDate.getFullYear()}年`}
            {currentLevel === 'MONTH' && `${pivotDate.getFullYear()}年${pivotDate.getMonth() + 1}月`}
            {currentLevel === 'WEEK' && (() => {
               const weekDays = getWeekDaysArray(pivotDate);
               const first = weekDays[0];
               const last = weekDays[6];
               return `${first.getMonth() + 1}/${first.getDate()}-${last.getMonth() + 1}/${last.getDate()}`;
            })()}
            {currentLevel === 'DAY' && formatYYYYMMDD(pivotDate).substring(5)}
          </span>
          <button 
            id="btn-cal-next"
            onClick={() => changePivotDate('forward')}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 bg-transparent cursor-pointer text-gray-400 hover:text-gray-700 dark:text-zinc-500"
          >
            <ChevronRight size={13} className="stroke-[2.5]" />
          </button>
          
          <button
            id="btn-cal-today"
            onClick={jumpToToday}
            className="text-[9.5px] font-black text-[#007DFF] hover:bg-blue-100 dark:hover:bg-blue-900/30 bg-[#E8F3FF]/45 p-1 px-2 rounded-lg cursor-pointer ml-1"
          >
            今
          </button>
        </div>
      </div>

      {/* Main Grid Render Area */}
      <div id="calendar-view-content" className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {currentLevel === 'DAY' && renderDayView()}
        {currentLevel === 'WEEK' && renderWeekView()}
        {currentLevel === 'MONTH' && renderMonthView()}
        {currentLevel === 'YEAR' && renderYearView()}
      </div>
    </div>
  );
}
