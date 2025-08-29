import React, { useState, useEffect } from 'react';
import { Database, Filter, Search, Download, RefreshCw, Activity } from 'lucide-react';
import { sensorApi } from '../services/sensorApi';
import type { SensorData } from '../types/sensor';
import { useTheme } from '../contexts/ThemeContext';
import { SensorTable } from './SensorTable';

export const SensorsPage: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'fecha' | 'temperatura' | 'humedad'>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { themeMode } = useTheme();

  useEffect(() => {
    fetchSensors();
  }, []);

  useEffect(() => {
    filterAndSortSensors();
  }, [sensors, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchSensors = async () => {
    try {
      setIsLoading(true);
      const data = await sensorApi.getAllSensors();
      setSensors(data);
    } catch (error) {
      console.error('Error fetching sensors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortSensors = () => {
    let filtered = [...sensors];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sensor =>
        sensor._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sensor.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sensor.actuador.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sensor => sensor.estado === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'fecha') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSensors(filtered);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Fecha', 'Temperatura', 'Humedad', 'Estado', 'Actuador'],
      ...filteredSensors.map(sensor => [
        sensor._id,
        sensor.fecha,
        sensor.temperatura,
        sensor.humedad,
        sensor.estado,
        sensor.actuador
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensores_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados', count: sensors.length },
    { value: 'normal', label: 'Normal', count: sensors.filter(s => s.estado === 'normal').length },
    { value: 'critico', label: 'Crítico', count: sensors.filter(s => s.estado === 'critico').length },
    { value: 'caliente', label: 'Caliente', count: sensors.filter(s => s.estado === 'caliente').length },
    { value: 'frio', label: 'Frío', count: sensors.filter(s => s.estado === 'frio').length },
    { value: 'alto', label: 'Alto', count: sensors.filter(s => s.estado === 'alto').length },
    { value: 'bajo', label: 'Bajo', count: sensors.filter(s => s.estado === 'bajo').length },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
              <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 glass-effect border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 mb-4">
                            <Database size={32} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-black dark:text-white">
            Registros de Sensores
          </h1>
          <p className={`${themeMode === 'light' ? 'text-black' : 'text-white'} max-w-2xl mx-auto`}>
            Monitorea, filtra y exporta registros históricos de sensores IoT
          </p>
        </header>

      {/* Controls */}
      <div className="glass-effect border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Search */}
          <div className="flex-1">
                         <label htmlFor="search" className="block text-sm font-medium text-black dark:text-white mb-2">
               Buscar Registros
             </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
              </div>
              <input
                id="search"
                type="text"
                placeholder="Buscar por ID, estado o actuador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-64">
                         <label htmlFor="status-filter" className="block text-sm font-medium text-black dark:text-white mb-2">
               Filtrar por Estado
             </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter size={18} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
              </div>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-200 text-black dark:text-white backdrop-blur-sm appearance-none cursor-pointer"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} className="glass-effect">
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="lg:w-48">
            <label htmlFor="sort-by" className="block text-sm font-medium text-black dark:text-white mb-2">
              Ordenar por
            </label>
            <div className="flex space-x-2">
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'fecha' | 'temperatura' | 'humedad')}
                className="flex-1 px-3 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-black dark:text-white backdrop-blur-sm text-sm appearance-none cursor-pointer"
              >
                              <option value="fecha" className="glass-effect">Fecha</option>
              <option value="temperatura" className="glass-effect">Temperatura</option>
              <option value="humedad" className="glass-effect">Humedad</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/30 border border-gray-200/50 dark:border-white/10 rounded-2xl transition-all duration-200 backdrop-blur-sm"
                title={`Orden ${sortOrder === 'asc' ? 'ascendente' : 'descendente'}`}
              >
                <div className={`w-4 h-4 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                  ↑
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={fetchSensors}
              disabled={isLoading}
              className="px-4 py-3 glass-effect text-black dark:text-white hover:bg-white/30 dark:hover:bg-black/30 disabled:bg-white/20 dark:disabled:bg-black/20 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg flex items-center space-x-2"
              title="Actualizar datos"
            >
                              <RefreshCw size={18} className={`${themeMode === 'light' ? 'text-black' : 'text-white'} ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleExport}
              disabled={filteredSensors.length === 0}
              className="px-4 py-3 glass-effect text-black dark:text-white hover:bg-white/30 dark:hover:bg-black/30 disabled:bg-white/20 dark:disabled:bg-black/20 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg flex items-center space-x-2"
              title="Exportar a CSV"
            >
                              <Download size={18} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
            </button>
          </div>
        </div>
      </div>

              {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-effect rounded-3xl p-6 shadow-xl text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                            <Activity size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white mb-1">
            {filteredSensors.length}
          </p>
          <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
            Registros Filtrados
          </p>
        </div>

        <div className="glass-effect rounded-3xl p-6 shadow-xl text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <Database size={24} className="text-white" />
              </div>
          <p className="text-2xl font-bold text-black dark:text-white mb-1">
            {sensors.length}
          </p>
          <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
            Total de Registros
          </p>
        </div>

        <div className="glass-effect rounded-3xl p-6 shadow-xl text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
            <Database size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white mb-1">
            {sensors.filter(s => s.estado === 'critico').length}
          </p>
          <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
            Registros Críticos
          </p>
        </div>
      </div>

      {/* Sensor Table */}
              <div className="glass-effect rounded-3xl overflow-hidden shadow-xl">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Database size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black dark:text-white">
                  Registros de Sensores
                </h3>
                <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                  {filteredSensors.length} de {sensors.length} registros
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <SensorTable data={filteredSensors} />
          )}
        </div>
      </div>
    </div>
  );
};