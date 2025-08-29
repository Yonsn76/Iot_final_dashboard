import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronUp, ChevronDown, X } from 'lucide-react';

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
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: themeMode === 'light' ? '#000' : '#fff',
        color: themeMode === 'light' ? '#fff' : '#000',
        padding: '8px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: themeMode === 'light' ? '1px solid #333' : '1px solid #ccc',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
      onClick={() => setIsVisible(true)}
      title="Click para mostrar debug info">
        <span>🔧</span>
        <span>Debug</span>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: themeMode === 'light' ? '#000' : '#fff',
      color: themeMode === 'light' ? '#fff' : '#000',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '200px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      border: themeMode === 'light' ? '1px solid #333' : '1px solid #ccc'
    }}>
      {/* Header con controles */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        borderBottom: `1px solid ${themeMode === 'light' ? '#fff' : '#333'}`,
        paddingBottom: '4px'
      }}>
        <span style={{ fontWeight: 'bold' }}>Auth Debug</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'none',
              border: 'none',
              color: themeMode === 'light' ? '#fff' : '#000',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = themeMode === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'none',
              border: 'none',
              color: themeMode === 'light' ? '#fff' : '#000',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = themeMode === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
            title="Ocultar"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      {!isMinimized && (
        <>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>User: {user?.username || 'None'}</div>
        </>
      )}
    </div>
  );
};



