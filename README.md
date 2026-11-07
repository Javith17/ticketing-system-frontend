# Ticketing System — Frontend

React + TypeScript SPA for the Ticketing System, built with Vite, Material UI, Redux Toolkit, and React Router.

## Stack

- **React 19 + TypeScript** (Vite)
- **Material UI** for components, **MUI Icons** / **react-icons** for iconography
- **Redux Toolkit** for state management, backed by a REST API via `src/api/client.ts`
- **React Router v7** with public/protected route guards
- Light/dark theme support, toggle at the bottom of the side navigation

## Project structure

```
src/
  pages/        Route-level page components (Login, Dashboard, Tickets, Users, ...)
  components/    Reusable UI: layout (sidenav/topbar), common, and per-feature dialogs
  redux/         Store, slices (auth/tickets/users/categories/assets/ncr/features/roles/ui)
  api/           Fetch-based REST client (auth header, error handling)
  routes/        ProtectedRoute / PublicRoute guards
  theme/         MUI theme + light/dark ThemeModeContext
  utils/         Validators, formatters, env accessor
  types/         Shared TypeScript types
```

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

The dev server runs on **http://localhost:4001** (configurable via `VITE_PORT` in `.env`). Point
`VITE_API_BASE_URL` at a running backend — every screen loads its data from that API; there is no
mock/offline mode.

## API integration

All Redux slices (`auth`, `tickets`, `users`, `categories`, `assets`, `ncr`, `features`, `roles`) call
the backend through `src/api/client.ts` (`apiGet`/`apiPost`/`apiPatch`/`apiDelete`), which attaches the
bearer token from sign-in and normalizes error responses. Each slice maps the backend's snake_case
response shape to the camelCase types in `src/types`. Sign-in expects `POST /auth/signIn` to return
`{ accessToken, user }`; the token is stored and sent as `Authorization: Bearer <token>` on subsequent
requests.

## Available scripts

- `npm run dev` — start the Vite dev server (port from `VITE_PORT`, default `4001`)
- `npm run build` — type-check and build for production into `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint

## Environment variables

See `.env.example`:

- `VITE_PORT` — dev/preview server port (default `4001`)
- `VITE_APP_NAME` — display name
- `VITE_API_BASE_URL` — base URL of the backend API

## AWS deployment

This app is a static SPA build (`dist/`) and can be deployed in any of the following ways:

### Option A — AWS Amplify Hosting

`amplify.yml` is included at the repo root. Connect the repository in the Amplify console; it will run
`npm ci && npm run build` and publish `dist/`. Since this is a client-side-routed SPA, add a rewrite rule
in Amplify's **Rewrites and redirects** so unknown paths fall back to `index.html`:

```
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
Target: /index.html
Type: 200 (Rewrite)
```

### Option B — Containerized (ECS / App Runner / Elastic Beanstalk Docker)

A `Dockerfile` + `nginx.conf` are included, building the app and serving `dist/` via nginx on port
`4001` with SPA fallback routing baked in.

```bash
docker build -t ticketing-frontend .
docker run -p 4001:4001 ticketing-frontend
```

### Option C — S3 + CloudFront

Run `npm run build`, sync `dist/` to an S3 bucket, and front it with CloudFront. Configure the
CloudFront distribution's error pages to return `index.html` (HTTP 200) for 403/404 errors to support
client-side routing.
