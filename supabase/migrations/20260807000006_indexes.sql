-- Section 8: Database Indexes

CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_volunteers_status ON volunteers(status);
CREATE INDEX idx_volunteer_signups_event ON volunteer_event_signups(event_id);
