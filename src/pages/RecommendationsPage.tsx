import { useState, useEffect } from 'react';
import { Sparkles, Star, ThumbsUp, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Game } from '../types';
import { useRouter } from '../context/RouterContext';

interface RecommendedGame extends Game {
  average_rating: number;
  review_count: number;
  recommendation_score: number;
}

export function RecommendationsPage() {
  const [topRated, setTopRated] = useState<RecommendedGame[]>([]);
  const [trending, setTrending] = useState<RecommendedGame[]>([]);
  const [hidden, setHidden] = useState<RecommendedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useRouter();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*');

      if (gamesError) throw gamesError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('game_id, rating');

      if (reviewsError) throw reviewsError;

      const gamesWithRatings = (gamesData || []).map(game => {
        const gameReviews = (reviewsData || []).filter(r => r.game_id === game.id);
        const avgRating = gameReviews.length > 0
          ? gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length
          : 0;

        const recScore = avgRating * Math.log(gameReviews.length + 1);

        return {
          ...game,
          average_rating: avgRating,
          review_count: gameReviews.length,
          recommendation_score: recScore
        };
      });

      const topRatedGames = gamesWithRatings
        .filter(g => g.review_count > 0)
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 3);

      const trendingGames = gamesWithRatings
        .filter(g => g.review_count > 0)
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, 3);

      const hiddenGems = gamesWithRatings
        .filter(g => g.review_count > 0 && g.review_count < 5 && g.average_rating >= 8)
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 3);

      setTopRated(topRatedGames);
      setTrending(trendingGames);
      setHidden(hiddenGems);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-cyan-400 text-xl">Loading recommendations...</div>
      </div>
    );
  }

  function RecommendationSection({
    title,
    icon: Icon,
    games,
    description
  }: {
    title: string;
    icon: React.ElementType;
    games: RecommendedGame[];
    description: string;
  }) {
    if (games.length === 0) return null;

    return (
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-2">
          <Icon className="w-7 h-7 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-gray-400 mb-6">{description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => navigateTo('game', game.id)}
              className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-cyan-500 transition-all cursor-pointer group"
            >
              <div className="relative h-48">
                <img
                  src={game.image_url}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">{game.average_rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{game.developer}</p>

                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">{game.genre}</span>
                  <span className="text-gray-500">{game.review_count} reviews</span>
                </div>

                <p className="text-sm text-gray-300 line-clamp-2 mb-4">{game.description}</p>

                <div className="flex flex-wrap gap-2">
                  {game.platform.slice(0, 3).map(platform => (
                    <span key={platform} className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                      {platform}
                    </span>
                  ))}
                  {game.platform.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                      +{game.platform.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Recommended For You</h1>
          </div>
          <p className="text-gray-400">Curated selections based on community ratings and reviews</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecommendationSection
          title="Top Rated Games"
          icon={ThumbsUp}
          games={topRated}
          description="The highest-rated games according to our community"
        />

        <RecommendationSection
          title="Trending Now"
          icon={TrendingUp}
          games={trending}
          description="Popular games with great ratings and active communities"
        />

        <RecommendationSection
          title="Hidden Gems"
          icon={Sparkles}
          games={hidden}
          description="Underrated games you might have missed"
        />

        {topRated.length === 0 && trending.length === 0 && hidden.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No recommendations available yet.</p>
            <p className="text-gray-600 text-sm mt-2">Add some reviews to see personalized recommendations!</p>
          </div>
        )}
      </div>
    </div>
  );
}
