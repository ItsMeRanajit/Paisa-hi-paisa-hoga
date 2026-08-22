import React from 'react';
import { Home, Landmark, CreditCard, Target, BarChart2, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useFinanceStore } from '../../store/useFinanceStore';
import { NavigationTab } from '../../types/finance';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'banks', label: 'Banks', icon: Landmark },
  { id: 'credit_cards', label: 'Cards', icon: CreditCard },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'analysis', label: 'Analysis', icon: BarChart2 },
  { id: 'profile', label: 'Profile', icon: User },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinanceStore();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 block sm:hidden bg-[#0c0e12]/95 border-t border-[#1c212b] backdrop-blur-lg pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors cursor-pointer min-w-[50px]',
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Icon className={clsx('h-4.5 w-4.5', isActive && 'text-white')} />
              <span className={clsx('mt-1 text-[10px] font-medium', isActive ? 'text-zinc-100 font-semibold' : 'text-zinc-400')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const DesktopNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinanceStore();

  return (
    <nav className="hidden sm:flex items-center gap-1 bg-[#13161c] p-1 rounded-xl border border-[#222731]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
              isActive
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
