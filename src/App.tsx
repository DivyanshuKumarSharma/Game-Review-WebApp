import { RouterProvider, useRouter } from './context/RouterContext';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { AddGamePage } from './pages/AddGamePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { RecommendationsPage } from './pages/RecommendationsPage';

function AppContent() {
  const { currentPage } = useRouter();

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'add-game' && <AddGamePage />}
      {currentPage === 'game' && <GameDetailPage />}
      {currentPage === 'leaderboard' && <LeaderboardPage />}
      {currentPage === 'recommendations' && <RecommendationsPage />}
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}

export default App;