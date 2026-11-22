import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// This script runs on your machine, never in the browser, so it uses the
// service role key. That key bypasses row-level security, which the upsert
// needs: updating games that were already imported isn't allowed for the
// public anon key. Never put this key in a VITE_ variable, because Vite ships
// those to the browser.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RAWG_API_KEY = process.env.RAWG_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RAWG_API_KEY) {
  throw new Error(
    'Missing environment variables: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and RAWG_API_KEY are all required'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// RAWG rates games from 0 to 5; the app scores from 0 to 10 with one decimal.
function toTenPointScore(rawgRating) {
  return Math.round(Number(rawgRating ?? 0) * 20) / 10;
}

async function fetchRawgPage(page = 1, pageSize = 20) {
  const url =
    `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page=${page}&page_size=${pageSize}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`RAWG request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function mapGame(rawgGame) {
  const score = toTenPointScore(rawgGame.rating);
  return {
    rawg_id: rawgGame.id,
    title: rawgGame.name ?? 'Unknown',
    description: rawgGame.slug ?? '',
    developer: 'Unknown',
    publisher: 'Unknown',
    genre: rawgGame.genres?.[0]?.name ?? 'Unknown',
    platform: rawgGame.platforms?.map((p) => p.platform?.name).filter(Boolean) ?? [],
    image_url: rawgGame.background_image ?? '',
    release_date: rawgGame.released || null,
    gameplay_score: score,
    graphics_score: score,
    story_score: score,
    sound_score: score,
    value_score: score,
  };
}

async function importGames(page = 1, pageSize = 20) {
  const data = await fetchRawgPage(page, pageSize);
  const mappedGames = (data.results ?? []).map(mapGame);

  const { data: upserted, error } = await supabase
    .from('games')
    .upsert(mappedGames, { onConflict: 'rawg_id' })
    .select();

  if (error) {
    console.error('Supabase upsert error:', error);
    return;
  }

  console.log(`Imported ${upserted.length} games from page ${page}`);
}

for (let page = 1; page <= 5; page++) {
  await importGames(page, 20);
}