import React, { useState, useEffect, useRef } from 'react';
import {
  Thermometer, 
  Droplets, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';
import { sensorApi } from '../services/sensorApi';
import { notificationService } from '../services/notificationService';
import { settingsService } from '../services/settingsService';
import type { SensorData, SensorStats } from '../types/sensor';
import { useTheme } from '../contexts/ThemeContext';
import { TemperatureChart } from './TemperatureChart';
import { StatusChart } from './StatusChart';
import { ActuatorChart } from './ActuatorChart';
import { SensorTable } from './SensorTable';
import { DateFilter } from './DateFilter';
import { format, subDays } from 'date-fns';
import { useGSAPAnimations } from '../hooks/useGSAPAnimations';

export const AdminDashboard: React.FC = () => {
  const [filteredSensors, setFilteredSensors] = useState<SensorData[]>([]);
  const [allSensors, setAllSensors] = useState<SensorData[]>([]);
  const [stats, setStats] = useState<SensorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState(settingsService.getRefreshInterval());
  const { themeMode } = useTheme();
  
  // GSAP Animations hook (available for future use)
  useGSAPAnimations();
  
  // Refs for animations
  const headerRef = useRef<HTMLElement>(null);
  const headerIconRef = useRef<HTMLDivElement>(null);
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const headerSubtitleRef = useRef<HTMLParagraphElement>(null);
  const statsCardsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLElement>(null);
  
  // Date filter state
  const [startDate, setStartDate] = useState(() => 
    format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm")
  );
  const [endDate, setEndDate] = useState(() => 
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );

  const fetchSensorData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all sensors for latest reading
      const allSensorsData = await sensorApi.getAllSensors();
      setAllSensors(allSensorsData);
      
      // Apply date filter
      const filtered = await sensorApi.getSensorsByDateRange(startDate, endDate);
      setFilteredSensors(filtered);
      
      // Calculate stats for filtered data
      const calculatedStats = sensorApi.calculateStats(filtered);
      setStats(calculatedStats);
      
      // Evaluate notification rules for all sensors (especially the latest ones)
      if (allSensorsData.length > 0) {
        console.log('Evaluating notifications for all sensors...');
        // Evaluate notifications for the most recent sensors
        const recentSensors = allSensorsData.slice(0, 5); // Last 5 sensors
        recentSensors.forEach(sensor => {
          notificationService.evaluateSensorData(sensor);
        });
      }
      
    } catch (err) {
      setError('Error al cargar los datos de sensores');
      console.error('Error fetching sensor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch only the latest sensor data for real-time updates
  const fetchLatestSensorData = async () => {
    try {
      const latestSensor = await sensorApi.getLatestSensor();
      if (latestSensor) {
        // Update only the first element (most recent) in allSensors
        setAllSensors(prev => {
          if (prev.length > 0 && prev[0]._id === latestSensor._id) {
            return prev; // No change needed
          }
          // Replace the first element with the latest
          const updated = [...prev];
          updated[0] = latestSensor;
          return updated;
        });

        // Evaluate notification rules for the latest sensor data
        notificationService.evaluateSensorData(latestSensor);
      }
    } catch (err) {
      console.error('Error fetching latest sensor data:', err);
    }
  };

  useEffect(() => {
    fetchSensorData();
  }, [startDate, endDate]);

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      const newInterval = settingsService.getRefreshInterval();
      setRefreshInterval(newInterval);
      console.log('Settings changed, new refresh interval:', newInterval);
    };
    
    settingsService.addListener(handleSettingsChange);
    
    return () => {
      settingsService.removeListener(handleSettingsChange);
    };
  }, []);

  // Auto-refresh latest sensor data using settings interval
  useEffect(() => {
    const refreshIntervalMs = refreshInterval * 1000; // Convert to milliseconds
    console.log(`Setting up auto-refresh interval: ${refreshIntervalMs}ms (${refreshInterval}s)`);
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing sensor data...');
      fetchLatestSensorData();
    }, refreshIntervalMs);

    return () => {
      console.log('Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [refreshInterval]); // Re-run when refresh interval changes

  // Listen for notifications and update count
  useEffect(() => {
    const updateNotificationCount = () => {
      setNotificationCount(notificationService.getUnreadCount());
    };

    // Initial count
    updateNotificationCount();

    // Listen for new notifications
    notificationService.addListener(() => {
      updateNotificationCount();
    });

    // Update count every 10 seconds
    const interval = setInterval(updateNotificationCount, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    fetchSensorData();
  };

  const getLatestReadings = () => {
    return sensorApi.getLatestReadings(filteredSensors, 15);
  };

  const getChartData = () => {
    return sensorApi.getTemperatureTrend(filteredSensors.slice(-50)); // Last 50 readings for chart
  };

  const getCriticalAlerts = () => {
    return allSensors.filter(sensor => 
      sensor.estado === 'critico' || sensor.estado === 'alto' || sensor.estado === 'bajo'
    ).length;
  };

  const getAlertDetails = () => {
    const criticalSensors = allSensors.filter(sensor => 
      sensor.estado === 'critico' || sensor.estado === 'alto' || sensor.estado === 'bajo'
    );
    
    const alertTypes = {
      critico: criticalSensors.filter(s => s.estado === 'critico').length,
      alto: criticalSensors.filter(s => s.estado === 'alto').length,
      bajo: criticalSensors.filter(s => s.estado === 'bajo').length,
    };
    
    return {
      total: criticalSensors.length,
      types: alertTypes,
      latest: criticalSensors.length > 0 ? criticalSensors[0] : null
    };
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-effect p-8 text-center border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 max-w-md w-full">
          <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg mx-auto mb-4">
            <AlertTriangle size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
          </div>
          <h2 className="text-xl font-bold text-black dark:text-white mb-4">
            Error al cargar el dashboard
          </h2>
          <p className="text-black dark:text-white mb-6">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-6 py-3 glass-effect text-black dark:text-white border border-white/30 rounded-lg hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
             {/* Current Reading Header - Before Main Title */}
       {!isLoading && allSensors.length > 0 && (
        <section className="glass-effect p-4 lg:p-6 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                <Activity size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                  Registro Actual
                </h2>
                <p className="text-sm text-black dark:text-white font-medium">
                  Última lectura en tiempo real
                </p>
              </div>
            </div>
            
                         <div className="text-right">
               <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                 ID: {allSensors[0]?._id || 'N/A'}
               </div>
               <div className={`text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                 {allSensors[0]?.fecha ? 
                   format(new Date(allSensors[0].fecha), 'dd/MM/yyyy HH:mm:ss') : 
                   'N/A'
                 }
               </div>
               <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                 Actualizado hace: {allSensors[0]?.fecha ? 
                   (() => {
                     const now = new Date();
                     const readingTime = new Date(allSensors[0].fecha);
                     const diffMs = now.getTime() - readingTime.getTime();
                     const diffMins = Math.floor(diffMs / (1000 * 60));
                     const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
                     
                     if (diffMins > 0) {
                       return `${diffMins}m ${diffSecs}s`;
                     } else {
                       return `${diffSecs}s`;
                     }
                   })() : 
                   'N/A'
                 }
               </div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Current Temperature */}
            <div className="text-center p-3 glass-effect border border-white/20 rounded-xl">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Thermometer size={14} className="text-orange-600" />
              </div>
                                 <div className={`text-lg font-bold mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                     {allSensors[0]?.temperatura || 0}°C
                   </div>
              <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                Temperatura
              </div>
            </div>

            {/* Current Humidity */}
            <div className="text-center p-3 glass-effect border border-white/20 rounded-xl">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Droplets size={14} className="text-blue-600" />
              </div>
                                 <div className={`text-lg font-bold mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                     {allSensors[0]?.humedad || 0}%
                   </div>
              <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                Humedad
              </div>
            </div>

            {/* Current Status */}
            <div className="text-center p-3 glass-effect border border-white/20 rounded-xl">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity size={14} className="text-green-600" />
              </div>
                                 <div className={`text-sm font-bold mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                     {allSensors[0]?.estado || 'N/A'}
                   </div>
              <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                Estado
              </div>
            </div>

            {/* Current Actuator */}
            <div className="text-center p-3 glass-effect border border-white/20 rounded-xl">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Settings size={14} className="text-purple-600" />
              </div>
                                 <div className={`text-xs font-bold mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                     {allSensors[0]?.actuador || 'Ninguno'}
                   </div>
              <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                Actuador
              </div>
            </div>
          </div>

          {/* Current Reading Details */}
          <div className="glass-effect border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                Detalles del Registro Actual
              </h4>
              <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                Tiempo Transcurrido
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className={`text-xs font-medium mb-1 ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                  ID del Sensor
                </div>
                <div className={`text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  {filteredSensors[filteredSensors.length - 1]?._id || 'N/A'}
                </div>
              </div>
              
              <div>
                <div className={`text-xs font-medium mb-1 ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                  Fecha y Hora
                </div>
                                   <div className={`text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                     {allSensors[0]?.fecha ? 
                       format(new Date(allSensors[0].fecha), 'dd/MM/yyyy HH:mm:ss') : 
                       'N/A'
                     }
                   </div>
              </div>
              
              <div>
                <div className={`text-xs font-medium mb-1 ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                  Última Actualización
                </div>
                                   <div className={`text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                     {allSensors[0]?.fecha ? 
                       (() => {
                         const now = new Date();
                         const readingTime = new Date(allSensors[0].fecha);
                         const diffMs = now.getTime() - readingTime.getTime();
                         const diffMins = Math.floor(diffMs / (1000 * 60));
                         const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
                         
                         if (diffMins > 0) {
                           return `${diffMins}m ${diffSecs}s`;
                         } else {
                           return `${diffSecs}s`;
                         }
                       })() : 
                       'N/A'
                     }
                   </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Header */}
      <header className="text-center space-y-6 mt-8">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 glass-effect border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 overflow-hidden rounded-2xl">
            <img 
              src="/logo.jpg" 
              alt="SensorSP Logo" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          
          {/* Notification Indicator */}
          <div className="relative">
            <button
              onClick={() => {
                // Navigate to notifications page
                const event = new CustomEvent('navigateTo', { detail: 'notifications' });
                window.dispatchEvent(event);
              }}
              className="w-16 h-16 glass-effect border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 flex items-center justify-center"
              title="Ver notificaciones"
            >
              <Bell size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
            </button>
            
            {/* Notification Badge */}
            {notificationCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {notificationCount > 99 ? '99+' : notificationCount}
              </div>
            )}
          </div>
        </div>
        
        <h1 className="text-4xl lg:text-5xl font-black text-black dark:text-white">
          Dashboard IoT
        </h1>
        <p className="text-lg lg:text-xl text-black dark:text-white max-w-3xl mx-auto font-medium">
          Monitoreo y análisis en tiempo real de sensores IoT
        </p>
        
        {/* Refresh Interval Indicator */}
        <div className="flex items-center justify-center space-x-2 px-4 py-2 glass-effect border border-white/30 rounded-xl">
          <Activity size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Actualización automática cada {refreshInterval} segundos
          </span>
        </div>
      </header>

      {/* Date Filter */}
      <div className="flex justify-center">
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      </div>



      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="glass-effect p-8 text-center border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="w-12 h-12 border-4 border-white/30 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black dark:text-white font-medium">
              Cargando datos de sensores...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Statistics Cards */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Total Readings */}
              <div className="glass-effect p-6 lg:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                    <Activity size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                      {stats?.totalReadings || 0}
                    </p>
                                         <p className="text-sm lg:text-base font-semibold text-black dark:text-white">Total de Lecturas</p>
                  </div>
                </div>
              </div>

              {/* Average Temperature */}
              <div className="glass-effect p-6 lg:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                    <Thermometer size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                      {stats?.avgTemperature || 0}°C
                    </p>
                                         <p className="text-sm lg:text-base font-semibold text-black dark:text-white">Temperatura Promedio</p>
                  </div>
                </div>
              </div>

              {/* Average Humidity */}
              <div className="glass-effect p-6 lg:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                    <Droplets size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                      {stats?.avgHumidity || 0}%
                    </p>
                                         <p className="text-sm lg:text-base font-semibold text-black dark:text-white">Humedad Promedio</p>
                  </div>
                </div>
              </div>

              {/* Critical Alerts */}
              <div className="glass-effect p-6 lg:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                    <AlertTriangle size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
                      {getCriticalAlerts()}
                    </p>
                    <p className="text-sm lg:text-base font-semibold text-black dark:text-white">Alertas Críticas</p>
                  </div>
                </div>
                
                {/* Alert Breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="text-lg font-bold text-red-600">
                      {getAlertDetails().types.critico}
                    </div>
                    <div className="text-xs text-red-600 font-medium">Crítico</div>
                  </div>
                  <div className="text-center p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="text-lg font-bold text-orange-600">
                      {getAlertDetails().types.alto}
                    </div>
                    <div className="text-xs text-orange-600 font-medium">Alto</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="text-lg font-bold text-yellow-600">
                      {getAlertDetails().types.bajo}
                    </div>
                    <div className="text-xs text-yellow-600 font-medium">Bajo</div>
                  </div>
                </div>
                
                {/* Latest Alert Info */}
                {getAlertDetails().latest && (
                  <div className="mt-3 p-2 bg-white/10 rounded-lg border border-white/20">
                    <div className="text-xs text-black dark:text-white font-medium mb-1">
                      Última Alerta:
                    </div>
                    <div className="text-xs text-black dark:text-white">
                      {getAlertDetails().latest?.estado} - {getAlertDetails().latest?.temperatura}°C
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>



          {/* Charts Section */}
          <section className="space-y-8 lg:space-y-10">
            {/* Temperature Chart - Full Width */}
            <div className="glass-effect p-6 lg:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                  <TrendingUp size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                    Tendencia de Temperatura
                  </h3>
                                       <p className="text-base lg:text-lg text-black dark:text-white font-medium">
                       Últimas 50 lecturas
                     </p>
                </div>
              </div>
              <TemperatureChart data={getChartData()} />
            </div>

            {/* Distribution Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {/* Status Chart */}
              <div className="glass-effect p-6 lg:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                    <BarChart3 size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                      Distribución de Estados
                    </h3>
                                         <p className="text-base lg:text-lg text-black dark:text-white font-medium">
                       Estados de sensores
                     </p>
                  </div>
                </div>
                <StatusChart data={filteredSensors} />
              </div>

              {/* Actuator Chart */}
              <div className="glass-effect p-6 lg:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                    <Settings size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                      Distribución de Actuadores
                    </h3>
                                         <p className="text-base lg:text-lg text-black dark:text-white font-medium">
                       Tipos de actuadores activos
                     </p>
                  </div>
                </div>
                <ActuatorChart data={filteredSensors} />
              </div>
             </div>
          </section>

          {/* Sensor Table */}
          <section>
            <div className="glass-effect overflow-hidden border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="p-6 lg:p-8 border-b border-white/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                    <Activity size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                      Lecturas Recientes
                    </h3>
                                         <p className="text-base lg:text-lg text-black dark:text-white font-medium">
                       Últimas 15 lecturas de sensores
                     </p>
                  </div>
                </div>
              </div>
              <div className="p-2 sm:p-4 lg:p-6">
                <SensorTable data={getLatestReadings()} />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};