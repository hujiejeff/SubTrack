import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subscription, BillingCycle } from '../types';

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
    color: '#3b82f6'
  });

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
        color: initialData.color
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
        color: '#3b82f6'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      price: parseFloat(formData.price),
      currency: formData.currency,
      cycle: formData.cycle,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      nextBillingDate: formData.startDate,
      status: initialData ? initialData.status : 'active' as const,
      category: formData.category,
      color: formData.color
    };

    if (initialData) {
      onSave({ ...data, id: initialData.id } as Subscription);
    } else {
      onSave(data);
    }
    onClose();
  };

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
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {initialData ? '编辑订阅' : '添加新订阅'}
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
