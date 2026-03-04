/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Search, Bell, LayoutDashboard, CreditCard, PieChart as PieIcon, Settings, User, Download, Upload, Edit3, Calendar as CalendarIcon, Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subscription, SpendingStats, UserProfile } from './types';
import { SubscriptionCard } from './components/SubscriptionCard';
import { StatsOverview } from './components/StatsOverview';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { SettingsModal } from './components/SettingsModal';
import { CalendarView } from './components/CalendarView';
import { TrendsChart } from './components/TrendsChart';
import { cn } from './lib/utils';
import { convertToBase } from './lib/currency';
import { format, addMonths } from 'date-fns';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subtrack_subscriptions',
  USER_PROFILE: 'subtrack_user_profile'
};

const DEFAULT_USER: UserProfile = {
  name: '用户',
  email: 'user@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  theme: 'system',
  baseCurrency: 'CNY'
};

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 45,
    currency: 'CNY',
    cycle: 'monthly',
    startDate: '2024-01-15',
    nextBillingDate: '2024-03-15',
    status: 'active',
    category: '娱乐',
    color: '#E50914'
  },
  {
    id: '2',
    name: 'Spotify',
    price: 15,
    currency: 'CNY',
    cycle: 'monthly',
    startDate: '2024-02-01',
    nextBillingDate: '2024-04-01',
    status: 'active',
    category: '娱乐',
    color: '#1DB954'
  },
  {
    id: '3',
    name: 'ChatGPT Plus',
    price: 140,
    currency: 'CNY',
    cycle: 'monthly',
    startDate: '2023-12-10',
    nextBillingDate: '2024-03-10',
    status: 'active',
    category: '生产力',
    color: '#10A37F'
  },
  {
    id: '4',
    name: 'iCloud+',
    price: 6,
    currency: 'CNY',
    cycle: 'monthly',
    startDate: '2023-05-20',
    nextBillingDate: '2024-03-20',
    status: 'active',
    category: '生活',
    color: '#007AFF'
  },
  {
    id: '5',
    name: '百度网盘',
    price: 30,
    currency: 'CNY',
    cycle: 'monthly',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    nextBillingDate: '2024-01-01',
    status: 'expired',
    category: '生产力',
    color: '#0066FF'
  }
];

type TabType = 'dashboard' | 'subscriptions' | 'profile';

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return saved ? JSON.parse(saved) : MOCK_SUBSCRIPTIONS;
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'cancelled' | 'expired'>('all');
  const [currentTab, setCurrentTab] = useState<TabType | 'calendar'>('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
    
    const root = document.documentElement;
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', isDark);
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme(userProfile.theme);

    if (userProfile.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [userProfile.theme]);

  const stats = useMemo<SpendingStats>(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    
    const monthlyTotal = activeSubs.reduce((acc, s) => {
      const priceInBase = convertToBase(s.price, s.currency, userProfile.baseCurrency);
      switch (s.cycle) {
        case 'monthly': return acc + priceInBase;
        case 'quarterly': return acc + priceInBase / 3;
        case 'semi-annually': return acc + priceInBase / 6;
        case 'yearly': return acc + priceInBase / 12;
        default: return acc;
      }
    }, 0);

    // Category Breakdown
    const categoryMap = new Map<string, { value: number; color: string }>();
    activeSubs.forEach(s => {
      let monthlyPrice = 0;
      const priceInBase = convertToBase(s.price, s.currency, userProfile.baseCurrency);
      switch (s.cycle) {
        case 'monthly': monthlyPrice = priceInBase; break;
        case 'quarterly': monthlyPrice = priceInBase / 3; break;
        case 'semi-annually': monthlyPrice = priceInBase / 6; break;
        case 'yearly': monthlyPrice = priceInBase / 12; break;
      }
      const existing = categoryMap.get(s.category) || { value: 0, color: s.color };
      categoryMap.set(s.category, { 
        value: existing.value + monthlyPrice, 
        color: existing.color 
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color
    }));

    // Item Breakdown
    const itemBreakdown = activeSubs.map(s => {
      let monthlyPrice = 0;
      const priceInBase = convertToBase(s.price, s.currency, userProfile.baseCurrency);
      switch (s.cycle) {
        case 'monthly': monthlyPrice = priceInBase; break;
        case 'quarterly': monthlyPrice = priceInBase / 3; break;
        case 'semi-annually': monthlyPrice = priceInBase / 6; break;
        case 'yearly': monthlyPrice = priceInBase / 12; break;
      }
      return {
        name: s.name,
        value: monthlyPrice,
        color: s.color
      };
    }).sort((a, b) => b.value - a.value);

    // Trends (Next 6 months)
    const trends = Array.from({ length: 6 }).map((_, i) => {
      const date = addMonths(new Date(), i);
      const monthStr = format(date, 'MMM');
      return { month: monthStr, amount: monthlyTotal }; // Simplified for now
    });
    
    return {
      monthlyTotal,
      yearlyTotal: monthlyTotal * 12,
      activeCount: activeSubs.length,
      categoryBreakdown,
      itemBreakdown,
      trends
    };
  }, [subscriptions, userProfile.baseCurrency]);

  const categories = useMemo(() => {
    const allCats = subscriptions.map(s => s.category);
    return Array.from(new Set(allCats));
  }, [subscriptions]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || sub.status === activeTab;
      const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory;
      return matchesSearch && matchesTab && matchesCategory;
    });
  }, [subscriptions, searchQuery, activeTab, selectedCategory]);

  const handleSaveSubscription = (data: Omit<Subscription, 'id'> | Subscription) => {
    if ('id' in data) {
      setSubscriptions(subs => subs.map(s => s.id === data.id ? (data as Subscription) : s));
    } else {
      const subWithId: Subscription = {
        ...data,
        id: Math.random().toString(36).substr(2, 9)
      } as Subscription;
      setSubscriptions([...subscriptions, subWithId]);
    }
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条订阅记录吗？')) {
      setSubscriptions(subs => subs.filter(s => s.id !== id));
    }
  };

  const handleStatusChange = (id: string, status: Subscription['status']) => {
    setSubscriptions(subs => subs.map(s => s.id === id ? { ...s, status } : s));
  };

  const openAddModal = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    const data = JSON.stringify({ subscriptions, userProfile }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.subscriptions && Array.isArray(data.subscriptions)) {
          setSubscriptions(data.subscriptions);
          if (data.userProfile) setUserProfile(data.userProfile);
          alert('数据导入成功！');
        } else {
          alert('无效的备份文件格式');
        }
      } catch (err) {
        alert('解析备份文件失败');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可撤销。')) {
      localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      setSubscriptions([]);
      setUserProfile(DEFAULT_USER);
      alert('所有数据已清除');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SubTrack</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
                const nextTheme = themes[(themes.indexOf(userProfile.theme) + 1) % themes.length];
                setUserProfile(p => ({ ...p, theme: nextTheme }));
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center gap-1"
              title={`当前模式: ${userProfile.theme === 'system' ? '自动' : userProfile.theme === 'dark' ? '深色' : '浅色'}`}
            >
              {userProfile.theme === 'light' ? <Sun size={20} /> : userProfile.theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
              <span className="text-[10px] font-bold uppercase hidden sm:inline">
                {userProfile.theme === 'system' ? 'Auto' : userProfile.theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </button>
            <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">总览</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">您的订阅支出概况</p>
                </div>
              </div>
              <StatsOverview stats={stats} currency={userProfile.baseCurrency} />
              <TrendsChart data={stats.trends} currency={userProfile.baseCurrency} />
            </motion.div>
          )}

          {currentTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">续费日历</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">直观管理您的扣款计划</p>
              </div>
              <CalendarView subscriptions={subscriptions} />
            </motion.div>
          )}

          {currentTab === 'subscriptions' && (
            <motion.div
              key="subscriptions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">订阅列表</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">管理您的所有服务</p>
                </div>
                <button 
                  onClick={openAddModal}
                  className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="搜索订阅..."
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl w-full overflow-x-auto no-scrollbar">
                    {(['all', 'active', 'paused', 'cancelled', 'expired'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-1",
                          activeTab === tab 
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                      >
                        {tab === 'all' ? '全部' : tab === 'active' ? '活跃' : tab === 'paused' ? '暂停' : tab === 'cancelled' ? '取消' : '过期'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                        selectedCategory === 'all' 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-300"
                      )}
                    >
                      所有分类
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                          selectedCategory === cat 
                            ? "bg-blue-600 border-blue-600 text-white" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-300"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubscriptions.map((sub) => (
                    <SubscriptionCard 
                      key={sub.id} 
                      subscription={sub} 
                      onStatusChange={handleStatusChange}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                        <Search size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">未找到相关订阅</h3>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="text-center pt-8">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden mx-auto">
                    <img src={userProfile.avatar} alt="Avatar" referrerPolicy="no-referrer" />
                  </div>
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{userProfile.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{userProfile.email}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><User size={18} /></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">编辑个人资料</span>
                  </div>
                </div>
                
                <div 
                  onClick={handleExport}
                  className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><Download size={18} /></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">导出数据备份</span>
                  </div>
                  <span className="text-xs text-slate-400">JSON</span>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"><Upload size={18} /></div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">导入数据备份</span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleImport} 
                  />
                </div>

                <div 
                  onClick={handleClearData}
                  className="p-4 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40"><Plus size={18} className="rotate-45" /></div>
                    <span className="font-medium text-rose-600 dark:text-rose-400">清除所有数据</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40 pb-safe">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-around">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              currentTab === 'dashboard' ? "text-blue-600" : "text-slate-400 dark:text-slate-500"
            )}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">总览</span>
          </button>
          <button 
            onClick={() => setCurrentTab('subscriptions')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              currentTab === 'subscriptions' ? "text-blue-600" : "text-slate-400 dark:text-slate-500"
            )}
          >
            <CreditCard size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">订阅</span>
          </button>
          <button 
            onClick={() => setCurrentTab('calendar')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              currentTab === 'calendar' ? "text-blue-600" : "text-slate-400 dark:text-slate-500"
            )}
          >
            <CalendarIcon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">日历</span>
          </button>
          <button 
            onClick={() => setCurrentTab('profile')}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              currentTab === 'profile' ? "text-blue-600" : "text-slate-400 dark:text-slate-500"
            )}
          >
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">我的</span>
          </button>
        </div>
      </nav>

      <AddSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveSubscription}
        initialData={editingSubscription}
      />

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={setUserProfile}
        initialData={userProfile}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={setUserProfile}
        initialData={userProfile}
      />
    </div>
  );
}
