# Vacation Tracker

A shared vacation planning app for organizing destinations and activities across devices and browsers. All data is stored in Supabase and is visible to anyone with the link — no login required.

## Features

- Add and remove destinations
- Add activities to each destination with a category, notes, and priority
- Filter activities by category (Breakfast, Lunch, Activity, Dinner)
- Data is shared globally and syncs across all devices
- Deleted items are soft-deleted and recoverable from the Supabase dashboard

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Supabase (PostgreSQL)
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
  deleted_at timestamptz
);
```

## Recovering Deleted Items

Deletions are soft — rows remain in the database with a `deleted_at` timestamp. To restore a deleted destination or activity:

1. Open the Supabase dashboard and go to the **Table Editor**
2. Filter for rows where `deleted_at` is not null
3. Set `deleted_at` back to `null` on the row(s) you want to restore
