import { useState } from 'react';
import { GAMES } from './data/games';
import { GAME_POKEMON_ID_SETS } from './data/gamePokedex';
import { SmartBuilder } from './components/SmartBuilder';

function App() {
  const [selectedGameId, setSelectedGameId] = useState<string>('all');

  const selectedGame = GAMES.find(g => g.id === selectedGameId)!;
  const isAllGames = selectedGame.id === 'all';
  const availableIds = isAllGames ? undefined : GAME_POKEMON_ID_SETS[selectedGame.id];
  const mechGen = isAllGames ? undefined : selectedGame.mechGen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-3xl">⚔️</span>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">
                  Pokémon Type Coverage
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Find the minimum party to cover super effectiveness against all types
                </p>
              </div>
            </div>

            {/* Game selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="game-select" className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                Game:
              </label>
              <select
                id="game-select"
                value={selectedGameId}
                onChange={e => setSelectedGameId(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {(() => {
                  const groups: string[] = [];
                  const byGroup: Record<string, typeof GAMES> = {};
                  for (const g of GAMES) {
                    if (!byGroup[g.group]) { byGroup[g.group] = []; groups.push(g.group); }
                    byGroup[g.group].push(g);
                  }
                  return groups.map(grp =>
                    grp === '' ? (
                      byGroup[grp].map(g => <option key={g.id} value={g.id}>{g.label}</option>)
                    ) : (
                      <optgroup key={grp} label={grp}>
                        {byGroup[grp].map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                      </optgroup>
                    )
                  );
                })()}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <SmartBuilder availableIds={availableIds} mechGen={mechGen} />
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        Built with React + Vite · Type data from Gen 9 Pokémon games
      </footer>
    </div>
  );
}

export default App;
