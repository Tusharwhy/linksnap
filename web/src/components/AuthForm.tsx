import { useState, type FormEvent } from 'react'
import { ApiError, type FieldError } from '../api/client'
import type { Credentials } from '../api/auth'

interface AuthFormProps {
  title: string
  submitLabel: string
  passwordHint?: string
  onSubmit: (credentials: Credentials) => Promise<void>
}

export function AuthForm({ title, submitLabel, passwordHint, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fieldError = (field: string) => fieldErrors.find((e) => e.field === field)?.message

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setFieldErrors([])
    setIsSubmitting(true)
    try {
      await onSubmit({ email, password })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError('Could not reach the server. Is the backend running?')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h1>{title}</h1>

      {error && <p className="error" role="alert">{error}</p>}

      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {fieldError('email') && <span className="field-error">{fieldError('email')}</span>}
      </label>

      <label>
        Password
        <input
          type="password"
          autoComplete={submitLabel === 'Log in' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {passwordHint && !fieldError('password') && <span className="hint">{passwordHint}</span>}
        {fieldError('password') && <span className="field-error">{fieldError('password')}</span>}
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Please wait…' : submitLabel}
      </button>
    </form>
  )
}
