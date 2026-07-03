# RatedWorktops

AI-powered kitchen worktop visualiser. Upload a photo of a kitchen, pick a stone material, and get a
photorealistic render with the worktop/splashback/island surfaces automatically detected and replaced.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage) - schema + RLS policies in `supabase/schema.sql`
- Google Gemini (image editing) for the AI render, `sharp` for watermarking
- Stripe for subscription billing

## Getting started

1. Copy `.env.local.example` to `.env.local` and fill in your Supabase, Gemini, Stripe and Twilio credentials.
2. Run `supabase/schema.sql` in your Supabase project's SQL editor (creates tables, RLS policies, storage
   buckets, and the `redeem_credit`/`grant_credits` RPCs).
3. Promote your own account to admin once you've signed up:
   ```sql
   update profiles set role = 'super_admin' where email = 'you@example.com';
   ```
4. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```

## Structure

- `src/app/(auth)` - sign up, sign in, password reset, phone verification
- `src/app/(app)` - the customer-facing app: visualiser, stone catalog, saved projects, credits, account
- `src/app/(admin)/admin` - the admin portal: dashboard, analytics, users, stone library, categories,
  subscriptions, audit log
- `src/app/api` - the AI generation route and Stripe checkout/webhook routes
- `src/lib` - Supabase clients, server actions, AI provider abstraction, data fetchers
