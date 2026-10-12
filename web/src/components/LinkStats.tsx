import { useEffect, useState } from 'react'
import { linkApi, type LinkStats as Stats } from '../api/links'

export function LinkStats({ code }: { code: string }) {
    const [stats, setStats] = useState<Stats | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        linkApi
            .getStats(code)
            .then(setStats)
            .catch(() => setError('Could not load stats'))
    }, [code])

    if (error) return <p className="field-error">{error}</p>
    if (!stats) return <p className="hint">Loading stats…</p>

    // Scale bars relative to the busiest day (at least 1 to avoid dividing by 0)
    const max = Math.max(1, ...stats.daily.map((day) => day.clicks))

    return (
        <div className="stats">
            <p className="hint">Last 7 days · {stats.totalClicks} clicks in total</p>
            <div className="chart">
                {stats.daily.map((day) => (
                    <div key={day.date} className="chart-col" title={`${day.date}: ${day.clicks} clicks`}>
                        <span className="chart-value">{day.clicks}</span>
                        <div className="chart-bar" style={{ height: `${(day.clicks / max) * 100}%` }} />
                        <span className="chart-label">
                            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
