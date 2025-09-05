import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Trash2, Filter, Bell, Activity } from 'lucide-react';
import { sensorApi } from '../services/sensorApi';
import { settingsService } from '../services/settingsService';
import type { SensorData } from '../types/sensor';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';

interface Alert {
  id: string;
  sensorId: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
  sensorData: SensorData;
}

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(settingsService.getRefreshInterval());
  const { themeMode } = useTheme();

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      const newInterval = settingsService.getRefreshInterval();
      setRefreshInterval(newInterval);
      console.log('Alerts settings changed, new refresh interval:', newInterval);
    };
    
    settingsService.addListener(handleSettingsChange);
    
    return () => {
      settingsService.removeListener(handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    generateAlertsFromSensorData();
    
    // Auto-refresh alerts using settings interval
    const refreshIntervalMs = refreshInterval * 1000; // Convert to milliseconds
    console.log(`Setting up alerts auto-refresh interval: ${refreshIntervalMs}ms (${refreshInterval}s)`);
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing alerts...');
      generateAlertsFromSensorData();
    }, refreshIntervalMs);
    
    return () => {
      console.log('Clearing alerts auto-refresh interval');
      clearInterval(interval);
    };
  }, [refreshInterval]); // Re-run when refresh interval changes

  const generateAlertsFromSensorData = async () => {
    try {
      setIsLoading(true);
      const sensors = await sensorApi.getAllSensors();
      const generatedAlerts: Alert[] = [];

      sensors.forEach(sensor => {
        // Critical alerts - based on estado
        if (sensor.estado === 'critico') {
          generatedAlerts.push({
            id: `${sensor._id}-critical-${Date.now()}`,
            sensorId: sensor._id,
            type: 'critical',
            message: `🚨 ESTADO CRÍTICO: Temperatura ${sensor.temperatura}°C, Humedad ${sensor.humedad}% - Sensor ${sensor._id.slice(-8)}`,
            timestamp: sensor.fecha,
            read: false, // Critical alerts are always unread initially
            sensorData: sensor
          });
        } 
        // Warning alerts - based on estado
        else if (sensor.estado === 'alto' || sensor.estado === 'bajo') {
          generatedAlerts.push({
            id: `${sensor._id}-warning-${Date.now()}`,
            sensorId: sensor._id,
            type: 'warning',
            message: `⚠️ VALOR ${sensor.estado.toUpperCase()}: Temperatura ${sensor.temperatura}°C, Humedad ${sensor.humedad}% - Sensor ${sensor._id.slice(-8)}`,
            timestamp: sensor.fecha,
            read: Math.random() > 0.3, // 70% chance of being unread
            sensorData: sensor
          });
        } 
        // Info alerts - based on actuator activation
        else if (sensor.actuador && sensor.actuador !== 'ninguno' && sensor.actuador !== 'Ninguno') {
          generatedAlerts.push({
            id: `${sensor._id}-info-${Date.now()}`,
            sensorId: sensor._id,
            type: 'info',
            message: `ℹ️ ACTUADOR ACTIVADO: ${sensor.actuador} - Temp ${sensor.temperatura}°C, Humedad ${sensor.humedad}% - Sensor ${sensor._id.slice(-8)}`,
            timestamp: sensor.fecha,
            read: Math.random() > 0.5, // 50% chance of being unread
            sensorData: sensor
          });
        }
        
        // Additional alerts based on temperature thresholds
        if (sensor.temperatura > 40) {
          generatedAlerts.push({
            id: `${sensor._id}-temp-critical-${Date.now()}`,
            sensorId: sensor._id,
            type: 'critical',
            message: `🔥 TEMPERATURA CRÍTICA: ${sensor.temperatura}°C - Sensor ${sensor._id.slice(-8)}`,
            timestamp: sensor.fecha,
            read: false, // Critical alerts are always unread
            sensorData: sensor
          });
        } else if (sensor.temperatura > 35) {
          generatedAlerts.push({
            id: `${sensor._id}-temp-high-${Date.now()}`,
            sensorId: sensor._id,
            type: 'warning',
            message: `🌡️ TEMPERATURA ALTA: ${sensor.temperatura}°C - Sensor ${sensor._id.slice(-8)}`,
            timestamp: sensor.fecha,
            read: Math.random() > 0.4,
            sensorData: sensor
          });
        } else if (sensor.temperatura < 10) {
          generatedAlerts.push({
            id: `${sensor._id}-temp-low-${Date.now()}`,
            sensorId: sensor._id,
            type: 'warning',
            message: `❄️ TEMPERATURA BAJA: ${sensor.temperatura}°C - Sensor ${sensor._id.slice(-8)}`,
            timestamp: sensor.fecha,
            read: Math.random() > 0.4,
            sensorData: sensor
          });
        }
        
        // Additional alerts based on humidity thresholds
        if (sensor.humedad > 90) {
          generatedAlerts.push({
            id: `${sensor._id}-humidity-critical-${Date.now()}`,
            sensorId: sensor._id,
            type: 'critical',
            message: `💧 HUMEDAD CRÍTICA: ${sensor.humedad}% - Sensor ${sensor._id.slice(-8)}`,
            timestamp: sensor.fecha,
            read: false, // Critical alerts are always unread
            sensorData: sensor
          });
        } else if (sensor.humedad > 80) {
          generatedAlerts.push({
            id: `${sensor._id}-humidity-high-${Date.now()}`,
            sensorId: sensor._id,
            type: 'warning',
            message: `💧 HUMEDAD ALTA: ${sensor.humedad}% - Sensor ${sensor._id.slice(-8)}`,
            timestamp: sensor.fecha,
            read: Math.random() > 0.4,
            sensorData: sensor
          });
        } else if (sensor.humedad < 20) {
          generatedAlerts.push({
            id: `${sensor._id}-humidity-low-${Date.now()}`,
            sensorId: sensor._id,
            type: 'warning',
            message: `🏜️ HUMEDAD BAJA: ${sensor.humedad}% - Sensor ${sensor._id.slice(-8)}`,
            timestamp: sensor.fecha,
            read: Math.random() > 0.4,
            sensorData: sensor
          });
        }
      });

             // Sort by timestamp (most recent first) - Show ALL alerts, no duplicates removal
       generatedAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
       setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error generating alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.read;
    if (filter === 'critical') return alert.type === 'critical';
    return true;
  });

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle size={20} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'info': return <CheckCircle size={20} className="text-blue-500" />;
              default: return <Clock size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />;
    }
  };

  const getAlertStyle = (type: string, read: boolean) => {
    const baseStyle = "relative p-6 rounded-2xl border transition-all duration-300 ";
    const readStyle = read ? "opacity-75 " : "";
    
    switch (type) {
      case 'critical':
        return baseStyle + readStyle + "bg-red-50/70 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30 backdrop-blur-sm";
      case 'warning':
        return baseStyle + readStyle + "bg-yellow-50/70 dark:bg-yellow-900/20 border-yellow-200/50 dark:border-yellow-800/30 backdrop-blur-sm";
      case 'info':
        return baseStyle + readStyle + "bg-blue-50/70 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm";
      default:
        return baseStyle + readStyle + "glass-effect backdrop-blur-sm";
    }
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical').length;

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 glass-effect border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 mb-4">
                          <AlertTriangle size={32} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-black dark:text-white">
          Centro de Alertas
        </h1>
        <p className="text-black dark:text-white max-w-2xl mx-auto">
          Gestiona las notificaciones y alertas del sistema IoT
        </p>
        
        {/* Refresh Interval Indicator */}
        <div className="flex items-center justify-center space-x-2 px-4 py-2 glass-effect border border-white/30 rounded-xl">
          <Activity size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Actualización automática cada {refreshInterval} segundos
          </span>
        </div>
        
        <div className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'} opacity-75`}>
          Última actualización: {alerts.length > 0 ? format(new Date(alerts[0]?.timestamp), 'dd/MM/yyyy HH:mm:ss') : 'N/A'}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-effect border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 text-center">
          <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Bell size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
          </div>
          <p className="text-3xl font-bold text-black dark:text-white mb-1">
            {alerts.length}
          </p>
          <p className="text-sm text-black dark:text-white">Total de Alertas</p>
        </div>
        
        <div className="glass-effect border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 text-center">
          <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <CheckCircle size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
          </div>
          <p className="text-3xl font-bold text-black dark:text-white mb-1">
            {unreadCount}
          </p>
          <p className="text-sm text-black dark:text-white">Sin Leer</p>
        </div>
        
        <div className="glass-effect border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 text-center">
          <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <AlertTriangle size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
          </div>
          <p className="text-3xl font-bold text-black dark:text-white mb-1">
            {criticalCount}
          </p>
          <p className="text-sm text-black dark:text-white">Críticas</p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-effect border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: `Todas (${alerts.length})`, color: 'from-gray-500 to-gray-600' },
              { key: 'unread', label: `Sin Leer (${unreadCount})`, color: 'from-yellow-500 to-orange-600' },
              { key: 'critical', label: `Críticas (${criticalCount})`, color: 'from-red-500 to-red-600' }
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key as 'all' | 'unread' | 'critical')}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  filter === key
                    ? `bg-gradient-to-r ${color} text-white shadow-lg`
                    : 'glass-effect text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={generateAlertsFromSensorData}
              disabled={isLoading}
              className="px-4 py-2 glass-effect text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40 disabled:bg-white/20 dark:disabled:bg-black/20 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              title="Actualizar alertas"
            >
              <div className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full ${isLoading ? 'animate-spin' : ''}`}></div>
              <span>Actualizar</span>
            </button>
            
            <button
              onClick={markAllAsRead}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <CheckCircle size={18} className="text-white" />
              <span>Marcar Todo como Leído</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="glass-effect border border-white/30 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                              <AlertTriangle size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                Lista de Alertas
              </h3>
              <p className="text-sm text-black dark:text-white">
                {filteredAlerts.length} alertas {filter !== 'all' ? `(${filter})` : ''}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-20">
                              <CheckCircle size={64} className={`mx-auto mb-4 ${themeMode === 'light' ? 'text-black' : 'text-white'}`} />
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No hay alertas</h3>
              <p className="text-black dark:text-white">
                {filter === 'all' 
                  ? 'No se han generado alertas en el sistema'
                  : filter === 'unread'
                  ? 'Todas las alertas han sido leídas'
                  : 'No hay alertas críticas'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map(alert => (
                <div key={alert.id} className={getAlertStyle(alert.type, alert.read)}>
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                                          <p className={`text-sm font-medium ${alert.read ? 'text-gray-800 dark:text-gray-400' : 'text-black dark:text-white'}`}>
                  {alert.message}
                </p>
                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-700 dark:text-gray-400">
                  <span>{format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm')}</span>
                  <span>Sensor: {alert.sensorId.slice(-8)}</span>
                  <span>Temp: {alert.sensorData.temperatura}°C</span>
                  <span>Humedad: {alert.sensorData.humedad}%</span>
                  <span>Estado: {alert.sensorData.estado}</span>
                </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!alert.read && (
                            <button
                              onClick={() => markAsRead(alert.id)}
                              className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200"
                              title="Marcar como leído"
                            >
                                                              <CheckCircle size={16} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                            title="Eliminar alerta"
                          >
                                                            <Trash2 size={16} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Unread indicator */}
                  {!alert.read && (
                    <div className="absolute top-4 right-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};