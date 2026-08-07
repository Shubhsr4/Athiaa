-- Create table for tracking phone OTP rate limits (30-second window)
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    last_requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by phone number
CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_phone ON public.otp_rate_limits(phone);

-- Enable Row Level Security (RLS)
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS by default. Block public access.
CREATE POLICY "No public access to otp_rate_limits"
    ON public.otp_rate_limits
    FOR ALL
    USING (false);
