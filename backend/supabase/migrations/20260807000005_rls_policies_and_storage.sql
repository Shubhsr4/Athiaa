-- Section 6: RLS Policies & Section 7: Storage Buckets

-- 1. animals policies
CREATE POLICY "Public can view animals" ON animals FOR SELECT USING (true);
CREATE POLICY "Admins manage animals" ON animals FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 2. animal_updates policies
CREATE POLICY "Public can view animal updates" ON animal_updates FOR SELECT USING (true);
CREATE POLICY "Admins manage animal updates" ON animal_updates FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 3. campaigns policies
CREATE POLICY "Public can view active campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Admins manage campaigns" ON campaigns FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 4. donations policies
CREATE POLICY "Users view own donations" ON donations FOR SELECT
  USING (auth.uid() = donor_id OR is_admin(auth.uid()));
CREATE POLICY "Admins manage donations" ON donations FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 5. volunteers policies
CREATE POLICY "Users view own application" ON volunteers FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "Users submit application" ON volunteers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage volunteers" ON volunteers FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 6. volunteer_events policies
CREATE POLICY "Public can view volunteer events" ON volunteer_events FOR SELECT USING (true);
CREATE POLICY "Admins manage volunteer events" ON volunteer_events FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 7. volunteer_event_signups policies
CREATE POLICY "Volunteers view own signups" ON volunteer_event_signups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM volunteers
      WHERE volunteers.id = volunteer_event_signups.volunteer_id
        AND volunteers.user_id = auth.uid()
    ) OR is_admin(auth.uid())
  );
CREATE POLICY "Volunteers signup for events" ON volunteer_event_signups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM volunteers
      WHERE volunteers.id = volunteer_event_signups.volunteer_id
        AND volunteers.user_id = auth.uid()
    )
  );
CREATE POLICY "Admins manage volunteer event signups" ON volunteer_event_signups FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 8. adoption_requests policies
CREATE POLICY "Requesters view own adoption requests" ON adoption_requests FOR SELECT
  USING (auth.uid() = requester_id OR is_admin(auth.uid()));
CREATE POLICY "Anyone can submit adoption request" ON adoption_requests FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins manage adoption requests" ON adoption_requests FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 9. testimonials policies
CREATE POLICY "Public view published testimonials" ON testimonials FOR SELECT
  USING (is_published = true OR is_admin(auth.uid()));
CREATE POLICY "Admins manage testimonials" ON testimonials FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 10. contact_messages policies
CREATE POLICY "Anyone can submit contact message" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view contact messages" ON contact_messages FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins manage contact messages" ON contact_messages FOR ALL
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 11. audit_logs policies
CREATE POLICY "Admins view audit log" ON audit_logs FOR SELECT USING (is_admin(auth.uid()));


-- Section 7: Storage Buckets Creation
INSERT INTO storage.buckets (id, name, public) VALUES
  ('animal-photos', 'animal-photos', true),
  ('campaign-covers', 'campaign-covers', true),
  ('avatars', 'avatars', true),
  ('receipts', 'receipts', false),
  ('legal-docs', 'legal-docs', true),
  ('volunteer-docs', 'volunteer-docs', false),
  ('media-gallery', 'media-gallery', true),
  ('testimonial-avatars', 'testimonial-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Objects RLS Policies
CREATE POLICY "Public read for public storage buckets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('animal-photos', 'campaign-covers', 'avatars', 'legal-docs', 'media-gallery', 'testimonial-avatars'));

CREATE POLICY "Admins manage storage objects"
  ON storage.objects FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users manage own avatar"
  ON storage.objects FOR ALL
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
