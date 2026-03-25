import { TYPES, PokemonType } from '../data/typeChart';
import { TypeBadge } from './TypeBadge';

interface CoverageGridProps {
  coveredTypes: PokemonType[];
}

export function CoverageGrid({ coveredTypes }: CoverageGridProps) {
  const coveredSet = new Set(coveredTypes);
  const allCovered = coveredTypes.length === TYPES.length;

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">Coverage</h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${allCovered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {coveredTypes.length}/{TYPES.length} types
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPES.map(t => (
          <TypeBadge key={t} type={t} size="sm" dimmed={!coveredSet.has(t)} />
        ))}
      </div>

      {!allCovered && (
        <div className="mt-3 text-xs text-red-500 font-medium">
          Missing: {TYPES.filter(t => !coveredSet.has(t)).join(', ')}
        </div>
      )}

      {allCovered && (
        <div className="mt-3 text-xs text-green-600 font-semibold">
          All 18 types covered!
        </div>
      )}
    </div>
  );
}
