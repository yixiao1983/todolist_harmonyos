/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type Quadrant = number; 
// Dynamic quadrants can be configured through settings. Default quadrants:
// 1 = 重要且紧急 (Important & Urgent)
// 2 = 重要不紧急 (Important & Not Urgent)
// 3 = 紧急不重要 (Not Important & Urgent)
// 4 = 不紧急不重要 (Not Important & Not Urgent)

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Habit {
  id: string;
  title: string;
  createdAt: string;
  completedDates: string[]; // dates of completion, e.g. ["2026-05-31"]
}

export interface QuadrantCategory {
  id: number;
  title: string;
  description: string;
  color: string; // Tailwind gradient/bg classes, e.g. "from-rose-50 to-rose-100/50 hover:bg-rose-100/40 border-rose-200/60 dark:from-rose-950/20 dark:to-rose-800/10 dark:border-rose-900/30"
  badgeClass: string; // e.g. "bg-rose-500 text-white"
  accentColor: string; // e.g. "text-rose-600"
}

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: Priority;
  quadrant: Quadrant;
  tags: string[];
  dueDate: string; // YYYY-MM-DD
  subtasks: SubTask[];
  dependencies: string[]; // List of Task IDs that must be completed first
  focusMinutes: number; // accumulated focus minutes
  createdAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tasks: Array<{
    title: string;
    description: string;
    priority: Priority;
    quadrant: Quadrant;
    tags: string[];
    subtasks: string[]; // basic title list
  }>;
}

export interface FocusSession {
  id: string;
  taskId?: string; // Optional linked task
  durationSeconds: number;
  type: 'POMODORO' | 'COUNTDOWN' | 'STOPWATCH';
  timestamp: string; // ISO string
  completed: boolean;
}

export type FocusMode = 'POMODORO' | 'COUNTDOWN' | 'STOPWATCH';

export type WhiteNoiseType = 'RAIN' | 'WAVE' | 'FOREST' | 'FIRE' | 'NONE';

export interface CalendarDay {
  dateString: string; // YYYY-MM-DD
  dayLabel: number; // 1-31
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}
