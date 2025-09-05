import axios from 'axios';

const API_BASE_URL = 'https://iotapi.up.railway.app/api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

class AuthApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/users/register', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || 'Error en el registro');
      }
      throw new Error('Error de conexión');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/users/login', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || 'Error en el login');
      }
      throw new Error('Error de conexión');
    }
  }

  async getProfile(token: string): Promise<User> {
    try {
      const response = await this.api.get<User>('/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || 'Error al obtener perfil');
      }
      throw new Error('Error de conexión');
    }
  }
}

export const authApi = new AuthApiService();
