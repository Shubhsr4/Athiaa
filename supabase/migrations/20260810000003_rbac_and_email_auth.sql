-- Migration: Hierarchical RBAC, Email Auth Profiles & Security Trigger

-- 1. Roles Seed Table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

INSERT INTO roles (name) VALUES
  ('admin'),
  ('staff'),
  ('donor'),
  ('volunteer'),
  ('foster'),
  ('rescuer'),
  ('adopter')
ON CONFLICT (name) DO NOTHING;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. User Roles Junction Table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, role_id)
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Role Details Tables
CREATE TABLE IF NOT EXISTS donor_details (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  pan_number TEXT,
  total_donated NUMERIC(12,2) NOT NULL DEFAULT 0,
  preferred_causes TEXT[]
);
ALTER TABLE donor_details ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS volunteer_details (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  skills TEXT[],
  availability TEXT,
  background_check_status TEXT NOT NULL DEFAULT 'pending',
  assigned_shelter_id TEXT
);
ALTER TABLE volunteer_details ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS foster_details (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  home_type TEXT,
  max_capacity INT,
  currently_fostering_count INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE foster_details ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS rescuer_details (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_available BOOLEAN NOT NULL DEFAULT false,
  coverage_area TEXT,
  active_rescue_count INT NOT NULL DEFAULT 0
);
ALTER TABLE rescuer_details ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS adopter_details (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  home_verification_status TEXT NOT NULL DEFAULT 'pending',
  application_notes TEXT
);
ALTER TABLE adopter_details ENABLE ROW LEVEL SECURITY;

-- 5. Public Profiles View (Exposes non-sensitive profile info safely)
CREATE OR REPLACE VIEW public_profiles AS
  SELECT id, full_name, avatar_url, created_at
  FROM profiles
  WHERE is_active = true;

-- 6. SINGLE SOURCE OF TRUTH RBAC SECURITY FUNCTION (Supports text role or role_id join)
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  has_match BOOLEAN := false;
BEGIN
  -- 1. Check direct role text column on user_roles (if pre-existing enum/text schema)
  BEGIN
    EXECUTE 'SELECT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = $1 AND (role::text = $2 OR ($2 = ''admin'' AND role::text IN (''admin'', ''super_admin'')))
    )' INTO has_match USING check_user_id, check_role;
  EXCEPTION WHEN OTHERS THEN
    has_match := false;
  END;

  IF has_match THEN
    RETURN true;
  END IF;

  -- 2. Check role_id join against roles table
  BEGIN
    EXECUTE 'SELECT EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1 AND r.name = $2
    )' INTO has_match USING check_user_id, check_role;
  EXCEPTION WHEN OTHERS THEN
    has_match := false;
  END;

  RETURN has_match;
END;
$$;

-- 7. Trigger Function on auth.users AFTER INSERT (Auto-profile + Default 'donor' role)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  donor_role_id INT;
BEGIN
  -- Create profile record
  INSERT INTO profiles (id, full_name, avatar_url, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'city'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;

  -- Lookup donor role ID
  SELECT id INTO donor_role_id FROM roles WHERE name = 'donor';

  -- Auto-grant default 'donor' role
  IF donor_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, granted_by)
    VALUES (NEW.id, donor_role_id, NULL)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    -- Create matching donor_details row
    INSERT INTO donor_details (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 8. Row Level Security Policies

-- roles policies
CREATE POLICY "Public read roles" ON roles FOR SELECT USING (true);

-- profiles policies
CREATE POLICY "Users read own profile or admins read all" ON profiles FOR SELECT
  USING (auth.uid() = id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile or admins update all" ON profiles FOR UPDATE
  USING (auth.uid() = id OR has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR has_role(auth.uid(), 'admin'));

-- user_roles policies (Strictly Admin-managed)
CREATE POLICY "Users read own roles or admins read all" ON user_roles FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage user roles" ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- donor_details policies
CREATE POLICY "Donors read own details or admins" ON donor_details FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Donors update own details or admins" ON donor_details FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Donors insert own details" ON donor_details FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'donor'));

-- volunteer_details policies
CREATE POLICY "Volunteers read own details or admins" ON volunteer_details FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Volunteers update own details or admins" ON volunteer_details FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Volunteers insert own details" ON volunteer_details FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'volunteer'));

-- foster_details policies
CREATE POLICY "Fosters read own details or admins" ON foster_details FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Fosters update own details or admins" ON foster_details FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Fosters insert own details" ON foster_details FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'foster'));

-- rescuer_details policies
CREATE POLICY "Rescuers read own details or admins" ON rescuer_details FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Rescuers update own details or admins" ON rescuer_details FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Rescuers insert own details" ON rescuer_details FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'rescuer'));

-- adopter_details policies
CREATE POLICY "Adopters read own details or admins" ON adopter_details FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Adopters update own details or admins" ON adopter_details FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Adopters insert own details" ON adopter_details FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'adopter'));
