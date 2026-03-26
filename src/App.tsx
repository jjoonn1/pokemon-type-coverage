import { useMemo, useState } from 'react';
import { findMinimumCoverage } from './utils/setCover';
import { UNAVAILABLE_TYPES_BY_GEN, GAMES } from './data/games';
import { GAME_POKEMON_ID_SETS } from './data/gamePokedex';
import { TYPES, PokemonType } from './data/typeChart';
import { PokemonCard } from './components/PokemonCard';
import { CoverageGrid } from './components/CoverageGrid';
import { PartyBuilder } from './components/PartyBuilder';
import { SmartBuilder } from './components/SmartBuilder';

type Tab = 'optimal' | 'smart' | 'builder';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('optimal');
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [selectedGameId, setSelectedGameId] = useState<string>('all');

  const selectedGame = GAMES.find(g => g.id === selectedGameId)!;
  const isAllGames = selectedGame.id === 'all';
  const availableIds = isAllGames ? undefined : GAME_POKEMON_ID_SETS[selectedGame.id];
  const mechGen = isAllGames ? undefined : selectedGame.mechGen;

  const unavailableTypes = useMemo(
    () => (mechGen !== undefined ? (UNAVAILABLE_TYPES_BY_GEN[mechGen] ?? []) as PokemonType[] : []),
    [mechGen],
  );

  const result = useMemo(() => {
    setSolutionIndex(0);
    return findMinimumCoverage(availableIds, mechGen);
  }, [availableIds, mechGen]);
  const solution = result.solutions[solutionIndex] ?? result.solutions[0];
  const allCoveredTypes = solution?.flatMap(c => c.coveredTypes) ?? [];
  const coveredSet = [...new Set(allCoveredTypes)] as typeof allCoveredTypes;

  const availableTypeCount = TYPES.length - unavailableTypes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚔️</span>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Pokémon Type Coverage
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Find the minimum Pokémon party to cover super effectiveness against all types
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Game selector + Tabs row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            {(([
              ['optimal', '🏆 Optimal'],
              ['smart',   '✨ Smart Builder'],
              ['builder', '🔧 Party Builder'],
            ] as const)).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-white shadow text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'optimal' && (
          <>
            {/* Result banner */}
            <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl font-black">{result.minCount}</span>
                <div>
                  <p className="text-lg font-bold">Pokémon minimum</p>
                  <p className="text-indigo-200 text-sm">
                    to achieve super effectiveness against all {availableTypeCount} types
                    {!isAllGames && ` available in ${selectedGame.shortLabel}`}
                  </p>
                </div>
              </div>
              <p className="text-indigo-200 text-xs mt-2">
                {!isAllGames
                  ? `Using the ${availableIds?.size ?? 0} Pokémon available in ${selectedGame.label}`
                  : `Using bitmask BFS over all 171 possible single & dual-type combinations`}
              </p>
            </div>

            {/* Solution selector */}
            {result.solutions.length > 1 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {result.solutions.length} optimal solutions found:
                </span>
                <div className="flex gap-1">
                  {result.solutions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSolutionIndex(i)}
                      className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                        i === solutionIndex
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pokémon cards */}
            {solution && (
              <div className="grid gap-4 sm:grid-cols-2">
                {solution.map((combo, i) => (
                  <PokemonCard key={i} combo={combo} index={i} availableIds={availableIds} />
                ))}
              </div>
            )}

            {/* Coverage overview */}
            {solution && (
              <CoverageGrid coveredTypes={coveredSet} unavailableTypes={unavailableTypes} />
            )}

            {/* Explanation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 text-sm text-gray-600 leading-relaxed">
              <h3 className="font-bold text-gray-800 mb-2">How it works</h3>
              <p>
                This is a <strong>minimum set cover</strong> problem. We have a universe of types that must be covered
                (i.e., each type must be super-effectively hit by at least one Pokémon in the party). Each Pokémon
                with 1 or 2 types covers the union of their offensive super-effective matchups.
              </p>
              <p className="mt-2">
                The algorithm uses <strong>BFS over bitmask states</strong>: each of the 2<sup>18</sup> = 262,144
                possible coverage states is a node, and we find the shortest path from 0 (no coverage)
                to the target (all available types covered).
                {isAllGames && ' All 171 possible type combinations (18 mono + 153 dual) are evaluated at each step.'}
              </p>
            </div>
          </>
        )}

        {activeTab === 'smart' && <SmartBuilder availableIds={availableIds} mechGen={mechGen} />}
        {activeTab === 'builder' && <PartyBuilder availableIds={availableIds} mechGen={mechGen} />}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        Built with React + Vite · Type data from Gen 8/9 Pokémon games
      </footer>
    </div>
  );
}

export default App;
