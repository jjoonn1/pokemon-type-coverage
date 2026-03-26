export interface Game {
  id: string;
  label: string;
  shortLabel: string;
  /** Type mechanics generation — determines which types are available to attack with */
  mechGen: number;
  /** Display group for the dropdown */
  group: string;
}

export const GAMES: Game[] = [
  { id: 'all',      label: 'All Games (no filter)',                      shortLabel: 'All',        mechGen: 9, group: '' },

  // Generation I — 1996
  { id: 'rby',      label: 'Red / Blue / Yellow',                        shortLabel: 'RBY',        mechGen: 1, group: 'Generation I' },

  // Generation II — 1999
  { id: 'gsc',      label: 'Gold / Silver / Crystal',                    shortLabel: 'GSC',        mechGen: 2, group: 'Generation II' },

  // Generation III — 2002
  { id: 'rse',      label: 'Ruby / Sapphire / Emerald',                  shortLabel: 'RSE',        mechGen: 3, group: 'Generation III' },
  { id: 'frlg',     label: 'FireRed / LeafGreen',                        shortLabel: 'FR/LG',      mechGen: 3, group: 'Generation III' },

  // Generation IV — 2006
  { id: 'dpp',      label: 'Diamond / Pearl / Platinum',                 shortLabel: 'DPP',        mechGen: 4, group: 'Generation IV' },
  { id: 'hgss',     label: 'HeartGold / SoulSilver',                     shortLabel: 'HG/SS',      mechGen: 4, group: 'Generation IV' },

  // Generation V — 2010
  { id: 'bw',       label: 'Black / White',                              shortLabel: 'B/W',        mechGen: 5, group: 'Generation V' },
  { id: 'b2w2',     label: 'Black 2 / White 2',                          shortLabel: 'B2/W2',      mechGen: 5, group: 'Generation V' },

  // Generation VI — 2013
  { id: 'xy',       label: 'X / Y',                                      shortLabel: 'X/Y',        mechGen: 6, group: 'Generation VI' },
  { id: 'oras',     label: 'Omega Ruby / Alpha Sapphire',                 shortLabel: 'OR/AS',      mechGen: 6, group: 'Generation VI' },

  // Generation VII — 2016
  { id: 'sm',       label: 'Sun / Moon',                                 shortLabel: 'S/M',        mechGen: 7, group: 'Generation VII' },
  { id: 'usum',     label: 'Ultra Sun / Ultra Moon',                     shortLabel: 'US/UM',      mechGen: 7, group: 'Generation VII' },
  { id: 'lgpe',     label: "Let's Go Pikachu / Eevee",                   shortLabel: 'LGP/E',      mechGen: 7, group: 'Generation VII' },

  // Generation VIII — 2019
  { id: 'swsh',     label: 'Sword / Shield',                             shortLabel: 'Sw/Sh',      mechGen: 8, group: 'Generation VIII' },
  { id: 'swsh_dlc', label: 'Sword / Shield + DLC',                       shortLabel: 'Sw/Sh+DLC',  mechGen: 8, group: 'Generation VIII' },
  { id: 'bdsp',     label: 'Brilliant Diamond / Shining Pearl',          shortLabel: 'BD/SP',      mechGen: 8, group: 'Generation VIII' },
  { id: 'pla',      label: 'Legends: Arceus',                            shortLabel: 'PLA',        mechGen: 8, group: 'Generation VIII' },

  // Generation IX — 2022
  { id: 'sv',       label: 'Scarlet / Violet',                           shortLabel: 'S/V',        mechGen: 9, group: 'Generation IX' },
  { id: 'sv_dlc',   label: 'Scarlet / Violet + DLC',                     shortLabel: 'S/V+DLC',    mechGen: 9, group: 'Generation IX' },
  { id: 'lza',      label: 'Legends: Z-A',                               shortLabel: 'LZ-A',       mechGen: 9, group: 'Generation IX' },
];

// Types that did not yet exist as a type in a given mechGen
// (affects which attacking types are usable)
export const UNAVAILABLE_TYPES_BY_GEN: Record<number, string[]> = {
  1: ['Steel', 'Dark', 'Fairy'],
  2: ['Fairy'],
  3: ['Fairy'],
  4: ['Fairy'],
  5: ['Fairy'],
};
