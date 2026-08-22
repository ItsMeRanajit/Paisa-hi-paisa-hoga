import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { ToastContainer } from './ToastContainer';
import { QuickActionModal } from './QuickActionModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-200 flex flex-col antialiased selection:bg-zinc-800 selection:text-white">
      {/* Top Navbar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 safe-bottom-padding">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Quick Action Modal */}
      <QuickActionModal />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
