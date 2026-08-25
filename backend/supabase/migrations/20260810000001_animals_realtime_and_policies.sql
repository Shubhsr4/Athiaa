-- Migration: Realtime publication for animals table and storage policies
ALTER PUBLICATION supabase_realtime ADD TABLE animals;

-- Confirm RLS is enabled on animals table
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

-- Ensure public can SELECT available animals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'animals' AND policyname = 'Public can view animals'
  ) THEN
    CREATE POLICY "Public can view animals" ON animals FOR SELECT USING (true);
  END IF;
END $$;

-- Ensure admins can manage (INSERT, UPDATE, DELETE) animals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'animals' AND policyname = 'Admins manage animals'
  ) THEN
    CREATE POLICY "Admins manage animals" ON animals FOR ALL
      USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;
