/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, Priority, Quadrant, SubTask } from '../types';
import { X, Plus, Trash2, Tag, Calendar, AlertTriangle, ChevronRight, Bookmark } from 'lucide-react';
import { getLocalISODate } from '../utils/date';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null; // Null means creating a new task
  allTasks: Task[];
  onSave: (task: Task) => void;
  onSaveAsTemplate?: (name: string, description: string, task: Task) => void;
  isQuadrantsEnabled?: boolean;
}

export function TaskDrawer({ isOpen, onClose, task, allTasks, onSave, onSaveAsTemplate, isQuadrantsEnabled = true }: TaskDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [quadrant, setQuadrant] = useState<Quadrant>(2);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');

  // Sync state with selected task or reset for new
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setQuadrant(task.quadrant);
      setTags([...task.tags]);
      setDueDate(task.dueDate || getLocalISODate());
      setSubtasks([...task.subtasks]);
      setDependencies([...task.dependencies]);
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setQuadrant(2);
      setTags(['工作']);
      setDueDate(getLocalISODate());
      setSubtasks([]);
      setDependencies([]);
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  // Add a tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Add a subtask
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = subtaskInput.trim();
    if (clean) {
      const newSub: SubTask = {
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: clean,
        isCompleted: false,
      };
      setSubtasks([...subtasks, newSub]);
      setSubtaskInput('');
    }
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(subtasks.map(s => s.id === subId ? { ...s, isCompleted: !s.isCompleted } : s));
  };

  const handleRemoveSubtask = (subId: string) => {
    setSubtasks(subtasks.filter(s => s.id !== subId));
  };

  const handleToggleDependency = (depId: string) => {
    if (dependencies.includes(depId)) {
      setDependencies(dependencies.filter(id => id !== depId));
    } else {
      setDependencies([...dependencies, depId]);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const savedTask: Task = {
      id: task?.id || 'task-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      isCompleted: task?.isCompleted || false,
      priority,
      quadrant,
      tags,
      dueDate,
      subtasks,
      dependencies,
      focusMinutes: task?.focusMinutes || 0,
      createdAt: task?.createdAt || new Date().toISOString(),
    };

    onSave(savedTask);
    onClose();
  };

  const triggerSaveTemplate = () => {
    if (!title.trim()) return;
    setTemplateName(title + ' 模版');
    setTemplateDesc(description || '基于该任务快捷创建的子任务项目模版。');
    setShowSaveTemplateModal(true);
  };

  const handleConfirmSaveTemplate = () => {
    if (onSaveAsTemplate && templateName.trim()) {
      const dummyTask: Task = {
        id: '',
        title: title.trim(),
        description: description.trim(),
        isCompleted: false,
        priority,
        quadrant,
        tags,
        dueDate,
        subtasks,
        dependencies: [],
        focusMinutes: 0,
        createdAt: '',
      };
      onSaveAsTemplate(templateName.trim(), templateDesc.trim(), dummyTask);
      setShowSaveTemplateModal(false);
    }
  };

  // Exclude current task from potential dependencies to prevent circular dependency
  const availableDependencyTasks = allTasks.filter(t => !task || t.id !== task.id);

  return (
    <div id="drawer-container" className="fixed inset-0 z-50 flex items-end justify-center pb-6 bg-black/55 backdrop-blur-xs transition-opacity duration-300">
      <div 
        id="drawer-panel" 
        className="relative w-[96%] max-w-lg bg-[#F1F3F5] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-transform duration-300 transform translate-y-0"
      >
        {/* Draw Handle Accent */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-2">
          <h3 id="drawer-title" className="text-lg font-semibold text-gray-800 font-sans tracking-tight">
            {task ? '编辑待办事项' : '新建待办事项'}
          </h3>
          <button 
            id="drawer-close"
            onClick={onClose} 
            className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div id="drawer-scroll" className="flex-1 overflow-y-auto px-6 pb-8 space-y-5">
          {/* Title and Notes */}
          <div className="space-y-3 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
            <div>
              <label id="lbl-title" className="block text-xs font-medium text-gray-400 mb-1">待办名称 *</label>
              <input
                id="drawer-input-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例如：准备项目发布提案"
                className="w-full text-base font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 py-1"
                maxLength={80}
              />
            </div>
            <div className="h-[1px] bg-gray-100" />
            <div>
              <label id="lbl-desc" className="block text-xs font-medium text-gray-400 mb-1">补充详情</label>
              <textarea
                id="drawer-input-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="添加任务备注或背景描述..."
                className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-0 resize-none h-16 pt-1"
              />
            </div>
          </div>

          {/* Quick Config Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Due Date */}
            <div className="bg-white p-3.5 rounded-3xl shadow-xs border border-gray-100 flex items-center space-x-3">
              <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-600">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">截止日期</span>
                <input
                  id="drawer-input-date"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full text-sm font-semibold text-gray-700 bg-transparent focus:outline-none border-0 p-0 text-left cursor-pointer"
                />
              </div>
            </div>

            {/* Priority Picker */}
            <div className="bg-white p-3.5 rounded-3xl shadow-xs border border-gray-100">
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">任务优先级</span>
              <div id="priority-pills" className="flex bg-gray-100 p-0.5 rounded-2xl">
                {(['HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(p => {
                  const isActive = priority === p;
                  let activeClass = 'bg-gray-400 text-white';
                  if (p === 'HIGH') activeClass = 'bg-rose-500 text-white shadow-xs';
                  if (p === 'MEDIUM') activeClass = 'bg-amber-400 text-gray-850 shadow-xs';
                  if (p === 'LOW') activeClass = 'bg-[#007DFF] text-white shadow-xs';

                  return (
                    <button
                      id={`pill-prio-${p}`}
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 text-center py-1 text-xs font-bold rounded-xl transition-all duration-200 ${
                        isActive ? activeClass : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {p === 'HIGH' ? '高' : p === 'MEDIUM' ? '中' : '低'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quadrant Dimension Selection */}
          {isQuadrantsEnabled && (
            <div className="bg-white p-4 rounded-3xl shadow-xs border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">归属四象限 (智能分类)</span>
                <span id="quad-badge" className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {quadrant === 1 && '第 I 象限：重要且紧急'}
                  {quadrant === 2 && '第 II 象限：重要不紧急'}
                  {quadrant === 3 && '第 III 象限：紧急不重要'}
                  {quadrant === 4 && '第 IV 象限：不紧急不重要'}
                </span>
              </div>
              <div id="quadrant-matrix" className="grid grid-cols-2 gap-2 h-26">
                {[
                  { n: 1, name: '重要且紧急', c: 'border-l-4 border-l-rose-500 hover:bg-rose-50/40 bg-rose-50/10' },
                  { n: 2, name: '重要不紧急', c: 'border-l-4 border-l-amber-400 hover:bg-amber-50/40 bg-amber-50/10' },
                  { n: 3, name: '紧急不重要', c: 'border-l-4 border-l-blue-500 hover:bg-blue-50/40 bg-blue-50/10' },
                  { n: 4, name: '不紧急不重要', c: 'border-l-4 border-l-gray-400 hover:bg-gray-50/40 bg-gray-50/10' }
                ].map(q => (
                  <button
                    id={`btn-quad-${q.n}`}
                    key={q.n}
                    onClick={() => setQuadrant(q.n as Quadrant)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${q.c} ${
                      quadrant === q.n 
                        ? 'border-gray-800 scale-[1.02] shadow-xs' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-[10px] text-gray-400 font-bold">象限 0{q.n}</span>
                    <span className="text-xs font-semibold text-gray-700">{q.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks Section */}
          <div className="bg-white p-4 rounded-3xl shadow-xs border border-gray-100 space-y-3">
            <span className="block text-xs font-semibold text-gray-600 mb-1">拆解子任务 ({subtasks.length})</span>
            {subtasks.length > 0 && (
              <div id="subtasks-list" className="space-y-2 max-h-40 overflow-y-auto">
                {subtasks.map(sub => (
                  <div id={`subtask-${sub.id}`} key={sub.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl group border border-gray-100">
                    <div className="flex items-center space-x-2.5">
                      <input
                        id={`chk-sub-${sub.id}`}
                        type="checkbox"
                        checked={sub.isCompleted}
                        onChange={() => handleToggleSubtask(sub.id)}
                        className="w-4 h-4 text-emerald-500 rounded-full focus:ring-emerald-400 border-gray-300 cursor-pointer"
                      />
                      <span className={`text-xs text-gray-700 ${sub.isCompleted ? 'line-through text-gray-400 font-normal' : 'font-medium'}`}>
                        {sub.title}
                      </span>
                    </div>
                    <button
                      id={`btn-del-sub-${sub.id}`}
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="p-1 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors opacity-80"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleAddSubtask} className="flex items-center space-x-2">
              <input
                id="drawer-input-subtask"
                type="text"
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                placeholder="添加具体的子任务步骤..."
                className="flex-1 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-xs font-medium text-gray-700 placeholder-gray-400 rounded-2xl border border-gray-100 focus:border-gray-300 focus:outline-none p-2.5 transition-colors"
              />
              <button
                id="btn-add-subtask"
                type="submit"
                className="p-2.5 bg-[#007DFF] text-white rounded-2xl hover:bg-blue-600 transition-colors"
              >
                <Plus size={14} />
              </button>
            </form>
          </div>

          {/* Task Dependency Manager */}
          <div className="bg-white p-4 rounded-3xl shadow-xs border border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">前置条件 (任务依赖关系)</span>
              {dependencies.length > 0 && (
                <span id="dep-count" className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <AlertTriangle size={10} />
                  已设置 {dependencies.length} 个前置依赖
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              被勾选的任务将作为此任务的“锁定依赖”。在它们全部完成之前，本任务会被标记为锁定状态。
            </p>

            {availableDependencyTasks.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-[11px] text-gray-400">列表暂无其他任务可用作依赖关系</span>
              </div>
            ) : (
              <div id="dependency-scroller" className="max-h-36 overflow-y-auto space-y-1.5 border border-gray-100 rounded-2xl p-1.5 bg-gray-50/50">
                {availableDependencyTasks.map(t => {
                  const isChecked = dependencies.includes(t.id);
                  return (
                    <button
                      id={`btn-dep-${t.id}`}
                      key={t.id}
                      onClick={() => handleToggleDependency(t.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                        isChecked 
                          ? 'bg-amber-100/50 border-amber-300/80 shadow-2xs' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xs font-semibold text-gray-700 line-clamp-1">{t.title}</span>
                      <div className="flex items-center space-x-1.5">
                        {t.isCompleted ? (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm font-bold">已就绪</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm font-bold">待完成</span>
                        )}
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isChecked ? 'border-amber-500 bg-amber-500 text-white' : 'border-gray-300'
                        }`}>
                          {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Tags Manager */}
          <div className="bg-white p-4 rounded-3xl shadow-xs border border-gray-100 space-y-2">
            <span className="block text-xs font-semibold text-gray-600 mb-1">分类标签</span>
            <div id="tags-pills-row" className="flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <span id={`drawer-tag-${idx}`} key={idx} className="flex items-center space-x-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                  <Tag size={10} />
                  <span>{tag}</span>
                  <button
                    id={`btn-del-tag-${idx}`}
                    onClick={() => handleRemoveTag(idx)}
                    className="hover:bg-gray-200 p-0.5 rounded-full transition-colors text-gray-400 hover:text-rose-500"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex items-center space-x-2">
              <input
                id="drawer-input-tag"
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="添加自定义标签（工作、生活等）"
                className="flex-1 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-xs font-medium text-gray-700 placeholder-gray-400 rounded-2xl border border-gray-100 focus:border-gray-300 focus:outline-none p-2.5 transition-colors"
                maxLength={12}
              />
              <button
                id="btn-add-tag"
                type="submit"
                className="p-2.5 bg-[#007DFF] text-white rounded-2xl hover:bg-blue-600 transition-colors"
              >
                <Plus size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Action Bottom Utility Board */}
        <div className="bg-white px-6 py-4.5 border-t border-gray-100 flex items-center space-x-3">
          {/* Save As Template Quick Option */}
          {onSaveAsTemplate && task && (
            <button
              id="btn-save-as-template"
              onClick={triggerSaveTemplate}
              title="将该项存为快速导入模版"
              className="px-3.5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <Bookmark size={15} />
              存为模版
            </button>
          )}

          <button
            id="btn-confirm-save-drawer"
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 p-3.5 bg-[#007DFF] disabled:bg-gray-350 text-white font-semibold rounded-2xl hover:bg-blue-600 text-sm text-center shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            保存待办
          </button>
        </div>
      </div>

      {/* Save Template Dialog Inner Modal */}
      {showSaveTemplateModal && (
        <div id="template-modal-overlay" className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-5.5 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-gray-800">保存为项目模板</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">模板名称</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 focus:border-gray-300 rounded-xl p-2.5 text-xs font-semibold text-gray-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">模板描述</label>
                <textarea
                  value={templateDesc}
                  onChange={e => setTemplateDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 focus:border-gray-300 rounded-xl p-2.5 text-xs text-gray-600 focus:outline-none h-14 resize-none"
                />
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className="flex-1 p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSaveTemplate}
                disabled={!templateName.trim()}
                className="flex-1 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                克隆保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
