import { TypeCombo } from '../utils/setCover';
import { TypeBadge } from './TypeBadge';
import { getPokemonForTypes, getSpriteUrl } from '../data/pokemonSpecies';
import { PokemonType } from '../data/typeChart';

interface PokemonCardProps {
  combo: TypeCombo;
  index: number;
  availableIds?: Set<number>;
}

export function PokemonCard({ combo, index, availableIds }: PokemonCardProps) {
  const examples = getPokemonForTypes(combo.types as PokemonType[], availableIds).slice(0, 4);

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

      {examples.length > 0 ? (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Example Pokémon
          </p>
          <div className="flex gap-3 flex-wrap">
            {examples.map(p => (
              <div key={p.id} className="flex flex-col items-center gap-0.5">
                <img
                  src={getSpriteUrl(p.id)}
                  alt={p.name}
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                />
                <span className="text-xs text-gray-500 text-center leading-tight">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-300 italic border-t border-gray-100 pt-2">
          No Pokémon in our database for this combo
        </p>
      )}
    </div>
  );
}
