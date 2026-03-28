/*
  # Game Review Platform Schema

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `release_date` (date)
      - `developer` (text)
      - `publisher` (text)
      - `image_url` (text)
      - `genre` (text)
      - `platform` (text array)
      - `gameplay_score` (integer) - for radar chart
      - `graphics_score` (integer) - for radar chart
      - `story_score` (integer) - for radar chart
      - `sound_score` (integer) - for radar chart
      - `value_score` (integer) - for radar chart
      - `created_at` (timestamptz)
      
    - `reviews`
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key to games)
      - `user_name` (text)
      - `rating` (integer)
      - `title` (text)
      - `content` (text)
      - `gameplay_rating` (integer)
      - `graphics_rating` (integer)
      - `story_rating` (integer)
      - `sound_rating` (integer)
      - `value_rating` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated insert on reviews
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  release_date date NOT NULL,
  developer text NOT NULL,
  publisher text NOT NULL,
  image_url text NOT NULL,
  genre text NOT NULL,
  platform text[] NOT NULL DEFAULT '{}',
  gameplay_score integer NOT NULL DEFAULT 0,
  graphics_score integer NOT NULL DEFAULT 0,
  story_score integer NOT NULL DEFAULT 0,
  sound_score integer NOT NULL DEFAULT 0,
  value_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  title text NOT NULL,
  content text NOT NULL,
  gameplay_rating integer NOT NULL CHECK (gameplay_rating >= 1 AND gameplay_rating <= 10),
  graphics_rating integer NOT NULL CHECK (graphics_rating >= 1 AND graphics_rating <= 10),
  story_rating integer NOT NULL CHECK (story_rating >= 1 AND story_rating <= 10),
  sound_rating integer NOT NULL CHECK (sound_rating >= 1 AND sound_rating <= 10),
  value_rating integer NOT NULL CHECK (value_rating >= 1 AND value_rating <= 10),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games are viewable by everyone"
  ON games FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert reviews"
  ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);