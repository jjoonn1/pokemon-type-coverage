import { PokemonType, TYPE_COLORS } from '../data/typeChart';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg';
  dimmed?: boolean;
}

export function TypeBadge({ type, size = 'md', dimmed = false }: TypeBadgeProps) {
  const { bg, text } = TYPE_COLORS[type];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-block font-semibold rounded-full ${sizeClass} transition-opacity ${dimmed ? 'opacity-30' : 'opacity-100'}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {type}
    </span>
  );
}
