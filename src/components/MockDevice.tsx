/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Pause, Play, Square, Timer, CheckCircle, BellRing, Smartphone, Clipboard, FileText, CheckSquare, Plus } from 'lucide-react';

interface MockDeviceProps {
  children: React.ReactNode;
  // Live view properties
  isTimerActive: boolean;
  timerLabel: string; // "24:59"
  isPaused: boolean;
  timerTitle?: string; // Linked task title to display
  onPauseToggle: () => void;
  onStopTimer: () => void;
  // Homescreen desktop toggles
  isHomeScreen: boolean;
  onToggleHomeScreen: () => void;
  // Clipboard dynamic bubble
  clipboardItem: string | null;
  onImportClipboard: () => void;
  onClearClipboard: () => void;
}

export function MockDevice({
  children,
  isTimerActive,
  timerLabel,
  isPaused,
  timerTitle = '极简专注',
  onPauseToggle,
  onStopTimer,
  isHomeScreen,
  onToggleHomeScreen,
  clipboardItem,
  onImportClipboard,
  onClearClipboard
}: MockDeviceProps) {
  const [systemTime, setSystemTime] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isLiveExpanded, setIsLiveExpanded] = useState(false);

  // Keep system time ticked
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Slowly deplete battery mock
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(b => Math.max(b - 1, 15));
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="harmony-device-shell" className="relative w-full max-w-5xl mx-auto rounded-[3.25rem] bg-[#121314] p-3.5 shadow-2xl border-4 border-gray-800 flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Absolute Notch Area for aesthetics */}
      <div className="absolute top-0 left-1/3 right-1/3 h-5 bg-black rounded-b-2xl z-40 hidden md:block" />

      {/* Device Sidebar / Controls Dashboard Panel */}
      <div id="device-sidebar" className="w-full md:w-64 flex flex-col justify-between bg-zinc-900 rounded-[2.25rem] p-5 text-white border border-zinc-800">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#007DFF] flex items-center justify-center font-black text-xs text-white">
              H
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400">HarmonyOS NEXT</p>
              <h2 className="text-sm font-black text-white leading-tight">鸿蒙纯血待办</h2>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">环境仿真控制器</span>
            
            {/* View State toggler */}
            <button
              id="sidebar-btn-home"
              onClick={onToggleHomeScreen}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isHomeScreen 
                  ? 'bg-zinc-800 border-zinc-700 text-white shadow-md' 
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Smartphone size={16} className={isHomeScreen ? 'text-[#007DFF]' : ''} />
                <span className="text-xs font-extrabold">鸿蒙系统桌面</span>
              </div>
              {isHomeScreen && <div className="w-1.5 h-1.5 bg-[#007DFF] rounded-full" />}
            </button>

            <button
              id="sidebar-btn-app"
              onClick={onToggleHomeScreen}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                !isHomeScreen 
                  ? 'bg-zinc-800 border-zinc-700 text-white shadow-md' 
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CheckSquare size={16} className={!isHomeScreen ? 'text-[#007DFF]' : ''} />
                <span className="text-xs font-extrabold">TodoList 应用主屏</span>
              </div>
              {!isHomeScreen && <div className="w-1.5 h-1.5 bg-[#007DFF] rounded-full" />}
            </button>
          </div>

          {/* Micro Information Hub on HarmonyOS features */}
          <div className="bg-zinc-950 p-4 rounded-3xl border border-zinc-800/60 mt-6 space-y-2.5">
            <span className="text-[10px] text-zinc-400 font-bold block">💡 独家黑科技适配点</span>
            <ul className="space-y-1.5 text-[10.5px] text-zinc-500 leading-relaxed font-semibold">
              <li className="flex items-start gap-1">
                <span className="text-[#007DFF] font-mono">•</span>
                实况窗 (Live View)：专注时退至后台，顶部弹出秒级计时胶囊。
              </li>
              <li className="flex items-start gap-1">
                <span className="text-[#007DFF] font-mono">•</span>
                桌面卡片 (Form)：支持 2×2 / 1×2 待办微交互，直接卡片打卡。
              </li>
              <li className="flex items-start gap-1">
                <span className="text-[#007DFF] font-mono">•</span>
                触觉振动 (Haptics)：专注时间结束伴随低频钟声双重律动反馈。
              </li>
            </ul>
          </div>
        </div>

        {/* Minimalist human label */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-sans font-medium">
          <span>HarmonyOS NEXT 原生体验版</span>
          <span>API 12</span>
        </div>
      </div>

      {/* Main Inner Device Canvas Screen */}
      <div className="flex-1 bg-[#EEF2F6] rounded-[2.25rem] border border-gray-200/50 flex flex-col overflow-hidden relative min-h-[580px]">
        
        {/* Device Native Status Bar */}
        <div id="device-statusbar" className="h-10 bg-[#EDEFF2] px-6 flex items-center justify-between text-gray-600 relative z-30 select-none">
          {/* Left: Time and Notifications */}
          <div className="flex items-center space-x-2.5 font-sans font-bold text-xs">
            <span>{systemTime}</span>
            {isTimerActive && (
              <span className="animate-bounce">
                <BellRing size={12} className="text-emerald-600" />
              </span>
            )}
          </div>

          {/* Center Dynamic Notch & Live View Capsule (实况窗) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5">
            {isTimerActive ? (
              <div 
                id="live-capsule"
                onClick={() => setIsLiveExpanded(!isLiveExpanded)}
                className={`flex items-center space-x-2 px-3 py-1 bg-gray-900 border border-gray-800 text-white rounded-full transition-all duration-300 ease-out shadow-lg cursor-pointer transform ${
                  isLiveExpanded ? 'scale-105 bg-black ring-2 ring-[#007DFF]/50' : 'hover:scale-[1.03]'
                }`}
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping flex-shrink-0" />
                <Timer size={11} className="text-emerald-400" />
                <span className="text-[10px] font-black font-mono tracking-wider">{timerLabel}</span>
                <span className="text-[9px] font-bold text-gray-300 max-w-22 truncate hidden sm:inline">
                  {timerTitle.substring(0, 8)}
                </span>

                {/* Extended controller menu hover */}
                {isLiveExpanded && (
                  <div className="flex items-center space-x-1 border-l border-gray-700 pl-2 ml-1" onClick={e => e.stopPropagation()}>
                    <button 
                      id="live-btn-pause"
                      onClick={onPauseToggle}
                      className="p-0.5 rounded bg-gray-800 hover:bg-gray-700 text-emerald-400"
                    >
                      {isPaused ? <Play size={10} /> : <Pause size={10} />}
                    </button>
                    <button 
                      id="live-btn-stop"
                      onClick={onStopTimer}
                      className="p-0.5 rounded bg-gray-850 hover:bg-rose-950 text-rose-400"
                    >
                      <Square size={10} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Empty camera bar hole
              <div className="w-24 h-4.5 bg-[#DCDEE2] rounded-full flex items-center justify-center shadow-inner">
                <div className="w-2 h-2 bg-[#2E3135] rounded-full ml-1" />
              </div>
            )}
          </div>

          {/* Right: Networking, Battery, Sound */}
          <div className="flex items-center space-x-2 text-gray-500 font-bold">
            <Signal size={12} />
            <Wifi size={12} />
            <div className="flex items-center space-x-0.5 font-mono text-[10px] text-gray-700">
              <Battery size={13} className="text-gray-600" />
              <span>{batteryLevel}%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Clipboard Smart Clipboard Tag Alert */}
        {clipboardItem && (
          <div id="paste-alert-bubble" className="absolute top-11 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-2.5 border border-blue-100 shadow-lg z-40 transition-all flex items-center justify-between animate-fade-in animate-bounce">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
                <Clipboard size={14} />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] text-gray-400 font-bold uppercase">检测到剪贴板有时间代办</span>
                <p className="text-xs text-gray-700 font-semibold truncate max-w-44 leading-tight">{clipboardItem}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                id="paste-btn-close"
                onClick={onClearClipboard}
                className="p-1 px-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 text-[10px] font-bold"
              >
                忽略
              </button>
              <button
                id="paste-btn-apply"
                onClick={onImportClipboard}
                className="p-1 px-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold flex items-center gap-0.5"
              >
                <Plus size={10} />
                一键导入
              </button>
            </div>
          </div>
        )}

        {/* Core application view / desktop viewport slots */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </div>

        {/* Bottom System Gesture Navigation Bar */}
        <div className="h-8 bg-transparent flex items-center justify-center relative select-none">
          <div className="w-32 h-1 bg-gray-400/80 rounded-full hover:bg-black/80 transition-colors" />
        </div>
      </div>
    </div>
  );
}
