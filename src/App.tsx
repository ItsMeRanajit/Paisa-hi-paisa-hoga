import React from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { BankWorkspace } from './components/banks/BankWorkspace';
import { CreditCardsPage } from './components/credit-cards/CreditCardsPage';
import { GoalsPage } from './components/goals/GoalsPage';
import { AnalysisDashboard } from './components/analysis/AnalysisDashboard';
import { ProfilePage } from './components/profile/ProfilePage';

export function App() {
  const { activeTab } = useFinanceStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome />;
      case 'banks':
        return <BankWorkspace />;
      case 'credit_cards':
        return <CreditCardsPage />;
      case 'goals':
        return <GoalsPage />;
      case 'analysis':
        return <AnalysisDashboard />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardHome />;
    }
  };

  return <AppLayout>{renderActiveView()}</AppLayout>;
}

export default App;
