import { createContext, useContext, useState, ReactNode } from 'react';

type Page = 'home' | 'add-game' | 'game' | 'leaderboard' | 'recommendations';

interface RouterContextType {
  currentPage: Page;
  selectedGameId: string | null;
  navigateTo: (page: Page, gameId?: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const navigateTo = (page: Page, gameId?: string) => {
    setCurrentPage(page);
    if (gameId) {
      setSelectedGameId(gameId);
    }
  };

  return (
    <RouterContext.Provider value={{ currentPage, selectedGameId, navigateTo }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
}
