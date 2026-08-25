-- Migration: 20260824000001_80g_receipts_and_sequence.sql
-- Description: Add 80G receipt tracking columns, sequential receipt generator, and RLS policies

-- 1. Add missing receipt and 80G tax columns to donations table
ALTER TABLE donations 
  ADD COLUMN IF NOT EXISTS donor_pan TEXT,
  ADD COLUMN IF NOT EXISTS receipt_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS receipt_sent_at TIMESTAMPTZ;

-- 2. Add index and unique constraint on razorpay_payment_id for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_donations_razorpay_payment_id 
  ON donations (razorpay_payment_id) 
  WHERE razorpay_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donations_donor_pan 
  ON donations (donor_pan) 
  WHERE donor_pan IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donations_receipt_number 
  ON donations (receipt_number) 
  WHERE receipt_number IS NOT NULL;

-- 3. Create Postgres sequence for legally-compliant sequential receipt numbers
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START WITH 1 INCREMENT BY 1;

-- 4. Create SQL helper function to generate formatted sequential 80G receipt numbers
-- Format: ATHIA/80G/{financial_year}/{sequential_number:06d} e.g. ATHIA/80G/2026-27/000001
CREATE OR REPLACE FUNCTION generate_80g_receipt_number(fy TEXT DEFAULT '2026-27')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_val BIGINT;
  formatted_num TEXT;
BEGIN
  next_val := nextval('receipt_number_seq');
  formatted_num := 'ATHIA/80G/' || fy || '/' || LPAD(next_val::TEXT, 6, '0');
  RETURN formatted_num;
END;
$$;

-- 5. Ensure private receipts bucket exists in storage.buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 6. Storage RLS policy: Donors can read their own receipts, Admins can read all receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Donors and admins access private receipts'
  ) THEN
    CREATE POLICY "Donors and admins access private receipts"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'receipts' AND (
          is_admin(auth.uid()) OR
          EXISTS (
            SELECT 1 FROM public.donations
            WHERE donations.donor_id = auth.uid()
              AND donations.receipt_url = storage.objects.name
          )
        )
      );
  END IF;
END $$;
