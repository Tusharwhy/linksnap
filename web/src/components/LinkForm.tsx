import { useState, type FormEvent } from 'react'
import { ApiError, type FieldError } from '../api/client'


interface LinkFormProps {
    submitLabel: string,
    onSubmit: (url: string) => Promise<void>
}

export function LinkForm({ submitLabel, onSubmit }: LinkFormProps) {
    const [userUrls, setUserUrl] = useState('')
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
            await onSubmit(userUrls)
            setUserUrl('')
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
        <form className='link-form' onSubmit={handleSubmit} noValidate>
            {error && <p className="error" role="alert">{error}</p>}

            <label>
                URL:
                <input
                    type="url"
                    placeholder="https://example.com/a/very/long/url"
                    value={userUrls}
                    onChange={(e) => setUserUrl(e.target.value)}
                />
                {fieldError('url') && <span className="field-error">{fieldError('url')}</span>}
            </label>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Please wait..." : submitLabel}
            </button>
        </form>
    )
}