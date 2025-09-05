import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AuthContextType, AuthState, LoginCredentials, User } from '../types/auth';
import { authApi, type RegisterData, type LoginData, type AuthResponse } from '../services/authApi';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_ERROR':
    case 'REGISTER_ERROR':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'RESTORE_SESSION':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

// Helper function to convert API user to local user format
const convertApiUserToLocal = (apiUser: any): User => ({
  id: apiUser._id,
  username: apiUser.username,
  email: apiUser.email,
  role: apiUser.role,
  createdAt: apiUser.createdAt,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored session on app start
    const storedUser = localStorage.getItem('iot-dashboard-user');
    const storedToken = localStorage.getItem('iot-dashboard-token');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'RESTORE_SESSION', payload: user });
      } catch {
        localStorage.removeItem('iot-dashboard-user');
        localStorage.removeItem('iot-dashboard-token');
        dispatch({ type: 'LOGIN_ERROR' });
      }
    } else {
      dispatch({ type: 'LOGIN_ERROR' });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const loginData: LoginData = {
        email: credentials.email || credentials.username || '', // Support both email and username
        password: credentials.password,
      };
      
      const response: AuthResponse = await authApi.login(loginData);
      const user = convertApiUserToLocal(response.user);
      
      localStorage.setItem('iot-dashboard-user', JSON.stringify(user));
      localStorage.setItem('iot-dashboard-token', response.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR' });
      throw error;
    }
  };

  const register = async (registerData: RegisterData): Promise<void> => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response: AuthResponse = await authApi.register(registerData);
      const user = convertApiUserToLocal(response.user);
      
      localStorage.setItem('iot-dashboard-user', JSON.stringify(user));
      localStorage.setItem('iot-dashboard-token', response.token);
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'REGISTER_ERROR' });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('iot-dashboard-user');
    localStorage.removeItem('iot-dashboard-token');
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
