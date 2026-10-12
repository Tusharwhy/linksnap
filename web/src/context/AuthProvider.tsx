import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type AuthResponse, type Credentials, type User } from '../api/auth'
import { setUnauthorizedHandler, tokenStorage } from '../api/client'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(tokenStorage.get()))

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  // An expired or invalid token anywhere in the app logs the user out.
  useEffect(() => setUnauthorizedHandler(logout), [logout])

  // On page load, if a token was saved, ask the backend who it belongs to.
  useEffect(() => {
    if (!tokenStorage.get()) return
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoading(false))
  }, [])

  const handleAuth = useCallback((response: AuthResponse) => {
    tokenStorage.set(response.token)
    setUser(response.user)
  }, [])

  const login = useCallback(
    async (credentials: Credentials) => handleAuth(await authApi.login(credentials)),
    [handleAuth],
  )

  const register = useCallback(
    async (credentials: Credentials) => handleAuth(await authApi.register(credentials)),
    [handleAuth],
  )

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
