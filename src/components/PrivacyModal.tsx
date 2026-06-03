import React, { useState } from 'react';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyModalProps {
  onAgree: () => void;
  onDisagree: () => void;
  onShowPolicy: (type: 'USER' | 'PRIVACY') => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onAgree, onDisagree, onShowPolicy }) => {
  const [isRead, setIsRead] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800"
      >
        <div className="p-6 pb-4 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
            <ShieldAlert className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            欢迎使用 ZenFlow
          </h2>
          <div className="text-sm text-gray-500 dark:text-zinc-400 text-left space-y-3">
            <p>
              感谢您信任并使用 ZenFlow。我们非常重视您的个人信息和隐私保护。
            </p>
            <p>
              为了让您清楚地了解我们如何收集、使用、保护您的个人信息，请您在开始使用前仔细阅读<span className="text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer" onClick={() => onShowPolicy('USER')}>《用户协议》</span>和<span className="text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer" onClick={() => onShowPolicy('PRIVACY')}>《隐私政策》</span>。
            </p>
            <p className="text-xs bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg">
              核心摘要：<br/>
              1. 您的待办数据将主要存储于本地设备。<br/>
              2. 保证应用内干净纯粹的沉浸体验。
            </p>
          </div>
        </div>

        <div className="px-6 py-2 flex items-center justify-center gap-2">
          <input 
            type="checkbox" 
            id="read-agreement" 
            className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
            checked={isRead}
            onChange={(e) => setIsRead(e.target.checked)}
          />
          <label htmlFor="read-agreement" className="text-xs text-gray-500 dark:text-zinc-400 select-none">
            我已阅读并同意上述协议
          </label>
        </div>

        <div className="flex flex-col gap-2 p-6 pt-3">
          <button
            className={`w-full py-3.5 rounded-2xl font-bold transition-all ${
              isRead 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20' 
              : 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed'
            }`}
            onClick={() => {
              if (isRead) {
                onAgree();
              } else {
                // If they try to click without checking, flash the checkbox or just ignore
              }
            }}
          >
            同意并继续
          </button>
          <button
            className="w-full py-3 rounded-2xl font-semibold text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            onClick={onDisagree}
          >
            不同意并退出
          </button>
        </div>
      </motion.div>
    </div>
  );
};
