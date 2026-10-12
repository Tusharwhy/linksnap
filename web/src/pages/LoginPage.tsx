import { Link, useLocation, useNavigate } from 'react-router'
import { AuthForm } from '../components/AuthForm'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Go back to the page the user originally wanted, if any
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  return (
    <main className="page">
      <AuthForm
        title="Log in to LinkSnap"
        submitLabel="Log in"
        onSubmit={async (credentials) => {
          await login(credentials)
          navigate(from, { replace: true })
        }}
      />
      <p className="center">
        No account? <Link to="/register">Create one</Link>
      </p>
    </main>
  )
}
