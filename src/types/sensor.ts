export interface SensorData {
  _id: string;
  fecha: string;
  temperatura: number;
  humedad: number;
  estado: 'normal' | 'frio' | 'caliente' | 'critico' | 'bajo' | 'alto';
  actuador: string;
}

export interface SensorStats {
  totalReadings: number;
  avgTemperature: number;
  avgHumidity: number;
  statusDistribution: Record<string, number>;
  actuatorDistribution: Record<string, number>;
}

export interface DateRange {
  start: string;
  end: string;
}
