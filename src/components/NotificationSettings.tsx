import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Save, Trash2, Plus, Thermometer, Droplets, Fan, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationRule {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'actuator' | 'status';
  condition: 'above' | 'below' | 'equals' | 'not_equals' | 'contains' | 'not_contains';
  value: string | number;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export const NotificationSettings: React.FC = () => {
  const { themeMode } = useTheme();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved rules from localStorage
  useEffect(() => {
    const savedRules = localStorage.getItem('notificationRules');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, []);

  // Save rules to localStorage
  const saveRules = (newRules: NotificationRule[]) => {
    localStorage.setItem('notificationRules', JSON.stringify(newRules));
    setRules(newRules);
  };

  const addRule = (rule: Omit<NotificationRule, 'id'>) => {
    const newRule: NotificationRule = {
      ...rule,
      id: Date.now().toString(),
    };
    const newRules = [...rules, newRule];
    saveRules(newRules);
    setShowAddForm(false);
  };

  const updateRule = (id: string, updates: Partial<NotificationRule>) => {
    const newRules = rules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    );
    saveRules(newRules);
    setEditingRule(null);
  };

  const deleteRule = (id: string) => {
    const newRules = rules.filter(rule => rule.id !== id);
    saveRules(newRules);
  };

  const toggleRule = (id: string) => {
    const newRules = rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    );
    saveRules(newRules);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer size={16} />;
      case 'humidity': return <Droplets size={16} />;
      case 'actuator': return <Fan size={16} />;
      case 'status': return <Zap size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'above': return 'Mayor que';
      case 'below': return 'Menor que';
      case 'equals': return 'Igual a';
      case 'not_equals': return 'Diferente de';
      case 'contains': return 'Contiene';
      case 'not_contains': return 'No contiene';
      default: return condition;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 glass-effect border border-white/20 flex items-center justify-center shadow-lg">
            <Bell size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Configuración de Notificaciones
            </h3>
            <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
              Gestiona las reglas de notificaciones personalizadas
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Nueva Regla</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map(rule => (
          <div
            key={rule.id}
            className={`glass-effect border border-white/30 rounded-xl p-4 transition-all duration-300 ${
              rule.enabled ? 'shadow-lg' : 'opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  rule.enabled ? 'bg-green-500/20' : 'bg-gray-500/20'
                }`}>
                  {getTypeIcon(rule.type)}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                      {rule.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                      {rule.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
                    {getConditionText(rule.condition)} {rule.value}
                    {rule.type === 'temperature' && '°C'}
                    {rule.type === 'humidity' && '%'}
                  </p>
                  
                  <p className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-gray-400'} mt-1`}>
                    {rule.message}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    rule.enabled 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={rule.enabled ? 'Desactivar regla' : 'Activar regla'}
                >
                  {rule.enabled ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
                
                <button
                  onClick={() => setEditingRule(rule)}
                  className="p-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  title="Editar regla"
                >
                  <Settings size={16} />
                </button>
                
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                  title="Eliminar regla"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {rules.length === 0 && (
          <div className="text-center py-12 glass-effect border border-white/30 rounded-xl">
            <BellOff size={48} className={`mx-auto mb-4 ${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`} />
            <p className={`text-lg font-semibold ${themeMode === 'light' ? 'text-black' : 'text-white'} mb-2`}>
              No hay reglas configuradas
            </p>
            <p className={`${themeMode === 'light' ? 'text-black' : 'text-gray-400'}`}>
              Crea tu primera regla de notificación para empezar
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Rule Form */}
      {(showAddForm || editingRule) && (
        <NotificationRuleForm
          rule={editingRule}
          onSave={(rule) => {
            if (editingRule) {
              updateRule(editingRule.id, rule);
            } else {
              addRule(rule);
            }
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingRule(null);
          }}
        />
      )}
    </div>
  );
};

interface NotificationRuleFormProps {
  rule?: NotificationRule | null;
  onSave: (rule: Omit<NotificationRule, 'id'>) => void;
  onCancel: () => void;
}

const NotificationRuleForm: React.FC<NotificationRuleFormProps> = ({ rule, onSave, onCancel }) => {
  const { themeMode } = useTheme();
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    type: rule?.type || 'temperature',
    condition: rule?.condition || 'above',
    value: rule?.value || '',
    enabled: rule?.enabled ?? true,
    priority: rule?.priority || 'medium',
    message: rule?.message || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.value && formData.message) {
      onSave(formData);
    }
  };

  const getTypeOptions = () => [
    { value: 'temperature', label: '🌡️ Temperatura' },
    { value: 'humidity', label: '💧 Humedad' },
    { value: 'actuator', label: '⚙️ Actuador' },
    { value: 'status', label: '⚡ Estado' },
  ];

  const getConditionOptions = () => {
    const baseConditions = [
      { value: 'equals', label: 'Igual a' },
      { value: 'not_equals', label: 'Diferente de' },
    ];

    if (formData.type === 'temperature' || formData.type === 'humidity') {
      return [
        { value: 'above', label: 'Mayor que' },
        { value: 'below', label: 'Menor que' },
        ...baseConditions,
      ];
    }

    if (formData.type === 'actuator' || formData.type === 'status') {
      return [
        { value: 'contains', label: 'Contiene' },
        { value: 'not_contains', label: 'No contiene' },
        ...baseConditions,
      ];
    }

    return baseConditions;
  };

  const getPriorityOptions = () => [
    { value: 'low', label: '🟢 Baja' },
    { value: 'medium', label: '🟡 Media' },
    { value: 'high', label: '🟠 Alta' },
    { value: 'critical', label: '🔴 Crítica' },
  ];

  return (
    <div className="glass-effect border border-white/30 rounded-xl p-6 shadow-xl">
      <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
        {rule ? 'Editar Regla' : 'Nueva Regla de Notificación'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rule Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Nombre de la Regla
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 glass-effect border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-black dark:text-white"
              placeholder="Ej: Temperatura alta crítica"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Tipo de Monitoreo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 glass-effect border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-black dark:text-white"
            >
              {getTypeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Condición
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
              className="w-full px-3 py-2 glass-effect border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-black dark:text-white"
            >
              {getConditionOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Valor
            </label>
            <input
              type={formData.type === 'temperature' || formData.type === 'humidity' ? 'number' : 'text'}
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 glass-effect border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-black dark:text-white"
              placeholder={
                formData.type === 'temperature' ? '35' :
                formData.type === 'humidity' ? '80' :
                formData.type === 'actuator' ? 'ventilador' :
                'normal'
              }
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Prioridad
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 glass-effect border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-black dark:text-white"
            >
              {getPriorityOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Enabled */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="enabled" className={`text-sm font-medium ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Regla activa
            </label>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            Mensaje de Notificación
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 glass-effect border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-black dark:text-white"
            placeholder="Ej: ¡Temperatura crítica detectada! Verificar sistema de refrigeración."
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 glass-effect text-black dark:text-white hover:bg-white/40 dark:hover:bg-black/40 rounded-lg transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <Save size={16} />
            <span>{rule ? 'Actualizar' : 'Crear'} Regla</span>
          </button>
        </div>
      </form>
    </div>
  );
};
