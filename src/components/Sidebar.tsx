import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Database,
  AlertTriangle,
  TrendingUp,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { themeMode } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analytics', label: 'Análisis', icon: TrendingUp },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'sensors', label: 'Registros', icon: Database },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleMenuClick = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 glass-effect"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-80 glass-effect border-r border-white/30 shadow-2xl hover:shadow-3xl
        transition-all duration-500 lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-8 border-b border-white/30 dark:border-gray-600/30">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg overflow-hidden rounded-xl">
                  <img 
                    src="/logo.jpg" 
                    alt="SensorSP Logo" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900 dark:text-white">
                    SensorSP
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Centro de Administración del Sensor IoT
                  </p>
                </div>
              </div>
              
              {/* Mobile Close Button */}
              <button
                className="lg:hidden p-2 rounded-lg glass-effect hover:bg-white/40 dark:hover:bg-black/40"
                onClick={() => setIsMobileOpen(false)}
              >
                <X size={18} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4">
            <div className="flex items-center space-x-3 p-3 glass-effect rounded-lg">
                             <div className="w-10 h-10 glass-effect flex items-center justify-center">
                 <User size={18} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
               </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {user?.username}
                </p>
                                 <p className="text-xs text-black dark:text-white capitalize">
                   {user?.role}
                 </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      className={`
                        w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                        ${isActive 
                          ? 'bg-blue-600 text-white dark:text-white' 
                          : 'text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40'
                        }
                      `}
                      onClick={() => handleMenuClick(item.id)}
                    >
                      <Icon size={20} className={isActive ? 'text-white' : themeMode === 'light' ? 'text-black' : 'text-white'} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
            {/* Theme Toggle */}
            <div className="flex justify-center">
              <ThemeToggle />
            </div>

            {/* Logout Button */}
            <button
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors duration-200"
              onClick={logout}
            >
              <LogOut size={20} className="text-red-600 dark:text-red-400" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};