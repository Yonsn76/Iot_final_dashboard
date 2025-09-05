import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Activity, ArrowLeft, Zap, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const { themeMode } = useTheme();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (formData.username.length > 30) {
      newErrors.username = 'El nombre de usuario no puede tener más de 30 caracteres';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error en el registro',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Floating Elements - Black & White Style */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-black/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-1/4 left-1/4 text-black/10 animate-float">
          <Zap size={24} className="text-black dark:text-white" />
        </div>
        <div className="absolute top-1/3 right-1/4 text-gray-800/10 animate-float-delayed">
          <Shield size={20} className="text-black dark:text-white" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 text-gray-600/10 animate-float-slow">
          <Activity size={28} className="text-black dark:text-white" />
        </div>
        <div className="absolute top-1/2 right-1/3 text-black/10 animate-float">
          <Sparkles size={22} className="text-black dark:text-white" />
        </div>
      </div>

      {/* Main Register Card */}
      <div className="relative w-full max-w-lg">
        {/* Glass morphism card */}
        <div className="glass-effect rounded-3xl shadow-2xl p-10 relative overflow-hidden border border-white/30 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
        
          {/* Glass shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
        
        {/* Header */}
        <div className="relative text-center mb-8">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-2xl rotate-6 transform"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl -rotate-6 transform"></div>
            <div className="relative bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-800 dark:to-black rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.jpg" 
                alt="SensorSP Logo" 
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
          
          <h1 className={`text-4xl lg:text-5xl font-black mb-3 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            SensorSP
          </h1>
          <p className={`text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
            Únete a la plataforma de monitoreo inteligente
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className={`text-sm font-medium ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Nombre de Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-black dark:text-white" />
              </div>
              <input
                id="username"
                type="text"
                placeholder="Ingresa tu nombre de usuario"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                disabled={isSubmitting}
                className={`w-full pl-12 pr-4 py-4 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.username ? 'animate-shake' : ''}`}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-500">⚠️</span>
                {errors.username}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className={`text-sm font-medium ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={20} className="text-black dark:text-white" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isSubmitting}
                className={`w-full pl-12 pr-4 py-4 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.email ? 'animate-shake' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-500">⚠️</span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className={`text-sm font-medium ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={20} className="text-black dark:text-white" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                disabled={isSubmitting}
                className={`w-full pl-12 pr-12 py-4 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.password ? 'animate-shake' : ''}`}
              />
              <button
                type="button"
                className={`absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} /> : <Eye size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-500">⚠️</span>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className={`text-sm font-medium ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={20} className="text-black dark:text-white" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                disabled={isSubmitting}
                className={`w-full pl-12 pr-12 py-4 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.confirmPassword ? 'animate-shake' : ''}`}
              />
              <button
                type="button"
                className={`absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} /> : <Eye size={20} className={themeMode === 'light' ? 'text-black' : 'text-white'} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-500">⚠️</span>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
              Tipo de Cuenta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                disabled={isSubmitting}
                className={`p-4 glass-effect hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200 group ${
                  formData.role === 'user' ? 'ring-2 ring-blue-500/50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-700 dark:to-emerald-800 rounded-xl text-white">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className={`font-medium text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Usuario</div>
                    <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Acceso estándar</div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                disabled={isSubmitting}
                className={`p-4 glass-effect hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200 group ${
                  formData.role === 'admin' ? 'ring-2 ring-blue-500/50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-xl text-white">
                    <Shield size={16} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className={`font-medium text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Administrador</div>
                    <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Acceso completo</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-5 glass-effect hover:bg-white/40 dark:hover:bg-black/40 disabled:bg-white/20 dark:disabled:bg-black/20 font-bold rounded-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-2xl hover:shadow-3xl border border-white/30 relative overflow-hidden group ${themeMode === 'light' ? 'text-black' : 'text-white'}`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                <span className={themeMode === 'light' ? 'text-black' : 'text-white'}>Registrando...</span>
              </div>
            ) : (
              <>
                <span className={`relative z-10 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Crear Cuenta</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8">
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20 dark:border-gray-600/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 glass-effect rounded-full ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                ¿Ya tienes cuenta?
              </span>
            </div>
          </div>

          {/* Back to Login Button */}
          <button
            type="button"
            onClick={onBackToLogin}
            disabled={isSubmitting}
            className="w-full p-4 glass-effect hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200 group"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-700 dark:to-gray-800 rounded-xl text-white">
                <ArrowLeft size={16} className="text-white" />
              </div>
              <div className="text-center">
                <div className={`font-medium text-sm ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Volver al Login</div>
                <div className={`text-xs ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>Inicia sesión aquí</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    {/* Custom animations via inline styles */}
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-float-delayed {
        animation: float 6s ease-in-out infinite;
        animation-delay: 2s;
      }
      
      .animate-float-slow {
        animation: float 8s ease-in-out infinite;
        animation-delay: 4s;
      }
    `}</style>
  </div>
  );
};
