import { useMemo, useState, useRef, useEffect } from 'react';
import { TYPES, PokemonType, SUPER_EFFECTIVE, TYPE_INDEX } from '../data/typeChart';
import { TypeCombo, computePartyCoverage, findMinimumCoverageFrom } from '../utils/setCover';
import { PokemonSpecies, searchPokemon, getSpriteUrl } from '../data/pokemonSpecies';
import { TypeBadge } from './TypeBadge';
import { PokemonCard } from './PokemonCard';
import { CoverageGrid } from './CoverageGrid';

interface PartySlot {
  pokemon: PokemonSpecies | null;
  types: PokemonType[];
}

function slotToCombo(slot: PartySlot): TypeCombo {
  let mask = 0;
  for (const t of slot.types) {
    for (const defended of SUPER_EFFECTIVE[t]) {
      mask |= (1 << TYPE_INDEX[defended]);
    }
  }
  const coveredTypes = TYPES.filter((_, i) => (mask >> i) & 1);
  return { types: slot.types, label: slot.types.join('/') || '', coverageMask: mask, coveredTypes };
}

// ── Search box ────────────────────────────────────────────────────────────────
function PokemonSearch({ onAdd, disabled }: { onAdd: (p: PokemonSpecies) => void; disabled: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PokemonSpecies[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchPokemon(query));
    setOpen(query.length >= 2);
  }, [query]);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  function select(p: PokemonSpecies) {
    onAdd(p);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={disabled ? 'Party full (6/6)' : 'Search Pokémon by name…'}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white disabled:bg-gray-50 disabled:text-gray-400"
      />
      {open && (
        <ul className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.map(p => (
            <li key={p.id}>
              <button
                onClick={() => select(p)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-indigo-50 text-left"
              >
                <img src={getSpriteUrl(p.id)} alt={p.name} className="w-9 h-9 object-contain" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                  <div className="flex gap-1 mt-0.5">
                    {p.types.map(t => <TypeBadge key={t} type={t} size="sm" />)}
                  </div>
                </div>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400">No Pokémon found</li>
          )}
        </ul>
      )}
    </div>
  );
}

// ── Type picker ───────────────────────────────────────────────────────────────
function TypePicker({ onAdd, disabled }: { onAdd: (types: PokemonType[]) => void; disabled: boolean }) {
  const [pending, setPending] = useState<PokemonType[]>([]);

  function toggle(type: PokemonType) {
    if (disabled) return;
    if (pending.includes(type)) {
      setPending(pending.filter(t => t !== type));
      return;
    }
    const next = [...pending, type];
    if (next.length === 2) {
      onAdd(next);
      setPending([]);
    } else {
      setPending(next);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TYPES.map(t => {
          const selected = pending.includes(t);
          const blocked = !selected && pending.length >= 2;
          return (
            <button
              key={t}
              onClick={() => toggle(t)}
              disabled={disabled || blocked}
              className={`transition-all ${
                disabled || blocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
              } ${selected ? 'ring-2 ring-offset-1 ring-indigo-500 rounded-full' : ''}`}
            >
              <TypeBadge type={t} size="sm" />
            </button>
          );
        })}
      </div>

      {/* 1-type confirm */}
      {pending.length === 1 && (
        <button
          onClick={() => { onAdd(pending); setPending([]); }}
          className="mt-3 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          <TypeBadge type={pending[0]} size="sm" />
          <span>Add as {pending[0]}-type only</span>
        </button>
      )}
    </div>
  );
}

// ── Party member chip ─────────────────────────────────────────────────────────
function PartyMember({ slot, onRemove }: { slot: PartySlot; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm border border-gray-100">
      {slot.pokemon && (
        <img src={getSpriteUrl(slot.pokemon.id)} alt={slot.pokemon.name} className="w-10 h-10 object-contain" />
      )}
      <div className="flex flex-col gap-0.5 min-w-0">
        {slot.pokemon && (
          <p className="text-xs font-bold text-gray-700 truncate">{slot.pokemon.name}</p>
        )}
        <div className="flex gap-1 flex-wrap">
          {slot.types.map(t => <TypeBadge key={t} type={t} size="sm" />)}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="ml-2 text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0 transition-colors"
        aria-label="Remove"
      >
        ×
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SmartBuilder() {
  const [party, setParty] = useState<PartySlot[]>([]);
  const [solutionIndex, setSolutionIndex] = useState(0);

  const full = party.length >= 6;

  function addToParty(types: PokemonType[], pokemon?: PokemonSpecies) {
    if (full) return;
    setParty(prev => [...prev, { types, pokemon: pokemon ?? null }]);
  }

  function removeFromParty(idx: number) {
    setParty(prev => prev.filter((_, i) => i !== idx));
  }

  const partyCombos = useMemo(() => party.map(slotToCombo), [party]);
  const { coveredMask, coveredTypes } = useMemo(() => computePartyCoverage(partyCombos), [partyCombos]);
  const completion = useMemo(() => { setSolutionIndex(0); return findMinimumCoverageFrom(coveredMask); }, [coveredMask]);
  const completionSolution = completion.solutions[solutionIndex] ?? completion.solutions[0] ?? [];
  const totalCoveredTypes = useMemo(() => {
    const allMask = coveredMask | completionSolution.reduce((m, c) => m | c.coverageMask, 0);
    return TYPES.filter((_, i) => (allMask >> i) & 1);
  }, [coveredMask, completionSolution]);

  const alreadyCovered = coveredTypes.length === TYPES.length;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Your party ── */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">Your Pokémon</h2>

        {/* Party chips */}
        {party.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {party.map((slot, idx) => (
              <PartyMember key={idx} slot={slot} onRemove={() => removeFromParty(idx)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No Pokémon added yet — search or pick types below.</p>
        )}

        {/* Add panel */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-600">
            {full ? '🎒 Party is full (6/6)' : 'Add a Pokémon'}
          </p>

          <PokemonSearch
            onAdd={p => addToParty([...p.types], p)}
            disabled={full}
          />

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-100" />
            <span>or pick types</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <TypePicker onAdd={types => addToParty(types)} disabled={full} />
        </div>

        {party.length > 0 && <CoverageGrid coveredTypes={coveredTypes} />}
      </div>

      {/* ── Optimal completion ── */}
      {party.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm font-semibold text-gray-400">Optimal Completion</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {alreadyCovered ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <p className="text-2xl mb-1">🎉</p>
              <p className="text-green-700 font-bold text-lg">Full coverage achieved!</p>
              <p className="text-green-600 text-sm mt-1">Your current party already covers all 18 types.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-indigo-600 rounded-2xl p-5 shadow text-white">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black">{completion.minCount}</span>
                  <div>
                    <p className="font-bold">additional Pokémon needed</p>
                    <p className="text-indigo-200 text-sm">to complete full coverage given your current party</p>
                  </div>
                </div>
                {completion.solutions.length > 1 && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-indigo-200 text-xs">{completion.solutions.length} solutions:</span>
                    <div className="flex gap-1">
                      {completion.solutions.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSolutionIndex(i)}
                          className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                            i === solutionIndex ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white hover:bg-indigo-400'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {completionSolution.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {completionSolution.map((combo, i) => (
                    <PokemonCard key={i} combo={combo} index={i} />
                  ))}
                </div>
              )}

              {completionSolution.length > 0 && <CoverageGrid coveredTypes={totalCoveredTypes} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
