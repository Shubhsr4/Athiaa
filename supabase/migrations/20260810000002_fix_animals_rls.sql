-- Fix animals RLS policy to allow insert/update/delete for admin and authenticated app users
DROP POLICY IF EXISTS "Admins manage animals" ON animals;
DROP POLICY IF EXISTS "Public manage animals" ON animals;

CREATE POLICY "Anyone can manage animals" ON animals FOR ALL
  USING (true) WITH CHECK (true);

-- Confirm Storage Object Policies for animal-photos
DROP POLICY IF EXISTS "Public manage animal-photos storage" ON storage.objects;

CREATE POLICY "Public manage animal-photos storage" ON storage.objects FOR ALL
  USING (bucket_id IN ('animal-photos', 'media-gallery'))
  WITH CHECK (bucket_id IN ('animal-photos', 'media-gallery'));
