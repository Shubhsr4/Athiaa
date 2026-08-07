# Athia — Full Authentication & Admin Authorization Guide

This document explains how to make any user an **Admin** and details the full **Phone-OTP Authentication & Role Authorization System** built for Athia.

---

## 1. How to Make a User an Admin

Role privileges in Athia live strictly inside the `user_roles` database table.

### Option A: Using Supabase Dashboard (SQL Editor) — Recommended

1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/ycwldacrvzkooxijtrfi/sql](https://supabase.com/dashboard/project/ycwldacrvzkooxijtrfi/sql)
2. Run this SQL query to assign the `admin` (or `super_admin`) role to any user ID:

```sql
-- Replace 'USER_UUID_HERE' with the user's ID from auth.users or profiles
INSERT INTO user_roles (user_id, role)
VALUES ('USER_UUID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

#### How to find a user's `user_id`:
Run this in the SQL Editor to list all users and their phone numbers:
```sql
SELECT id, phone, created_at FROM profiles;
```

---

### Option B: Quick Test Admin Account
In local development mode, logging in with phone number **`9999999999`** and test OTP **`123456`** automatically grants admin session access.

---

## 2. Complete Architecture of the Auth System

```
[ User Phone ] 
     │
     ▼
1. Login Page (/login) 
     │
     ▼
2. Edge Function: generate-otp ──► MSG91 SMS API ──► Mobile SMS
     │
     ▼
  Hashes OTP (SHA-256) ──► Saved in database table `otp_codes`
     │
     ▼
3. Edge Function: verify-otp ──► Compares SHA-256 Hash ──► Supabase Auth (auth.users)
     │
     ▼
4. Database Trigger: on_auth_user_created ──► Auto-creates `profiles` & `user_roles` ('donor')
     │
     ▼
5. React AuthProvider & AdminRoute ──► Checks `user_roles` / `is_admin()` ──► Access to /admin/*
```

---

### Key Subsystems Detailed:

### Subsystem 1: MSG91 Phone-OTP Generation (`generate-otp`)
- **Location**: [supabase/functions/generate-otp/index.ts](file:///c:/Users/Admin/OneDrive/Desktop/Aathia/supabase/functions/generate-otp/index.ts)
- **Workflow**:
  1. Validates & formats input mobile number to E.164 (`+91XXXXXXXXXX`).
  2. Enforces 30-second rate limiting per phone number using `otp_rate_limits`.
  3. Generates a random 6-digit OTP code, computes its SHA-256 hash using WebCrypto.
  4. Saves `{ phone, otp_hash, expires_at: now() + 10m, attempts: 0, verified: false }` into `otp_codes`.
  5. Calls MSG91 API (`https://control.msg91.com/api/v5/otp`) to deliver SMS to the user's mobile phone.

---

### Subsystem 2: OTP Verification & Session Issuance (`verify-otp`)
- **Location**: [supabase/functions/verify-otp/index.ts](file:///c:/Users/Admin/OneDrive/Desktop/Aathia/supabase/functions/verify-otp/index.ts)
- **Workflow**:
  1. Hashes input code with SHA-256 and compares it against `otp_codes`.
  2. Blocks verification if attempts exceed 5; sets `verified = true` on match.
  3. Checks `auth.users` for existing user or calls `supabaseAdmin.auth.admin.createUser()`.
  4. Generates real Supabase Auth session JWT token using `generateLink` and `verifyOtp`.
  5. Returns JWT session to client.

---

### Subsystem 3: Database Trigger & Auto-Profile (`handle_new_user()`)
- **Location**: [supabase/migrations/20260807000003_profiles.sql](file:///c:/Users/Admin/OneDrive/Desktop/Aathia/supabase/migrations/20260807000003_profiles.sql)
- **Workflow**:
  1. Trigger `on_auth_user_created` executes automatically whenever a row appears in `auth.users`.
  2. Inserts profile record into `profiles` table.
  3. Inserts default `'donor'` role into `user_roles` table.

---

### Subsystem 4: Role-Based Authorization & RLS
- **Location**: [supabase/migrations/20260807000002_app_role_and_user_roles.sql](file:///c:/Users/Admin/OneDrive/Desktop/Aathia/supabase/migrations/20260807000002_app_role_and_user_roles.sql)
- **Design Principle**:
  - Roles live **exclusively** inside `user_roles` (`donor`, `volunteer`, `ngo_staff`, `admin`, `super_admin`).
  - Roles **never** live on `profiles`, preventing users from self-elevating privileges by editing their profile.
  - RLS policies utilize `SECURITY DEFINER` function `is_admin(auth.uid())` with `SET search_path = public` to prevent RLS recursion and search_path hijacking.

---

### Subsystem 5: Frontend Route Protection (`AdminRoute` & `AuthProvider`)
- **Location**: [components/providers/AuthProvider.tsx](file:///c:/Users/Admin/OneDrive/Desktop/Aathia/components/providers/AuthProvider.tsx) & [src/components/AdminRoute.tsx](file:///c:/Users/Admin/OneDrive/Desktop/Aathia/src/components/AdminRoute.tsx)
- **Workflow**:
  1. `AuthProvider` queries `user_roles` table and `is_admin()` RPC function on startup.
  2. `AdminRoute` component gates all `/admin/*` routes in `src/App.tsx`.
  3. Non-admin or unauthenticated users attempting to navigate to `/admin/*` are automatically redirected to `/login`.
