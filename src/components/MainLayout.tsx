import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AdminDashboard } from './AdminDashboard';
import { SensorsPage } from './SensorsPage';
import { AnalyticsPage } from './AnalyticsPage';
import { AlertsPage } from './AlertsPage';
import { NotificationsPage } from './NotificationsPage';
import { SettingsPage } from './SettingsPage';

export const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Listen for navigation events from dashboard
  React.useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setCurrentPage(event.detail);
    };

    window.addEventListener('navigateTo', handleNavigate as EventListener);
    return () => window.removeEventListener('navigateTo', handleNavigate as EventListener);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'sensors':
        return <SensorsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 lg:ml-80 min-h-screen">
        {renderCurrentPage()}
      </main>
    </div>
  );
};
