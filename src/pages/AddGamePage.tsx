import { useState } from 'react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from '../context/RouterContext';

type FormData = {
  title: string;
  description: string;
  developer: string;
  publisher: string;
  genre: string;
  platform: string;
  image_url: string;
  release_date: string;
  gameplay_score: number;
  graphics_score: number;
  story_score: number;
  sound_score: number;
  value_score: number;
};

export function AddGamePage() {
  const { navigateTo } = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    developer: '',
    publisher: '',
    genre: '',
    platform: '',
    image_url: '',
    release_date: '',
    gameplay_score: 5,
    graphics_score: 5,
    story_score: 5,
    sound_score: 5,
    value_score: 5,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    const scoreFields = [
      'gameplay_score',
      'graphics_score',
      'story_score',
      'sound_score',
      'value_score',
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: scoreFields.includes(name) ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      developer: formData.developer.trim(),
      publisher: formData.publisher.trim(),
      genre: formData.genre.trim(),
      platform: formData.platform
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      image_url: formData.image_url.trim(),
      release_date: formData.release_date || null,
      gameplay_score: formData.gameplay_score,
      graphics_score: formData.graphics_score,
      story_score: formData.story_score,
      sound_score: formData.sound_score,
      value_score: formData.value_score,
    };

    const { error } = await supabase.from('games').insert(payload);

    if (error) {
      console.error('Error adding game:', error);
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    setSuccessMessage('Game added successfully!');
    setSubmitting(false);

    setFormData({
      title: '',
      description: '',
      developer: '',
      publisher: '',
      genre: '',
      platform: '',
      image_url: '',
      release_date: '',
      gameplay_score: 5,
      graphics_score: 5,
      story_score: 5,
      sound_score: 5,
      value_score: 5,
    });

    setTimeout(() => {
      navigateTo('home');
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigateTo('home')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-8">
            <PlusCircle className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Add a New Game</h1>
              <p className="text-gray-400 mt-1">
                Submit a game manually to your platform
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Elden Ring"
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre
                </label>
                <input
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="Action RPG"
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description of the game..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Developer
                </label>
                <input
                  name="developer"
                  value={formData.developer}
                  onChange={handleChange}
                  placeholder="FromSoftware"
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Publisher
                </label>
                <input
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  placeholder="Bandai Namco"
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platforms
              </label>
              <input
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                placeholder="PC, PS5, Xbox Series X"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Separate multiple platforms with commas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  name="release_date"
                  value={formData.release_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Score Breakdown</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gameplay Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    name="gameplay_score"
                    value={formData.gameplay_score}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Graphics Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    name="graphics_score"
                    value={formData.graphics_score}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Story Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    name="story_score"
                    value={formData.story_score}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sound Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    name="sound_score"
                    value={formData.sound_score}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    name="value_score"
                    value={formData.value_score}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {submitting ? 'Adding Game...' : 'Add Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}