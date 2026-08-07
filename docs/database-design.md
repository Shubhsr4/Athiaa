# Athia — Supabase Database Design
(Phone-OTP auth via MSG91 + role-based admin authorization)

This is written so you can hand sections of it straight to Gemini/Antigravity as implementation prompts. Each section is a self-contained SQL block.

---

## 1. Auth Strategy

Supabase's built-in phone auth expects Twilio/MessageBird, so since you're on MSG91 via custom Edge Functions, auth works like this:

1. `generate-otp` Edge Function → calls MSG91, stores a hashed OTP in `otp_codes`.
2. `verify-otp` Edge Function → checks the hash/expiry, then uses `supabase.auth.admin.createUser()` (if new) or fetches the existing user, and returns a session via `generateLink`/custom JWT.
3. `profiles` row is created via trigger the moment an `auth.users` row appears.
4. Role lives in a **separate** `user_roles` table — never on `profiles` — so a user can never escalate their own privileges by editing their profile row.

```
Client → generate-otp (Edge Fn) → MSG91 sends SMS → otp_codes row created
Client → verify-otp (Edge Fn) → checks otp_codes → auth.users created/fetched → session returned
```

---

## 2. OTP Table

```sql
create table otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_otp_phone on otp_codes(phone);

-- no RLS needed to be user-facing at all — only Edge Functions
-- (service role) touch this table. Lock it down completely:
alter table otp_codes enable row level security;
-- no policies added = only service_role can access it
```

Add a cron (pg_cron or your GitHub Actions workaround) to purge expired rows daily.

---

## 3. Roles & Admin Authorization

```sql
create type app_role as enum ('donor', 'volunteer', 'ngo_staff', 'admin', 'super_admin');

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'donor',
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table user_roles enable row level security;

-- Security-definer function so RLS policies elsewhere can check role
-- without recursive RLS lookups on user_roles itself
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from user_roles
    where user_id = _user_id and role in ('admin', 'super_admin')
  )
$$;

-- Only admins can read/manage roles; nobody can self-grant
create policy "Admins manage roles"
  on user_roles for all
  using (is_admin(auth.uid()))
  with check (is_admin(auth.uid()));

create policy "Users can view own role"
  on user_roles for select
  using (auth.uid() = user_id);
```

**Why this pattern:** every other table's RLS policy calls `is_admin(auth.uid())`, so admin access is defined in exactly one place. Never check role via a client-editable column.

---

## 4. Profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  full_name text,
  email text,
  avatar_url text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users view/update own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Admins view all profiles"
  on profiles for select using (is_admin(auth.uid()));

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, phone) values (new.id, new.phone);
  insert into public.user_roles (user_id, role) values (new.id, 'donor');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 5. Core Domain Tables

```sql
-- Animals (rescue cases)
create table animals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species text not null,
  status text not null default 'under_treatment'
    check (status in ('rescued','under_treatment','fostered','adopted','deceased')),
  story text,
  cover_image_url text,
  rescued_at date,
  location text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Timeline/medical updates per animal
create table animal_updates (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animals(id) on delete cascade,
  note text not null,
  image_url text,
  posted_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Fundraising campaigns
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  goal_amount numeric(12,2),
  raised_amount numeric(12,2) not null default 0,
  cover_image_url text,
  starts_at date,
  ends_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Donations (Razorpay)
create table donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references auth.users(id),
  donor_name text,
  donor_phone text,
  donor_email text,
  amount numeric(12,2) not null,
  campaign_id uuid references campaigns(id),
  animal_id uuid references animals(id),
  razorpay_order_id text,
  razorpay_payment_id text,
  status text not null default 'created'
    check (status in ('created','paid','failed','refunded')),
  is_recurring boolean not null default false,
  receipt_sent boolean not null default false,
  created_at timestamptz not null default now()
);

-- Volunteer applications
create table volunteers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  full_name text not null,
  phone text not null,
  skills text[],
  availability text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Volunteer events & signups
create table volunteer_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity int,
  created_at timestamptz not null default now()
);

create table volunteer_event_signups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references volunteer_events(id) on delete cascade,
  volunteer_id uuid not null references volunteers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, volunteer_id)
);

-- Adoption listings
create table adoption_requests (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animals(id),
  requester_id uuid references auth.users(id),
  full_name text not null,
  phone text not null,
  message text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','completed')),
  created_at timestamptz not null default now()
);

-- Testimonials / stories
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  content text not null,
  avatar_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Contact form
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Admin action audit trail
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  table_name text,
  record_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);
```

---

## 6. RLS Pattern (repeat per table)

General rule: **public read** for donor-facing content (animals, campaigns, testimonials), **admin-only write**, and **owner-or-admin** for personal records (donations, volunteer applications).

```sql
alter table animals enable row level security;
create policy "Public can view animals" on animals for select using (true);
create policy "Admins manage animals" on animals for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

alter table campaigns enable row level security;
create policy "Public can view active campaigns" on campaigns for select using (true);
create policy "Admins manage campaigns" on campaigns for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

alter table donations enable row level security;
create policy "Users view own donations" on donations for select
  using (auth.uid() = donor_id or is_admin(auth.uid()));
create policy "Admins manage donations" on donations for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
-- inserts happen via Edge Function using service_role (after Razorpay verification),
-- so no public insert policy needed

alter table volunteers enable row level security;
create policy "Users view own application" on volunteers for select
  using (auth.uid() = user_id or is_admin(auth.uid()));
create policy "Users submit application" on volunteers for insert
  with check (auth.uid() = user_id);
create policy "Admins manage volunteers" on volunteers for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

alter table contact_messages enable row level security;
create policy "Anyone can submit contact message" on contact_messages for insert with check (true);
create policy "Admins view contact messages" on contact_messages for select using (is_admin(auth.uid()));

alter table audit_logs enable row level security;
create policy "Admins view audit log" on audit_logs for select using (is_admin(auth.uid()));
-- inserts only via service_role from Edge Functions/triggers
```

Apply the same public-read/admin-write shape to `animal_updates`, `volunteer_events`, `adoption_requests`, `testimonials`.

---

## 7. Storage Buckets

| Bucket | Public? | Purpose |
|---|---|---|
| `animal-photos` | public | animal profile & update images |
| `campaign-covers` | public | campaign cover images |
| `avatars` | public | user/volunteer avatars |
| `receipts` | private | donation receipts (signed URLs only) |
| `legal-docs` | public | 80G/12A/AWBI certificates |
| `volunteer-docs` | private | ID proofs, if collected |
| `media-gallery` | public | general site media |
| `testimonial-avatars` | public | testimonial photos |

Private buckets should only be reachable via signed URLs generated in an Edge Function that checks `is_admin()` or record ownership first — never expose `service_role` to the client.

---

## 8. Indexes worth adding early

```sql
create index idx_donations_donor on donations(donor_id);
create index idx_donations_campaign on donations(campaign_id);
create index idx_donations_status on donations(status);
create index idx_animals_status on animals(status);
create index idx_volunteers_status on volunteers(status);
create index idx_volunteer_signups_event on volunteer_event_signups(event_id);
```

---

## 9. Quick admin-authorization checklist

- [ ] `user_roles` is the single source of truth for role — no role field on `profiles`
- [ ] `is_admin()` / `has_role()` are `security definer` so RLS doesn't recurse
- [ ] No client code ever writes to `user_roles` (admin-only insert/update via dashboard or an Edge Function gated by `is_admin`)
- [ ] `otp_codes` has RLS enabled with **zero** policies — only `service_role` (Edge Functions) can touch it
- [ ] All Razorpay/MSG91 secret calls happen in Edge Functions, never client-side
- [ ] Audit log write on every role change and every admin delete/update (trigger or explicit Edge Function call)
