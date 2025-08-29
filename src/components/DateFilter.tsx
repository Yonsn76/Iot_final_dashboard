import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="glass-effect border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 max-w-5xl mx-auto hover:scale-[1.02] hover:rotate-1">
      <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
        
        {/* Start Date */}
        <div className="flex-1 w-full">
                     <label htmlFor="start-date" className="block text-sm font-medium text-black dark:text-white mb-2">
             Fecha de Inicio
           </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar size={18} className="text-black dark:text-white" />
            </div>
                         <input
               id="start-date"
               type="datetime-local"
               value={startDate}
               onChange={(e) => onStartDateChange(e.target.value)}
               className="w-full pl-12 pr-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-black dark:text-white backdrop-blur-sm"
             />
          </div>
        </div>
        
        {/* End Date */}
        <div className="flex-1 w-full">
                     <label htmlFor="end-date" className="block text-sm font-medium text-black dark:text-white mb-2">
             Fecha Final
           </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar size={18} className="text-black dark:text-white" />
            </div>
                         <input
               id="end-date"
               type="datetime-local"
               value={endDate}
               onChange={(e) => onEndDateChange(e.target.value)}
               className="w-full pl-12 pr-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-black dark:text-white backdrop-blur-sm"
             />
          </div>
        </div>

        {/* Refresh Button */}
        <div className="w-full lg:w-auto">
          <label className="block text-sm font-medium text-transparent mb-2 lg:hidden">
            Acciones
          </label>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full lg:w-auto px-8 py-4 glass-effect text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40 disabled:bg-white/20 dark:disabled:bg-black/20 font-bold rounded-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 disabled:scale-100 shadow-2xl hover:shadow-3xl border border-white/30 flex items-center justify-center space-x-3"
            title="Actualizar datos"
          >
            <RefreshCw 
              size={18} 
              className={`text-black dark:text-white ${isLoading ? 'animate-spin' : ''} transition-transform duration-300`} 
            />
            <span>{isLoading ? 'Cargando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};