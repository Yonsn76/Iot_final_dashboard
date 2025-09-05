import type { SensorData } from '../types/sensor';

export interface NotificationRule {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'actuator' | 'status';
  condition: 'above' | 'below' | 'equals' | 'not_equals' | 'contains' | 'not_contains';
  value: string | number;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface Notification {
  id: string;
  ruleId: string;
  ruleName: string;
  message: string;
  priority: string;
  timestamp: Date;
  sensorData: SensorData;
  read: boolean;
}

class NotificationService {
  private rules: NotificationRule[] = [];
  private notifications: Notification[] = [];
  private listeners: ((notification: Notification) => void)[] = [];

  constructor() {
    this.loadRules();
    this.loadNotifications();
  }

  // Load rules from localStorage
  private loadRules() {
    const savedRules = localStorage.getItem('notificationRules');
    if (savedRules) {
      this.rules = JSON.parse(savedRules);
    } else {
      // Create default rules if none exist
      this.createDefaultRules();
    }
    console.log('Loaded notification rules:', this.rules);
  }

  // Create default notification rules
  private createDefaultRules() {
    const defaultRules: NotificationRule[] = [
      {
        id: 'default-temp-high',
        name: 'Temperatura Alta',
        type: 'temperature',
        condition: 'above',
        value: 30,
        enabled: true,
        priority: 'medium',
        message: '¡Temperatura alta detectada! La temperatura ha superado los 30°C.'
      },
      {
        id: 'default-temp-critical',
        name: 'Temperatura Crítica',
        type: 'temperature',
        condition: 'above',
        value: 35,
        enabled: true,
        priority: 'critical',
        message: '¡Temperatura crítica! La temperatura ha superado los 35°C. Verificar sistema de refrigeración.'
      },
      {
        id: 'default-humidity-high',
        name: 'Humedad Alta',
        type: 'humidity',
        condition: 'above',
        value: 80,
        enabled: true,
        priority: 'high',
        message: '¡Humedad alta detectada! La humedad ha superado el 80%.'
      },
      {
        id: 'default-status-critical',
        name: 'Estado Crítico',
        type: 'status',
        condition: 'equals',
        value: 'critico',
        enabled: true,
        priority: 'critical',
        message: '¡Estado crítico detectado! El sensor está en estado crítico.'
      },
      {
        id: 'default-temp-extreme',
        name: 'Temperatura Extrema',
        type: 'temperature',
        condition: 'above',
        value: 40,
        enabled: true,
        priority: 'critical',
        message: '¡TEMPERATURA EXTREMA! La temperatura ha superado los 40°C. Acción inmediata requerida.'
      },
      {
        id: 'default-humidity-extreme',
        name: 'Humedad Extrema',
        type: 'humidity',
        condition: 'above',
        value: 90,
        enabled: true,
        priority: 'critical',
        message: '¡HUMEDAD EXTREMA! La humedad ha superado el 90%. Riesgo de condensación.'
      },
      {
        id: 'default-temp-low',
        name: 'Temperatura Baja',
        type: 'temperature',
        condition: 'below',
        value: 10,
        enabled: true,
        priority: 'medium',
        message: '¡Temperatura baja detectada! La temperatura ha bajado de 10°C.'
      }
    ];

    this.rules = defaultRules;
    localStorage.setItem('notificationRules', JSON.stringify(defaultRules));
    console.log('Created default notification rules');
  }

  // Load notifications from localStorage
  private loadNotifications() {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      this.notifications = JSON.parse(savedNotifications).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  }

  // Save notifications to localStorage
  private saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  // Get all rules
  getRules(): NotificationRule[] {
    return this.rules;
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get unread notifications count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get notifications by priority
  getNotificationsByPriority(priority: string): Notification[] {
    return this.notifications.filter(n => n.priority === priority);
  }

  // Add a notification listener
  addListener(listener: (notification: Notification) => void) {
    this.listeners.push(listener);
  }

  // Remove a notification listener
  removeListener(listener: (notification: Notification) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Evaluate sensor data against rules and trigger notifications
  evaluateSensorData(sensorData: SensorData) {
    console.log('Evaluating sensor data for notifications:', sensorData);
    const enabledRules = this.rules.filter(rule => rule.enabled);
    console.log('Enabled rules:', enabledRules);
    
    enabledRules.forEach(rule => {
      console.log('Checking rule:', rule.name, 'against sensor data');
      const shouldTrigger = this.shouldTriggerNotification(rule, sensorData);
      console.log('Rule should trigger:', shouldTrigger);
      
      if (shouldTrigger) {
        console.log('Creating notification for rule:', rule.name);
        this.createNotification(rule, sensorData);
      }
    });
  }

  // Check if a rule should trigger a notification
  private shouldTriggerNotification(rule: NotificationRule, sensorData: SensorData): boolean {
    console.log(`Evaluating rule ${rule.name}: type=${rule.type}, condition=${rule.condition}, value=${rule.value}`);
    
    let result = false;
    switch (rule.type) {
      case 'temperature':
        console.log(`Temperature: actual=${sensorData.temperatura}, expected=${rule.value}`);
        result = this.evaluateNumericCondition(rule.condition, sensorData.temperatura, rule.value as number);
        break;
      
      case 'humidity':
        console.log(`Humidity: actual=${sensorData.humedad}, expected=${rule.value}`);
        result = this.evaluateNumericCondition(rule.condition, sensorData.humedad, rule.value as number);
        break;
      
      case 'actuator':
        console.log(`Actuator: actual=${sensorData.actuador}, expected=${rule.value}`);
        result = this.evaluateStringCondition(rule.condition, sensorData.actuador, rule.value as string);
        break;
      
      case 'status':
        console.log(`Status: actual=${sensorData.estado}, expected=${rule.value}`);
        result = this.evaluateStringCondition(rule.condition, sensorData.estado, rule.value as string);
        break;
      
      default:
        result = false;
    }
    
    console.log(`Rule ${rule.name} result:`, result);
    return result;
  }

  // Evaluate numeric conditions (temperature, humidity)
  private evaluateNumericCondition(condition: string, actual: number, expected: number): boolean {
    switch (condition) {
      case 'above':
        return actual > expected;
      case 'below':
        return actual < expected;
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      default:
        return false;
    }
  }

  // Evaluate string conditions (actuator, status)
  private evaluateStringCondition(condition: string, actual: string, expected: string): boolean {
    const actualLower = actual.toLowerCase();
    const expectedLower = expected.toLowerCase();
    
    switch (condition) {
      case 'contains':
        return actualLower.includes(expectedLower);
      case 'not_contains':
        return !actualLower.includes(expectedLower);
      case 'equals':
        return actualLower === expectedLower;
      case 'not_equals':
        return actualLower !== expectedLower;
      default:
        return false;
    }
  }

  // Create a new notification
  private createNotification(rule: NotificationRule, sensorData: SensorData) {
    console.log('Creating notification for rule:', rule.name);
    
    // Check if we already have a recent notification for this rule and sensor
    const recentNotification = this.notifications.find(n => 
      n.ruleId === rule.id && 
      n.sensorData._id === sensorData._id &&
      Date.now() - n.timestamp.getTime() < 5 * 60 * 1000 // 5 minutes
    );

    if (recentNotification) {
      console.log('Duplicate notification prevented for rule:', rule.name);
      return; // Don't create duplicate notifications
    }

    const notification: Notification = {
      id: `${rule.id}-${sensorData._id}-${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      message: rule.message,
      priority: rule.priority,
      timestamp: new Date(),
      sensorData,
      read: false
    };

    console.log('New notification created:', notification);
    this.notifications.push(notification);
    this.saveNotifications();

    // Notify listeners
    console.log('Notifying listeners, count:', this.listeners.length);
    this.listeners.forEach(listener => listener(notification));

    // Show browser notification if supported
    this.showBrowserNotification(notification);
  }

  // Show browser notification
  private showBrowserNotification(notification: Notification) {
    console.log('Attempting to show browser notification for:', notification.ruleName);
    
    if ('Notification' in window) {
      console.log('Notifications API supported');
      console.log('Current permission status:', Notification.permission);
      
      if (Notification.permission === 'granted') {
        console.log('Notification permission granted, showing notification');
        try {
          const browserNotification = new Notification(notification.ruleName, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
            requireInteraction: notification.priority === 'critical'
          });
          
          // Add click handler to focus the window
          browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
          };
          
          console.log('Browser notification created successfully');
        } catch (error) {
          console.error('Error creating browser notification:', error);
        }
      } else {
        console.log('Notification permission not granted:', Notification.permission);
        console.log('To enable notifications, user must grant permission manually');
      }
    } else {
      console.log('Notifications API not supported in this browser');
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission result:', permission);
      return permission === 'granted';
    }
    return false;
  }

  // Get current notification permission status
  getPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if ('Notification' in window) {
      return Notification.permission as 'granted' | 'denied' | 'default';
    }
    return 'unsupported';
  }

  // Check if notifications are supported and enabled
  isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  // Check if notifications are enabled (permission granted)
  isNotificationEnabled(): boolean {
    return this.isNotificationSupported() && Notification.permission === 'granted';
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  // Delete notification
  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  // Get notification statistics
  getNotificationStats() {
    const total = this.notifications.length;
    const unread = this.notifications.filter(n => !n.read).length;
    const byPriority = {
      critical: this.notifications.filter(n => n.priority === 'critical').length,
      high: this.notifications.filter(n => n.priority === 'high').length,
      medium: this.notifications.filter(n => n.priority === 'medium').length,
      low: this.notifications.filter(n => n.priority === 'low').length,
    };

    return { total, unread, byPriority };
  }

  // Force reload rules (for testing)
  reloadRules() {
    this.loadRules();
    console.log('Rules reloaded:', this.rules);
  }
}

export const notificationService = new NotificationService();
