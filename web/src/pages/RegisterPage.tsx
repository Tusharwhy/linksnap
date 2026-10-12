import { Link, useNavigate } from 'react-router'
import { AuthForm } from '../components/AuthForm'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  return (
    <main className="page">
      <AuthForm
        title="Create your account"
        submitLabel="Sign up"
        passwordHint="At least 8 characters"
        onSubmit={async (credentials) => {
          await register(credentials)
          navigate('/', { replace: true })
        }}
      />
      <p className="center">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  )
}
