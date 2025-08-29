import axios from 'axios';
import type { SensorData, SensorStats } from '../types/sensor';

const API_BASE_URL = 'https://iotapi.up.railway.app/api';

class SensorApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  async getAllSensors(): Promise<SensorData[]> {
    try {
      const response = await this.api.get<SensorData[]>('/sensors');
      // Sort by date descending to get the most recent first
      return response.data.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      throw new Error('Failed to fetch sensor data');
    }
  }

  async getSensorsByDateRange(startDate: string, endDate: string): Promise<SensorData[]> {
    try {
      const allSensors = await this.getAllSensors();
      return allSensors.filter(sensor => {
        const sensorDate = new Date(sensor.fecha);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return sensorDate >= start && sensorDate <= end;
      });
    } catch (error) {
      console.error('Error fetching filtered sensor data:', error);
      throw new Error('Failed to fetch filtered sensor data');
    }
  }

  calculateStats(sensors: SensorData[]): SensorStats {
    if (sensors.length === 0) {
      return {
        totalReadings: 0,
        avgTemperature: 0,
        avgHumidity: 0,
        statusDistribution: {},
        actuatorDistribution: {},
      };
    }

    const totalReadings = sensors.length;
    const avgTemperature = sensors.reduce((sum, sensor) => sum + sensor.temperatura, 0) / totalReadings;
    const avgHumidity = sensors.reduce((sum, sensor) => sum + sensor.humedad, 0) / totalReadings;

    const statusDistribution: Record<string, number> = {};
    const actuatorDistribution: Record<string, number> = {};

    sensors.forEach(sensor => {
      statusDistribution[sensor.estado] = (statusDistribution[sensor.estado] || 0) + 1;
      actuatorDistribution[sensor.actuador] = (actuatorDistribution[sensor.actuador] || 0) + 1;
    });

    return {
      totalReadings,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      statusDistribution,
      actuatorDistribution,
    };
  }

  getLatestReadings(sensors: SensorData[], count: number = 10): SensorData[] {
    return sensors
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, count);
  }

  getLatestSensor(): Promise<SensorData | null> {
    return this.getAllSensors().then(sensors => {
      if (sensors.length > 0) {
        return sensors[0]; // Since getAllSensors now returns sorted data
      }
      return null;
    });
  }

  getTemperatureTrend(sensors: SensorData[]): Array<{ fecha: string; temperatura: number; humedad: number }> {
    return sensors
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .map(sensor => ({
        fecha: sensor.fecha,
        temperatura: sensor.temperatura,
        humedad: sensor.humedad,
      }));
  }
}

export const sensorApi = new SensorApiService();
