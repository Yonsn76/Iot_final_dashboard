import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronUp, ChevronDown, X, Bug } from 'lucide-react';

export const DebugLogin: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { themeMode } = useTheme();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // Solo muestra en desarrollo
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <div 
        className={`fixed top-4 right-4 glass-effect rounded-2xl p-3 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl z-50 ${
          themeMode === 'light' 
            ? 'bg-white/20 border-white/30 text-black hover:bg-white/30' 
            : 'bg-black/20 border-white/20 text-white hover:bg-black/30'
        }`}
        onClick={() => setIsVisible(true)}
        title="Click para mostrar debug info"
      >
        <div className="flex items-center gap-2">
          <Bug size={16} className="text-blue-500" />
          <span className="text-sm font-medium">Debug</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 glass-effect rounded-2xl p-4 max-w-xs z-50 transition-all duration-300 hover:shadow-2xl ${
      themeMode === 'light' 
        ? 'bg-white/20 border-white/30 text-black' 
        : 'bg-black/20 border-white/20 text-white'
    }`}>
      {/* Header con controles */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/20">
        <div className="flex items-center gap-2">
          <Bug size={16} className="text-blue-500" />
          <span className="font-bold text-sm">Auth Debug</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={`p-1 rounded-lg transition-all duration-200 hover:bg-white/20 ${
              themeMode === 'light' ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-300'
            }`}
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className={`p-1 rounded-lg transition-all duration-200 hover:bg-white/20 ${
              themeMode === 'light' ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-300'
            }`}
            title="Ocultar"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      {!isMinimized && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span>Loading: {isLoading ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
            <span>User: {user?.username || 'None'}</span>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
              <span>Role: {user.role}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



