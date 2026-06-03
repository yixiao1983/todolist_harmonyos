import React from 'react';
import { Settings, Info, FileText, Shield, ChevronRight, Moon, Grid2X2, Flame, Clock3 } from 'lucide-react';

interface SettingsViewProps {
  onShowPolicy: (type: 'USER' | 'PRIVACY') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  showQuadrantsTab: boolean;
  setShowQuadrantsTab: (val: boolean) => void;
  showHabitsTab: boolean;
  setShowHabitsTab: (val: boolean) => void;
  showPomodoroTab: boolean;
  setShowPomodoroTab: (val: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  onShowPolicy, 
  darkMode, setDarkMode,
  showQuadrantsTab, setShowQuadrantsTab,
  showHabitsTab, setShowHabitsTab,
  showPomodoroTab, setShowPomodoroTab
}) => {
  return (
    <div className="w-full h-full p-4 overflow-y-auto pb-24">
      <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 tracking-tight flex items-center gap-2">
        <Settings className="text-[#007DFF]" /> 设置与关于
      </h2>

      {/* App Info Card */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 dark:border-zinc-800 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg mb-4 flex items-center justify-center text-white text-3xl font-black">
          Z
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">ZenFlow</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Version 1.0.0</p>
      </div>

      {/* General Settings List */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800 mb-6">
        <h4 className="px-5 pt-4 pb-2 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
          应用设置
        </h4>
        
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 rounded-xl">
              <Moon size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">深色模式</span>
              <span className="text-[10px] text-gray-400">开启夜间护眼沉浸体验</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={(e) => setDarkMode(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#007DFF]"></div>
          </label>
        </div>

        {/* Quadrants Tab Toggle */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-xl">
              <Grid2X2 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">四象限功能</span>
              <span className="text-[10px] text-gray-400">在底部导航栏显示四象限视图</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showQuadrantsTab} 
              onChange={(e) => setShowQuadrantsTab(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#007DFF]"></div>
          </label>
        </div>

        {/* Habits Tab Toggle */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 rounded-xl">
              <Flame size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">习惯打卡功能</span>
              <span className="text-[10px] text-gray-400">在底部导航栏显示习惯养成看板</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showHabitsTab} 
              onChange={(e) => setShowHabitsTab(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#007DFF]"></div>
          </label>
        </div>

        {/* Pomodoro Tab Toggle */}
        <div className="flex items-center justify-between p-4 px-5">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-xl">
              <Clock3 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">番茄专注功能</span>
              <span className="text-[10px] text-gray-400">在底部导航栏显示沉浸专注空间</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showPomodoroTab} 
              onChange={(e) => setShowPomodoroTab(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#007DFF]"></div>
          </label>
        </div>
      </div>

      {/* About and Policies Menu List */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800">
        <h4 className="px-5 pt-4 pb-2 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
          法律与关于
        </h4>
        <div 
          className="flex items-center justify-between p-4 px-5 border-b border-gray-100 dark:border-zinc-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => onShowPolicy('USER')}
        >
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-xl">
              <FileText size={18} />
            </div>
            <span className="font-semibold text-sm">用户协议</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </div>

        <div 
          className="flex items-center justify-between p-4 px-5 border-b border-gray-100 dark:border-zinc-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
          onClick={() => onShowPolicy('PRIVACY')}
        >
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-xl">
              <Shield size={18} />
            </div>
            <span className="font-semibold text-sm">隐私政策</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </div>

        <div className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 rounded-xl">
              <Info size={18} />
            </div>
            <span className="font-semibold text-sm">关于我们</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">HarmonyOS 原生版</span>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400 dark:text-zinc-600">
        <p>版权所有 © 2026 ZenFlow 团队</p>
        <p>Powered by ArkTS & React</p>
      </div>
    </div>
  );
};
