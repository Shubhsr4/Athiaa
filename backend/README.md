# Athiaa Backend — Supabase & Edge Functions

This directory contains the database layer, migrations, RLS policies, PostgreSQL sequences, and Deno Edge Functions for Athiaa Animal Welfare NGO.

---

## Directory Structure

```
backend/
├── supabase/
│   ├── config.toml                 # Supabase CLI project configuration
│   ├── migrations/                 # PostgreSQL schema migrations (chronological)
│   │   ├── 20260725_otp_rate_limits.sql
│   │   ├── 20260807000001_core_enums_and_profiles.sql
│   │   ├── 20260807000002_app_role_and_user_roles.sql
│   │   ├── 20260807000003_system_audit_logs.sql
│   │   ├── 20260807000004_domain_tables.sql
│   │   ├── 20260807000005_rls_policies_and_storage.sql
│   │   ├── 20260810000001_update_animals_schema.sql
│   │   ├── 20260810000002_fix_animals_rls.sql
│   │   └── 20260824000001_80g_receipts_and_sequence.sql
│   └── functions/                  # Deno Edge Functions
│       ├── razorpay-webhook/       # HMAC-SHA256 signature verification & 80G PDF receipt generator
│       ├── get-receipt-url/        # Generates secure 60-min signed URLs for private receipts
│       ├── admin-resend-receipt/   # Admin endpoint to re-send receipt emails via Resend
│       └── _shared/                # Reusable pdf-lib receipt builder and Resend client
├── types/
│   └── database.types.ts           # Generated TypeScript types from Supabase schema
└── .env.example                    # Supabase backend secrets template
```

---

## 1. Local Development with Supabase CLI

### Prerequisites
Install [Supabase CLI](https://supabase.com/docs/guides/cli):
```bash
# macOS / Linux (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Starting Local Supabase Stack
```bash
cd backend
supabase start
```

### Applying Migrations
```bash
supabase db push
# or to reset and apply all migrations:
supabase db reset
```

---

## 2. Deploying to Supabase Cloud

### Link Project
```bash
supabase link --project-ref <your-project-id>
```

### Push Database Migrations
```bash
supabase db push
```

### Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy razorpay-webhook
supabase functions deploy get-receipt-url
supabase functions deploy admin-resend-receipt
```

### Set Production Secrets
```bash
supabase secrets set \
  RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret" \
  RESEND_API_KEY="re_your_resend_api_key" \
  RESEND_FROM_EMAIL="Athiaa Donations <donations@athiaango.org>" \
  NGO_LEGAL_NAME="ATHIAA ANIMAL WELFARE FOUNDATION" \
  NGO_ADDRESS="123 Rescue Way, South Extension, New Delhi - 110001, India" \
  NGO_PAN="AABTA1234F" \
  NGO_80G_REG_NUMBER="CIT-EXPT/80G/ATH-ND2025" \
  NGO_12A_REG_NUMBER="12A/TRUST-REG/25B084"
```
