-- Section 5: Core Domain Tables

-- 1. Animals (rescue cases)
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'under_treatment'
    CHECK (status IN ('rescued','under_treatment','fostered','adopted','deceased')),
  story TEXT,
  cover_image_url TEXT,
  rescued_at DATE,
  location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

-- 2. Timeline/medical updates per animal
CREATE TABLE animal_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  image_url TEXT,
  posted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE animal_updates ENABLE ROW LEVEL SECURITY;

-- 3. Fundraising campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  goal_amount NUMERIC(12,2),
  raised_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  cover_image_url TEXT,
  starts_at DATE,
  ends_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 4. Donations (Razorpay)
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES auth.users(id),
  donor_name TEXT,
  donor_phone TEXT,
  donor_email TEXT,
  amount NUMERIC(12,2) NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  animal_id UUID REFERENCES animals(id),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created','paid','failed','refunded')),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  receipt_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- 5. Volunteer applications
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  skills TEXT[],
  availability TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- 6. Volunteer events
CREATE TABLE volunteer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  capacity INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE volunteer_events ENABLE ROW LEVEL SECURITY;

-- 7. Volunteer event signups
CREATE TABLE volunteer_event_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES volunteer_events(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, volunteer_id)
);
ALTER TABLE volunteer_event_signups ENABLE ROW LEVEL SECURITY;

-- 8. Adoption requests
CREATE TABLE adoption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id),
  requester_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE adoption_requests ENABLE ROW LEVEL SECURITY;

-- 9. Testimonials / stories
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  avatar_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 10. Contact messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 11. Admin action audit trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
