-- ============================================================================
-- One-Time First Admin Bootstrap Script
-- Description:
--   Since no sign-up flow or API grants the admin role, run this script once
--   in your Supabase SQL Editor AFTER the admin user has registered normally
--   via the sign-up form.
-- ============================================================================

DO $$
DECLARE
  -- 1. REPLACE THIS WITH THE ACTUAL ADMIN EMAIL REGISTERED
  target_email TEXT := 'admin@athiaango.org';
  
  target_user_id UUID;
  admin_role_id INT;
BEGIN
  -- 2. Lookup user ID in auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE LOWER(email) = LOWER(target_email);

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user "%" was not found in auth.users. Ensure you have registered the account first via the website sign-up page.', target_email;
  END IF;

  -- 3. Lookup or ensure 'admin' role exists
  SELECT id INTO admin_role_id 
  FROM public.roles 
  WHERE LOWER(name) = 'admin';

  IF admin_role_id IS NULL THEN
    INSERT INTO public.roles (name) VALUES ('admin') RETURNING id INTO admin_role_id;
  END IF;

  -- 4. Grant admin role in user_roles
  INSERT INTO public.user_roles (user_id, role_id, granted_at, granted_by)
  VALUES (target_user_id, admin_role_id, now(), NULL)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RAISE NOTICE 'SUCCESS: User "%" (UUID: %) has been granted the "admin" role.', target_email, target_user_id;
END $$;
