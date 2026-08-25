-- Section 2: OTP Table (service-role only, RLS enabled with zero policies)

CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_phone ON otp_codes(phone);

-- Enable RLS with zero policies so only service_role can access it
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
