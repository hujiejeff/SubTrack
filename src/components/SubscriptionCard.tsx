import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Calendar, CheckCircle2, PauseCircle, XCircle, Edit2, Trash2, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subscription } from '../types';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface SubscriptionCardProps {
  subscription: Subscription;
  onStatusChange: (id: string, status: Subscription['status']) => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  subscription, 
  onStatusChange, 
  onEdit, 
  onDelete 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusConfig = {
    active: { icon: CheckCircle2, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: '活跃中' },
    paused: { icon: PauseCircle, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', label: '已暂停' },
    cancelled: { icon: XCircle, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', label: '已取消' },
    expired: { icon: Calendar, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', label: '已过期' },
  };

  const StatusIcon = statusConfig[subscription.status].icon;

  const cycleLabels = {
    'monthly': '月',
    'quarterly': '季',
    'semi-annually': '半年',
    'yearly': '年'
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner"
            style={{ backgroundColor: subscription.color }}
          >
            {subscription.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{subscription.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subscription.category}</p>
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-40 py-1 overflow-hidden"
              >
                <button 
                  onClick={() => { onEdit(subscription); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit2 size={14} />
                  编辑订阅
                </button>
                
                {subscription.status === 'active' ? (
                  <button 
                    onClick={() => { onStatusChange(subscription.id, 'paused'); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <PauseCircle size={14} />
                    暂停订阅
                  </button>
                ) : subscription.status !== 'expired' && (
                  <button 
                    onClick={() => { onStatusChange(subscription.id, 'active'); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <PlayCircle size={14} />
                    恢复订阅
                  </button>
                )}

                {subscription.status !== 'cancelled' && subscription.status !== 'expired' && (
                  <button 
                    onClick={() => { onStatusChange(subscription.id, 'cancelled'); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <XCircle size={14} />
                    取消订阅
                  </button>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                
                <button 
                  onClick={() => { onDelete(subscription.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <Trash2 size={14} />
                  删除记录
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {subscription.currency !== 'CNY' ? subscription.currency : '¥'}
              {subscription.price.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 uppercase">/ {cycleLabels[subscription.cycle]}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 dark:text-slate-500">
            <Calendar size={12} />
            {subscription.status === 'expired' ? (
              <span>已于 {subscription.endDate ? format(parseISO(subscription.endDate), 'yyyy-MM-dd') : '未知日期'} 过期</span>
            ) : (
              <span>下次扣款: {format(parseISO(subscription.nextBillingDate), 'MMM do', { locale: zhCN })}</span>
            )}
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
          statusConfig[subscription.status].bg,
          statusConfig[subscription.status].color
        )}>
          <StatusIcon size={14} />
          <span>{statusConfig[subscription.status].label}</span>
        </div>
      </div>
    </motion.div>
  );
};
