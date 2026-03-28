import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const RAWG_API_KEY = process.env.RAWG_API_KEY;

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY || !RAWG_API_KEY) {
  throw new Error('Missing environment variables');
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
    gameplay_score: Number(rawgGame.rating ?? 0),
    graphics_score: Number(rawgGame.rating ?? 0),
    story_score: Number(rawgGame.rating ?? 0),
    sound_score: Number(rawgGame.rating ?? 0),
    value_score: Number(rawgGame.rating ?? 0),
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