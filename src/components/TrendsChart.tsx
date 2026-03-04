import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { getCurrencySymbol } from '../lib/currency';

interface TrendsChartProps {
  data: { month: string; amount: number }[];
  currency: string;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ data, currency }) => {
  const symbol = getCurrencySymbol(currency);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">支出趋势</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">未来 6 个月的预估支出变化</p>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => `${symbol}${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: 'none', 
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`${symbol}${value.toFixed(2)}`, '预估支出']}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
