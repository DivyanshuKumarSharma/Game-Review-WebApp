# Game Review Platform

A web app for reviewing video games and finding what to play next. Browse a catalogue, read and write reviews that score five categories, and see games ranked on a leaderboard and in recommendation lists.

**React 18 · TypeScript · Vite · Tailwind CSS · Supabase (PostgreSQL) · RAWG API**

## Features

| Page | What it does |
|---|---|
| **Home** | Game catalogue with search by title and filters for genre and platform. Each card shows the average rating and review count. |
| **Game detail** | Full game info, every review, a review form, and a radar chart comparing the five category scores. |
| **Leaderboard** | Games ranked by average rating, with the top three highlighted. |
| **Recommendations** | Three lists: *Top rated*, *Trending* and *Hidden gems* (see below). |
| **Add game** | Form for adding a game to the catalogue by hand. |

Reviews score a game from 1 to 10 overall and in five categories (gameplay, graphics, story, sound and value), and the database enforces that range with `CHECK` constraints.

### How recommendations are ranked

- **Top rated:** highest average rating among reviewed games.
- **Trending:** `average rating × ln(review count + 1)`, so a game needs both good scores and a number of reviews to rank highly. A single 10/10 review doesn't beat a steady 8.5 across twenty.
- **Hidden gems:** games averaging 8 or more with fewer than five reviews.

### Implementation notes

- The radar chart is hand-drawn SVG, with no chart library. It plots scores on a 0–10 scale and clamps out-of-range values to the chart's edges.
- Navigation uses a small React context (`RouterContext`) instead of a routing library.
- Row-level security is enabled on both tables. Anyone can read games and reviews, and the public anon key can add reviews and games, but it can't edit or delete them.
- `scripts/importRawgGames.mjs` pulls the first five pages of games (100 titles) from the [RAWG](https://rawg.io/apidocs) API and upserts them into Supabase by `rawg_id`, so running it again updates games instead of duplicating them. It runs locally with the service role key and converts RAWG's 0–5 rating to the app's 0–10 scale.

## Tech stack

| | |
|---|---|
| Front end | React 18, TypeScript, Vite, Tailwind CSS, lucide-react icons |
| Back end | Supabase: PostgreSQL with row-level security, accessed with `@supabase/supabase-js` |
| Data import | Node.js script using the RAWG REST API |
| Tooling | ESLint, `tsc --noEmit` type checking |

## Getting started

Requirements: Node.js 18 or newer, a free [Supabase](https://supabase.com) project, and (for importing games) a free [RAWG API key](https://rawg.io/apidocs).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root (it is already in `.gitignore`):

   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Only needed for the import script. Never prefix these with VITE_,
   # because Vite ships VITE_ variables to the browser.
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RAWG_API_KEY=your-rawg-key
   ```

3. Set up the database by running both files in `supabase/migrations/` in order, in the Supabase SQL editor or with `supabase db push`. The first creates the tables, indexes and read policies. The second adds what adding and importing games need: a unique `rawg_id`, an optional release date, decimal category scores, and an insert policy for games.

4. Optionally, import games from RAWG:

   ```bash
   node scripts/importRawgGames.mjs
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

### Scripts

| Command | |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with `tsc` |

## Project structure

```
src/
├── pages/            Home, GameDetail, Leaderboard, Recommendations, AddGame
├── components/       Navigation, ReviewForm, RadarChart (SVG)
├── context/          RouterContext: page state and navigation
├── lib/supabase.ts   Supabase client, configured from env vars
└── types/            Game and Review types
scripts/
└── importRawgGames.mjs
supabase/migrations/  Database schema, indexes and RLS policies
```

## Known gaps

Things I'd change next:

- **Anyone can add games.** Like reviews, games can be added without an account, so the catalogue is open to spam. Supabase Auth with an admin role would fix that.
- **Reviews are anonymous.** Anyone with the anon key can post a review under any name. Supabase Auth and a per-user insert policy would fix that.
- **Ratings are computed in the browser.** Each page fetches all games and reviews and averages them client-side. A SQL view or database function would scale better.
- **The RAWG import fills placeholders.** Developer and publisher are set to "Unknown", the description is the RAWG slug, and all five category scores are seeded from RAWG's single overall rating.
