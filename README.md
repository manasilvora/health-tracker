# HealthTrack

Track your daily macros, sleep quality, and workouts. Built with Next.js, Supabase, and Tailwind CSS.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel

## Local Setup

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd health-tracker
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then run the schema:
   - Go to **SQL Editor** in your Supabase dashboard
   - Paste and run the contents of `supabase/schema.sql`

3. **Set environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project URL and anon key from **Project Settings → API**.

4. **Run locally**
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add the two environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Supabase Auth Setup

In your Supabase dashboard go to **Authentication → URL Configuration** and set:
- **Site URL**: your Vercel deployment URL (e.g. `https://health-tracker.vercel.app`)
- **Redirect URLs**: add `https://health-tracker.vercel.app/auth/callback`
