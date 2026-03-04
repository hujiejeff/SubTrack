import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subscription } from '../types';
import { cn } from '../lib/utils';

interface CalendarViewProps {
  subscriptions: Subscription[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ subscriptions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getSubscriptionsForDay = (day: Date) => {
    return subscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      
      const start = new Date(sub.startDate);
      const currentDay = day;
      
      // If the day is before the start date, it's not billing yet
      if (currentDay < start) return false;
      
      // If there's an end date and we're past it
      if (sub.endDate && currentDay > new Date(sub.endDate)) return false;

      const startDay = start.getDate();
      const currentDayOfMonth = currentDay.getDate();
      const lastDayOfMonth = endOfMonth(currentDay).getDate();

      const isBillingDay = currentDayOfMonth === startDay || (startDay > lastDayOfMonth && currentDayOfMonth === lastDayOfMonth);

      if (!isBillingDay) return false;

      // Check cycle frequency
      const monthsDiff = (currentDay.getFullYear() - start.getFullYear()) * 12 + (currentDay.getMonth() - start.getMonth());
      
      switch (sub.cycle) {
        case 'monthly':
          return true;
        case 'quarterly':
          return monthsDiff % 3 === 0;
        case 'semi-annually':
          return monthsDiff % 6 === 0;
        case 'yearly':
          return monthsDiff % 12 === 0;
        default:
          return false;
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {format(currentDate, 'yyyy年 MMMM', { locale: zhCN })}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">查看本月续费提醒</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-50 dark:border-slate-800">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const daySubs = getSubscriptionsForDay(day);
          const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
          
          return (
            <div 
              key={day.toString()} 
              className={cn(
                "min-h-[100px] p-2 border-r border-b border-slate-50 dark:border-slate-800 last:border-r-0 transition-colors",
                !isCurrentMonth && "bg-slate-50/50 dark:bg-slate-900/50",
                isToday(day) && "bg-blue-50/30 dark:bg-blue-900/10"
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  !isCurrentMonth ? "text-slate-300 dark:text-slate-700" : "text-slate-600 dark:text-slate-400",
                  isToday(day) && "text-blue-600 dark:text-blue-400 font-bold"
                )}>
                  {format(day, 'd')}
                </span>
                {daySubs.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                )}
              </div>
              
              <div className="space-y-1">
                {daySubs.slice(0, 3).map(sub => (
                  <div 
                    key={sub.id}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate text-white"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.name}
                  </div>
                ))}
                {daySubs.length > 3 && (
                  <div className="text-[10px] text-slate-400 pl-1">
                    +{daySubs.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
