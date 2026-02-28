# CLAUDE.md — Literary Genius Academy

This file provides essential context for AI assistants working in this codebase. Read it before making changes.

---

## Project Overview

**Literary Genius Academy** is an AI-powered educational SaaS platform for PK-12 students, teachers, and parents. It enables book creation, AI tutoring, assignment management, adaptive testing, analytics, and gamification. The platform is deployed on Vercel with Supabase as the backend and Anthropic Claude for AI features.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (PostgreSQL + Auth + Edge Functions)
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Deployment:** Vercel (Edge Functions for API routes)

---

## Development Commands

```bash
npm run dev        # Start Vite dev server on http://localhost:5173
npm run build      # Production build → dist/
npm run build:dev  # Dev-mode build (for debugging)
npm run lint       # Run ESLint over all .ts/.tsx files
npm run preview    # Preview production build locally
```

No test framework is configured. There are no test files or test scripts.

---

## Environment Variables

Create `.env.local` for development (see `.env.local.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-anthropic-key        # Used by api/tutor.ts (server-side only)
```

- `VITE_*` variables are exposed to the browser by Vite.
- `ANTHROPIC_API_KEY` is server-side only (Vercel Edge Function) — never prefix it with `VITE_`.
- For production, set these in the Vercel dashboard under Environment Variables.

---

## Repository Structure

```
/
├── api/                         # Vercel Edge Function API routes
│   ├── tutor.ts                 # POST /api/tutor — AI tutoring endpoint
│   └── cron/                    # Scheduled task handlers
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker (offline support)
│   └── offline.html
├── src/
│   ├── App.tsx                  # Root component — state-based view routing
│   ├── main.tsx                 # Entry point, AuthProvider + PWA setup
│   ├── components/              # All React components (150+)
│   │   ├── ui/                  # shadcn/ui primitives (do not edit directly)
│   │   ├── auth/                # Login, registration, password modals
│   │   ├── admin/               # Admin dashboard and tools
│   │   ├── teacher/             # Teacher-specific components
│   │   ├── AppLayout.tsx        # Public landing page
│   │   ├── StudentView.tsx      # Student main dashboard
│   │   ├── AdminDashboard.tsx   # Admin panel
│   │   ├── AITutor.tsx          # AI chat tutor
│   │   ├── BookCreator.tsx      # Book authoring tool
│   │   └── ...                  # Many feature components
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Auth state (useReducer + Supabase)
│   │   └── AppContext.tsx       # Global app state
│   ├── hooks/                   # 17 custom hooks
│   │   ├── useAuth.ts           # Re-export from AuthContext
│   │   ├── useStudentData.ts
│   │   ├── useTeacherData.ts
│   │   ├── useParentData.ts
│   │   ├── useSubscription.ts
│   │   ├── useOfflineSync.ts
│   │   └── ...
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client + shared DB types
│   │   ├── utils.ts             # cn() utility (clsx + tailwind-merge)
│   │   ├── indexedDB.ts         # Offline data storage
│   │   ├── database-helpers.ts  # DB utility functions
│   │   └── notification-service.ts
│   ├── pages/                   # Standalone page components
│   │   ├── Admin.tsx
│   │   ├── ForStudents.tsx / ForTeachers.tsx
│   │   ├── Pricing.tsx / Features.tsx / About.tsx
│   │   ├── VerifyEmail.tsx / ResetPassword.tsx
│   │   └── ...
│   ├── services/
│   │   ├── adminService.ts      # Admin Supabase queries
│   │   └── bookService.ts       # Book CRUD operations
│   └── types/
│       └── auth.ts              # User, UserRole, AuthState, etc.
├── supabase/
│   ├── migrations/              # 14 SQL migration files (run in order)
│   └── functions/               # Supabase Edge Functions
│       ├── multi-subject-learning-path-generator/
│       └── teacher-analytics/
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json / tsconfig.app.json
├── eslint.config.js
├── components.json              # shadcn/ui config
└── vercel.json                  # SPA rewrites
```

---

## Navigation & Routing

This project uses **state-based view switching** instead of React Router. There is no URL-based routing.

`src/App.tsx` controls which top-level view is shown based on:
- `currentView` state: `'landing' | 'student' | 'admin'`
- Authentication state from `useAuth()`
- Admin status checked via Supabase `profiles` table (`is_admin` or `role === 'admin'`)

**View map:**
| `currentView` | Component | When shown |
|---|---|---|
| `'landing'` | `<AppLayout />` | No user logged in |
| `'admin'` | `<AdminDashboard />` | Authenticated admin user |
| `'student'` | `<StudentView />` | Any authenticated non-admin user |

Pages under `src/pages/` are rendered inside `AppLayout` as content sections, not via URL routing.

---

## Authentication

Managed by `AuthContext` (`src/contexts/AuthContext.tsx`):

- **Provider:** Wrap app in `<AuthProvider>` (done in `main.tsx`)
- **Hook:** `const { user, login, logout, register, ... } = useAuth()`
- **Session:** Persisted in `localStorage` under key `literary-genius-auth`
- **Supabase table:** `user_profiles` (not the built-in `auth.users`)

**Auth flow:**
1. `supabase.auth.getSession()` on mount hydrates state
2. `onAuthStateChange` listener keeps state in sync
3. On login, `fetchUserProfile(userId)` loads from `user_profiles`
4. OAuth (Google, GitHub) users get auto-created profiles with role `'student'`

**User roles** (`src/types/auth.ts`):
```ts
type UserRole = 'student' | 'teacher' | 'parent' | 'admin'
```

Admin status is stored in the `profiles` table as `is_admin: boolean` OR `role: 'admin'`. The app checks both.

---

## Database (Supabase)

**Client initialization:** `src/lib/supabase.ts` — import `supabase` from here everywhere.

**Shared types** are exported from `src/lib/supabase.ts`:
- `UserProfile`, `Student`, `Teacher`, `UserRole`

**Migrations** in `supabase/migrations/` (run in numeric order):
| File | Contents |
|---|---|
| `001_core_schema.sql` | Core tables: user_profiles, students, teachers, parents, assignments, books |
| `002_submissions_grades.sql` | Submission and grading tables |
| `003_learning_achievements.sql` | Achievements and badges |
| `004_notifications_messages.sql` | Notifications and messaging |
| `005_rls_policies*.sql` | Row-Level Security policies |
| `006_triggers_functions*.sql` | Database triggers and stored procedures |
| `007_sample_data*.sql` | Sample seed data |

**Key tables:**
- `user_profiles` — extends `auth.users`; stores role, name, avatar
- `students` — game stats (xp, level, streak, coins)
- `assignments` — teacher-created assignments
- `assignment_submissions` — student work
- `books` / `book_pages` — book creation content
- `profiles` — separate table used by App.tsx for admin check (`is_admin`, `role`)

Note: there are two profile-like tables (`user_profiles` and `profiles`). `AuthContext` reads from `user_profiles`; `App.tsx` reads from `profiles` for admin detection. Be aware of this inconsistency.

---

## AI Tutor API

**File:** `api/tutor.ts` — Vercel Edge Function

**Endpoint:** `POST /api/tutor`

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "subject": "Math",
  "gradeLevel": 4,
  "context": "optional additional context"
}
```

**Response:**
```json
{ "response": "AI tutor message..." }
```

Uses `claude-sonnet-4-20250514` via direct `fetch` to the Anthropic REST API (not the SDK). Maintains full conversation history by passing the `messages` array. The system prompt adapts tone and vocabulary by grade level.

---

## Component Conventions

- **All components are functional** with React hooks. No class components.
- **TypeScript** is required for all source files.
- **Props** use inline TypeScript interfaces (not separate type files, unless shared).
- **Styling** uses Tailwind CSS utility classes. CSS variables are defined in `src/index.css` for the design system.
- **UI primitives** from `shadcn/ui` live in `src/components/ui/`. Do not modify these files directly — use `npx shadcn-ui@latest add <component>` to add new ones.
- **Class name utility:** use `cn()` from `src/lib/utils.ts` (combines `clsx` and `tailwind-merge`).
- **Forms:** React Hook Form + Zod validation.
- **Data fetching:** Supabase client directly inside hooks/services, with React Query for caching where needed.
- **Notifications/toasts:** use `sonner` (imported as `toast` from `sonner`).

---

## State Management

- **Auth state:** `AuthContext` (useReducer pattern)
- **App-level state:** `AppContext`
- **Server state:** React Query (`@tanstack/react-query`)
- **Domain data:** Custom hooks (`useStudentData`, `useTeacherData`, `useParentData`, etc.)
- **Local component state:** `useState`
- **Offline data:** IndexedDB via `src/lib/indexedDB.ts`

---

## TypeScript Configuration

- `tsconfig.json` — base config, references `tsconfig.app.json` and `tsconfig.node.json`
- `tsconfig.app.json` — browser code; `strict` mode, but `noUnusedLocals`, `noImplicitAny`, and `noFallthroughCasesInSwitch` are **disabled**
- Path alias: `@/*` resolves to `./src/*` — use this for all imports within `src/`

```ts
// Correct
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// Avoid relative paths across directories
import { supabase } from '../../lib/supabase'
```

---

## ESLint

Config in `eslint.config.js`:
- TypeScript ESLint recommended rules
- React Hooks rules (enforced)
- React Refresh plugin (warns on non-component exports from component files)
- `@typescript-eslint/no-unused-vars` is **off** — unused variables won't error

Run: `npm run lint`

---

## Styling Conventions

- **Dark mode:** class-based via `next-themes`. Use `dark:` Tailwind variants.
- **Brand colors:** defined as CSS custom properties in `src/index.css` and referenced in `tailwind.config.ts` (HSL-based: `--primary`, `--secondary`, `--destructive`, etc.)
- **Primary color scheme:** Deep blue (`#1a2744`, `#2d3e5f`) with gold accents (`#ffd700`)
- **Responsive design:** Mobile-first. Use `sm:`, `md:`, `lg:` breakpoint prefixes.
- **Typography plugin:** `@tailwindcss/typography` available for prose content.

---

## PWA & Offline

- Service worker at `public/sw.js`
- PWA manifest at `public/manifest.json` (app name: "Literary Genius Academy")
- Offline page at `public/offline.html`
- IndexedDB for local data: `src/lib/indexedDB.ts`
- Offline sync: `useOfflineSync()` hook and `OfflineDataSyncManager` component
- PWA install prompt: `PWAInstallPrompt` component

---

## Deployment

**Platform:** Vercel

- `vercel.json` rewrites all routes to `index.html` (SPA mode)
- Build command: `npm run build`
- Output directory: `dist/`
- API routes under `api/` are deployed as Vercel Edge Functions
- No source maps in production (disabled in `vite.config.ts`)

**Pre-deployment checklist:**
1. Run all Supabase migrations
2. Set environment variables in Vercel dashboard (Production + Preview + Development)
3. Configure Supabase Auth providers (Google, GitHub)
4. Set up email verification redirect URLs
5. Configure Stripe webhooks (if payments active)

Documentation files for deployment: `DEPLOYMENT_GUIDE.md`, `VERCEL_SETUP.md`, `SUPABASE_SETUP_GUIDE.md`

---

## Key Patterns & Gotchas

1. **Two profile tables:** `user_profiles` (used by AuthContext) and `profiles` (used by App.tsx for admin check). When querying user role/admin status, be clear which table is being used.

2. **No React Router:** All navigation is state-driven. Do not add React Router without agreement — it was intentionally removed. To navigate between sections, lift state or use context.

3. **Admin detection:** Admin status is `profile.is_admin === true || profile.role === 'admin'`. Both fields must be checked.

4. **Edge Function AI calls:** `api/tutor.ts` uses raw `fetch` to the Anthropic REST API, not the SDK. The model is pinned to `claude-sonnet-4-20250514`.

5. **Debug logging:** `App.tsx` contains many `console.log` calls for debugging. These are intentional for now and should not be removed without care.

6. **OAuth profile creation:** OAuth sign-ins that don't have an existing `user_profiles` row trigger `createOAuthProfile()`, which defaults the role to `'student'`.

7. **`cn()` for class names:** Always use `import { cn } from '@/lib/utils'` when combining conditional Tailwind classes.

8. **shadcn/ui components:** Located in `src/components/ui/`. These are generated files — prefer adding new shadcn components via CLI rather than editing existing ones manually.

---

## Adding New Features

When adding a new feature:
1. Create components in `src/components/` (or a subdirectory if feature-specific)
2. Add domain data hooks in `src/hooks/` if the feature needs Supabase data
3. Add services in `src/services/` for complex query logic
4. Add types to `src/types/` or locally in the component for simple prop types
5. For new API endpoints, add a file under `api/` as a Vercel Edge Function
6. For new DB tables, create a numbered migration in `supabase/migrations/`

---

## Documentation Files

The repo contains 30+ markdown documentation files in the root covering:
- `SETUP_INSTRUCTIONS.md` — full local setup guide
- `SUPABASE_SETUP_GUIDE.md` — Supabase project setup
- `DEPLOYMENT_GUIDE.md` / `VERCEL_SETUP.md` — Vercel deployment
- `STRIPE_SETUP_GUIDE.md` — payment integration
- `AUTHENTICATION_SETUP.md` / `GOOGLE_AUTH_SETUP.md` — OAuth setup
- `AI_QUESTION_GENERATION_SETUP.md` — AI feature setup
- `BUILD_TROUBLESHOOTING.md` / `VERCEL_TROUBLESHOOTING.md` — common issues
