export interface AppSettings {
  notifications: {
    email: boolean;
    push: boolean;
    critical: boolean;
    updates: boolean;
  };
  data: {
    autoRefresh: boolean;
    refreshInterval: number;
    maxRecords: number;
  };
  security: {
    sessionTimeout: number;
    twoFactor: boolean;
    loginAlerts: boolean;
  };
}

class SettingsService {
  private settings: AppSettings = {
    notifications: {
      email: true,
      push: false,
      critical: true,
      updates: false
    },
    data: {
      autoRefresh: true,
      refreshInterval: 30,
      maxRecords: 1000
    },
    security: {
      sessionTimeout: 60,
      twoFactor: false,
      loginAlerts: true
    }
  };

  private listeners: ((settings: AppSettings) => void)[] = [];

  constructor() {
    this.loadSettings();
  }

  // Load settings from localStorage
  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        this.settings = { ...this.settings, ...parsedSettings };
        console.log('Settings loaded from localStorage:', this.settings);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
  }

  // Save settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('appSettings', JSON.stringify(this.settings));
      console.log('Settings saved to localStorage:', this.settings);
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  // Get current settings
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  // Update settings
  updateSettings(newSettings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  // Update specific setting section
  updateSection<K extends keyof AppSettings>(section: K, values: Partial<AppSettings[K]>): void {
    this.settings[section] = { ...this.settings[section], ...values };
    this.saveSettings();
    this.notifyListeners();
  }

  // Get specific setting value
  getSetting<K extends keyof AppSettings>(section: K, key: keyof AppSettings[K]): AppSettings[K][keyof AppSettings[K]] {
    return this.settings[section][key];
  }

  // Get refresh interval for auto-updates
  getRefreshInterval(): number {
    return this.settings.data.refreshInterval;
  }

  // Get auto-refresh setting
  getAutoRefresh(): boolean {
    return this.settings.data.autoRefresh;
  }

  // Add listener for settings changes
  addListener(listener: (settings: AppSettings) => void): void {
    this.listeners.push(listener);
  }

  // Remove listener
  removeListener(listener: (settings: AppSettings) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getSettings()));
  }

  // Reset to default settings
  resetToDefaults(): void {
    this.settings = {
      notifications: {
        email: true,
        push: false,
        critical: true,
        updates: false
      },
      data: {
        autoRefresh: true,
        refreshInterval: 30,
        maxRecords: 1000
      },
      security: {
        sessionTimeout: 60,
        twoFactor: false,
        loginAlerts: true
      }
    };
    this.saveSettings();
    this.notifyListeners();
  }
}

export const settingsService = new SettingsService();
