import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Game } from '../types';
import { useRouter } from '../context/RouterContext';

interface LeaderboardGame extends Game {
  average_rating: number;
  review_count: number;
  rank: number;
}

export function LeaderboardPage() {
  const [games, setGames] = useState<LeaderboardGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useRouter();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
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

        return {
          ...game,
          average_rating: avgRating,
          review_count: gameReviews.length,
          rank: 0
        };
      });

      const sortedGames = gamesWithRatings
        .sort((a, b) => {
          if (b.average_rating !== a.average_rating) {
            return b.average_rating - a.average_rating;
          }
          return b.review_count - a.review_count;
        })
        .map((game, index) => ({ ...game, rank: index + 1 }));

      setGames(sortedGames);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return <div className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold text-lg">#{rank}</div>;
    }
  }

  function getRankBadgeColor(rank: number) {
    switch (rank) {
      case 1:
        return 'from-yellow-500 to-yellow-600';
      case 2:
        return 'from-gray-400 to-gray-500';
      case 3:
        return 'from-amber-600 to-amber-700';
      default:
        return 'from-gray-700 to-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-cyan-400 text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Game Leaderboard</h1>
          </div>
          <p className="text-gray-400">Top-rated games based on community reviews</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {games.slice(0, 3).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <span>Top 3 Games</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {games.slice(0, 3).map((game) => (
                <div
                  key={game.id}
                  onClick={() => navigateTo('game', game.id)}
                  className="relative bg-gray-900 rounded-lg border border-gray-800 overflow-hidden cursor-pointer hover:border-cyan-500 transition-all group"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRankBadgeColor(game.rank)}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      {getRankIcon(game.rank)}
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xl font-bold text-white">{game.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <img
                      src={game.image_url}
                      alt={game.title}
                      className="w-full h-32 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                    />
                    <h3 className="text-lg font-bold text-white mb-1">{game.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{game.developer}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">{game.genre}</span>
                      <span className="text-xs text-gray-500">{game.review_count} reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800 text-gray-400 text-sm font-semibold">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Game</div>
            <div className="col-span-2">Genre</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-2">Reviews</div>
          </div>

          <div className="divide-y divide-gray-800">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => navigateTo('game', game.id)}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-800 transition-colors cursor-pointer items-center"
              >
                <div className="col-span-1 flex items-center">
                  {game.rank <= 3 ? (
                    getRankIcon(game.rank)
                  ) : (
                    <span className="text-gray-500 font-semibold">#{game.rank}</span>
                  )}
                </div>

                <div className="col-span-5 flex items-center space-x-3">
                  <img
                    src={game.image_url}
                    alt={game.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{game.title}</h3>
                    <p className="text-sm text-gray-400">{game.developer}</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">{game.genre}</span>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold">
                      {game.average_rating > 0 ? game.average_rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-gray-400">{game.review_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No games in the leaderboard yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
