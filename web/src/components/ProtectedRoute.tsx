import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'

// Only logged-in users. Others go to /login and come back here after logging in.
export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <p className="center">Loading…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

// Only logged-out users (login/register). Logged-in users go to the dashboard.
export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <p className="center">Loading…</p>
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
