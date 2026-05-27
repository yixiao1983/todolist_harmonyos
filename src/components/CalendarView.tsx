/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task } from '../types';
import { Calendar, ChevronLeft, ChevronRight, CheckSquare, ListTodo, Layers, Sparkles } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

type CalendarLevel = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export function CalendarView({ tasks, onEditTask, selectedDate, onSelectDate }: CalendarViewProps) {
  const [currentLevel, setCurrentLevel] = useState<CalendarLevel>('MONTH');
  
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
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00

    return (
      <div id="calendar-day-flow" className="flex flex-col h-[340px] overflow-y-auto bg-white rounded-3xl p-4 border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <span className="text-xs font-bold text-gray-800">今日安排 ({dayTasks.length} 项)</span>
          <span className="text-xs font-mono text-gray-400 font-bold">{dateStr}</span>
        </div>

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
                  <span className={`text-xs font-bold truncate ${t.isCompleted && 'line-through opacity-60'}`}>{t.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-sm uppercase font-black ${
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

  // 2. Render WEEK View: 7 Columns
  const renderWeekView = () => {
    const weekDays = getWeekDaysArray(pivotDate);
    return (
      <div id="calendar-week-flow" className="grid grid-cols-7 gap-1.5 h-[340px]">
        {weekDays.map((wd, i) => {
          const wdStr = formatYYYYMMDD(wd);
          const wdTasks = tasks.filter(t => t.dueDate === wdStr);
          const isToday = formatYYYYMMDD(new Date()) === wdStr;
          const isSelected = formatYYYYMMDD(pivotDate) === wdStr;

          return (
            <button
              id={`week-col-${wdStr}`}
              key={i}
              onClick={() => {
                setPivotDate(wd);
                onSelectDate(wdStr);
              }}
              className={`rounded-2xl p-2 flex flex-col items-center border transition-all text-left w-full h-full cursor-pointer overflow-hidden ${
                isSelected 
                  ? 'bg-gray-950 border-gray-950 text-white shadow-xs' 
                  : isToday 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-white text-gray-800 border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className={`text-[10px] font-bold ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                {WEEKDAYS[i]}
              </span>
              <span className="text-sm font-black mt-0.5">{wd.getDate()}</span>

              {/* Task Dots/Mini elements */}
              <div className="flex-1 w-full mt-3 space-y-1 overflow-y-auto no-scrollbar">
                {wdTasks.map(t => (
                  <div 
                    key={t.id} 
                    className={`w-full text-[8px] p-0.5 px-1 rounded-sm truncate ${
                      isSelected 
                        ? 'bg-white/10 text-white' 
                        : t.isCompleted 
                          ? 'bg-gray-100 text-gray-400 line-through' 
                          : t.priority === 'HIGH' 
                            ? 'bg-rose-100 text-rose-800 font-bold' 
                            : 'bg-blue-50 text-blue-800 font-bold'
                    }`}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // 3. Render MONTH View: 42 Days Grid
  const renderMonthView = () => {
    const days = getDaysInMonthGrid(pivotDate);
    const selectedDateStr = formatYYYYMMDD(pivotDate);

    return (
      <div id="calendar-month-flow" className="flex flex-col h-[340px]">
        {/* Week Days Headers */}
        <div className="grid grid-cols-7 text-center mb-1 bg-gray-100/50 p-1 rounded-xl">
          {WEEKDAYS.map((wd, i) => (
            <span key={i} className="text-[10px] font-extrabold text-gray-500 py-1">{wd}</span>
          ))}
        </div>

        {/* Days Box */}
        <div id="month-grid-content" className="grid grid-cols-7 gap-1.5 flex-1">
          {days.map((item, idx) => {
            const dateStr = formatYYYYMMDD(item.date);
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const isSelected = dateStr === selectedDateStr;
            const completedCount = dayTasks.filter(t => t.isCompleted).length;

            return (
              <button
                id={`month-day-${dateStr}`}
                key={idx}
                onClick={() => {
                  setPivotDate(item.date);
                  onSelectDate(dateStr);
                }}
                className={`relative rounded-xl p-1.5 border flex flex-col justify-between items-center text-center h-full transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-gray-900 border-gray-900 text-white shadow-2xs z-10' 
                    : item.isToday 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : item.isCurrentMonth
                        ? 'bg-white text-gray-800 border-gray-100 hover:border-gray-250 hover:bg-gray-50/50'
                        : 'bg-transparent text-gray-350 border-transparent hover:border-gray-100'
                }`}
              >
                <span className={`text-[11px] font-extrabold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {item.date.getDate()}
                </span>
                
                {/* Visual heat indicator */}
                {dayTasks.length > 0 && (
                  <div className="flex items-center space-x-0.5 mt-1">
                    {dayTasks.slice(0, 3).map((t, idx) => (
                      <span 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.isCompleted 
                            ? 'bg-emerald-500' 
                            : t.priority === 'HIGH' 
                              ? 'bg-rose-500' 
                              : 'bg-blue-400'
                        }`} 
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[7px] text-gray-400 font-bold font-mono">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
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
      <div id="calendar-year-flow" className="flex flex-col h-[340px] bg-white rounded-3xl p-4.5 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-amber-500 animate-spin" />
          <h4 className="text-xs font-extrabold text-gray-700">度年度待办与专注力热力分布走势</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-3.5 flex-1">
          {monthsData.map((mon, i) => {
            // Calculate color density based on completes
            let densityColor = 'bg-gray-100 text-gray-400';
            if (mon.completed > 0 && mon.completed <= 2) densityColor = 'bg-blue-100 text-blue-800';
            else if (mon.completed > 2 && mon.completed <= 5) densityColor = 'bg-blue-200 text-blue-900 border border-blue-300';
            else if (mon.completed > 5) densityColor = 'bg-emerald-500 text-white shadow-2xs font-extrabold';

            return (
              <div 
                id={`year-month-tile-${i}`}
                key={i} 
                className="flex flex-col justify-between p-3 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xs transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-gray-700">{MONTHS_ZH[i]}</span>
                  <span className="text-[9px] font-mono text-gray-400">总:{mon.total}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className={`text-[10px] p-1 px-2 rounded-xl text-center font-bold ${densityColor}`}>
                    {mon.completed} 完结
                  </div>
                  {mon.total > 0 && (
                    <span className="text-[9px] font-black text-emerald-600">
                      {Math.round((mon.completed / mon.total) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="calendar-view-container" className="space-y-4">
      {/* Top Controller Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 p-3.5 rounded-3xl border border-gray-150/40">
        <div className="flex items-center space-x-3.5">
          <Calendar size={18} className="text-blue-500" />
          <div className="flex items-center space-x-1.5 font-sans font-extrabold text-sm text-gray-800">
            <button 
              id="btn-cal-prev"
              onClick={() => changePivotDate('back')}
              className="p-1 rounded-lg hover:bg-gray-250 cursor-pointer text-gray-500"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-1 min-w-22 text-center tracking-tight">
              {currentLevel === 'YEAR' && `${pivotDate.getFullYear()} 年`}
              {currentLevel === 'MONTH' && `${pivotDate.getFullYear()}年 ${MONTHS_ZH[pivotDate.getMonth()]}`}
              {currentLevel === 'WEEK' && `第 ${Math.ceil(pivotDate.getDate() / 7)} 周 (${pivotDate.getMonth() + 1}月)`}
              {currentLevel === 'DAY' && formatYYYYMMDD(pivotDate)}
            </span>
            <button 
              id="btn-cal-next"
              onClick={() => changePivotDate('forward')}
              className="p-1 rounded-lg hover:bg-gray-250 cursor-pointer text-gray-500"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            id="btn-cal-today"
            onClick={jumpToToday}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1 px-2.5 rounded-xl cursor-pointer"
          >
            今日
          </button>
        </div>

        {/* Calendar Mode Toggles */}
        <div id="calendar-modes" className="flex bg-gray-150/80 p-0.5 rounded-2xl">
          {(['DAY', 'WEEK', 'MONTH', 'YEAR'] as CalendarLevel[]).map(lvl => (
            <button
              id={`btn-cal-mode-${lvl}`}
              key={lvl}
              onClick={() => setCurrentLevel(lvl)}
              className={`px-3 py-1 text-[11px] font-extrabold rounded-xl transition-all ${
                currentLevel === lvl 
                  ? 'bg-white text-gray-900 shadow-2xs' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {lvl === 'DAY' && '日'}
              {lvl === 'WEEK' && '周'}
              {lvl === 'MONTH' && '月'}
              {lvl === 'YEAR' && '年'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Render Area */}
      <div id="calendar-view-content" className="min-h-[340px]">
        {currentLevel === 'DAY' && renderDayView()}
        {currentLevel === 'WEEK' && renderWeekView()}
        {currentLevel === 'MONTH' && renderMonthView()}
        {currentLevel === 'YEAR' && renderYearView()}
      </div>
    </div>
  );
}
