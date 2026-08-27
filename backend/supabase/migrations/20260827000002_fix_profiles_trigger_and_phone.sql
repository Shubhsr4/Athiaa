-- ============================================================================
-- Migration: Fix Profiles Schema, Phone Storage, and Auth Trigger
-- Description:
--   Ensures profiles table stores full_name, phone, avatar_url, and city.
--   Updates handle_new_auth_user() to persist all metadata on sign up.
--   Backfills any existing profiles from auth.users raw_user_meta_data.
-- ============================================================================

-- 1. Ensure columns exist on profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Delhi NCR';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Update trigger function to extract both full_name and phone reliably
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
  user_city TEXT;
BEGIN
  -- Extract full_name, phone, avatar, city from raw_user_meta_data or auth.users
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
  user_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Delhi NCR');

  -- 1. Insert or update profile row with ALL fields (full_name, phone, avatar_url, city)
  INSERT INTO public.profiles (id, full_name, phone, avatar_url, city, created_at, is_active)
  VALUES (
    NEW.id,
    user_full_name,
    user_phone,
    user_avatar,
    user_city,
    now(),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    city = COALESCE(EXCLUDED.city, profiles.city);

  -- 2. Lookup 'user' role ID
  SELECT id INTO default_role_id FROM public.roles WHERE LOWER(name) = 'user' LIMIT 1;
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id FROM public.roles WHERE LOWER(name) = 'donor' LIMIT 1;
  END IF;

  -- 3. Auto-assign default role
  IF default_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id, granted_at, granted_by)
    VALUES (NEW.id, default_role_id, now(), NULL)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Re-attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Backfill existing user profiles whose phone wasn't populated from raw_user_meta_data
UPDATE public.profiles p
SET 
  full_name = COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1)),
  phone = COALESCE(NULLIF(p.phone, ''), u.raw_user_meta_data->>'phone', u.phone, '')
FROM auth.users u
WHERE p.id = u.id;
