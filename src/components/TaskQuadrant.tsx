/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Task, Quadrant, Priority, QuadrantCategory } from '../types';
import { Plus, CheckCircle, Circle, Flame, CalendarClock, ShieldAlert, Coffee, ArrowUpRight, GripVertical } from 'lucide-react';

interface TaskQuadrantProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onAddTaskInQuadrant: (quadrant: Quadrant) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onToggleSubtasksCollapse: (taskId: string) => void;
  onUpdateTaskQuadrant: (taskId: string, quadrant: Quadrant) => void;
  quadrantCategories: QuadrantCategory[];
}

export function TaskQuadrant({
  tasks,
  onToggleComplete,
  onEditTask,
  onAddTaskInQuadrant,
  onToggleSubtask,
  onToggleSubtasksCollapse,
  onUpdateTaskQuadrant,
  quadrantCategories
}: TaskQuadrantProps) {
  
  // Track which quadrant is actively being dragged over
  const [activeDragOverQuad, setActiveDragOverQuad] = React.useState<Quadrant | null>(null);

  // Desktop original task dragging indicator
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);

  // Mobile Touch dragging states
  const [touchActiveId, setTouchActiveId] = React.useState<string | null>(null);
  const [touchPos, setTouchPos] = React.useState({ x: 0, y: 0 });
  const [touchTargetQ, setTouchTargetQ] = React.useState<Quadrant | null>(null);

  const handleDragOver = (e: React.DragEvent, q: Quadrant) => {
    e.preventDefault();
    if (activeDragOverQuad !== q) {
      setActiveDragOverQuad(q);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDragOverQuad(null);
  };

  const handleDrop = (e: React.DragEvent, targetQ: Quadrant) => {
    e.preventDefault();
    setActiveDragOverQuad(null);
    setActiveDragId(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTaskQuadrant(taskId, targetQ);
    }
  };

  // Find currently dragging touch task card
  const draggedTouchTask = touchActiveId ? tasks.find(t => t.id === touchActiveId) : null;

  // Sift tasks by quadrant
  const getQuadrantTasks = (q: Quadrant) => {
    return tasks.filter(t => t.quadrant === q);
  };

  const categories = quadrantCategories.map((qc, index) => {
    const icons = [
      <Flame size={14} className="text-rose-500" />,
      <CalendarClock size={14} className="text-amber-500" />,
      <ShieldAlert size={14} className="text-blue-500" />,
      <Coffee size={14} className="text-gray-450" />
    ];
    return {
      ...qc,
      icon: icons[index % icons.length] || <Coffee size={14} className="text-gray-450" />
    };
  });

  return (
    <div className="relative w-full h-full select-none overflow-y-auto overflow-x-hidden">
      <div id="quadrant-container" className="grid grid-cols-2 grid-rows-2 gap-2.5 h-full min-h-[380px]">
        {categories.map(cat => {
          const catTasks = getQuadrantTasks(cat.id);
          const isHoveredZone = activeDragOverQuad === cat.id;
          
          return (
            <div
              id={`quad-card-${cat.id}`}
              key={cat.id}
              onDragOver={(e) => handleDragOver(e, cat.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, cat.id)}
              className={`rounded-[1.75rem] border p-3 flex flex-col h-full bg-gradient-to-br transition-all duration-300 shadow-2xs hover:shadow-xs relative ${
                isHoveredZone 
                  ? 'from-[#007DFF]/15 via-[#007DFF]/10 to-[#007DFF]/5 border-[#007DFF] dark:from-[#007DFF]/25 dark:to-transparent scale-[1.015] shadow-sm z-10 ring-2 ring-[#007DFF]/20' 
                  : cat.color
              }`}
            >
              {/* Quadrant Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1 min-w-0">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-md text-[9px] font-black ${cat.badgeClass} flex-shrink-0`}>
                    {cat.id}
                  </span>
                  <h4 className="text-[10.5px] font-black text-gray-800 dark:text-gray-100 font-sans tracking-tight truncate leading-none">
                    {cat.title}
                  </h4>
                </div>
                <button
                  id={`btn-quad-add-${cat.id}`}
                  onClick={() => onAddTaskInQuadrant(cat.id)}
                  className="p-1 rounded-lg bg-white/95 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 border border-gray-200/30 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:text-gray-950 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                  title="快速录入"
                >
                  <Plus size={11} className="stroke-[2.5]" />
                </button>
              </div>

              <p className="text-[8px] text-gray-400 font-bold mb-2 leading-none truncate">
                {cat.description}
              </p>

              {/* Tasks Container */}
              <div id={`quad-scroller-${cat.id}`} className={`flex-1 overflow-y-auto space-y-1 pr-0.5 no-scrollbar rounded-xl transition-all duration-250 ${isHoveredZone ? 'bg-[#007DFF]/5' : ''}`}>
                {catTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-4">
                    {cat.icon}
                    <span className="text-[8.5px] text-gray-400 font-bold mt-1">
                      {isHoveredZone ? '松手即可移至当前象限' : '暂无代办分派'}
                    </span>
                  </div>
                ) : (
                  catTasks.map(t => {
                    const isBeingDragged = activeDragId === t.id || touchActiveId === t.id;
                    return (
                      <div
                        id={`quad-task-item-${t.id}`}
                        key={t.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', t.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setActiveDragId(t.id);
                        }}
                        onDragEnd={() => {
                          setActiveDragId(null);
                          setActiveDragOverQuad(null);
                        }}
                        onTouchEnd={() => {
                          setActiveDragId(null);
                          setActiveDragOverQuad(null);
                        }}
                        onTouchCancel={() => {
                          setActiveDragId(null);
                          setActiveDragOverQuad(null);
                        }}
                        className={`group/item flex flex-col bg-white/95 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800/80 p-2 rounded-xl border border-gray-150/30 dark:border-zinc-805 shadow-2xs transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-xs active:scale-[0.98] select-none ${
                          isBeingDragged ? 'opacity-35 border-dashed border-blue-400 scale-[0.96] dark:border-blue-500' : ''
                        }`}
                        onClick={() => onEditTask(t)}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center space-x-1 flex-1 min-w-0">
                            {/* Drag Handle for Mobile */}
                            <div 
                              className="touch-none cursor-grab active:cursor-grabbing text-gray-300 dark:text-zinc-600 hover:text-gray-500 py-2 px-1 -ml-1 flex-shrink-0 sm:hidden"
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                const touch = e.touches[0];
                                setTouchActiveId(t.id);
                                setTouchPos({ x: touch.clientX, y: touch.clientY });
                              }}
                              onTouchMove={(e) => {
                                if (touchActiveId !== t.id) return;
                                const touch = e.touches[0];
                                setTouchPos({ x: touch.clientX, y: touch.clientY });

                                // Find element under touch position
                                const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                                if (elem) {
                                  let parent: HTMLElement | null = elem as HTMLElement;
                                  let targetQ: Quadrant | null = null;
                                  while (parent) {
                                    if (parent.id && parent.id.startsWith('quad-card-')) {
                                      const qId = parseInt(parent.id.replace('quad-card-', ''), 10) as Quadrant;
                                      if ([1, 2, 3, 4].includes(qId)) {
                                        targetQ = qId;
                                        break;
                                      }
                                    }
                                    parent = parent.parentElement;
                                  }
                                  if (targetQ !== null) {
                                    setActiveDragOverQuad(targetQ);
                                  } else {
                                    setActiveDragOverQuad(null);
                                  }
                                }
                              }}
                              onTouchEnd={(e) => {
                                e.stopPropagation();
                                if (touchActiveId !== t.id) return;
                                if (activeDragOverQuad !== null) {
                                  onUpdateTaskQuadrant(t.id, activeDragOverQuad);
                                }
                                setTouchActiveId(null);
                                setActiveDragOverQuad(null);
                              }}
                              onTouchCancel={(e) => {
                                e.stopPropagation();
                                setTouchActiveId(null);
                                setActiveDragOverQuad(null);
                              }}
                            >
                              <GripVertical size={14} />
                            </div>
                            
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
                                <CheckCircle size={14} className="fill-emerald-50 text-emerald-600" />
                              ) : (
                                <Circle size={14} className="opacity-80 hover:opacity-100 text-gray-400 dark:text-gray-500" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <p className={`text-[10px] font-bold truncate leading-tight ${
                                t.isCompleted ? 'line-through text-gray-400 dark:text-gray-500 font-normal shadow-none' : 'text-gray-750 dark:text-gray-200'
                              }`}>
                                {t.title}
                              </p>
                            </div>
                          </div>

                          {/* Hover edit icon */}
                          <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 text-gray-400 dark:text-gray-500">
                            <ArrowUpRight size={11} />
                          </div>
                        </div>

                        {/* Display subtasks inline */}
                        {t.subtasks && t.subtasks.length > 0 && (
                          <div className="mt-0.5 pt-0.5 border-t border-gray-100/65 dark:border-zinc-700/60 space-y-0.5">
                            {!t.isSubtasksCollapsed ? (
                              t.subtasks.map(sub => (
                                <div
                                  key={sub.id}
                                  draggable={false}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSubtask(t.id, sub.id);
                                  }}
                                  className="flex items-center gap-1.5 py-0.5 hover:bg-gray-100/50 dark:hover:bg-zinc-700/50 rounded-sm cursor-pointer transition-colors"
                                >
                                  <span className="flex-shrink-0">
                                    {sub.isCompleted ? (
                                      <CheckCircle size={10} className="fill-emerald-50 text-emerald-600" />
                                    ) : (
                                      <Circle size={10} className="text-gray-350 dark:text-gray-550 hover:text-gray-500" />
                                    )}
                                  </span>
                                  <span className={`text-[9.5px] truncate flex-1 leading-snug ${
                                    sub.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-650 dark:text-gray-300 font-medium'
                                  }`}>
                                    {sub.title}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div 
                                className="text-[8.5px] text-gray-400 dark:text-zinc-500 cursor-pointer flex items-center gap-1 hover:text-gray-600 transition-colors py-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleSubtasksCollapse(t.id);
                                }}
                              >
                                <span>已折叠 {t.subtasks.length} 个子任务 (已完成 {t.subtasks.filter(s => s.isCompleted).length})</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Elegant HUD Touch Assist Overlay */}
      {touchActiveId && draggedTouchTask && (
        <div 
          className="fixed z-50 pointer-events-none px-3 py-2 bg-white/95 dark:bg-zinc-900/95 rounded-2xl border border-[#007DFF] shadow-xl flex flex-col max-w-[170px] scale-105 rotate-2 opacity-95 transition-transform duration-75 backdrop-blur-xs font-sans text-left"
          style={{
            left: `${touchPos.x - 85}px`,
            top: `${touchPos.y - 45}px`,
          }}
        >
          <span className="text-[9.5px] font-black text-gray-800 dark:text-gray-100 truncate leading-none">
            {draggedTouchTask.title || '无标题待办'}
          </span>
          <span className="text-[7.5px] font-black text-[#007DFF] dark:text-blue-400 mt-1.5 flex items-center gap-1">
            <span>🚀</span>
            <span>正在移至: {activeDragOverQuad ? `第 ${activeDragOverQuad} 象限` : '松手放回原处'}</span>
          </span>
        </div>
      )}
    </div>
  );
}
