export interface Game {
  id: string;
  title: string;
  description: string;
  release_date: string;
  developer: string;
  publisher: string;
  image_url: string;
  genre: string;
  platform: string[];
  gameplay_score: number;
  graphics_score: number;
  story_score: number;
  sound_score: number;
  value_score: number;
  created_at: string;
}

export interface Review {
  id: string;
  game_id: string;
  user_name: string;
  rating: number;
  title: string;
  content: string;
  gameplay_rating: number;
  graphics_rating: number;
  story_rating: number;
  sound_rating: number;
  value_rating: number;
  created_at: string;
}

export interface GameWithStats extends Game {
  average_rating?: number;
  review_count?: number;
}
