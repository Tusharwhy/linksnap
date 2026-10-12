import { useEffect, useState } from 'react'
import { LinkForm } from '../components/LinkForm'
import { LinkItem } from '../components/LinkItem'
import { useAuth } from '../hooks/useAuth'
import { linkApi, type LinkList } from '../api/links'

const PAGE_SIZE = 10

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [page, setPage] = useState(1)
  const [data, setData] = useState<LinkList | null>(null)
  const [error, setError] = useState('')

  // Bumping this number re-runs the effect below, which reloads the list
  const [reloadKey, setReloadKey] = useState(0)
  const reload = () => setReloadKey((key) => key + 1)

  useEffect(() => {
    // Ignore responses from an older request (e.g. user clicked "Next" twice quickly)
    let ignore = false
    linkApi
      .listLinks(page, PAGE_SIZE)
      .then((result) => {
        if (ignore) return
        // If the last link on a page was deleted, step back to the previous page
        if (result.links.length === 0 && page > 1) return setPage(page - 1)
        setData(result)
        setError('')
      })
      .catch(() => !ignore && setError('Could not load your links'))
    return () => {
      ignore = true
    }
  }, [page, reloadKey])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <main className="page">
      <header className="topbar">
        <strong>LinkSnap</strong>
        <span>
          {user?.email} <button className="link-button" onClick={logout}>Log out</button>
        </span>
      </header>

      <section className="card">
        <h1>Shorten a link</h1>
        <LinkForm
          submitLabel="Create Link"
          onSubmit={async (url) => {
            await linkApi.createLink(url)
            // New links appear at the top of page 1
            setPage(1)
            reload()
          }}
        />
      </section>

      <section className="card">
        <div className="section-header">
          <h1>Your links</h1>
          <button className="secondary" onClick={reload}>Refresh</button>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        {!data && !error && <p className="hint">Loading…</p>}
        {data?.total === 0 && <p className="hint">No links yet. Create your first one above.</p>}

        {data && data.links.length > 0 && (
          <>
            <ul className="link-list">
              {data.links.map((link) => (
                <LinkItem
                  key={link.code}
                  link={link}
                  onDelete={async (code) => {
                    await linkApi.deleteLink(code)
                    reload()
                  }}
                />
              ))}
            </ul>

            {totalPages > 1 && (
              <nav className="pagination">
                <button className="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
                <span className="hint">Page {page} of {totalPages}</span>
                <button className="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  )
}
