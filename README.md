# Meander

A shared AI-powered vacation planning app for organizing destinations and activities. Meander helps you discover real, verified venues and experiences using a combination of Google Places and Claude AI — then keeps everything organized across all your devices.

## Features

- **Destinations & activities** — add destinations and organize activities by category (Breakfast, Lunch, Activity, Dinner) with notes and priority
- **AI enrichment** — every saved activity is automatically enriched with an emoji, highlight tags, and an "Open in Maps" link
- **✨ Suggest** — AI-powered activity suggestions based on your preferences:
  - Food categories (Breakfast, Lunch, Dinner) use **Google Places** for verified, real venues
  - Food-related keywords (e.g. "lunch spot", "restaurant") are detected automatically and also route to Google Places
  - Activity suggestions use **Claude Haiku** with confidence-focused prompting
- **Category filters** — filter your activity list by category or view all grouped by type
- **Cross-device sync** — all data is stored in Supabase and syncs across browsers and devices in real time
- **Soft deletes** — deleted items are recoverable from the Supabase dashboard
- **Password protected** — server-side password gate via Supabase Edge Function
- **Mobile responsive** — fully usable on portrait mobile

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **AI:** Claude Haiku (Anthropic) via Supabase Edge Functions
- **Venue data:** Google Places API (New)
- **Hosting:** Vercel

## Local Development

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

## Deployment

The app is deployed on Vercel. Set the following environment variables in **Vercel → Project Settings → Environment Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Push to `main` to trigger a new deployment.

## Supabase Edge Functions

Three Edge Functions handle server-side logic. Deploy with the Supabase CLI:

```bash
supabase functions deploy verify-password
supabase functions deploy enrich-activity
supabase functions deploy suggest-activity
```

Set the following secrets in **Supabase → Project Settings → Edge Functions → Secrets**:

| Secret | Purpose |
|---|---|
| `APP_PASSWORD` | Password gate |
| `ANTHROPIC_API_KEY` | Claude Haiku for enrichment and activity suggestions |
| `GOOGLE_PLACES_API_KEY` | Google Places API (New) for verified food venue suggestions |

## Database Schema

Run the following SQL in the Supabase SQL editor to set up the tables:

```sql
create table destinations (
  id bigint primary key,
  name text not null,
  deleted_at timestamptz
);

create table activities (
  id bigint primary key,
  destination_id bigint references destinations(id) on delete cascade,
  name text not null,
  category text not null,
  notes text not null default '',
  priority int not null,
  address text,
  emoji text,
  highlights text[],
  deleted_at timestamptz
);
```

## Recovering Deleted Items

Deletions are soft — rows remain in the database with a `deleted_at` timestamp. To restore a deleted destination or activity:

1. Open the Supabase dashboard and go to the **Table Editor**
2. Filter for rows where `deleted_at` is not null
3. Set `deleted_at` back to `null` on the row(s) you want to restore
