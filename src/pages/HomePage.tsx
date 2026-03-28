import { useState, useEffect } from 'react';
import { Search, Filter, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Game, Review } from '../types';
import { useRouter } from '../context/RouterContext';

interface GameWithRating extends Game {
  average_rating: number;
  review_count: number;
}

export function HomePage() {
  const [games, setGames] = useState<GameWithRating[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameWithRating[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useRouter();

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [searchTerm, selectedGenre, selectedPlatform, games]);

  async function fetchGames() {
    try {
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

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
          review_count: gameReviews.length
        };
      });

      setGames(gamesWithRatings);
      setFilteredGames(gamesWithRatings);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterGames() {
    let filtered = games;

    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.developer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre !== 'All') {
      filtered = filtered.filter(game => game.genre === selectedGenre);
    }

    if (selectedPlatform !== 'All') {
      filtered = filtered.filter(game => game.platform.includes(selectedPlatform));
    }

    setFilteredGames(filtered);
  }

  const genres = ['All', ...Array.from(new Set(games.map(g => g.genre)))];
  const platforms = ['All', ...Array.from(new Set(games.flatMap(g => g.platform)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-cyan-400 text-xl">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Games</h1>
          <p className="text-gray-400 mb-8">Explore reviews and ratings from the gaming community</p>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search games or developers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <div
              key={game.id}
              onClick={() => navigateTo('game', game.id)}
              className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500 transition-all cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={game.image_url}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">
                    {game.average_rating > 0 ? game.average_rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{game.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{game.developer}</p>

                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">{game.genre}</span>
                  <span className="text-gray-500">{game.review_count} reviews</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No games found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
