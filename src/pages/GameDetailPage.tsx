import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Calendar, Users, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Game, Review } from '../types';
import { useRouter } from '../context/RouterContext';
import { RadarChart } from '../components/RadarChart';
import { ReviewForm } from '../components/ReviewForm';

export function GameDetailPage() {
  const { selectedGameId, navigateTo } = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedGameId) {
      fetchGameDetails();
    }
  }, [selectedGameId]);

  async function fetchGameDetails() {
    try {
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', selectedGameId)
        .maybeSingle();

      if (gameError) throw gameError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('game_id', selectedGameId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      setGame(gameData);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleReviewSubmitted() {
    setShowReviewForm(false);
    fetchGameDetails();
  }

  if (loading || !game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-cyan-400 text-xl">Loading game details...</div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative h-96 overflow-hidden">
        <img
          src={game.image_url}
          alt={game.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent"></div>
        <button
          onClick={() => navigateTo('home')}
          className="absolute top-6 left-6 flex items-center space-x-2 px-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-lg text-white hover:bg-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">{game.title}</h1>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold text-white">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-gray-400">({reviews.length} reviews)</span>
                </div>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium">
                  {game.genre}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Developer: <span className="text-white">{game.developer}</span></span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Layers className="w-4 h-4" />
                  <span>Publisher: <span className="text-white">{game.publisher}</span></span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Released: <span className="text-white">{new Date(game.release_date).toLocaleDateString()}</span></span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {game.platform.map(platform => (
                    <span key={platform} className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed">{game.description}</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Reviews</h2>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
                >
                  {showReviewForm ? 'Cancel' : 'Write Review'}
                </button>
              </div>

              {showReviewForm && (
                <div className="mb-8">
                  <ReviewForm gameId={game.id} onSubmitted={handleReviewSubmitted} />
                </div>
              )}

              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-800 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {review.user_name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{review.user_name}</p>
                          <p className="text-gray-500 text-sm">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 bg-yellow-500/20 px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{review.title}</h4>
                    <p className="text-gray-300">{review.content}</p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Score Breakdown</h3>
              <RadarChart
                data={{
                  gameplay: game.gameplay_score,
                  graphics: game.graphics_score,
                  story: game.story_score,
                  sound: game.sound_score,
                  value: game.value_score,
                }}
                size={300}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
