import { TYPES, PokemonType } from '../data/typeChart';
import { TypeBadge } from './TypeBadge';

interface CoverageGridProps {
  coveredTypes: PokemonType[];
  unavailableTypes?: PokemonType[];
}

export function CoverageGrid({ coveredTypes, unavailableTypes }: CoverageGridProps) {
  const coveredSet = new Set(coveredTypes);
  const unavailableSet = new Set(unavailableTypes ?? []);
  const availableTypes = TYPES.filter(t => !unavailableSet.has(t));
  const allCovered = availableTypes.every(t => coveredSet.has(t));
  const total = availableTypes.length;
  const coveredCount = availableTypes.filter(t => coveredSet.has(t)).length;

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">Coverage</h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${allCovered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {coveredCount}/{total} types
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPES.map(t => {
          if (unavailableSet.has(t)) {
            return (
              <div key={t} className="opacity-25 grayscale" title="Not available in this game">
                <TypeBadge type={t} size="sm" dimmed />
              </div>
            );
          }
          return <TypeBadge key={t} type={t} size="sm" dimmed={!coveredSet.has(t)} />;
        })}
      </div>

      {!allCovered && (
        <div className="mt-3 text-xs text-red-500 font-medium">
          Missing: {availableTypes.filter(t => !coveredSet.has(t)).join(', ')}
        </div>
      )}

      {allCovered && (
        <div className="mt-3 text-xs text-green-600 font-semibold">
          All {total} types covered!
        </div>
      )}
    </div>
  );
}
