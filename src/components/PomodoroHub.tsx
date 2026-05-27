/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Task, FocusMode, WhiteNoiseType } from '../types';
import { FocusAudioSynthesizer } from '../utils/audio';
import { Play, Pause, Square, Timer, Headset, VolumeX, Volume2, Flame, CloudRain, Wind, Waves, Sparkles, CheckCircle } from 'lucide-react';

interface PomodoroHubProps {
  tasks: Task[];
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  totalDuration: number; // in seconds
  focusMode: FocusMode;
  activeTaskId?: string;
  onStartTimer: (duration: number, mode: FocusMode, taskId?: string) => void;
  onPauseToggle: () => void;
  onStopTimer: () => void;
  onLinkTask: (taskId: string) => void;
  audioSynth: FocusAudioSynthesizer;
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
  audioSynth
}: PomodoroHubProps) {
  const [customMinutes, setCustomMinutes] = useState(25);
  const [loudspeakersEnabled, setLoudspeakersEnabled] = useState(true);
  const [noiseVolume, setNoiseVolume] = useState(0.5);
  const [activeNoise, setActiveNoise] = useState<WhiteNoiseType>('NONE');

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

  const selectedLinkTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div id="pomodoro-focus-hub" className="space-y-4">
      
      {/* 2-Column Split: Clock Panel vs Ambient Sounds */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left Dial Panel */}
        <div className="md:col-span-7 bg-white rounded-[2rem] p-5 shadow-2xs border border-gray-100 flex flex-col items-center justify-between text-center min-h-[350px]">
          <div>
            <span className="text-[10px] font-black tracking-wider text-rose-500 uppercase block mb-1">
              {isRunning ? `${focusMode} 专注中` : '极简沙漏番茄时钟'}
            </span>
            <h4 className="text-xs font-semibold text-gray-400">
              {isRunning && selectedLinkTask ? `正在专注: ${selectedLinkTask.title}` : '自定义番茄时间聚焦方案'}
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
              <span id="timer-counter-label" className="text-2xl font-black text-gray-800 font-mono tracking-widest">
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
                  className="flex-1 max-w-[120px] p-2.5 bg-gray-150 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
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
              <div className="space-y-3">
                {/* Mode Selector and Linking */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 text-left">
                    <label className="block text-[8.5px] font-bold text-gray-400 uppercase mb-0.5">关联当前待办</label>
                    <select
                      id="pomo-select-link-task"
                      onChange={e => onLinkTask(e.target.value)}
                      value={activeTaskId || ''}
                      className="w-full bg-transparent focus:outline-none text-[10.5px] font-bold text-gray-700 border-0 p-0"
                    >
                      <option value="">-- 自主选择专注任务 --</option>
                      {pendingTasks.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 text-left flex flex-col justify-between">
                    <label id="lbl-custom-minutes" className="block text-[8.5px] font-bold text-gray-400 uppercase mb-0.5">自定时长 (1-90m)</label>
                    <input
                      id="input-custom-minutes"
                      type="number"
                      min={1}
                      max={90}
                      value={customMinutes}
                      onChange={e => setCustomMinutes(Math.max(1, Math.min(Number(e.target.value), 90)))}
                      className="bg-transparent focus:outline-none text-[10.5px] font-bold text-gray-700 border-0 p-0 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Preset Standard Pomorodo 25 min */}
                  <button
                    id="btn-trigger-preset-pomo"
                    onClick={() => {
                      onStartTimer(25 * 60, 'POMODORO', activeTaskId);
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
                      // Positive stopwatch counts up. Set 45 mins limit count-up standard
                      onStartTimer(45 * 60, 'STOPWATCH', activeTaskId);
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
                      onStartTimer(customMinutes * 60, 'COUNTDOWN', activeTaskId);
                    }}
                    className="p-2.5 bg-gray-900 hover:bg-black font-bold rounded-2xl text-[10px] text-white flex flex-col items-center justify-center space-y-1 hover:shadow-xs transition-all cursor-pointer"
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
        <div className="md:col-span-5 bg-white rounded-[2rem] p-5 shadow-2xs border border-gray-100 flex flex-col justify-between min-h-[350px]">
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
              { id: 'RAIN' as WhiteNoiseType, name: '深林雨声', desc: 'Pink Noise, Splat', icon: <CloudRain size={16} />, activeBg: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
              { id: 'WAVE' as WhiteNoiseType, name: '高山流水', desc: 'modulated sweep', icon: <Waves size={16} />, activeBg: 'bg-indigo-50 border-indigo-300 text-indigo-700' },
              { id: 'FOREST' as WhiteNoiseType, name: '环境白噪', desc: 'Brown rumble wind', icon: <Wind size={16} />, activeBg: 'bg-sky-50 border-sky-300 text-sky-700' },
              { id: 'FIRE' as WhiteNoiseType, name: '营地篝火', desc: 'cracking popping', icon: <Flame size={16} />, activeBg: 'bg-orange-50 border-orange-300 text-orange-700' },
            ].map(snd => (
              <button
                id={`btn-noise-${snd.id}`}
                key={snd.id}
                onClick={() => handleNoiseToggle(snd.id)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-[80px] transition-all cursor-pointer ${
                  activeNoise === snd.id 
                    ? snd.activeBg + ' scale-[1.02] shadow-2xs' 
                    : 'bg-gray-50 hover:bg-gray-100/80 border-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`p-1.5 rounded-lg ${activeNoise === snd.id ? 'bg-white/90' : 'bg-gray-200/50'}`}>
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
          <div className="border-t border-gray-100 pt-3 flex items-center space-x-2.5">
            <button
              id="pomo-loudspeaker-toggle"
              onClick={() => {
                const toggled = !loudspeakersEnabled;
                setLoudspeakersEnabled(toggled);
                audioSynth.setVolume(toggled ? noiseVolume : 0);
              }}
              className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              {loudspeakersEnabled && noiseVolume > 0 ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <div className="flex-1 bg-gray-150 h-1 rounded-full relative">
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
                className="absolute inset-0 opacity-100 w-full h-1 cursor-pointer accent-gray-800"
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 font-mono w-6 text-right">
              {Math.round(noiseVolume * 100)}%
            </span>
          </div>
        </div>

      </div>

      {/* Completion log of focus moments in this sessions */}
      <div id="focus-history-board" className="bg-white rounded-[2rem] p-4.5 border border-gray-100 space-y-2 text-left">
        <span className="text-[10px] font-black text-rose-500 uppercase block tracking-wider">
          💡 统计看板与番茄数据提示 (Statistics Indicator)
        </span>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100/50">
            <span className="block text-[9px] text-gray-400 font-bold">已积累专注分</span>
            <p className="text-sm font-black text-gray-800">
              {tasks.reduce((sum, t) => sum + (t.focusMinutes || 0), 0)} 分
            </p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100/50">
            <span className="block text-[9px] text-gray-400 font-bold">高优先级转化率</span>
            <p className="text-sm font-black text-rose-600">
              {tasks.filter(t => t.priority === 'HIGH' && t.isCompleted).length} / {tasks.filter(t => t.priority === 'HIGH').length || 0}
            </p>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100/50">
            <span className="block text-[9px] text-gray-400 font-bold">任务整体达成率</span>
            <p className="text-sm font-black text-emerald-600">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
