import { Trophy, Sparkles, Gamepad2, PlusCircle } from 'lucide-react';
import { useRouter } from '../context/RouterContext';

export function Navigation() {
  const { currentPage, navigateTo } = useRouter();

  const navItems = [
    { id: 'home' as const, label: 'Games', icon: Gamepad2 },
    { id: 'add-game' as const, label: 'Add Game', icon: PlusCircle },
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
    { id: 'recommendations' as const, label: 'Recommended', icon: Sparkles },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              PlaySuggest
            </span>
          </div>

          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
