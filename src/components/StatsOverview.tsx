import React, { useState } from 'react';
import { CreditCard, Calendar, TrendingUp, PieChart as PieIcon, List, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SpendingStats } from '../types';
import { cn } from '../lib/utils';
import { getCurrencySymbol } from '../lib/currency';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface StatsOverviewProps {
  stats: SpendingStats;
  currency: string;
  exchangeRateUpdate?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, currency, exchangeRateUpdate }) => {
  const [breakdownType, setBreakdownType] = useState<'category' | 'item'>('category');
  const symbol = getCurrencySymbol(currency);

  const chartData = breakdownType === 'category' ? stats.categoryBreakdown : stats.itemBreakdown;

  return (
    <div className="space-y-6 mb-8">
      {exchangeRateUpdate && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-[10px] text-blue-600 dark:text-blue-400 font-medium">
          <RefreshCw size={12} className="animate-spin-slow" />
          实时汇率已更新 ({new Date(exchangeRateUpdate).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })})
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <CreditCard size={20} />
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">月度支出</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{symbol}{stats.monthlyTotal.toFixed(2)}</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">/ 月</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">年度预估</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{symbol}{stats.yearlyTotal.toFixed(2)}</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">/ 年</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <List size={20} />
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">活跃订阅</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeCount}</h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">个</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <Calendar size={20} />
            </div>
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">下个扣款日</span>
          </div>
          <div>
            {stats.upcomingSubscription ? (
              <>
                <h3 className="text-xl font-semibold">
                  {format(parseISO(stats.upcomingSubscription.nextBillingDate), 'M月 d日', { locale: zhCN })}
                </h3>
                <p className="text-sm text-white/60 mt-1 truncate">
                  {stats.upcomingSubscription.name} 续费 {symbol}{stats.upcomingSubscription.price.toFixed(2)}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold">暂无计划</h3>
                <p className="text-sm text-white/60 mt-1">没有活跃的订阅</p>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
              <PieIcon size={18} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">支出明细</h3>
          </div>
          
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button 
              onClick={() => setBreakdownType('category')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                breakdownType === 'category' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <PieIcon size={14} />
              按分类
            </button>
            <button 
              onClick={() => setBreakdownType('item')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                breakdownType === 'item' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <List size={14} />
              按项目
            </button>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${symbol}${value.toFixed(2)}`, '月支出']}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  backgroundColor: '#1e293b',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed List with Icons */}
        <div className="mt-6 space-y-3">
          {chartData.map((item, index) => {
            const percentage = ((item.value / stats.monthlyTotal) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon ? (
                      <img src={item.icon} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      item.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{percentage}% 的支出</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{symbol}{item.value.toFixed(2)}</p>
                  <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ backgroundColor: item.color, width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
