export const TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
] as const;

export type PokemonType = typeof TYPES[number];

export const TYPE_INDEX: Record<PokemonType, number> = Object.fromEntries(
  TYPES.map((t, i) => [t, i])
) as Record<PokemonType, number>;

// superEffectiveAgainst[attacker] = list of defender types it hits for 2x
export const SUPER_EFFECTIVE: Record<PokemonType, PokemonType[]> = {
  Normal:   [],
  Fire:     ['Grass', 'Ice', 'Bug', 'Steel'],
  Water:    ['Fire', 'Ground', 'Rock'],
  Electric: ['Water', 'Flying'],
  Grass:    ['Water', 'Ground', 'Rock'],
  Ice:      ['Grass', 'Ground', 'Flying', 'Dragon'],
  Fighting: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
  Poison:   ['Grass', 'Fairy'],
  Ground:   ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
  Flying:   ['Grass', 'Fighting', 'Bug'],
  Psychic:  ['Fighting', 'Poison'],
  Bug:      ['Grass', 'Psychic', 'Dark'],
  Rock:     ['Fire', 'Ice', 'Flying', 'Bug'],
  Ghost:    ['Psychic', 'Ghost'],
  Dragon:   ['Dragon'],
  Dark:     ['Psychic', 'Ghost'],
  Steel:    ['Ice', 'Rock', 'Fairy'],
  Fairy:    ['Fighting', 'Dragon', 'Dark'],
};

// Type colors for UI
export const TYPE_COLORS: Record<PokemonType, { bg: string; text: string }> = {
  Normal:   { bg: '#A8A77A', text: '#fff' },
  Fire:     { bg: '#EE8130', text: '#fff' },
  Water:    { bg: '#6390F0', text: '#fff' },
  Electric: { bg: '#F7D02C', text: '#333' },
  Grass:    { bg: '#7AC74C', text: '#fff' },
  Ice:      { bg: '#96D9D6', text: '#333' },
  Fighting: { bg: '#C22E28', text: '#fff' },
  Poison:   { bg: '#A33EA1', text: '#fff' },
  Ground:   { bg: '#E2BF65', text: '#333' },
  Flying:   { bg: '#A98FF3', text: '#fff' },
  Psychic:  { bg: '#F95587', text: '#fff' },
  Bug:      { bg: '#A6B91A', text: '#fff' },
  Rock:     { bg: '#B6A136', text: '#fff' },
  Ghost:    { bg: '#735797', text: '#fff' },
  Dragon:   { bg: '#6F35FC', text: '#fff' },
  Dark:     { bg: '#705746', text: '#fff' },
  Steel:    { bg: '#B7B7CE', text: '#333' },
  Fairy:    { bg: '#D685AD', text: '#fff' },
};

// Notable example Pokémon for dual type combos
export const EXAMPLE_POKEMON: Record<string, string> = {
  'Fire/Flying':     'Charizard, Moltres',
  'Water/Flying':    'Gyarados (Flying/Water)',
  'Grass/Poison':    'Bulbasaur line, Venusaur',
  'Bug/Flying':      'Butterfree, Beautifly',
  'Normal/Flying':   'Pidgey line, Staraptor',
  'Ice/Flying':      'Articuno',
  'Fighting/Ground': 'Sandslash (Ground only), Machamp (Fighting)',
  'Fighting/Ice':    'No natural - closest: Beartic(Ice)+Medicham(Fighting)',
  'Ground/Dark':     'Krookodile',
  'Flying/Poison':   'Golbat, Crobat',
  'Rock/Ground':     'Rhyhorn line, Onix',
  'Ice/Psychic':     'Jynx',
  'Fire/Ground':     'Camerupt, Numel',
  'Electric/Flying': 'Zapdos, Emolga',
  'Steel/Fairy':     'Magearna, Klefki',
  'Dragon/Flying':   'Dragonite, Salamence',
  'Psychic/Fairy':   'Gardevoir, Mr. Mime',
  'Ghost/Dark':      'Spiritomb, Sableye',
  'Fighting/Dark':   'Scrafty',
  'Water/Ground':    'Swampert, Gastrodon',
  'Ground/Rock':     'Geodude line, Rhyhorn',
  'Bug/Poison':      'Beedrill',
  'Steel/Ground':    'Steelix, Sandshrew-Alolan',
  'Fire/Steel':      'Heatran',
  'Water/Ice':       'Lapras, Cloyster',
  'Grass/Ice':       'Abomasnow',
};
