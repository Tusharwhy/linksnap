import { apiRequest } from './client'

export interface User {
  id: string
  email: string
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Credentials {
  email: string
  password: string
}

export const authApi = {
  register: (credentials: Credentials) =>
    apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }),

  login: (credentials: Credentials) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  me: () => apiRequest<User>('/auth/me'),
}
