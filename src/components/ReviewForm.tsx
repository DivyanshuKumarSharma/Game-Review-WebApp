import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ReviewFormProps {
  gameId: string;
  onSubmitted: () => void;
}

export function ReviewForm({ gameId, onSubmitted }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    userName: '',
    title: '',
    content: '',
    rating: 5,
    gameplayRating: 5,
    graphicsRating: 5,
    storyRating: 5,
    soundRating: 5,
    valueRating: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert({
        game_id: gameId,
        user_name: formData.userName,
        title: formData.title,
        content: formData.content,
        rating: formData.rating,
        gameplay_rating: formData.gameplayRating,
        graphics_rating: formData.graphicsRating,
        story_rating: formData.storyRating,
        sound_rating: formData.soundRating,
        value_rating: formData.valueRating,
      });

      if (error) throw error;

      setFormData({
        userName: '',
        title: '',
        content: '',
        rating: 5,
        gameplayRating: 5,
        graphicsRating: 5,
        storyRating: 5,
        soundRating: 5,
        valueRating: 5,
      });

      onSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Write Your Review</h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
        <input
          type="text"
          required
          value={formData.userName}
          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Review Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          placeholder="Sum up your review"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Your Review</label>
        <textarea
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          placeholder="Share your thoughts about the game..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Overall Rating: {formData.rating}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
          className="w-full accent-cyan-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gameplay: {formData.gameplayRating}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.gameplayRating}
            onChange={(e) => setFormData({ ...formData, gameplayRating: parseInt(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Graphics: {formData.graphicsRating}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.graphicsRating}
            onChange={(e) => setFormData({ ...formData, graphicsRating: parseInt(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Story: {formData.storyRating}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.storyRating}
            onChange={(e) => setFormData({ ...formData, storyRating: parseInt(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sound: {formData.soundRating}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.soundRating}
            onChange={(e) => setFormData({ ...formData, soundRating: parseInt(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Value: {formData.valueRating}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.valueRating}
            onChange={(e) => setFormData({ ...formData, valueRating: parseInt(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
