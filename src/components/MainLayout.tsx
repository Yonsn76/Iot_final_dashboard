import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { AdminDashboard } from './AdminDashboard';
import { SensorsPage } from './SensorsPage';
import { AnalyticsPage } from './AnalyticsPage';
import { AlertsPage } from './AlertsPage';
import { NotificationsPage } from './NotificationsPage';
import { SettingsPage } from './SettingsPage';
import { notificationService } from '../services/notificationService';

export const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Request notification permission on app startup
  useEffect(() => {
    const requestNotificationPermission = async () => {
      // Check if permission is already granted
      if ('Notification' in window && Notification.permission === 'default') {
        console.log('Requesting notification permission on app startup...');
        try {
          const granted = await notificationService.requestPermission();
          if (granted) {
            console.log('Notification permission granted on startup');
          } else {
            console.log('Notification permission denied on startup');
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
      }
    };

    requestNotificationPermission();
  }, []);

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
