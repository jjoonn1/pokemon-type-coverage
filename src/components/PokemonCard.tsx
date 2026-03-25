import { TypeCombo } from '../utils/setCover';
import { TypeBadge } from './TypeBadge';
import { EXAMPLE_POKEMON } from '../data/typeChart';

interface PokemonCardProps {
  combo: TypeCombo;
  index: number;
}

export function PokemonCard({ combo, index }: PokemonCardProps) {
  const example = EXAMPLE_POKEMON[combo.label] || EXAMPLE_POKEMON[combo.types.slice().reverse().join('/')] || null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 border border-gray-100">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex gap-2 flex-wrap">
          {combo.types.map(t => (
            <TypeBadge key={t} type={t} size="lg" />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Super effective against ({combo.coveredTypes.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {combo.coveredTypes.map(t => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </div>

      {example && (
        <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2">
          e.g. {example}
        </p>
      )}
    </div>
  );
}
