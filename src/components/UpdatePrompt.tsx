import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const UpdatePrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-8 md:w-80"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 overflow-hidden relative">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                {needRefresh ? <RefreshCw size={20} className="animate-spin-slow" /> : <Info size={20} />}
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {needRefresh ? '发现新版本' : '应用已准备就绪'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {needRefresh 
                    ? '新版本已准备好，点击更新以加载最新功能和修复。' 
                    : '应用已缓存，现在可以离线使用了。'}
                </p>
                
                <div className="mt-4 flex gap-2">
                  {needRefresh && (
                    <button
                      onClick={() => updateServiceWorker(true)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
                    >
                      立即更新
                    </button>
                  )}
                  <button
                    onClick={close}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
                  >
                    稍后再说
                  </button>
                </div>
              </div>
              
              <button 
                onClick={close}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Progress bar for visual interest */}
            {needRefresh && (
              <div className="absolute bottom-0 left-0 h-1 bg-blue-600/20 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 10, ease: "linear" }}
                  className="h-full bg-blue-600"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
