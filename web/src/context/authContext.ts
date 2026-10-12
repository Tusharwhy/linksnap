import { createContext } from 'react'
import type { Credentials, User } from '../api/auth'

export interface AuthContextValue {
  user: User | null
  // True while checking a saved token on page load
  isLoading: boolean
  login: (credentials: Credentials) => Promise<void>
  register: (credentials: Credentials) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
