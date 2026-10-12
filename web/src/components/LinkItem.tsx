import { useState } from 'react'
import type { Link } from '../api/links'
import { LinkStats } from './LinkStats'

interface LinkItemProps {
    link: Link
    onDelete: (code: string) => Promise<void>
}

export function LinkItem({ link, onDelete }: LinkItemProps) {
    const [copied, setCopied] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const copy = async () => {
        await navigator.clipboard.writeText(link.shortUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const remove = async () => {
        if (!confirm(`Delete ${link.shortUrl}? It will stop working immediately.`)) return
        setIsDeleting(true)
        try {
            await onDelete(link.code)
        } catch {
            setIsDeleting(false)
        }
    }

    return (
        <li className="link-item">
            <div className="link-row">
                <div className="link-info">
                    <a href={link.shortUrl} target="_blank" rel="noreferrer" className="short-url">
                        {link.shortUrl}
                    </a>
                    <span className="original-url" title={link.url}>{link.url}</span>
                    <span className="hint">
                        {link.clicks} {link.clicks === 1 ? 'click' : 'clicks'} · created{' '}
                        {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="link-actions">
                    <button className="secondary" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
                    <button className="secondary" onClick={() => setShowStats((s) => !s)}>
                        {showStats ? 'Hide stats' : 'Stats'}
                    </button>
                    <button className="danger" onClick={remove} disabled={isDeleting}>
                        {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
            {showStats && <LinkStats code={link.code} />}
        </li>
    )
}
