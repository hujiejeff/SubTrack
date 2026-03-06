import React, { useState, useEffect } from 'react';
import { X, Globe, Moon, Sun, Monitor, Cloud, Github, Database, Key, Lock, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { DEFAULT_EXCHANGE_RATES } from '../lib/currency';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserProfile) => void;
  initialData: UserProfile;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<UserProfile>(initialData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const currencies = Object.keys(DEFAULT_EXCHANGE_RATES);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">通用设置</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Currency Setting */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" />
                  主货币 (总览显示)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {currencies.map(curr => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setFormData({ ...formData, baseCurrency: curr })}
                      className={cn(
                        "py-2 px-3 rounded-xl border text-sm font-medium transition-all",
                        formData.baseCurrency === curr
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300"
                      )}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Setting */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Monitor size={16} className="text-blue-500" />
                  外观模式
                </label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  {[
                    { id: 'light', label: '浅色', icon: Sun },
                    { id: 'dark', label: '深色', icon: Moon },
                    { id: 'system', label: '自动', icon: Monitor },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, theme: item.id as any })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                          formData.theme === item.id
                            ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                      >
                        <Icon size={16} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data Sync Setting */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Cloud size={16} className="text-blue-500" />
                  数据同步
                </label>
                
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  {[
                    { id: 'none', label: '无', icon: Cloud },
                    { id: 'webdav', label: 'WebDAV', icon: Database },
                    { id: 'gist', label: 'GitHub Gist', icon: Github },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ 
                          ...formData, 
                          syncConfig: { 
                            ...(formData.syncConfig || { method: 'none' }), 
                            method: item.id as any 
                          } 
                        })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all",
                          (formData.syncConfig?.method || 'none') === item.id
                            ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                      >
                        <Icon size={14} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {formData.syncConfig?.method === 'webdav' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                        <Link size={10} /> 服务器地址
                      </label>
                      <input 
                        type="text"
                        placeholder="https://dav.example.com/remote.php/dav/files/user/"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                        value={formData.syncConfig.webdav?.url || ''}
                        onChange={e => setFormData({
                          ...formData,
                          syncConfig: {
                            ...formData.syncConfig!,
                            webdav: { ...(formData.syncConfig!.webdav || { url: '', username: '' }), url: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                          <Database size={10} /> 用户名
                        </label>
                        <input 
                          type="text"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                          value={formData.syncConfig.webdav?.username || ''}
                          onChange={e => setFormData({
                            ...formData,
                            syncConfig: {
                              ...formData.syncConfig!,
                              webdav: { ...(formData.syncConfig!.webdav || { url: '', username: '' }), username: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                          <Lock size={10} /> 密码/应用令牌
                        </label>
                        <input 
                          type="password"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                          value={formData.syncConfig.webdav?.password || ''}
                          onChange={e => setFormData({
                            ...formData,
                            syncConfig: {
                              ...formData.syncConfig!,
                              webdav: { ...(formData.syncConfig!.webdav || { url: '', username: '' }), password: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {formData.syncConfig?.method === 'gist' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                        <Key size={10} /> GitHub Token (需要 gist 权限)
                      </label>
                      <input 
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxx"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                        value={formData.syncConfig.gist?.token || ''}
                        onChange={e => setFormData({
                          ...formData,
                          syncConfig: {
                            ...formData.syncConfig!,
                            gist: { ...(formData.syncConfig!.gist || { token: '' }), token: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                        <Github size={10} /> Gist ID (可选，留空则创建新 Gist)
                      </label>
                      <input 
                        type="text"
                        placeholder="留空自动创建"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                        value={formData.syncConfig.gist?.gistId || ''}
                        onChange={e => setFormData({
                          ...formData,
                          syncConfig: {
                            ...formData.syncConfig!,
                            gist: { ...(formData.syncConfig!.gist || { token: '' }), gistId: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20 transition-all active:scale-[0.98]"
                >
                  保存设置
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
