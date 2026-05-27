/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Task, Quadrant, Priority } from '../types';
import { Plus, CheckCircle, Circle, Flame, CalendarClock, ShieldAlert, Coffee, ArrowUpRight } from 'lucide-react';

interface TaskQuadrantProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onAddTaskInQuadrant: (quadrant: Quadrant) => void;
}

export function TaskQuadrant({ tasks, onToggleComplete, onEditTask, onAddTaskInQuadrant }: TaskQuadrantProps) {
  
  // Sift tasks by quadrant
  const getQuadrantTasks = (q: Quadrant) => {
    return tasks.filter(t => t.quadrant === q);
  };

  const categories = [
    {
      id: 1 as Quadrant,
      title: '重要 且 紧急 (第 I 象限)',
      description: '立即处理、危机应对、期限任务',
      color: 'from-rose-50 to-rose-100/50 hover:bg-rose-100/40 border-rose-200/60',
      badgeClass: 'bg-rose-500 text-white',
      accentColor: 'text-rose-600',
      icon: <Flame size={16} className="text-rose-500 animate-pulse" />,
    },
    {
      id: 2 as Quadrant,
      title: '重要 但 不紧急 (第 II 象限)',
      description: '规划开发、职业资产、日常健康',
      color: 'from-amber-50 to-amber-100/50 hover:bg-amber-100/40 border-amber-200/60',
      badgeClass: 'bg-amber-500 text-gray-900',
      accentColor: 'text-amber-700',
      icon: <CalendarClock size={16} className="text-amber-500" />,
    },
    {
      id: 3 as Quadrant,
      title: '紧急 但 不重要 (第 III 象限)',
      description: '琐碎电话、部分收件、无关邀请',
      color: 'from-blue-50 to-blue-100/50 hover:bg-blue-100/40 border-blue-200/60',
      badgeClass: 'bg-blue-500 text-white',
      accentColor: 'text-blue-600',
      icon: <ShieldAlert size={16} className="text-blue-500" />,
    },
    {
      id: 4 as Quadrant,
      title: '不重要 且 不紧急 (第 IV 象限)',
      description: '娱乐消遣、阅读碎片、杂乱事务',
      color: 'from-gray-50 to-gray-100/50 hover:bg-gray-100/45 border-gray-200/60',
      badgeClass: 'bg-gray-500 text-white',
      accentColor: 'text-gray-600',
      icon: <Coffee size={16} className="text-gray-400" />,
    }
  ];

  return (
    <div id="quadrant-container" className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {categories.map(cat => {
        const catTasks = getQuadrantTasks(cat.id);
        
        return (
          <div
            id={`quad-card-${cat.id}`}
            key={cat.id}
            className={`rounded-[2rem] border p-4.5 flex flex-col h-[350px] bg-gradient-to-br transition-all duration-300 shadow-2xs hover:shadow-xs ${cat.color}`}
          >
            {/* Quadrant Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`w-5 h-5 flex items-center justify-center rounded-lg text-xs font-black ${cat.badgeClass}`}>
                  {cat.id}
                </span>
                <h4 className="text-sm font-bold text-gray-800 font-sans tracking-tight">
                  {cat.title}
                </h4>
              </div>
              <button
                id={`btn-quad-add-${cat.id}`}
                onClick={() => onAddTaskInQuadrant(cat.id)}
                className="p-1 px-2.5 rounded-xl bg-white hover:bg-gray-100/80 border border-gray-200/40 text-gray-600 hover:text-gray-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={11} />
                快速录入
              </button>
            </div>

            <p className="text-[10.5px] text-gray-400 font-medium mb-3.5 leading-snug">
              {cat.description}
            </p>

            {/* Tasks Container */}
            <div id={`quad-scroller-${cat.id}`} className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {catTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
                  {cat.icon}
                  <span className="text-[11px] text-gray-400 font-bold mt-2">暂无任务分发到此象限</span>
                </div>
              ) : (
                catTasks.map(t => {
                  return (
                    <div
                      id={`quad-task-item-${t.id}`}
                      key={t.id}
                      className="group/item flex items-center justify-between bg-white/90 hover:bg-white p-2.5 rounded-2xl border border-gray-150/40 shadow-2xs transition-all duration-200 hover:translate-x-0.5 cursor-pointer"
                      onClick={() => onEditTask(t)}
                    >
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        {/* Checkbox */}
                        <button
                          id={`btn-quad-toggle-${t.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(t.id);
                          }}
                          className={`flex-shrink-0 cursor-pointer transition-transform duration-100 active:scale-90 ${cat.accentColor}`}
                        >
                          {t.isCompleted ? (
                            <CheckCircle size={17} className="fill-emerald-50 text-emerald-600" />
                          ) : (
                            <Circle size={17} className="opacity-80 hover:opacity-100 text-gray-400" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold truncate ${
                            t.isCompleted ? 'line-through text-gray-450 font-normal' : 'text-gray-750'
                          }`}>
                            {t.title}
                          </p>
                          
                          {/* Tags indicator */}
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            {t.priority === 'HIGH' && (
                              <span className="text-[8px] bg-rose-50 text-rose-600 px-1 py-0.2 rounded-sm font-bold animate-pulse">高</span>
                            )}
                            {t.tags.slice(0, 1).map((tag, i) => (
                              <span key={i} className="text-[9px] text-gray-400 font-medium font-mono">
                                #{tag}
                              </span>
                            ))}
                            {t.subtasks.length > 0 && (
                              <span className="text-[8px] bg-gray-150/80 text-gray-500 font-bold px-1 rounded-sm">
                                {t.subtasks.filter(s => s.isCompleted).length}/{t.subtasks.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Go edit hover arrow */}
                      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity pl-1 text-gray-400 hover:text-gray-700">
                        <ArrowUpRight size={13} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
