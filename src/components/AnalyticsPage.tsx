import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Activity,
  Thermometer,
  Droplets,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  TrendingDown,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { sensorApi } from '../services/sensorApi';
import type { SensorData, SensorStats } from '../types/sensor';
import { useTheme } from '../contexts/ThemeContext';
import { TemperatureChart } from './TemperatureChart';
import { StatusChart } from './StatusChart';
import { ActuatorChart } from './ActuatorChart';
import { DateFilter } from './DateFilter';
import { format, subDays, subHours, startOfDay, endOfDay } from 'date-fns';


export const AnalyticsPage: React.FC = () => {
  const [filteredSensors, setFilteredSensors] = useState<SensorData[]>([]);
  const [stats, setStats] = useState<SensorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const { themeMode } = useTheme();
  

  
  // Date filter state
  const [startDate, setStartDate] = useState(() => 
    format(subHours(new Date(), 24), "yyyy-MM-dd'T'HH:mm")
  );
  const [endDate, setEndDate] = useState(() => 
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );

  const fetchSensorData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Apply date filter
      const filtered = await sensorApi.getSensorsByDateRange(startDate, endDate);
      setFilteredSensors(filtered);
      
      // Calculate stats for filtered data
      const calculatedStats = sensorApi.calculateStats(filtered);
      setStats(calculatedStats);
      
    } catch (err) {
      setError('Error al cargar los datos de análisis');
      console.error('Error fetching sensor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
  }, [startDate, endDate]);

  const handleRefresh = () => {
    fetchSensorData();
  };

  const handleTimeRangeChange = (range: '1h' | '6h' | '24h' | '7d' | '30d') => {
    setTimeRange(range);
    const now = new Date();
    let start: Date;
    
    switch (range) {
      case '1h':
        start = subHours(now, 1);
        break;
      case '6h':
        start = subHours(now, 6);
        break;
      case '24h':
        start = subHours(now, 24);
        break;
      case '7d':
        start = subDays(now, 7);
        break;
      case '30d':
        start = subDays(now, 30);
        break;
    }
    
    setStartDate(format(start, "yyyy-MM-dd'T'HH:mm"));
    setEndDate(format(now, "yyyy-MM-dd'T'HH:mm"));
  };

  const getPerformanceMetrics = () => {
    if (!filteredSensors.length) return null;
    
    const totalReadings = filteredSensors.length;
    const criticalAlerts = filteredSensors.filter(s => s.estado === 'critico').length;
    const highAlerts = filteredSensors.filter(s => s.estado === 'alto').length;
    const normalReadings = filteredSensors.filter(s => s.estado === 'normal').length;
    
    const avgTemp = filteredSensors.reduce((sum, s) => sum + s.temperatura, 0) / totalReadings;
    const avgHumidity = filteredSensors.reduce((sum, s) => sum + s.humedad, 0) / totalReadings;
    
    return {
      totalReadings,
      criticalAlerts,
      highAlerts,
      normalReadings,
      avgTemp: avgTemp.toFixed(1),
      avgHumidity: avgHumidity.toFixed(1),
      alertRate: ((criticalAlerts + highAlerts) / totalReadings * 100).toFixed(1)
    };
  };

  const getTrendAnalysis = () => {
    if (!filteredSensors.length) return null;
    
    const sortedSensors = [...filteredSensors].sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    
    const recentSensors = sortedSensors.slice(-10);
    const olderSensors = sortedSensors.slice(0, 10);
    
    const recentAvgTemp = recentSensors.reduce((sum, s) => sum + s.temperatura, 0) / recentSensors.length;
    const olderAvgTemp = olderSensors.reduce((sum, s) => sum + s.temperatura, 0) / olderSensors.length;
    
    const tempTrend = recentAvgTemp > olderAvgTemp ? 'up' : 'down';
    const tempChange = Math.abs(recentAvgTemp - olderAvgTemp).toFixed(1);
    
    return {
      tempTrend,
      tempChange,
      isImproving: tempTrend === 'down' // Lower temperature is better
    };
  };

  const performanceMetrics = getPerformanceMetrics();
  const trendAnalysis = getTrendAnalysis();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle size={48} className={`mx-auto mb-4 ${themeMode === 'light' ? 'text-black' : 'text-white'}`} />
          <h2 className={`text-xl font-bold mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Error en el Análisis</h2>
          <p className={`mb-4 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <header 
        className="flex flex-col space-y-6"
      >
        {/* Title Section - Centered */}
        <div className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 glass-effect rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp size={32} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
          </div>
          <h1 
            className={`text-3xl sm:text-4xl xl:text-5xl font-black mb-3 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
          >
            Análisis Avanzado
          </h1>
          <p 
            className={`text-lg sm:text-xl ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
          >
            Métricas de rendimiento y análisis de tendencias
          </p>
        </div>
        
        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-auto">
            <DateFilter 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="w-full sm:w-auto p-3 glass-effect rounded-xl hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-200"
          >
            <RefreshCw size={20} className={`${themeMode === 'light' ? 'text-black' : 'text-white'} ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Time Range Selector */}
      <div className="glass-effect p-4 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <div className="flex items-center space-x-2">
            <Clock size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
            <h3 className={`font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Rango de Tiempo</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {(['1h', '6h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'glass-effect hover:bg-white/40 dark:hover:bg-black/40'
              } ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
            >
              {range === '1h' && '1 Hora'}
              {range === '6h' && '6 Horas'}
              {range === '24h' && '24 Horas'}
              {range === '7d' && '7 Días'}
              {range === '30d' && '30 Días'}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {/* Total Readings */}
        <div className="glass-effect p-4 sm:p-6 rounded-2xl text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Activity size={20} className="text-blue-600" />
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            {performanceMetrics?.totalReadings || 0}
          </h3>
          <p className={`text-xs sm:text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Total de Lecturas</p>
        </div>

        {/* Alert Rate */}
        <div className="glass-effect p-4 sm:p-6 rounded-2xl text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            {performanceMetrics?.alertRate || 0}%
          </h3>
          <p className={`text-xs sm:text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Tasa de Alertas</p>
        </div>

        {/* Average Temperature */}
        <div className="glass-effect p-4 sm:p-6 rounded-2xl text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Thermometer size={20} className="text-orange-600" />
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            {performanceMetrics?.avgTemp || 0}°C
          </h3>
          <p className={`text-xs sm:text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Temperatura Promedio</p>
        </div>

        {/* Average Humidity */}
        <div className="glass-effect p-4 sm:p-6 rounded-2xl text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Droplets size={20} className="text-cyan-600" />
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            {performanceMetrics?.avgHumidity || 0}%
          </h3>
          <p className={`text-xs sm:text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Humedad Promedio</p>
        </div>
      </div>

      {/* Trend Analysis */}
      {trendAnalysis && (
        <div className="glass-effect p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <Target size={24} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
            <h3 className={`text-xl font-bold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Análisis de Tendencias</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                trendAnalysis.tempTrend === 'up' ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                {trendAnalysis.tempTrend === 'up' ? (
                  <TrendingUp size={20} className="text-red-600" />
                ) : (
                  <TrendingDown size={20} className="text-green-600" />
                )}
              </div>
              <p className={`font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                Temperatura {trendAnalysis.tempTrend === 'up' ? 'Aumentando' : 'Disminuyendo'}
              </p>
              <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                Cambio: {trendAnalysis.tempChange}°C
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                trendAnalysis.isImproving ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                {trendAnalysis.isImproving ? (
                  <Zap size={20} className="text-green-600" />
                ) : (
                  <AlertTriangle size={20} className="text-yellow-600" />
                )}
              </div>
              <p className={`font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                Estado del Sistema
              </p>
              <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                {trendAnalysis.isImproving ? 'Mejorando' : 'Requiere Atención'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 mx-auto mb-3 rounded-full flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <p className={`font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                Período Analizado
              </p>
              <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                {timeRange === '1h' && 'Última Hora'}
                {timeRange === '6h' && 'Últimas 6 Horas'}
                {timeRange === '24h' && 'Últimas 24 Horas'}
                {timeRange === '7d' && 'Últimos 7 Días'}
                {timeRange === '30d' && 'Últimos 30 Días'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div 
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            Gráficos de Análisis
          </h2>
          <div className="flex items-center space-x-2">
            <Filter size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
            <span className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Datos filtrados por rango de tiempo
            </span>
          </div>
        </div>

        {/* Temperature Chart - Full Width */}
        <div className="glass-effect p-4 sm:p-6 rounded-2xl">
          <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            Tendencia de Temperatura
          </h3>
          <TemperatureChart data={filteredSensors} />
        </div>

        {/* Status and Actuator Charts - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Status Chart */}
          <div className="glass-effect p-4 sm:p-6 rounded-2xl">
            <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Distribución de Estados
            </h3>
            <StatusChart data={filteredSensors} />
          </div>

          {/* Actuator Chart */}
          <div className="glass-effect p-4 sm:p-6 rounded-2xl">
            <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Análisis de Actuadores
            </h3>
            <ActuatorChart data={filteredSensors} />
          </div>
        </div>


      </div>

      {/* Data Summary Table */}
      <div 
        className="glass-effect p-6 rounded-2xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <h2 className={`text-xl sm:text-2xl font-bold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            Resumen de Datos
          </h2>
          <div className="grid grid-cols-3 gap-4 lg:flex lg:items-center lg:space-x-4">
            <div className="text-center">
              <p className={`text-xs sm:text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Alertas Críticas</p>
              <p className={`text-xl sm:text-2xl font-bold text-red-600 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                {performanceMetrics?.criticalAlerts || 0}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs sm:text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Alertas Altas</p>
              <p className={`text-xl sm:text-2xl font-bold text-orange-600 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                {performanceMetrics?.highAlerts || 0}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs sm:text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Normal</p>
              <p className={`text-xl sm:text-2xl font-bold text-green-600 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                {performanceMetrics?.normalReadings || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Simple Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className={`text-left py-3 px-4 font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  Métrica
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  Valor
                </th>
                <th className={`text-left py-3 px-4 font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">Temperatura Promedio</td>
                <td className={`py-3 px-4 font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  {performanceMetrics?.avgTemp || 0}°C
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    parseFloat(performanceMetrics?.avgTemp || '0') > 30 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {parseFloat(performanceMetrics?.avgTemp || '0') > 30 ? 'Alto' : 'Normal'}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">Humedad Promedio</td>
                <td className={`py-3 px-4 font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  {performanceMetrics?.avgHumidity || 0}%
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    parseFloat(performanceMetrics?.avgHumidity || '0') > 80 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {parseFloat(performanceMetrics?.avgHumidity || '0') > 80 ? 'Alto' : 'Normal'}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">Tasa de Alertas</td>
                <td className={`py-3 px-4 font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  {performanceMetrics?.alertRate || 0}%
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    parseFloat(performanceMetrics?.alertRate || '0') > 10 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {parseFloat(performanceMetrics?.alertRate || '0') > 10 ? 'Crítico' : 'Normal'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
