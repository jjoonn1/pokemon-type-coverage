import { useMemo, useState } from 'react';
import { TYPES, PokemonType, SUPER_EFFECTIVE, TYPE_INDEX } from '../data/typeChart';
import { TypeCombo, computePartyCoverage, findMinimumCoverageFrom } from '../utils/setCover';
import { TypeBadge } from './TypeBadge';
import { PokemonCard } from './PokemonCard';
import { CoverageGrid } from './CoverageGrid';

interface PartySlot {
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
  return {
    types: slot.types,
    label: slot.types.join('/') || 'Empty',
    coverageMask: mask,
    coveredTypes,
  };
}

export function SmartBuilder() {
  const [party, setParty] = useState<PartySlot[]>([{ types: [] }]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [solutionIndex, setSolutionIndex] = useState(0);

  const partyCombos = useMemo(() => party.map(slotToCombo), [party]);
  const { coveredMask, coveredTypes } = useMemo(() => computePartyCoverage(partyCombos), [partyCombos]);
  const completion = useMemo(() => {
    setSolutionIndex(0);
    return findMinimumCoverageFrom(coveredMask);
  }, [coveredMask]);

  const completionSolution = completion.solutions[solutionIndex] ?? completion.solutions[0] ?? [];
  const totalCoveredTypes = useMemo(() => {
    const allMasks = coveredMask | completionSolution.reduce((m, c) => m | c.coverageMask, 0);
    return TYPES.filter((_, i) => (allMasks >> i) & 1);
  }, [coveredMask, completionSolution]);

  function toggleType(type: PokemonType) {
    setParty(prev => {
      const updated = [...prev];
      const slot = { ...updated[activeSlot] };
      if (slot.types.includes(type)) {
        slot.types = slot.types.filter(t => t !== type);
      } else if (slot.types.length < 2) {
        slot.types = [...slot.types, type];
      }
      updated[activeSlot] = slot;
      return updated;
    });
  }

  function addSlot() {
    if (party.length < 6) {
      setParty(prev => [...prev, { types: [] }]);
      setActiveSlot(party.length);
    }
  }

  function removeSlot(idx: number) {
    setParty(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated.length === 0 ? [{ types: [] }] : updated;
    });
    setActiveSlot(s => Math.max(0, Math.min(s, party.length - 2)));
  }

  const currentSlot = party[activeSlot];
  const alreadyCovered = coveredTypes.length === TYPES.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Section: Your Pokémon */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Your Pokémon</h2>
          <button
            onClick={addSlot}
            disabled={party.length >= 6}
            className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-40 hover:bg-indigo-700 transition-colors"
          >
            + Add Pokémon
          </button>
        </div>

        {/* Slot tabs */}
        <div className="flex flex-wrap gap-2">
          {party.map((slot, idx) => (
            <div key={idx} className="relative">
              <button
                onClick={() => setActiveSlot(idx)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeSlot === idx
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {slot.types.length > 0 ? slot.types.join('/') : `Slot ${idx + 1}`}
              </button>
              {party.length > 1 && (
                <button
                  onClick={() => removeSlot(idx)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Type picker */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-3">
            Select up to 2 types for{' '}
            <span className="font-semibold text-gray-700">Pokémon {activeSlot + 1}</span>
            {currentSlot.types.length > 0 && (
              <button
                onClick={() => setParty(prev => {
                  const updated = [...prev];
                  updated[activeSlot] = { types: [] };
                  return updated;
                })}
                className="ml-3 text-xs text-red-400 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => {
              const selected = currentSlot.types.includes(t);
              const disabled = !selected && currentSlot.types.length >= 2;
              return (
                <button
                  key={t}
                  onClick={() => !disabled && toggleType(t)}
                  className={`transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} ${selected ? 'ring-2 ring-offset-1 ring-indigo-500 rounded-full' : ''}`}
                >
                  <TypeBadge type={t} size="sm" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Coverage from locked party */}
        <CoverageGrid coveredTypes={coveredTypes} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm font-semibold text-gray-400">Optimal Completion</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Section: Optimal Completion */}
      {alreadyCovered ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-green-700 font-bold text-lg">Full coverage achieved!</p>
          <p className="text-green-600 text-sm mt-1">Your current party already covers all 18 types.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Banner */}
          <div className={`rounded-2xl p-5 shadow text-white ${completion.minCount > 0 ? 'bg-indigo-600' : 'bg-green-600'}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black">{completion.minCount}</span>
              <div>
                <p className="font-bold">
                  additional Pokémon needed
                </p>
                <p className="text-indigo-200 text-sm">
                  to complete full coverage given your current party
                </p>
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

          {/* Suggested Pokémon cards */}
          {completionSolution.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {completionSolution.map((combo, i) => (
                <PokemonCard key={i} combo={combo} index={i} />
              ))}
            </div>
          )}

          {/* Combined coverage grid */}
          {completionSolution.length > 0 && (
            <CoverageGrid coveredTypes={totalCoveredTypes} />
          )}
        </div>
      )}
    </div>
  );
}
