# Authentication & Role-Based Access Control (RBAC)

## Overview

The Introvera Admin Portal uses **Firebase Authentication** for identity (sign-in/sign-up) and a **custom RBAC system** backed by PostgreSQL for authorization (roles & permissions). Firebase handles _who you are_; the backend database decides _what you can do_.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  Next.js (App Router) + TypeScript + Tailwind + shadcn/ui   │
│                                                             │
│  Firebase Web SDK ──► signIn / signUp / signOut              │
│  AuthProvider     ──► stores firebaseUser + appUser          │
│  AuthGuard        ──► blocks unauthenticated / unverified    │
│  PermissionGuard  ──► blocks unauthorized (per permission)   │
│  Sidebar          ──► filters nav items by can()             │
│  API Client       ──► attaches Bearer token to every request │
└────────────────────────────┬────────────────────────────────┘
                             │ Authorization: Bearer <Firebase ID Token>
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  ASP.NET Core 8 Web API (Clean Architecture)                │
│                                                             │
│  FirebaseAuthHandler ──► verifies token, extracts UID/email │
│  PermissionHandler   ──► resolves permissions from DB        │
│  [HasPermission]     ──► attribute on controller actions     │
│  PermissionService   ──► aggregates perms, caches 10 min    │
│  AuthService         ──► sync user, build profile            │
│  AdminService        ──► CRUD users/roles/permissions        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     POSTGRESQL                              │
│  Users, Roles, Permissions, UserRoles, RolePermissions,     │
│  AccessRequests, AuditLogs                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Registration
1. User fills out `/register` form (name, email, password)
2. `signUp()` calls Firebase `createUserWithEmailAndPassword`
3. Firebase sends a **verification email** (link points to `/auth/action?mode=verifyEmail`)
4. User stays signed in but is redirected to `/verify-email` page
5. **User cannot access the dashboard until email is verified**
6. On the `/verify-email` page, user can:
   - Click "I've verified my email" to check status
   - Click "Resend verification email" (60s cooldown)
   - Click "Use a different account" to sign out

### Email Verification
1. User clicks link in email → lands on `/auth/action?mode=verifyEmail&oobCode=...`
2. `applyActionCode()` verifies the email with Firebase
3. `onEmailVerified()` reloads Firebase user + syncs to backend (`POST /api/auth/sync`)
4. Backend creates the user record with **Viewer** role (or **SuperAdmin** if first user)
5. Auto-redirects to `/overview` — no button needed

### Login
1. User enters email/password on `/login`
2. `signIn()` calls Firebase `signInWithEmailAndPassword`
3. If email is **not verified**: re-sends verification email, redirects to `/verify-email`
4. If email is **verified**: `AuthProvider.onAuthStateChanged` fires →
   - Calls `POST /api/auth/sync` (creates user if not exists)
   - Calls `GET /api/auth/me` (returns profile + roles + permissions)
   - Stores in `appUser` context
5. `AuthGuard` allows rendering the dashboard

### Password Reset
1. User clicks "Forgot password?" → goes to `/forgot-password`
2. Enters email → `sendPasswordResetEmail()` sends email via Firebase
3. User clicks link in email → lands on `/auth/action?mode=resetPassword&oobCode=...`
4. Page shows new password form with show/hide toggle
5. On submit → `confirmPasswordReset()` → success → "Go to Sign in"

### Logout
1. User clicks logout in sidebar → `signOut()` clears Firebase session
2. `AuthProvider` sets `firebaseUser = null`, `appUser = null`
3. `AuthGuard` redirects to `/login`

---

## Authorization (RBAC) — Frontend

### AuthProvider (`src/components/providers/AuthProvider.tsx`)

Global React context that provides:

| Property | Type | Description |
|---|---|---|
| `firebaseUser` | `User \| null` | Firebase auth user object |
| `appUser` | `UserProfile \| null` | Backend profile (id, email, roles, permissions) |
| `permissions` | `string[]` | Resolved permission keys (e.g. `["payments.read", "projects.read"]`) |
| `roles` | `string[]` | Role names (e.g. `["Admin", "Manager"]`) |
| `isSuperAdmin` | `boolean` | Whether user has SuperAdmin role |
| `emailVerified` | `boolean` | Whether Firebase email is verified |
| `loading` | `boolean` | Initial auth state loading |
| `can(perm)` | `function` | Check if user has a permission (SuperAdmin always returns true) |
| `isRole(role)` | `function` | Check if user has a specific role |
| `refreshProfile()` | `function` | Re-fetch profile from backend |
| `onEmailVerified()` | `function` | Reload user after email verification |

### Usage

```tsx
const { can, isSuperAdmin, appUser } = useAuth();

// Check permission
if (can("payments.create")) { /* show create button */ }

// Check role
if (isSuperAdmin) { /* show admin panel */ }
```

### AuthGuard (`src/components/auth/AuthGuard.tsx`)

Wraps the `(dashboard)` layout. Blocks rendering until:
1. Firebase auth is resolved
2. Email is verified
3. Backend profile (`appUser`) is loaded

Redirects:
- Not authenticated → `/login`
- Email not verified → `/verify-email`
- Viewer-only role → `/welcome-request-access`

**No flash of protected content** — shows a full-screen loader until everything is ready.

### PermissionGuard (`src/components/auth/PermissionGuard.tsx`)

Wraps individual pages/sections:

```tsx
// Require a specific permission
<PermissionGuard required="users.read">
  <UsersPage />
</PermissionGuard>

// Require SuperAdmin
<PermissionGuard superAdminOnly>
  <RolesPage />
</PermissionGuard>
```

Shows "Access Denied" message if unauthorized.

### Sidebar Navigation (`src/components/layout/Sidebar.tsx`)

Nav items have `permission` or `superAdminOnly` properties:

```tsx
const navItems = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard, permission: "dashboard.read" },
  { label: "Payments", href: "/payments", icon: CreditCard, permission: "payments.read" },
  { label: "Users", href: "/users", icon: Users, permission: "users.read" },
  { label: "Roles & Permissions", href: "/roles", icon: Shield, superAdminOnly: true },
];
```

Items are filtered using `can()` before rendering. Users only see what they have access to.

### API Client (`src/lib/api/client.ts`)

Automatically attaches the Firebase ID token to every request:

```
Authorization: Bearer <Firebase ID Token>
```

No manual token management needed — `getIdToken()` is called on every request.

---

## Route Structure

```
src/app/
├── (auth)/                          # Auth pages (no sidebar/header)
│   ├── layout.tsx                   # Centered layout, redirects verified users to /overview
│   ├── login/page.tsx               # Sign in
│   ├── register/page.tsx            # Create account
│   ├── forgot-password/page.tsx     # Request password reset email
│   ├── reset-password/page.tsx      # Set new password (standalone fallback)
│   ├── verify-email/page.tsx        # Waiting for email verification
│   ├── unauthorized/page.tsx        # Access denied page
│   └── auth/action/page.tsx         # Firebase email action handler (verify + reset)
│
├── (dashboard)/                     # Protected pages (sidebar + header)
│   ├── layout.tsx                   # Wraps with AuthGuard
│   ├── overview/page.tsx            # Dashboard
│   ├── payments/                    # Payment CRUD
│   ├── projects/                    # Project CRUD
│   ├── users/page.tsx               # User management (requires users.read)
│   ├── roles/page.tsx               # Roles & permissions (SuperAdmin only)
│   ├── settings/page.tsx            # Settings
│   └── welcome-request-access/      # Viewer landing page
│
└── layout.tsx                       # Root layout (ThemeProvider + AuthProvider)
```

---

## Viewer Role Behavior

Users who self-register get the **Viewer** role by default. Viewers:

- Are locked to `/welcome-request-access` — cannot access any other dashboard page
- Can submit an access request with an optional message
- See only minimal sidebar items (if any)
- Must wait for a SuperAdmin to upgrade their role

---

## Key Files

| File | Purpose |
|---|---|
| `src/lib/firebase.ts` | Firebase config, signIn, signUp, signOut, resetPassword, getIdToken |
| `src/components/providers/AuthProvider.tsx` | Global auth context with permissions, can(), isRole() |
| `src/components/auth/AuthGuard.tsx` | Route guard: requires auth + verified email + loaded profile |
| `src/components/auth/PermissionGuard.tsx` | Component guard: requires specific permission/role |
| `src/components/layout/Sidebar.tsx` | Permission-filtered navigation |
| `src/lib/api/client.ts` | API client with auto-attached Bearer token |
| `src/services/authService.ts` | API service for auth/admin endpoints |
| `src/types/auth.ts` | TypeScript types for UserProfile, Role, Permission, etc. |
| `src/components/ui/password-input.tsx` | Password input with show/hide toggle |
| `.env.local` | Firebase config + API URL (gitignored) |

---

## Environment Variables

```env
# Firebase (client-side, safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## Firebase Console Setup

1. **Authentication > Sign-in method**: Enable Email/Password
2. **Authentication > Templates**: Click edit on any template → **Customize action URL** → set to:
   - Local: `http://localhost:3000/auth/action`
   - Production: `https://your-domain.com/auth/action`

---

## Security Notes

- Firebase ID tokens expire after 1 hour and are auto-refreshed by the SDK
- The frontend `can()` check is **UX only** — the backend enforces permissions on every API call
- The API client never sends requests without a valid token
- Viewer users cannot access any protected content — the guard blocks before rendering
- All role/permission changes are audit-logged on the backend
