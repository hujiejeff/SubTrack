import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subscription, BillingCycle } from '../types';
import { cn } from '../lib/utils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Omit<Subscription, 'id'> | Subscription) => void;
  initialData?: Subscription | null;
}

export const AddSubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    currency: 'CNY',
    cycle: 'monthly' as BillingCycle,
    category: '娱乐',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    color: '#3b82f6',
    icon: '',
    isTrial: false,
    trialEndDate: ''
  });

  const [isFetchingIcon, setIsFetchingIcon] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price.toString(),
        currency: initialData.currency || 'CNY',
        cycle: initialData.cycle,
        category: initialData.category,
        startDate: initialData.startDate,
        endDate: initialData.endDate || '',
        color: initialData.color,
        icon: initialData.icon || '',
        isTrial: initialData.isTrial || false,
        trialEndDate: initialData.trialEndDate || ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        currency: 'CNY',
        cycle: 'monthly',
        category: '娱乐',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        color: '#3b82f6',
        icon: '',
        isTrial: false,
        trialEndDate: ''
      });
    }
  }, [initialData, isOpen]);

  // Auto-fetch icon when name changes
  useEffect(() => {
    if (!initialData && formData.name.length > 2) {
      const timer = setTimeout(async () => {
        setIsFetchingIcon(true);
        try {
          // Try to guess domain or use a search-based favicon service
          const domain = formData.name.toLowerCase().replace(/\s+/g, '') + '.com';
          const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
          setFormData(prev => ({ ...prev, icon: iconUrl }));
        } catch (e) {
          console.error('Failed to fetch icon');
        } finally {
          setIsFetchingIcon(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.name, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      price: parseFloat(formData.price),
      currency: formData.currency,
      cycle: formData.cycle,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      nextBillingDate: formData.isTrial ? formData.trialEndDate : formData.startDate,
      status: formData.isTrial ? 'trial' : (initialData ? initialData.status : 'active') as any,
      category: formData.category,
      color: formData.color,
      icon: formData.icon || undefined,
      isTrial: formData.isTrial,
      trialEndDate: formData.isTrial ? formData.trialEndDate : undefined
    };

    if (initialData) {
      onSave({ ...data, id: initialData.id } as Subscription);
    } else {
      onSave(data);
    }
    onClose();
  };

  const PRESET_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#f97316', '#64748b', '#000000'
  ];

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {initialData ? '编辑订阅' : '添加新订阅'}
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Preview Section */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg relative overflow-hidden"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.icon ? (
                      <img 
                        src={formData.icon} 
                        alt="Icon" 
                        className="w-full h-full object-cover"
                        onError={() => setFormData(prev => ({ ...prev, icon: '' }))}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      formData.name.charAt(0) || '?'
                    )}
                    {isFetchingIcon && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {formData.isTrial && (
                      <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-[10px] text-center py-0.5 font-bold uppercase tracking-wider">
                        Trial
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">服务名称</label>
                <input 
                  required
                  type="text"
                  placeholder="例如: Netflix, Spotify"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">试用模式</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isTrial: !formData.isTrial })}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative",
                      formData.isTrial ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      formData.isTrial ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
                {formData.isTrial && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">试用结束日期</label>
                      <input 
                        required={formData.isTrial}
                        type="date"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm dark:text-white"
                        value={formData.trialEndDate}
                        onChange={e => setFormData({ ...formData, trialEndDate: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">主题颜色</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        formData.color === c ? "border-slate-900 dark:border-white scale-110" : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input 
                    type="color"
                    className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">图标 URL (可选)</label>
                <input 
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-xs"
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">价格</label>
                  <div className="relative">
                    <input 
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">币种</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none dark:text-white"
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="CNY">人民币 (CNY)</option>
                    <option value="USD">美元 (USD)</option>
                    <option value="HKD">港币 (HKD)</option>
                    <option value="JPY">日元 (JPY)</option>
                    <option value="EUR">欧元 (EUR)</option>
                    <option value="GBP">英镑 (GBP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">周期</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none dark:text-white"
                  value={formData.cycle}
                  onChange={e => setFormData({ ...formData, cycle: e.target.value as BillingCycle })}
                >
                  <option value="monthly">每月</option>
                  <option value="quarterly">每季度</option>
                  <option value="semi-annually">每半年</option>
                  <option value="yearly">每年</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">分类</label>
                <input 
                  required
                  type="text"
                  placeholder="例如: 娱乐, 生产力, 生活"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">开始日期</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">结束日期 (可选)</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                  {initialData ? <Save size={20} /> : <Plus size={20} />}
                  {initialData ? '保存修改' : '确认添加'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
