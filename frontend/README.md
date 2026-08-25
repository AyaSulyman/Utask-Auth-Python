# uTask Frontend (Next.js + TypeScript)

This is the Next.js (App Router) + TypeScript port of the original Vite/React frontend.
Same design, same features, same backend — only the framework changed.

## Setup

```bash
npm install
cp .env.example .env.local   
npm run dev
```

Make sure the FastAPI backend's `CORS_ORIGINS` includes `http://localhost:3000`
(already the case in `backend/.env.example`).

## Structure

- `src/app/` — routes (App Router): `/login`, `/register`, `/dashboard`, `/profile`,
  `/stats`, `/admin/users`, plus `/` which redirects based on auth state.
- `src/components/` — `AppLayout`, `AuthLayout`, `ProtectedRoute`, shared `ui.tsx`
  primitives, and the `icons.tsx` icon set.
- `src/context/` — `AuthContext` and `ThemeContext`, both client-side providers
  wired up in `src/app/providers.tsx`.
- `src/lib/api.ts` — typed fetch wrapper for the FastAPI backend.

## Notes on the migration

- `react-router-dom` → Next.js `next/navigation` (`useRouter`, `usePathname`) and `next/link`.
- `ProtectedRoute` no longer has a `<Navigate>` equivalent, so it redirects via
  `useRouter().replace()` inside a `useEffect`, showing a spinner until resolved.
- `localStorage` access (auth token, theme) is guarded and only read after mount,
  since it's unavailable during Next.js server-side rendering.
- `import.meta.env.VITE_API_URL` → `process.env.NEXT_PUBLIC_API_URL`.
- All components are typed; `npx tsc --noEmit` and `npm run build` both pass clean.
