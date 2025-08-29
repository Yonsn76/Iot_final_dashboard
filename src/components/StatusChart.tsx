import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { SensorData } from '../types/sensor';

interface StatusChartProps {
  data: SensorData[];
  title?: string;
  type?: 'status' | 'actuator';
}

const STATUS_COLORS = {
  normal: '#10b981',
  critico: '#ef4444',
  caliente: '#f59e0b',
  frio: '#3b82f6',
  alto: '#f97316',
  bajo: '#8b5cf6',
};

const ACTUATOR_COLORS = {
  ninguno: '#6b7280',
  ventilador: '#3b82f6',
  aire_condicionado: '#06b6d4',
  calefactor: '#ef4444',
};

export const StatusChart: React.FC<StatusChartProps> = ({ 
  data, 
  title, 
  type = 'status' 
}) => {
  // Convert SensorData array to chart data
  const getChartData = () => {
    const counts: Record<string, number> = {};
    
    data.forEach(sensor => {
      const key = type === 'status' ? sensor.estado : sensor.actuador;
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const chartData = getChartData();
  const colors = type === 'status' ? STATUS_COLORS : ACTUATOR_COLORS;

  const getColor = (name: string, index: number): string => {
    return colors[name as keyof typeof colors] || `hsl(${index * 45}, 70%, 50%)`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {data.name}
          </p>
          <p className="text-sm font-medium" style={{ color: data.color }}>
            Cantidad: {data.value}
          </p>
        </div>
      );
    }
    return null;
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getColor(entry.name, index)} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              color: 'currentColor',
              fontSize: '14px',
              fontWeight: '500'
            }}
            className="text-gray-700 dark:text-gray-300"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};