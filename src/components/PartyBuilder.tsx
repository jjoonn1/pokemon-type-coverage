import { useState } from 'react';
import { TYPES, PokemonType } from '../data/typeChart';
import { TypeCombo, generateAllCombos, computePartyCoverage } from '../utils/setCover';
import { TypeBadge } from './TypeBadge';
import { CoverageGrid } from './CoverageGrid';

const ALL_COMBOS = generateAllCombos();

interface PartySlot {
  types: PokemonType[];
}

export function PartyBuilder() {
  const [party, setParty] = useState<PartySlot[]>([{ types: [] }]);
  const [activeSlot, setActiveSlot] = useState(0);

  const partyAsCombos: TypeCombo[] = party.map(slot => {
    if (slot.types.length === 0) return { types: [], label: '', coverageMask: 0, coveredTypes: [] };
    const key = slot.types.length === 1 ? slot.types[0] : `${slot.types[0]}/${slot.types[1]}`;
    const altKey = slot.types.length === 2 ? `${slot.types[1]}/${slot.types[0]}` : key;
    return ALL_COMBOS.find(c => c.label === key || c.label === altKey) || {
      types: slot.types,
      label: key,
      coverageMask: 0,
      coveredTypes: [],
    };
  });

  const { coveredTypes } = computePartyCoverage(partyAsCombos);

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
    setActiveSlot(Math.max(0, Math.min(activeSlot, party.length - 2)));
  }

  const currentSlot = party[activeSlot];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Party Builder</h2>
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
              {slot.types.length > 0
                ? slot.types.join('/')
                : `Slot ${idx + 1}`}
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
          Select up to 2 types for <span className="font-semibold text-gray-700">Pokémon {activeSlot + 1}</span>
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

      <CoverageGrid coveredTypes={coveredTypes} />
    </div>
  );
}
