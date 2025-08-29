import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface ChartDataPoint {
  fecha: string;
  temperatura: number;
  humedad: number;
}

interface TemperatureChartProps {
  data: ChartDataPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {format(new Date(label), 'dd/MM/yyyy HH:mm')}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name === 'temperatura' ? '°C' : '%'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ data, title }) => {
  const formatXAxisLabel = (tickItem: string) => {
    return format(new Date(tickItem), 'HH:mm');
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="currentColor" 
            className="text-gray-200 dark:text-gray-700" 
          />
          <XAxis 
            dataKey="fecha" 
            tickFormatter={formatXAxisLabel}
            stroke="currentColor"
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
          />
          <YAxis 
            stroke="currentColor" 
            className="text-gray-600 dark:text-gray-400"
            fontSize={12} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              color: 'currentColor',
              fontSize: '14px',
              fontWeight: '500'
            }}
            className="text-gray-700 dark:text-gray-300"
          />
          <Line
            type="monotone"
            dataKey="temperatura"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2, fill: '#ef4444' }}
            activeDot={{ r: 7, strokeWidth: 2 }}
            name="Temperatura"
          />
          <Line
            type="monotone"
            dataKey="humedad"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2, fill: '#3b82f6' }}
            activeDot={{ r: 7, strokeWidth: 2 }}
            name="Humedad"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};