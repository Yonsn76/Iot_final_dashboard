import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Save, Trash2, Plus, Thermometer, Droplets, Fan, Zap, CheckCircle, XCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService, type Notification, type NotificationRule } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificationsPage: React.FC = () => {
  const { themeMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'rules' | 'notifications'>('rules');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationStats, setNotificationStats] = useState(notificationService.getNotificationStats());

  // Load notifications
  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationService.getNotifications());
      setNotificationStats(notificationService.getNotificationStats());
    };

    // Initial load
    updateNotifications();

    // Listen for new notifications
    notificationService.addListener(() => {
      updateNotifications();
    });

    // Update every 10 seconds
    const interval = setInterval(updateNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    setNotifications(notificationService.getNotifications());
    setNotificationStats(notificationService.getNotificationStats());
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getNotifications());
    setNotificationStats(notificationService.getNotificationStats());
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
    setNotifications(notificationService.getNotifications());
    setNotificationStats(notificationService.getNotificationStats());
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
    setNotifications([]);
    setNotificationStats(notificationService.getNotificationStats());
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle size={16} className="text-black dark:text-white" />;
      case 'high': return <AlertTriangle size={16} className="text-black dark:text-white" />;
      case 'medium': return <Info size={16} className="text-black dark:text-white" />;
      case 'low': return <Info size={16} className="text-black dark:text-white" />;
      default: return <Info size={16} className="text-black dark:text-white" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-white/30 bg-white/5';
      case 'high': return 'border-white/30 bg-white/5';
      case 'medium': return 'border-white/30 bg-white/5';
      case 'low': return 'border-white/30 bg-white/5';
      default: return 'border-white/30 bg-white/5';
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl shadow-blue-500/30 mb-4">
          <Bell size={32} className="text-white" />
        </div>
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent">
          Notificaciones
        </h1>
        <p className="text-gray-800 dark:text-gray-400 max-w-2xl mx-auto">
          Gestiona las reglas de notificación y revisa las alertas del sistema
        </p>
        
                 {/* Action Buttons */}
         <div className="flex justify-center space-x-4">
           <button
             onClick={async () => {
               const granted = await notificationService.requestPermission();
               if (granted) {
                 alert('¡Permisos de notificación concedidos! Ahora recibirás alertas del navegador.');
               } else {
                 alert('Los permisos de notificación fueron denegados. Puedes habilitarlos manualmente en la configuración del navegador.');
               }
             }}
             className="px-6 py-3 glass-effect border border-white/30 text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40 font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
           >
             <Bell size={20} />
             <span>Habilitar Notificaciones del Navegador</span>
           </button>
           
           <button
             onClick={() => {
               // Clear localStorage and reload rules
               localStorage.removeItem('notificationRules');
               localStorage.removeItem('notifications');
               notificationService.reloadRules();
               // Refresh the page to update UI
               setTimeout(() => window.location.reload(), 500);
             }}
             className="px-6 py-3 glass-effect border border-white/30 text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40 font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
           >
             <RefreshCw size={20} />
             <span>Reiniciar Reglas</span>
           </button>
         </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {/* Test Buttons */}
           <div className="col-span-full flex justify-center mb-4 space-x-4">
             <button
               onClick={() => {
                 // Create a test notification
                 if ('Notification' in window && Notification.permission === 'granted') {
                   new Notification('Prueba de Notificación', {
                     body: '¡El sistema de notificaciones está funcionando correctamente!',
                     icon: '/favicon.ico',
                     tag: 'test-notification'
                   });
                 } else {
                   alert('Primero debes habilitar los permisos de notificación del navegador.');
                 }
               }}
               className="px-6 py-3 glass-effect border border-white/30 text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40 font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
             >
               <Bell size={20} />
               <span>Probar Notificación</span>
             </button>
             
             <button
               onClick={() => {
                 // Test notification rules with sample data
                 const testSensorData = {
                   _id: 'test-sensor-123',
                   temperatura: 40, // High temperature to trigger rules
                   humedad: 85, // High humidity to trigger rules
                   estado: 'critico', // Critical status to trigger rules
                   actuador: 'ventilador',
                   fecha: new Date().toISOString()
                 };
                 
                 console.log('Testing notification rules with sample data:', testSensorData);
                 notificationService.evaluateSensorData(testSensorData as any);
                 alert('Reglas de notificación probadas con datos de ejemplo. Revisa la consola para ver los logs.');
               }}
               className="px-6 py-3 glass-effect border border-white/30 text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40 font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
             >
               <AlertTriangle size={20} />
               <span>Probar Reglas</span>
             </button>
           </div>
                     <div className="glass-effect p-6 border border-white/30 rounded-2xl shadow-xl">
             <div className="flex items-center justify-between">
               <div className="w-12 h-12 glass-effect border border-white/30 rounded-2xl flex items-center justify-center">
                 <Bell size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
               </div>
               <div className="text-right">
                 <p className="text-3xl font-black text-black dark:text-white">
                   {notificationStats.total}
                 </p>
                 <p className="text-sm font-semibold text-black dark:text-gray-400">Total</p>
               </div>
             </div>
           </div>

                     <div className="glass-effect p-6 border border-white/30 rounded-2xl shadow-xl">
             <div className="flex items-center justify-between">
               <div className="w-12 h-12 glass-effect border border-white/30 rounded-2xl flex items-center justify-center">
                 <AlertTriangle size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
               </div>
               <div className="text-right">
                 <p className="text-3xl font-black text-black dark:text-white">
                   {notificationStats.unread}
                 </p>
                 <p className="text-sm font-semibold text-black dark:text-gray-400">Sin Leer</p>
               </div>
             </div>
           </div>

                     <div className="glass-effect p-6 border border-white/30 rounded-2xl shadow-xl">
             <div className="flex items-center justify-between">
               <div className="w-12 h-12 glass-effect border border-white/30 rounded-2xl flex items-center justify-center">
                 <AlertTriangle size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
               </div>
               <div className="text-right">
                 <p className="text-3xl font-black text-black dark:text-white">
                   {notificationStats.byPriority.critical + notificationStats.byPriority.high}
                 </p>
                 <p className="text-sm font-semibold text-black dark:text-gray-400">Críticas/Altas</p>
               </div>
             </div>
           </div>

                     <div className="glass-effect p-6 border border-white/30 rounded-2xl shadow-xl">
             <div className="flex items-center justify-between">
               <div className="w-12 h-12 glass-effect border border-white/30 rounded-2xl flex items-center justify-center">
                 <CheckCircle size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
               </div>
               <div className="text-right">
                 <p className="text-3xl font-black text-black dark:text-white">
                   {notificationStats.total - notificationStats.unread}
                 </p>
                 <p className="text-sm font-semibold text-black dark:text-gray-400">Leídas</p>
               </div>
             </div>
           </div>
        </div>

                 {/* Tabs */}
         <div className="flex space-x-2 p-2 glass-effect rounded-2xl border border-white/30">
           <button
             onClick={() => setActiveTab('rules')}
             className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
               activeTab === 'rules'
                 ? 'bg-white/40 dark:bg-black/40 text-black dark:text-white shadow-lg'
                 : 'text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20'
             }`}
           >
             <div className="flex items-center justify-center space-x-2">
               <Settings size={20} />
               <span>Reglas de Notificación</span>
             </div>
           </button>
           
           <button
             onClick={() => setActiveTab('notifications')}
             className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
               activeTab === 'notifications'
                 ? 'bg-white/40 dark:bg-black/40 text-black dark:text-white shadow-lg'
                 : 'text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20'
             }`}
           >
             <div className="flex items-center justify-center space-x-2">
               <Bell size={20} />
               <span>Alertas del Sistema</span>
               {notificationStats.unread > 0 && (
                 <span className="glass-effect border border-white/30 text-black dark:text-white text-xs px-2 py-1 rounded-full">
                   {notificationStats.unread}
                 </span>
               )}
             </div>
           </button>
         </div>

        {/* Content */}
        {activeTab === 'rules' ? (
          <NotificationSettings />
        ) : (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Alertas del Sistema
              </h3>
                             <div className="flex space-x-3">
                 <button
                   onClick={handleMarkAllAsRead}
                   className="px-4 py-2 glass-effect text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40 rounded-lg transition-all duration-200 flex items-center space-x-2"
                 >
                   <CheckCircle size={16} />
                   <span>Marcar Todo como Leído</span>
                 </button>
                 <button
                   onClick={handleClearAll}
                   className="px-4 py-2 glass-effect text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40 rounded-lg transition-all duration-200 flex items-center space-x-2"
                 >
                   <Trash2 size={16} />
                   <span>Limpiar Todo</span>
                 </button>
               </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12 glass-effect border border-white/30 rounded-xl">
                  <BellOff size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No hay notificaciones
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Las notificaciones aparecerán aquí cuando se activen las reglas
                  </p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`glass-effect border rounded-xl p-4 transition-all duration-300 ${
                      notification.read ? 'opacity-60' : 'shadow-lg'
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getPriorityIcon(notification.priority)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className={`font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                              {notification.ruleName}
                            </h4>
                                                         <span className="px-2 py-1 rounded-full text-xs font-medium glass-effect border border-white/30 text-black dark:text-white">
                               {notification.priority.toUpperCase()}
                             </span>
                                                         {!notification.read && (
                               <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></span>
                             )}
                          </div>
                          
                          <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-gray-300'} mb-2`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Sensor: {notification.sensorData._id.slice(-8)}</span>
                            <span>Temp: {notification.sensorData.temperatura}°C</span>
                            <span>Humedad: {notification.sensorData.humedad}%</span>
                            <span>Estado: {notification.sensorData.estado}</span>
                            <span>Hace: {formatDistanceToNow(notification.timestamp, { locale: es, addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      
                                             <div className="flex items-center space-x-2 ml-4">
                         {!notification.read && (
                           <button
                             onClick={() => handleMarkAsRead(notification.id)}
                             className="p-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                             title="Marcar como leído"
                           >
                             <CheckCircle size={16} />
                           </button>
                         )}
                         
                         <button
                           onClick={() => handleDeleteNotification(notification.id)}
                           className="p-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                           title="Eliminar notificación"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Import the NotificationSettings component
import { NotificationSettings } from './NotificationSettings';
