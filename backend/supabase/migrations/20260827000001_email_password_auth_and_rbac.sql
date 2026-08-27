-- ============================================================================
-- Migration: Complete Email/Password Auth, RBAC & Profiles System
-- Timestamp: 2026-08-27
-- Description:
--   1. Creates/standardizes profiles, roles, and user_roles tables.
--   2. Seeds core roles ('admin', 'user').
--   3. Implements SECURITY DEFINER function has_role(check_user_id, check_role).
--   4. Creates auth.users trigger to auto-create profile & auto-assign 'user' role.
--   5. Enforces strict RLS policies (Admins full access, Users own profile, Admins manage roles).
--   6. Creates narrow public_profiles view (hiding email & phone).
-- ============================================================================

-- 1. Core Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Seed core roles: 'admin' and 'user'
INSERT INTO public.roles (name) VALUES
  ('admin'),
  ('user')
ON CONFLICT (name) DO NOTHING;

-- 2. Profiles Table
-- Linked 1:1 with auth.users(id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Ensure all required columns exist with correct defaults
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. User Roles Junction Table
-- Enforces composite Primary Key (user_id, role_id)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, role_id)
);

-- 4. SECURITY DEFINER Function: has_role(check_user_id, check_role)
-- Single source of truth for all role authorization checks (DB RLS & Edge Functions)
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF check_user_id IS NULL OR check_role IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = check_user_id
      AND LOWER(r.name) = LOWER(check_role)
  );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, anon, service_role;

-- 5. Trigger Function: handle_new_auth_user()
-- Triggered AFTER INSERT on auth.users
-- Automatically creates matching profiles row & assigns default 'user' role.
-- (NO ONE ever gets 'admin' automatically)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role_id INT;
  user_full_name TEXT;
  user_phone TEXT;
  user_avatar TEXT;
BEGIN
  -- Extract full_name and phone from options.data metadata
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  user_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    NEW.phone,
    ''
  );
  
  user_avatar := NEW.raw_user_meta_data->>'avatar_url';

  -- 1. Create matching profile row
  INSERT INTO public.profiles (id, full_name, phone, avatar_url, created_at, is_active)
  VALUES (
    NEW.id,
    user_full_name,
    user_phone,
    user_avatar,
    now(),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    phone = CASE WHEN profiles.phone IS NULL OR profiles.phone = '' THEN EXCLUDED.phone ELSE profiles.phone END,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);

  -- 2. Lookup 'user' role ID
  SELECT id INTO default_role_id FROM public.roles WHERE LOWER(name) = 'user' LIMIT 1;

  -- 3. Auto-assign default 'user' role (NEVER admin)
  IF default_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id, granted_at, granted_by)
    VALUES (NEW.id, default_role_id, now(), NULL)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 6. Narrow Public Profiles View
-- Exposes only safe public attributes; NEVER exposes phone or email
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT 
    id, 
    full_name, 
    avatar_url, 
    created_at
  FROM public.profiles
  WHERE is_active = true;

GRANT SELECT ON public.public_profiles TO authenticated, anon, service_role;

-- 7. Row Level Security (RLS) Configuration

-- Enable RLS across all auth/RBAC tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Clean up existing duplicate policies if present
DROP POLICY IF EXISTS "Public read roles" ON public.roles;
DROP POLICY IF EXISTS "Users read own profile or admins read all" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile or admins update all" ON public.profiles;
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users read own roles or admins read all" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;

-- Roles Policies: Read-only for authenticated & public
CREATE POLICY "Public read roles"
  ON public.roles FOR SELECT
  USING (true);

-- Profiles Policies:
-- (a) SELECT: Users read only their own profile, Admins read all profiles
CREATE POLICY "Users read own profile or admins read all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- (b) UPDATE: Users update only their own profile, Admins update all
CREATE POLICY "Users update own profile or admins update all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- (c) DELETE: Restricted to Admins only
CREATE POLICY "Admins delete profiles"
  ON public.profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- User Roles Policies:
-- (a) SELECT: Users read their own roles, Admins read all
CREATE POLICY "Users read own roles or admins read all"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- (b) ALL (INSERT/UPDATE/DELETE): Restricted exclusively to Admins.
-- Regular users can NEVER insert, modify or delete role assignments.
CREATE POLICY "Admins manage user roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
