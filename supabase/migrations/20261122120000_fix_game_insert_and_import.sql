/*
  # Make adding and importing games work

  The first migration left out what the Add game page and the RAWG import
  script need:

  1. `rawg_id`: the import script upserts on this column, so it needs to exist
     and be unique. It stays NULL for games added by hand.
  2. `release_date` becomes nullable: RAWG has games with no release date, and
     the release date field on the Add game form is optional.
  3. Category scores become numeric(4,1): the Add game form allows decimals
     (step 0.1) and RAWG ratings are decimals, but integer columns reject
     them. Existing values are kept as they are.
  4. An INSERT policy on `games` so the Add game page can insert with the anon
     key, the same way anyone can already post a review. Rows inserted through
     this policy must not set `rawg_id`; only the import script sets that, and
     it uses the service role key, which bypasses row-level security. There is
     deliberately no UPDATE or DELETE policy, so the anon key can't edit or
     remove existing games.
*/

ALTER TABLE games ADD COLUMN IF NOT EXISTS rawg_id integer;
CREATE UNIQUE INDEX IF NOT EXISTS idx_games_rawg_id ON games(rawg_id);

ALTER TABLE games ALTER COLUMN release_date DROP NOT NULL;

ALTER TABLE games
  ALTER COLUMN gameplay_score TYPE numeric(4,1) USING gameplay_score::numeric,
  ALTER COLUMN graphics_score TYPE numeric(4,1) USING graphics_score::numeric,
  ALTER COLUMN story_score    TYPE numeric(4,1) USING story_score::numeric,
  ALTER COLUMN sound_score    TYPE numeric(4,1) USING sound_score::numeric,
  ALTER COLUMN value_score    TYPE numeric(4,1) USING value_score::numeric;

DROP POLICY IF EXISTS "Anyone can add games" ON games;
CREATE POLICY "Anyone can add games"
  ON games FOR INSERT
  TO anon, authenticated
  WITH CHECK (rawg_id IS NULL);
