import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Calendar, CheckCircle2, PauseCircle, XCircle, Edit2, Trash2, PlayCircle, Star } from 'lucide-react';
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
  displayMode?: 'standard' | 'compact' | 'mini';
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  subscription, 
  onStatusChange, 
  onEdit, 
  onDelete,
  displayMode = 'standard'
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 200px space below, open upwards
      setOpenUpwards(spaceBelow < 200);
    }
    setShowMenu(!showMenu);
  };

  const statusConfig = {
    active: { icon: CheckCircle2, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: '活跃中' },
    paused: { icon: PauseCircle, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', label: '已暂停' },
    cancelled: { icon: XCircle, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', label: '已取消' },
    expired: { icon: Calendar, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', label: '已过期' },
    trial: { icon: Star, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', label: '试用中' },
  };

  const StatusIcon = statusConfig[subscription.status].icon;

  const cycleLabels = {
    'monthly': '月',
    'quarterly': '季',
    'semi-annually': '半年',
    'yearly': '年'
  };

  const trialDaysLeft = subscription.isTrial && subscription.trialEndDate 
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  if (displayMode === 'mini') {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all",
          subscription.isTrial && "border-amber-200 dark:border-amber-900/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden shrink-0 relative"
            style={{ backgroundColor: subscription.color }}
          >
            {subscription.icon ? (
              <img src={subscription.icon} alt={subscription.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              subscription.name.charAt(0)
            )}
            {subscription.isTrial && (
              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                <Star size={12} className="text-white fill-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{subscription.name}</h3>
            <p className="text-[10px] text-slate-400">
              {subscription.isTrial ? `试用剩 ${trialDaysLeft} 天` : format(parseISO(subscription.nextBillingDate), 'MM-dd')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {subscription.currency !== 'CNY' ? subscription.currency : '¥'}
              {subscription.price.toFixed(0)}
            </p>
          </div>
          <div className="relative" ref={menuRef}>
            <button ref={buttonRef} onClick={toggleMenu} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
              <MoreVertical size={14} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                  className={cn(
                    "absolute right-0 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-40 py-1 overflow-hidden",
                    openUpwards ? "bottom-full mb-2" : "top-full mt-2"
                  )}
                >
                  <button onClick={() => { onEdit(subscription); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Edit2 size={12} /> 编辑
                  </button>
                  <button onClick={() => { onDelete(subscription.id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <Trash2 size={12} /> 删除
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  if (displayMode === 'compact') {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all",
          subscription.isTrial && "border-amber-200 dark:border-amber-900/50"
        )}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner overflow-hidden shrink-0 relative"
            style={{ backgroundColor: subscription.color }}
          >
            {subscription.icon ? (
              <img src={subscription.icon} alt={subscription.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              subscription.name.charAt(0)
            )}
            {subscription.isTrial && (
              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                <Star size={16} className="text-white fill-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{subscription.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", statusConfig[subscription.status].bg, statusConfig[subscription.status].color)}>
                {statusConfig[subscription.status].label}
              </span>
              <span className="text-[10px] text-slate-400">{subscription.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              {subscription.isTrial ? '试用结束' : '下次扣款'}
            </p>
            <p className={cn(
              "text-xs font-bold",
              subscription.isTrial ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"
            )}>
              {format(parseISO(subscription.isTrial ? subscription.trialEndDate! : subscription.nextBillingDate), 'MM-dd')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {subscription.currency !== 'CNY' ? subscription.currency : '¥'}
              {subscription.price.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400 uppercase">/ {cycleLabels[subscription.cycle]}</p>
          </div>
          <div className="relative" ref={menuRef}>
            <button ref={buttonRef} onClick={toggleMenu} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
              <MoreVertical size={18} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                  className={cn(
                    "absolute right-0 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-40 py-1 overflow-hidden",
                    openUpwards ? "bottom-full mb-2" : "top-full mt-2"
                  )}
                >
                  <button onClick={() => { onEdit(subscription); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Edit2 size={14} /> 编辑订阅
                  </button>
                  <button onClick={() => { onDelete(subscription.id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <Trash2 size={14} /> 删除记录
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-md transition-all duration-300",
        subscription.isTrial && "border-amber-200 dark:border-amber-900/50"
      )}
    >
      {subscription.isTrial && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
            <Star size={10} className="fill-white" />
            试用中
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner overflow-hidden"
            style={{ backgroundColor: subscription.color }}
          >
            {subscription.icon ? (
              <img 
                src={subscription.icon} 
                alt={subscription.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              subscription.name.charAt(0)
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{subscription.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subscription.category}</p>
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            ref={buttonRef}
            onClick={toggleMenu}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: openUpwards ? 10 : -10 }}
                className={cn(
                  "absolute right-0 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-40 py-1 overflow-hidden",
                  openUpwards ? "bottom-full mb-2" : "top-full mt-2"
                )}
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
