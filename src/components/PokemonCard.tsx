import { TypeCombo } from '../utils/setCover';
import { TypeBadge } from './TypeBadge';
import { PokemonSpecies, getPokemonForTypes, getSpriteUrl } from '../data/pokemonSpecies';
import { PokemonType } from '../data/typeChart';

interface PokemonCardProps {
  combo: TypeCombo;
  index: number;
  availableIds?: Set<number>;
  /** When provided, the card becomes interactive — click a Pokémon to add it, or the type button to add types only */
  onAdd?: (pokemon: PokemonSpecies | null) => void;
}

export function PokemonCard({ combo, index, availableIds, onAdd }: PokemonCardProps) {
  const examples = getPokemonForTypes(combo.types as PokemonType[], availableIds).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 border border-gray-100">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex gap-2 flex-wrap flex-1">
          {combo.types.map(t => (
            <TypeBadge key={t} type={t} size="lg" />
          ))}
        </div>
        {onAdd && (
          <button
            onClick={() => onAdd(null)}
            title="Add this type combo to party"
            className="ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg px-2 py-1 transition-colors whitespace-nowrap"
          >
            + Types only
          </button>
        )}
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
            {onAdd ? 'Pick a Pokémon to add' : 'Example Pokémon'}
          </p>
          <div className="flex gap-3 flex-wrap">
            {examples.map(p => (
              onAdd ? (
                <button
                  key={p.id}
                  onClick={() => onAdd(p)}
                  className="flex flex-col items-center gap-0.5 rounded-xl p-1.5 hover:bg-indigo-50 hover:ring-2 hover:ring-indigo-300 transition-all group"
                  title={`Add ${p.name} to party`}
                >
                  <div className="relative">
                    <img src={getSpriteUrl(p.id)} alt={p.name} className="w-12 h-12 object-contain" loading="lazy" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none">+</span>
                  </div>
                  <span className="text-xs text-gray-500 text-center leading-tight">{p.name}</span>
                </button>
              ) : (
                <div key={p.id} className="flex flex-col items-center gap-0.5">
                  <img src={getSpriteUrl(p.id)} alt={p.name} className="w-12 h-12 object-contain" loading="lazy" />
                  <span className="text-xs text-gray-500 text-center leading-tight">{p.name}</span>
                </div>
              )
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
