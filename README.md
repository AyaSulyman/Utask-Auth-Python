# uTask — Full Authentication & User Management System

A production-style REST API built with **FastAPI**, backed by **PostgreSQL**, with a
**Next.js + TypeScript** frontend. JWT authentication, role-based access control
(admin / client), pagination, filtering, soft delete, and public statistics.

```
utask-auth-system/
├── backend/     FastAPI + PostgreSQL API
└── frontend/    Next.js + TypeScript client
```

---

## Quick start

You need both servers running at the same time, in two terminals.

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env — set DATABASE_URL to your Postgres instance and a real JWT_SECRET_KEY

python -m venv venv
source venv/bin/activate       =
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Runs on **http://localhost:8000**. Swagger docs at `/docs`. Tables are created
automatically on first run — no manual migrations needed.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
Runs on **http://localhost:3000**. You'll be redirected to `/login` automatically.

### 3. Try it out

Register an account (it's created as `client` automatically), then promote
yourself to `admin` if you need admin access:
```sql
UPDATE users SET type = 'admin' WHERE email = 'you@example.com';
```

---

## Connecting the two

The frontend talks to the backend over HTTP using `NEXT_PUBLIC_API_URL`
(`frontend/.env.local`), and the backend must allow the frontend's origin via
`CORS_ORIGINS` (`backend/.env`).

| Setting | File | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | `http://localhost:8000` |
| `CORS_ORIGINS` | `backend/.env` | must include `http://localhost:3000` |

If login/register requests fail with a CORS error in the browser console, this
mismatch is almost always the cause.

---

## Backend

### Setup

**1. Configure environment variables**
```bash
cp .env.example .env
```
```env
DATABASE_URL=postgresql+psycopg2://utask_user:utask_pass@localhost:5432/utask
JWT_SECRET_KEY=some-long-random-string     # generate a real one for production
CORS_ORIGINS=http://localhost:3000
```

**2. Create the database**

*Option A — pgAdmin4 (GUI)*
1. Right-click **Login/Group Roles** → **Create** → name `utask_user`, set a
   password, enable **Can login?**
2. Right-click **Databases** → **Create** → name `utask`, owner `utask_user`

*Option B — psql*
```sql
CREATE USER utask_user WITH PASSWORD 'utask_pass';
CREATE DATABASE utask OWNER utask_user;
```

No manual migrations needed — tables are created automatically on first run.

**3. Install dependencies and run**
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- Interactive docs (Swagger UI): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/stats/count` → `{"total_users": 0}`

**Running with Docker instead** (from the project root, not this folder):
```bash
docker compose up --build
```
Starts Postgres and the API together, fully wired.

### Project structure

```
backend/
├── app/
│   ├── main.py                 FastAPI app instance, startup, router mounting
│   ├── config.py                Settings (env vars) via pydantic-settings
│   ├── database.py              SQLAlchemy engine/session setup
│   ├── models.py                SQLAlchemy User model
│   ├── schemas.py                Pydantic request/response schemas + validation
│   ├── security.py              Password hashing (Argon2), JWT sign/verify
│   ├── dependencies.py          Auth guards (get_current_user, require_admin)
│   ├── exception_handlers.py    Consistent error response formatting
│   ├── routers/
│   │   ├── auth.py              /register, /login
│   │   ├── users.py             /users/me, /users (admin CRUD)
│   │   └── stats.py             /stats/count, /average-age, /top-cities
│   └── services/
│       └── user_service.py      Business logic, isolated from HTTP layer
├── tests/                       pytest suite (37 tests)
├── requirements.txt
├── Dockerfile
└── .env.example
```

### API reference

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/register` | Public | Register as client (role is always forced to `client`) |
| POST | `/login` | Public | Log in, receive a JWT |
| POST | `/users` | Admin | Create a client or admin |
| GET | `/users/me` | Authenticated | Get own profile |
| PUT | `/users/me` | Authenticated | Update own profile (never own role) |
| GET | `/users` | Admin | List users — paginated, filterable, searchable |
| PUT | `/users/{id}` | Admin | Update any user, including their role |
| DELETE | `/users/{id}` | Admin | Soft-delete a user |
| GET | `/stats/count` | Public | Total active users |
| GET | `/stats/average-age` | Public | Average age of active users |
| GET | `/stats/top-cities` | Public | Top 3 cities by active user count |

**Pagination & filtering** (`GET /users`):
```
GET /users?city=Tripoli&type=client&page=2&limit=10
```
Filterable by `age`, `city`, `type`, `first_name`, `last_name`, `email`, combinable
with `page` and `limit` (capped by `MAX_PAGE_SIZE`). Response:
```json
{
  "page": 2,
  "limit": 10,
  "total": 45,
  "total_pages": 5,
  "users": [ ... ]
}
```

**Error codes:**

| Code | Meaning |
|---|---|
| 400 | Invalid request / business rule violation |
| 401 | Missing/invalid/expired JWT, bad login, or soft-deleted user |
| 403 | Authenticated but not authorized (e.g. client hitting an admin route) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |

### Testing

```bash
pytest
```
Runs against an isolated in-memory SQLite database, so it doesn't touch your real
Postgres data. 37 tests covering registration, login, auth/authorization, admin
user management, soft delete, and public statistics.

To test against real Postgres instead:
```bash
DATABASE_URL=postgresql+psycopg2://utask_user:utask_pass@localhost:5432/utask_test pytest
```
Use a throwaway database for this — the test suite creates and deletes data.

### Security notes

- Passwords are hashed with **Argon2** before storage — never logged, stored,
  or returned in plain text.
- Public registration cannot set `type` — the field is absent from the
  registration schema entirely, not just ignored.
- Soft-deleted users (`is_deleted=true`) fail login with `401` even with correct
  credentials, and are excluded from `/users` listings and all `/stats` endpoints.
- Role changes only happen via `PUT /users/{id}` by an authenticated admin.

---

## Frontend

### Requirements

- Node.js 18.18+ (Next.js 16 requirement)
- The backend running and reachable

### Setup

**1. Configure environment variables**
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
Point this at wherever the FastAPI backend is actually running.

**2. Install and run**
```bash
npm install
npm run dev
```
Open **http://localhost:3000**.

**Other scripts:**
```bash
npm run build   =
npm run start    =
npm run lint    =
npx tsc --noEmit =
```

### Project structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx            Root layout — global CSS, metadata, providers
│   │   ├── providers.tsx         Wraps the app in ThemeProvider + AuthProvider
│   │   ├── page.tsx              Root route — redirects based on auth state
│   │   ├── globals.css           Design tokens, theme, shared animation classes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── stats/page.tsx
│   │   └── admin/users/page.tsx
│   ├── components/
│   │   ├── AppLayout.tsx         Sidebar + header shell for authenticated pages
│   │   ├── AuthLayout.tsx        Split-screen layout for login/register
│   │   ├── ProtectedRoute.tsx    Redirects unauthenticated/unauthorized users
│   │   ├── ui.tsx                Shared primitives: Card, Button, Field, Badge, etc.
│   │   └── icons.tsx             Inline SVG icon set
│   ├── context/
│   │   ├── AuthContext.tsx       Token/user state, login/logout, localStorage sync
│   │   └── ThemeContext.tsx      Light/dark theme, localStorage sync
│   └── lib/
│       └── api.ts                Typed fetch wrapper + all API request functions
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.example
```

### Pages

| Route | Access | Purpose |
|---|---|---|
| `/login` | Public | Sign in |
| `/register` | Public | Create an account (always created as `client`) |
| `/dashboard` | Authenticated | Overview stats + account summary |
| `/profile` | Authenticated | View/edit own info and password |
| `/stats` | Authenticated | Full public statistics view |
| `/admin/users` | Admin only | Paginated, filterable user table; create/edit/soft-delete |

`ProtectedRoute` wraps every authenticated page and redirects to `/login` if
there's no valid session, or to `/dashboard` if a non-admin hits an admin-only route.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| Login/register fails with a CORS error in the browser console | Backend's `CORS_ORIGINS` doesn't include `http://localhost:3000` — check `backend/.env` |
| Login/register fails with a network error (no CORS message) | Backend isn't running, or `NEXT_PUBLIC_API_URL` is wrong |
| Blank page / stuck on spinner | Check the browser console — usually an expired/invalid token; clear localStorage and log in again |
| `npm run dev` fails to start | Delete `node_modules` and `.next`, then `npm install` again |

---

## Core features

- **JWT authentication** — stateless, signed tokens issued at login
- **Role-based access** — exactly two roles, `admin` and `client`, enforced server-side
- **Secure by design** — Argon2 password hashing; public registration can never set a role
- **Pagination & filtering** — combinable filters on age, city, type, first/last name, email
- **Soft delete** — deleted users are deactivated, not destroyed; excluded from
  logins, listings, and public stats
- **Public statistics** — total active users, average age, top 3 cities — no auth required

## Tech stack

| Layer | Technology |
|---|---|
| API | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Auth | JWT (python-jose), Argon2 (passlib) |
| Frontend | Next.js 16 (App Router), TypeScript, React |
| Testing | pytest, httpx |
