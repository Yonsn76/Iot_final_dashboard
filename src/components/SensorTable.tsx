import React from 'react';
import type { SensorData } from '../types/sensor';
import { format } from 'date-fns';
import { Thermometer, Droplets, Activity, Settings, Calendar, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SensorTableProps {
  data: SensorData[];
}

const getStatusConfig = (estado: string) => {
  switch (estado) {
    case 'normal': 
      return { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        label: 'Normal',
        icon: Activity
      };
    case 'critico': 
      return { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        label: 'Crítico',
        icon: AlertCircle
      };
    case 'caliente': 
      return { 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        label: 'Caliente',
        icon: Thermometer
      };
    case 'frio': 
      return { 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        label: 'Frío',
        icon: Thermometer
      };
    case 'alto': 
      return { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        label: 'Alto',
        icon: AlertCircle
      };
    case 'bajo': 
      return { 
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        label: 'Bajo',
        icon: AlertCircle
      };
    default: 
      return { 
        color: 'glass-effect text-black dark:text-white',
        label: estado,
        icon: Activity
      };
  }
};

export const SensorTable: React.FC<SensorTableProps> = ({ data }) => {
  const { themeMode } = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity size={48} className={`mx-auto mb-4 ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`} />
        <p className={`${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>No hay datos de sensores disponibles</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {data.map((sensor, index) => {
          const statusConfig = getStatusConfig(sensor.estado);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div 
              key={sensor._id}
              className="glass-effect rounded-lg p-4 border border-white/30"
            >
              {/* Header with date and status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className={themeMode === 'light' ? 'text-black' : 'text-gray-400'} />
                  <div>
                    <div className={`font-medium text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                      {format(new Date(sensor.fecha), 'dd/MM/yyyy')}
                    </div>
                    <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                      {format(new Date(sensor.fecha), 'HH:mm')}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <StatusIcon size={12} className="mr-1" />
                  {statusConfig.label}
                </span>
              </div>
              
              {/* Data grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Temperature */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Thermometer size={16} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                      {sensor.temperatura}°C
                    </div>
                    <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                      Temperatura
                    </div>
                  </div>
                </div>
                
                {/* Humidity */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Droplets size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                      {sensor.humedad}%
                    </div>
                    <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                      Humedad
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actuator */}
              {sensor.actuador && sensor.actuador !== 'ninguno' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <Settings size={14} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {sensor.actuador}
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className={`text-left py-3 px-4 text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-gray-300'}`}>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                    <span>Fecha</span>
                  </div>
                </th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-gray-300'}`}>
                  <div className="flex items-center space-x-2">
                    <Thermometer size={16} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                    <span>Temperatura</span>
                  </div>
                </th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-gray-300'}`}>
                  <div className="flex items-center space-x-2">
                    <Droplets size={16} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                    <span>Humedad</span>
                  </div>
                </th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-gray-300'}`}>
                  Estado
                </th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${themeMode === 'light' ? 'text-black' : 'text-gray-300'}`}>
                  <div className="flex items-center space-x-2">
                    <Settings size={16} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                    <span>Actuador</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((sensor, index) => {
                const statusConfig = getStatusConfig(sensor.estado);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr 
                    key={sensor._id} 
                    className="hover:bg-white/40 dark:hover:bg-black/40 transition-colors duration-200"
                  >
                    <td className="py-4 px-4 text-sm">
                      <div className={`font-medium ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                        {format(new Date(sensor.fecha), 'dd/MM/yyyy')}
                      </div>
                      <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                        {format(new Date(sensor.fecha), 'HH:mm')}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <Thermometer size={14} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className={`font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                          {sensor.temperatura}°C
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Droplets size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className={`font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                          {sensor.humedad}%
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon size={12} className="mr-1" />
                        {statusConfig.label}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4 text-sm">
                      <div className="flex items-center space-x-2">
                        {sensor.actuador !== 'ninguno' && (
                          <>
                            <Settings size={14} className="text-green-600 dark:text-green-400" />
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {sensor.actuador}
                            </span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </>
                        )}
                        {sensor.actuador === 'ninguno' && (
                          <span className={`font-medium ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                            Ninguno
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};