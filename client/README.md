# PrepEdge — Client

React 19 + Vite frontend for the PrepEdge interview preparation tracker. Serves the landing page, authentication, onboarding, dashboard, mock/topic tests, results, confidence explorer, AI coach chat, and the admin panel.

## Stack

| Tool | Version | Purpose |
|---|---|---|
| React | ^19.2.5 | UI framework |
| Vite | ^8.0.9 | Build tool & dev server |
| Tailwind CSS | ^4.3.0 | Utility-first styling |
| React Router DOM | ^7.15.1 | Client-side routing, lazy-loaded pages |
| Recharts | ^3.8.1 | Data visualization (radar, line, bar, pie) |
| Framer Motion | ^12.43.0 | Animations & transitions |
| React Markdown + remark-gfm | ^10.1.0 / ^4.0.1 | Rendering notes/cheat-sheet content |
| @react-oauth/google | ^0.13.5 | Google OAuth integration |
| Lucide React | ^1.16.0 | Icon library |
| Axios | ^1.19.0 | HTTP client |

## Getting Started

```bash
npm install
npm run dev
```

- Dev server starts at `http://localhost:5173`
- Copy `.env.example` to `.env` and set `VITE_API_URL` (default `http://localhost:8080`) and `VITE_GOOGLE_CLIENT_ID`.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Structure

```
src/
├── pages/           Route-level pages (auth, dashboard, tests, results, admin/...)
├── components/      Feature components (dashboard/, mock-test/, interview/, chat/, admin/, ui/, ...)
├── context/         Theme (dark/light) context
├── utils/           API base, chat/auth/profile caches, quiz-session state, validation
└── data/            Static display metadata (category labels/colors)
```

## Environment

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:8080` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client id for the login button |

The backend must be running for most pages to load data — see the [root README](../README.md) for full setup.
