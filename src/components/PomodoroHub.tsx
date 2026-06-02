/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Task, FocusMode, WhiteNoiseType } from '../types';
import { FocusAudioSynthesizer } from '../utils/audio';
import { Play, Pause, Square, Timer, Headset, VolumeX, Volume2, Flame, CloudRain, Wind, Waves, Sparkles, CheckCircle, Trash2, Plus } from 'lucide-react';

interface PomodoroHubProps {
  tasks: Task[];
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  totalDuration: number; // in seconds
  focusMode: FocusMode;
  activeTaskId?: string;
  onStartTimer: (duration: number, mode: FocusMode, taskId?: string, customTitle?: string) => void;
  onPauseToggle: () => void;
  onStopTimer: () => void;
  onLinkTask: (taskId: string) => void;
  audioSynth: FocusAudioSynthesizer;
  customFocusTitle: string;
  onSetCustomFocusTitle: (title: string) => void;
}

export function PomodoroHub({
  tasks,
  isRunning,
  isPaused,
  timeRemaining,
  totalDuration,
  focusMode,
  activeTaskId,
  onStartTimer,
  onPauseToggle,
  onStopTimer,
  onLinkTask,
  audioSynth,
  customFocusTitle,
  onSetCustomFocusTitle
}: PomodoroHubProps) {
  const [customMinutes, setCustomMinutes] = useState(25);
  const [positiveMinutes, setPositiveMinutes] = useState(60); // 支持沙漏正向计时时间设置，默认60分钟
  const [loudspeakersEnabled, setLoudspeakersEnabled] = useState(true);
  const [noiseVolume, setNoiseVolume] = useState(0.5);
  const [activeNoise, setActiveNoise] = useState<WhiteNoiseType>('NONE');
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(false);

  const [presets, setPresets] = useState<Array<{ id: string; title: string; minutes: number; mode: FocusMode }>>(() => {
    const local = localStorage.getItem('hm_focus_presets');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: 'pres-1', title: '阅读专业书籍', minutes: 25, mode: 'POMODORO' },
      { id: 'pres-2', title: '硬笔书法练习', minutes: 30, mode: 'STOPWATCH' },
      { id: 'pres-3', title: '全神贯注写代码', minutes: 45, mode: 'POMODORO' },
      { id: 'pres-4', title: '身心拉伸与调息', minutes: 15, mode: 'COUNTDOWN' },
    ];
  });

  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [newPresetMinutes, setNewPresetMinutes] = useState(25);
  const [newPresetMode, setNewPresetMode] = useState<FocusMode>('POMODORO');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  const savePresets = (newPresets: Array<{ id: string; title: string; minutes: number; mode: FocusMode }>) => {
    setPresets(newPresets);
    localStorage.setItem('hm_focus_presets', JSON.stringify(newPresets));
  };

  const handleAddPreset = () => {
    if (!newPresetTitle.trim()) return;
    const nid = 'pres-' + Date.now();
    const item = {
      id: nid,
      title: newPresetTitle.trim(),
      minutes: Math.max(1, Math.min(newPresetMinutes, 180)),
      mode: newPresetMode
    };
    const updated = [...presets, item];
    savePresets(updated);
    setNewPresetTitle('');
    if (audioSynth) {
      audioSynth.synthesizeHapticChime();
    }
  };

  // Sync volume with synthesizer
  useEffect(() => {
    audioSynth.setVolume(noiseVolume);
  }, [noiseVolume]);

  const handleNoiseToggle = (theme: WhiteNoiseType) => {
    if (activeNoise === theme) {
      audioSynth.stop();
      setActiveNoise('NONE');
    } else {
      audioSynth.play(theme, noiseVolume);
      setActiveNoise(theme);
    }
  };

  // Clean ambient loops when component unmounts
  useEffect(() => {
    return () => {
      audioSynth.stop();
    };
  }, []);

  const pendingTasks = tasks.filter(t => !t.isCompleted);

  // SVG parameters for the ring
  const radius = 80;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // If timer is on Stopwatch mode, progress behaves upwards, otherwise countdown downwards
  const percentage = isRunning 
    ? focusMode === 'STOPWATCH'
      ? Math.min((totalDuration - timeRemaining) / (totalDuration || 1) * 100, 100)
      : Math.min((timeRemaining / (totalDuration || 1)) * 100, 100)
    : 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Format Helper
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isWorkspaceActive = isWorkspaceExpanded || isRunning;
  const selectedLinkTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div id="pomodoro-focus-hub" className="space-y-4">
      
      {/* Immersive New Page View of Clock & Audio when Workspace is Active */}
      {isWorkspaceActive ? (
        <div className="space-y-4 relative z-0">
          
          {/* Header row to return back to standard focus library */}
          <div className="flex items-center justify-between bg-gray-50/70 dark:bg-zinc-900/40 border border-gray-150/30 dark:border-zinc-800/40 p-3 rounded-2xl">
            <div className="flex items-center gap-2 text-left">
              <span className="p-1 px-1.5 rounded-lg bg-[#E8F3FF] dark:bg-blue-900/20 text-[#007DFF]">
                <Timer size={14} className="stroke-[2.5]" />
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-gray-800 dark:text-gray-100">
                  {isRunning ? '⏳ 深度专注沉浸时间' : '⏱️ 极简沙漏番茄时钟空间'}
                </span>
                <span className="text-[9px] font-medium text-gray-400">已开启 HarmonyOS 立体白噪音神经深度调理</span>
              </div>
            </div>
            
            {/* Return back button, hidden when timer is actively running */}
            {!isRunning && (
              <button
                id="btn-return-preset-library"
                onClick={() => {
                  setIsWorkspaceExpanded(false);
                  if (audioSynth) {
                    audioSynth.synthesizeHapticChime();
                  }
                }}
                className="text-[10px] font-black text-gray-500 hover:text-gray-900 bg-white dark:bg-zinc-800 hover:bg-gray-50 border border-gray-150 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 hover:scale-[1.02]"
              >
                <span>返回专注主页</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Left Dial Panel */}
            <div className="md:col-span-7 bg-white dark:bg-zinc-900/60 rounded-[2rem] p-5 shadow-2xs border border-gray-100 dark:border-zinc-800/50 flex flex-col items-center justify-between text-center min-h-[350px] transform-gpu backface-hidden">
              <div>
                <span className="text-[10px] font-black tracking-wider text-rose-500 uppercase block mb-1">
                  {isRunning ? `${focusMode === 'STOPWATCH' ? '沙漏正向计时' : focusMode === 'POMODORO' ? '番茄' : '倒计时'} 专注中` : '极简沙漏番茄时钟'}
                </span>
                <h4 className="text-xs font-semibold text-gray-400">
                  {isRunning ? `正在专注: ${selectedLinkTask?.title || customFocusTitle || '临时专注项目'}` : '自定义番茄时间聚焦方案'}
                </h4>
              </div>

              {/* Core Central SVG Timer Circle Dial */}
              <div className="relative my-4 flex items-center justify-center">
                <svg
                  height={radius * 2}
                  width={radius * 2}
                  className="transform -rotate-90"
                >
                  <circle
                    stroke="#F3F4F6"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    id="timer-ring-indicator"
                    stroke={focusMode === 'STOPWATCH' ? '#007DFF' : '#EF4444'}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, strokeLinecap: 'round', transition: 'stroke-dashoffset 0.35s' }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                </svg>
                
                {/* Direct Digital Clock Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span id="timer-counter-label" className="text-2xl font-black text-gray-800 dark:text-gray-100 font-mono tracking-widest">
                    {isRunning ? formatTime(timeRemaining) : `${customMinutes}:00`}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                    {isRunning ? (isPaused ? '已暂停' : '专注聚焦处') : '标准25分钟'}
                  </span>
                </div>
              </div>

              {/* Action Row controller */}
              <div className="w-full space-y-3">
                {isRunning ? (
                  <div className="flex justify-center space-x-2.5">
                    <button
                      id="pomo-btn-pause-toggle"
                      onClick={onPauseToggle}
                      className="flex-1 max-w-[120px] p-2.5 bg-gray-150 dark:bg-zinc-800 hover:bg-gray-200 text-gray-700 dark:text-zinc-250 hover:text-gray-900 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isPaused ? <Play size={12} /> : <Pause size={12} />}
                      <span>{isPaused ? '恢复' : '暂停'}</span>
                    </button>
                    <button
                      id="pomo-btn-stop"
                      onClick={onStopTimer}
                      className="flex-1 max-w-[120px] p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Square size={12} />
                      <span>放弃</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 w-full text-left">
                    {/* Mode Selector and Linking */}
                    <div className="space-y-2 bg-gray-50 dark:bg-zinc-900/30 rounded-2xl p-3 border border-gray-100 dark:border-zinc-800/30 flex flex-col gap-2">
                      <span className="text-[9px] font-black tracking-widest text-[#007DFF] uppercase">🎯 专注项目与时间预设</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-white dark:bg-zinc-900/60 rounded-xl p-2 border border-gray-150/40 dark:border-zinc-800/40 text-left">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">关联当前待办</label>
                          <select
                            id="pomo-select-link-task"
                            onChange={e => onLinkTask(e.target.value)}
                            value={activeTaskId || ''}
                            className="w-full bg-transparent focus:outline-none text-[10.5px] font-bold text-gray-700 dark:text-gray-200 border-0 p-0 cursor-pointer"
                          >
                            <option value="">-- 无 (临时自由专注) --</option>
                            {pendingTasks.map(t => (
                              <option key={t.id} value={t.id}>
                                {t.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="bg-white dark:bg-zinc-900/60 rounded-xl p-2 border border-gray-150/40 dark:border-zinc-800/40 text-left">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">自定义临时专注项目</label>
                          <input
                            id="input-pomo-custom-focus-title"
                            type="text"
                            placeholder="例如：练习书法"
                            value={customFocusTitle}
                            onChange={e => onSetCustomFocusTitle(e.target.value)}
                            className="bg-transparent focus:outline-none text-[10.5px] font-bold text-gray-700 dark:text-gray-200 border-0 p-0 w-full placeholder-gray-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white dark:bg-zinc-900/60 rounded-xl p-2 border border-gray-150/40 dark:border-zinc-800/40 text-left">
                          <label id="lbl-custom-minutes" className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">自定倒计时 (1-90m)</label>
                          <input
                            id="input-custom-minutes"
                            type="number"
                            min={1}
                            max={90}
                            value={customMinutes}
                            onChange={e => setCustomMinutes(Math.max(1, Math.min(Number(e.target.value), 90)))}
                            className="bg-transparent focus:outline-none text-[10.5px] font-bold text-gray-700 dark:text-gray-200 border-0 p-0 w-full font-mono"
                          />
                        </div>

                        <div className="bg-white dark:bg-zinc-900/60 rounded-xl p-2 border border-gray-150/40 dark:border-zinc-800/40 text-left">
                          <label id="lbl-positive-minutes" className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">正向沙漏时长 (1-180m)</label>
                          <input
                            id="input-positive-minutes"
                            type="number"
                            min={1}
                            max={180}
                            value={positiveMinutes}
                            onChange={e => setPositiveMinutes(Math.max(1, Math.min(Number(e.target.value), 180)))}
                            className="bg-transparent focus:outline-none text-[10.5px] font-bold text-gray-700 dark:text-gray-200 border-0 p-0 w-full font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Preset Standard Pomodoro 25 min */}
                      <button
                        id="btn-trigger-preset-pomo"
                        onClick={() => {
                          const tTitle = activeTaskId ? tasks.find(t => t.id === activeTaskId)?.title : customFocusTitle;
                          onStartTimer(25 * 60, 'POMODORO', activeTaskId, tTitle);
                        }}
                        className="p-2.5 bg-rose-500 hover:bg-rose-600 font-bold rounded-2xl text-[10px] text-white flex flex-col items-center justify-center space-y-1 hover:shadow-xs transition-all cursor-pointer"
                      >
                        <Timer size={13} />
                        <span>25m 番茄</span>
                      </button>

                      {/* Sandglass Stopwatch count up (Hourglass mode) */}
                      <button
                        id="btn-trigger-preset-hourglass"
                        onClick={() => {
                          const tTitle = activeTaskId ? tasks.find(t => t.id === activeTaskId)?.title : customFocusTitle;
                          onStartTimer(positiveMinutes * 60, 'STOPWATCH', activeTaskId, tTitle);
                        }}
                        className="p-2.5 bg-[#007DFF] hover:bg-blue-600 font-bold rounded-2xl text-[10px] text-white flex flex-col items-center justify-center space-y-1 hover:shadow-xs transition-all cursor-pointer"
                      >
                        <Timer size={13} />
                        <span>沙漏正向计时</span>
                      </button>

                      {/* Trigger custom duration count down */}
                      <button
                        id="btn-trigger-preset-custom"
                        onClick={() => {
                          const tTitle = activeTaskId ? tasks.find(t => t.id === activeTaskId)?.title : customFocusTitle;
                          onStartTimer(customMinutes * 60, 'COUNTDOWN', activeTaskId, tTitle);
                        }}
                        className="p-2.5 bg-gray-900 dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 font-bold rounded-2xl text-[10px] text-white flex flex-col items-center justify-center space-y-1 hover:shadow-xs transition-all cursor-pointer"
                      >
                        <Timer size={13} />
                        <span>定制倒计时</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right White Noise Panel */}
            <div className="md:col-span-5 bg-white dark:bg-zinc-900/60 rounded-[2rem] p-5 shadow-2xs border border-gray-100 dark:border-zinc-800/50 flex flex-col justify-between min-h-[350px] transform-gpu backface-hidden relative z-10 overflow-hidden">
              <div>
                <span className="text-[10px] font-black tracking-wider text-rose-500 uppercase block mb-1">
                  专注白噪音 Ambient Audio
                </span>
                <h4 className="text-xs font-semibold text-gray-400">
                  内置 HarmonyOS 立体声音效，促进深度神经聚焦
                </h4>
              </div>

              {/* Sound Grid cards */}
              <div id="noise-sound-grid" className="grid grid-cols-2 gap-2 my-4">
                {[
                  { id: 'RAIN' as WhiteNoiseType, name: '深林雨声', desc: 'Pink Noise, Splat', icon: <CloudRain size={16} />, activeBg: 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-600/40 dark:text-emerald-300' },
                  { id: 'WAVE' as WhiteNoiseType, name: '高山流水', desc: 'modulated sweep', icon: <Waves size={16} />, activeBg: 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-600/40 dark:text-indigo-300' },
                  { id: 'FOREST' as WhiteNoiseType, name: '环境白噪', desc: 'Brown rumble wind', icon: <Wind size={16} />, activeBg: 'bg-sky-50 border-sky-300 text-sky-700 dark:bg-sky-950/20 dark:border-sky-600/40 dark:text-sky-350' },
                  { id: 'FIRE' as WhiteNoiseType, name: '营地篝火', desc: 'cracking popping', icon: <Flame size={16} />, activeBg: 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/20 dark:border-orange-600/40 dark:text-orange-300' },
                ].map(snd => (
                  <button
                    id={`btn-noise-${snd.id}`}
                    key={snd.id}
                    onClick={() => handleNoiseToggle(snd.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-[80px] transition-all cursor-pointer ${
                      activeNoise === snd.id 
                        ? snd.activeBg + ' scale-[1.02] shadow-2xs font-extrabold' 
                        : 'bg-gray-50 dark:bg-zinc-900/30 hover:bg-gray-100/80 dark:hover:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full bg-transparent">
                      <span className={`p-1.5 rounded-lg ${activeNoise === snd.id ? 'bg-white dark:bg-zinc-805 text-gray-900' : 'bg-gray-200/50 dark:bg-zinc-800/60'}`}>
                        {snd.icon}
                      </span>
                      {activeNoise === snd.id && <span className="text-[8px] font-extrabold uppercase animate-pulse">正在放</span>}
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold leading-none mb-1">{snd.name}</p>
                      <p className="text-[8.5px] text-gray-400 font-bold leading-none">{snd.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Sound volume slider row */}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 flex items-center space-x-2.5 bg-transparent">
                <button
                  id="pomo-loudspeaker-toggle"
                  onClick={() => {
                    const toggled = !loudspeakersEnabled;
                    setLoudspeakersEnabled(toggled);
                    audioSynth.setVolume(toggled ? noiseVolume : 0);
                  }}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  {loudspeakersEnabled && noiseVolume > 0 ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
                <div className="flex-1 bg-gray-150 dark:bg-zinc-850 h-1 rounded-full relative">
                  <input
                    id="noise-vol-slider"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={noiseVolume}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setNoiseVolume(val);
                      if (val > 0) setLoudspeakersEnabled(true);
                    }}
                    className="absolute inset-0 opacity-100 w-full h-1 cursor-pointer accent-gray-805"
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 font-mono w-6 text-right">
                  {Math.round(noiseVolume * 100)}%
                </span>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* STANDARD VIEW Mode: Presets Library + Outside Control Buttons */
        <div className="space-y-4 text-left relative z-0">
          
          {/* Presets items library list with absolutely NO surrounding card / border frame wrapper */}
          <div id="focus-presets-library-container" className="space-y-3 text-left relative pt-1">
            <div className="flex items-center justify-between pl-1 bg-transparent pr-1">
              <div className="flex items-center gap-1.5 bg-transparent">
                <Flame size={12} className="text-orange-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-[#007DFF] dark:text-blue-400 uppercase tracking-widest font-sans">
                  专注预设项库 ({presets.length})
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 bg-transparent">
                {/* 1. Compact New Preset Pill */}
                <button
                  id="btn-trigger-new-preset-modal"
                  onClick={() => {
                    setIsPresetModalOpen(true);
                    if (audioSynth) {
                      audioSynth.synthesizeHapticChime();
                    }
                  }}
                  title="新建自定义专注预设"
                  className="px-2.5 py-1.5 bg-[#E8F3FF] hover:bg-[#D5EAFF] dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-[#007DFF] font-black rounded-xl text-[9.5px] transition-all cursor-pointer flex items-center justify-center gap-1 border border-blue-250/10 active:scale-95"
                >
                  <Plus size={10} className="stroke-[3.5]" />
                  <span>新建预设</span>
                </button>

                {/* 2. Compact Direct Clock Setup Pill */}
                <button
                  id="btn-trigger-main-focus"
                  onClick={() => {
                    setIsWorkspaceExpanded(true);
                    if (audioSynth) {
                      audioSynth.synthesizeSuccessChime();
                    }
                  }}
                  title="开启极简沙漏番茄时钟"
                  className="px-2.5 py-1.5 bg-gradient-to-r from-[#007DFF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black rounded-xl text-[9.5px] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                >
                  <Timer size={10} className="stroke-[2.5]" />
                  <span>极简番茄钟</span>
                </button>
              </div>
            </div>

            {presets.length === 0 ? (
              <div className="text-center py-6 text-gray-450 text-[10.5px] bg-gray-50/50 dark:bg-zinc-900/15 border border-gray-150/10 dark:border-zinc-800/25 rounded-2xl p-4">
                 暂无配置预设。点击上方 <span className="font-bold text-[#007DFF]">【新建预设】</span> 或 <span className="font-bold text-blue-600">【极简番茄钟】</span> 开启你的专注之旅 🚀
              </div>
            ) : (
              <div id="presets-list-vertical" className="space-y-1.5 bg-transparent">
                {presets.map(item => {
                  const isPomo = item.mode === 'POMODORO';
                  const isStopwatch = item.mode === 'STOPWATCH';

                  return (
                    <div
                      id={`focus-preset-card-${item.id}`}
                      key={item.id}
                      className="bg-white hover:bg-gray-50/50 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60 border border-gray-150/35 dark:border-zinc-850 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 select-none transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0 bg-transparent">
                        <span className="text-[13px] shrink-0">{isPomo ? '🍅' : isStopwatch ? '⏳' : '⏱️'}</span>
                        <span className="text-[11.5px] font-bold text-gray-850 dark:text-gray-200 truncate leading-none">
                          {item.title}
                        </span>
                        <span className="text-[8.5px] font-mono font-black text-gray-400 dark:text-zinc-500 shrink-0 bg-gray-200/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded leading-none">
                          {item.minutes}m ({isPomo ? '番茄' : isStopwatch ? '沙漏' : '倒计'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 bg-transparent animate-fade-in">
                        <button
                          id={`btn-start-preset-${item.id}`}
                          onClick={() => {
                            // Triggers page view switch to show clock immediately
                            setIsWorkspaceExpanded(true);
                            onStartTimer(item.minutes * 60, item.mode, undefined, item.title);
                            if (audioSynth) {
                              audioSynth.synthesizeSuccessChime();
                            }
                          }}
                          title="立即开启本次预设"
                          className="px-3.5 py-1.5 text-[10.5px] font-black rounded-lg bg-[#007DFF] hover:bg-blue-600 text-white cursor-pointer transition-all flex items-center gap-0.5 shadow-3xs"
                        >
                          <Play size={8} className="fill-white stroke-[3]" />
                          <span>开启</span>
                        </button>
                        <button
                          id={`btn-delete-preset-${item.id}`}
                          onClick={() => {
                            const updated = presets.filter(p => p.id !== item.id);
                            savePresets(updated);
                            if (audioSynth) {
                              audioSynth.synthesizeHapticChime();
                            }
                          }}
                          title="删除"
                          className="p-1.5 rounded-lg bg-transparent hover:bg-rose-50 text-gray-405 dark:text-zinc-500 hover:text-rose-500 cursor-pointer transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Preset Creation Modal popup */}
      {isPresetModalOpen && (
        <div id="new-preset-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-150/25 dark:border-zinc-800/70 w-full max-w-sm p-5 shadow-2xl text-left space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-150 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <Flame className="text-[#007DFF]/90 animate-pulse" size={14} />
                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">新建自定义专注预设</h3>
              </div>
              <button
                id="btn-close-new-preset-modal"
                onClick={() => setIsPresetModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-50 dark:bg-zinc-800 rounded-full cursor-pointer transition-colors"
               >
                <Plus size={12} className="transform rotate-45 stroke-[2.5]" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-0.5">专注项目（例：高效写稿、物理练习）</label>
                <input
                  id="input-new-preset-title"
                  type="text"
                  placeholder="请输入您的专注主题"
                  value={newPresetTitle}
                  onChange={e => setNewPresetTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-150/40 dark:border-zinc-700/50 rounded-xl p-2.5 text-[11px] font-extrabold text-gray-800 dark:text-gray-100 placeholder-gray-350 dark:placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-0.5">专注时长 (分钟)</label>
                  <input
                    id="input-new-preset-minutes"
                    type="number"
                    min={1}
                    max={120}
                    value={newPresetMinutes}
                    onChange={e => setNewPresetMinutes(Math.max(1, Math.min(Number(e.target.value), 120)))}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-150/40 dark:border-zinc-700/50 rounded-xl p-2.5 text-[11px] font-extrabold text-gray-800 dark:text-gray-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-0.5">时钟模式</label>
                  <select
                    id="select-new-preset-mode"
                    value={newPresetMode}
                    onChange={e => setNewPresetMode(e.target.value as FocusMode)}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-150/40 dark:border-zinc-700/50 rounded-xl p-2 text-[11px] font-extrabold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="POMODORO">🍅 标准番茄</option>
                    <option value="STOPWATCH">⏳ 沙漏正计时</option>
                    <option value="COUNTDOWN">⏱️ 倒计时模式</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-105 dark:border-zinc-850">
              <button
                id="btn-cancel-new-preset"
                onClick={() => setIsPresetModalOpen(false)}
                className="flex-1 py-2 font-bold text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[11px] rounded-xl transition-all cursor-pointer text-center"
              >
                取消
              </button>
              <button
                id="btn-confirm-new-preset"
                onClick={() => {
                  handleAddPreset();
                  setIsPresetModalOpen(false);
                }}
                className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-[#007DFF] text-white font-extrabold rounded-xl text-[11px] transition-all cursor-pointer text-center shadow-xs"
              >
                克隆建立项
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
