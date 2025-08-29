import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { themeMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    }
  };

  const handleDemoLogin = (userType: 'admin' | 'user') => {
    setCredentials({
      username: userType,
      password: userType === 'admin' ? 'admin123' : 'user123'
    });
  };

  return (
    <div className={`login-container ${themeMode}`}>
      <div className={`login-card ${themeMode}`}>
        <div className="login-header">
          <div className="login-logo">
            <Activity size={40} className="text-black dark:text-white" />
          </div>
                     <h1 className={themeMode === 'light' ? 'text-black' : 'text-white'}>IoT Dashboard</h1>
           <p className={themeMode === 'light' ? 'text-black' : 'text-white'}>Ingresa a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className={`login-form ${themeMode}`}>
          <div className={`input-group ${themeMode}`}>
            <User size={20} className="text-black dark:text-white" />
            <input
              type="text"
              placeholder="Usuario"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>

          <div className={`input-group ${themeMode}`}>
            <Lock size={20} className="text-black dark:text-white" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} className="text-black dark:text-white" /> : <Eye size={20} className="text-black dark:text-white" />}
            </button>
          </div>

                     {error && <div className={`error-message ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>{error}</div>}

          <button type="submit" className={`login-button ${themeMode}`} disabled={isLoading}>
                         {isLoading ? (
               <>
                 <div className="spinner"></div>
                 <span className={themeMode === 'light' ? 'text-black' : 'text-white'}>Iniciando sesión...</span>
               </>
             ) : (
               <span className={themeMode === 'light' ? 'text-black' : 'text-white'}>Iniciar Sesión</span>
             )}
          </button>
        </form>

        <div className={`demo-accounts ${themeMode}`}>
                     <p className={themeMode === 'light' ? 'text-black' : 'text-white'}>Cuentas de demostración:</p>
          <div className={`demo-buttons ${themeMode}`}>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className={`demo-button admin ${themeMode}`}
              disabled={isLoading}
            >
                             <span className={themeMode === 'light' ? 'text-black' : 'text-white'}>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              className={`demo-button user ${themeMode}`}
              disabled={isLoading}
            >
                             <span className={themeMode === 'light' ? 'text-black' : 'text-white'}>Usuario Demo</span>
            </button>
          </div>
          <div className={`demo-credentials ${themeMode}`}>
                         <small className={themeMode === 'light' ? 'text-black' : 'text-white'}>
               <strong>Admin:</strong> admin / admin123<br />
               <strong>Usuario:</strong> user / user123
             </small>
          </div>
        </div>
      </div>
    </div>
  );
};
