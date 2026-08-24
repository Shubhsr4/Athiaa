-- Strict RLS Policies for animals and storage buckets
DROP POLICY IF EXISTS "Anyone can manage animals" ON animals;
DROP POLICY IF EXISTS "Admins manage animals" ON animals;
DROP POLICY IF EXISTS "Public manage animals" ON animals;

CREATE POLICY "Admins manage animals" ON animals FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Storage Object Policies for animal-photos
DROP POLICY IF EXISTS "Public manage animal-photos storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage animal-photos storage" ON storage.objects;

CREATE POLICY "Admins manage animal-photos storage" ON storage.objects FOR ALL
  USING (bucket_id IN ('animal-photos', 'media-gallery') AND is_admin(auth.uid()))
  WITH CHECK (bucket_id IN ('animal-photos', 'media-gallery') AND is_admin(auth.uid()));
