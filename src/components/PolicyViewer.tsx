import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface PolicyViewerProps {
  type: 'USER' | 'PRIVACY';
  onClose: () => void;
}

export const PolicyViewer: React.FC<PolicyViewerProps> = ({ type, onClose }) => {
  const title = type === 'USER' ? '用户协议' : '隐私政策';

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1C1C1E] w-full max-w-lg h-[85vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border border-gray-100 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed space-y-4">
          <p className="font-bold text-gray-800 dark:text-gray-200">更新日期：2026年6月</p>
          <p>
            欢迎使用 ZenFlow。本{title}是您与 ZenFlow 团队之间关于使用本应用所订立的协议。
          </p>
          
          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-base pt-2">1. 信息的收集与使用</h4>
          <p>
            所有的待办数据默认安全地存储在您的本地设备中，除非您主动触发多端同步功能。
          </p>

          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-base pt-2">2. 权限声明</h4>
          <p>
            为保障核心业务的正常运行，我们需要向您申请以下权限：<br/>
            • <b>网络权限</b>：用于应用内接收更新、提交产品反馈以及潜在的云端同步服务。
          </p>

          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-base pt-2">3. 数据安全与隐私保护</h4>
          <p>
            我们采用业界标准的安全技术和措施来保护您的数据。未经您的明示同意，我们不会向任何第三方出售或共享您的个人信息。
          </p>

          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-base pt-2">4. 协议的变更与生效</h4>
          <p>
            我们保留根据法律法规变化或业务运营需要随时修改本政策的权利。如果我们对本政策进行重大变更，我们将通过应用内弹窗等显著方式通知您。
          </p>

          <div className="pt-8 pb-4 text-center text-xs text-gray-400">
            <p>ZenFlow 团队</p>
            <p>邮箱：legal@zenflow.app</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
