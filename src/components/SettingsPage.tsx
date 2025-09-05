import React, { useState, useEffect } from 'react';
import { Settings, User, Database, Shield, Palette, Moon, Sun, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { settingsService, type AppSettings } from '../services/settingsService';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { themeMode, toggleThemeMode } = useTheme();
  
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from service on component mount
  useEffect(() => {
    setSettings(settingsService.getSettings());
    
    // Listen for settings changes
    const handleSettingsChange = (newSettings: AppSettings) => {
      setSettings(newSettings);
    };
    
    settingsService.addListener(handleSettingsChange);
    
    return () => {
      settingsService.removeListener(handleSettingsChange);
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Settings are already saved automatically when they change
      console.log('Settings manually saved:', settings);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (section: keyof AppSettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    setSettings(newSettings);
    settingsService.updateSettings(newSettings);
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 dark:from-purple-500 dark:to-purple-600 rounded-3xl shadow-xl shadow-purple-500/30 mb-4">
                          <Settings size={32} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
        </div>
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
          Configuración
        </h1>
                 <p className="text-gray-800 dark:text-gray-400 max-w-2xl mx-auto">
           Personaliza tu experiencia y configura las preferencias del sistema
         </p>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Profile */}
        <div className="glass-effect rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <User size={20} className="text-white" />
                </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Perfil de Usuario
                </h3>
                                 <p className="text-sm text-gray-800 dark:text-gray-400">
                   Información de tu cuenta
                 </p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de Usuario
                </label>
                <div className={`px-4 py-3 glass-effect backdrop-blur-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  {user?.username}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <div className={`px-4 py-3 glass-effect backdrop-blur-sm capitalize ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  {user?.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="glass-effect rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Palette size={20} className="text-white" />
                </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Apariencia
                </h3>
                                 <p className="text-sm text-gray-800 dark:text-gray-400">
                   Personaliza la interfaz
                 </p>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Theme Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Modo de Tema
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => themeMode === 'dark' && toggleThemeMode()}
                  className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all duration-300 ${
                    themeMode === 'light'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-300 shadow-lg'
                      : 'glass-effect border-white/30 text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40'
                  }`}
                >
                  <Sun size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                  <span className="font-medium">Claro</span>
                </button>
                
                <button
                  onClick={() => themeMode === 'light' && toggleThemeMode()}
                  className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all duration-300 ${
                    themeMode === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-300 shadow-lg'
                      : 'glass-effect border-white/30 text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40'
                  }`}
                >
                  <Moon size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                  <span className="font-medium">Oscuro</span>
                </button>
              </div>
            </div>

                         {/* Theme Mode Info */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                 Modo Actual
               </label>
               <div className="p-4 glass-effect border border-white/30 rounded-2xl">
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
                     {themeMode === 'light' ? (
                       <Sun size={24} className="text-black" />
                     ) : (
                       <Moon size={24} className="text-white" />
                     )}
                   </div>
                   <div>
                     <p className="font-bold text-gray-900 dark:text-white">
                       Modo {themeMode === 'light' ? 'Claro' : 'Oscuro'}
                     </p>
                     <p className="text-sm text-gray-800 dark:text-gray-400">
                       Tema activo actualmente
                     </p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="glass-effect rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Database size={20} className="text-white" />
                </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Gestión de Datos
                </h3>
                                 <p className="text-sm text-gray-800 dark:text-gray-400">
                   Configuración de datos y actualización
                 </p>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intervalo de Actualización (segundos)
                </label>
                <input
                  type="number"
                  value={settings.data.refreshInterval}
                  onChange={(e) => handleSettingChange('data', 'refreshInterval', parseInt(e.target.value) || 30)}
                  className={`w-full px-4 py-3 glass-effect border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Máximo de Registros
                </label>
                <input
                  type="number"
                  value={settings.data.maxRecords}
                  onChange={(e) => handleSettingChange('data', 'maxRecords', parseInt(e.target.value) || 1000)}
                  className={`w-full px-4 py-3 glass-effect border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-effect rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Shield size={20} className="text-white" />
                </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Seguridad
                </h3>
                                 <p className="text-sm text-gray-800 dark:text-gray-400">
                   Configuración de seguridad y privacidad
                 </p>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tiempo de Sesión (minutos)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                }))}
                className={`w-full md:w-64 px-4 py-3 glass-effect border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 backdrop-blur-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
              />
            </div>

            {Object.entries({
              twoFactor: 'Autenticación de Dos Factores',
              loginAlerts: 'Alertas de Inicio de Sesión'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </label>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    security: {
                      ...prev.security,
                      [key]: !prev.security[key as keyof typeof prev.security]
                    }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    settings.security[key as keyof typeof settings.security]
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'glass-effect'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-300 ${
                      settings.security[key as keyof typeof settings.security]
                        ? 'bg-white translate-x-6'
                        : themeMode === 'light' ? 'bg-black translate-x-1' : 'bg-white translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-4 glass-effect hover:bg-white/30 dark:hover:bg-black/30 disabled:bg-gray-400/50 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 shadow-xl flex items-center space-x-3 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
          >
            {isSaving ? (
              <>
                <RefreshCw size={20} className={`${themeMode === 'light' ? 'text-black' : 'text-white'} animate-spin`} />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
                <span>Guardar Configuración</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};