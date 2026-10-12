# LinkSnap Web

React frontend for LinkSnap: sign up, create short links, copy and share them, view 7-day click stats, and delete links.

**Stack:** React 19 · TypeScript · Vite · React Router

## Run locally

The API must be running on `http://localhost:3000` (see [`../api`](../api)).

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
```

In development, Vite proxies `/api` and `/r` to the API, so the browser sees a single origin and no CORS setup is needed.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Base path of the API |

## Structure

```
src/
├── api/          # apiRequest() client, auth + links API calls
├── context/      # AuthContext + AuthProvider (user session)
├── hooks/        # useAuth()
├── components/   # AuthForm, LinkForm, LinkItem, LinkStats, route guards
├── pages/        # Login, Register, Dashboard
└── App.tsx       # Routes
```

## How auth works

- The JWT from login/register is stored in `localStorage` and sent as `Authorization: Bearer <token>` on every request.
- On page load, `AuthProvider` calls `/auth/me` to restore the session.
- Any `401` response logs the user out (for example, an expired token).
- `ProtectedRoute` sends logged-out users to `/login`, then back to the page they wanted.
