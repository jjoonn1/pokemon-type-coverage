/**
 * Fetches all 1025 Pokémon from PokéAPI and writes pokemonSpecies.ts
 * Run with: node scripts/fetchPokemon.mjs
 */
import { writeFileSync } from 'fs';

const TOTAL = 1025;
const CONCURRENCY = 25;

// Special-case names where "-" splitting + capitalize doesn't work
const NAME_OVERRIDES = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',
  'type-null': 'Type: Null',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'porygon-z': 'Porygon-Z',
  'ho-oh': 'Ho-Oh',
  'chi-yu': 'Chi-Yu',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'wo-chien': 'Wo-Chien',
  'great-tusk': 'Great Tusk',
  'scream-tail': 'Scream Tail',
  'brute-bonnet': 'Brute Bonnet',
  'flutter-mane': 'Flutter Mane',
  'slither-wing': 'Slither Wing',
  'sandy-shocks': 'Sandy Shocks',
  'iron-treads': 'Iron Treads',
  'iron-bundle': 'Iron Bundle',
  'iron-hands': 'Iron Hands',
  'iron-jugulis': 'Iron Jugulis',
  'iron-moth': 'Iron Moth',
  'iron-thorns': 'Iron Thorns',
  'roaring-moon': 'Roaring Moon',
  'iron-valiant': 'Iron Valiant',
  'koraidon': 'Koraidon',
  'miraidon': 'Miraidon',
  'walking-wake': 'Walking Wake',
  'iron-leaves': 'Iron Leaves',
  'gouging-fire': 'Gouging Fire',
  'raging-bolt': 'Raging Bolt',
  'iron-boulder': 'Iron Boulder',
  'iron-crown': 'Iron Crown',
  'terapagos': 'Terapagos',
  'pecharunt': 'Pecharunt',
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatName(rawName) {
  if (NAME_OVERRIDES[rawName]) return NAME_OVERRIDES[rawName];
  return rawName.split('-').map(capitalize).join(' ');
}

function formatType(rawType) {
  return capitalize(rawType);
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(res => setTimeout(res, 1000 * (i + 1)));
    }
  }
}

async function fetchPokemon(id) {
  const data = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const types = data.types
    .sort((a, b) => a.slot - b.slot)
    .map(t => formatType(t.type.name));
  return { id: data.id, name: formatName(data.name), types };
}

async function main() {
  const allPokemon = [];
  const failed = [];

  for (let start = 1; start <= TOTAL; start += CONCURRENCY) {
    const end = Math.min(start + CONCURRENCY - 1, TOTAL);
    const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    process.stdout.write(`Fetching ${start}–${end}...`);
    try {
      const batch = await Promise.all(ids.map(id => fetchPokemon(id).catch(e => ({ error: e, id }))));
      for (const p of batch) {
        if (p.error) { failed.push(p.id); allPokemon.push(null); }
        else allPokemon.push(p);
      }
      console.log(' done');
    } catch (e) {
      console.log(` ERROR: ${e.message}`);
      for (const id of ids) failed.push(id);
    }
  }

  if (failed.length > 0) {
    console.warn(`Failed IDs: ${failed.join(', ')}`);
  }

  const genBoundaries = [
    { start: 1,   end: 151,  label: 'Gen 1' },
    { start: 152, end: 251,  label: 'Gen 2' },
    { start: 252, end: 386,  label: 'Gen 3' },
    { start: 387, end: 493,  label: 'Gen 4' },
    { start: 494, end: 649,  label: 'Gen 5' },
    { start: 650, end: 721,  label: 'Gen 6' },
    { start: 722, end: 809,  label: 'Gen 7' },
    { start: 810, end: 905,  label: 'Gen 8' },
    { start: 906, end: 1025, label: 'Gen 9' },
  ];

  const lines = [
    `import { PokemonType } from './typeChart';`,
    ``,
    `export interface PokemonSpecies {`,
    `  id: number;`,
    `  name: string;`,
    `  types: [PokemonType] | [PokemonType, PokemonType];`,
    `}`,
    ``,
    `// Max national dex ID for each generation`,
    `export const GEN_MAX_ID: Record<number, number> = {`,
    `  1: 151, 2: 251, 3: 386, 4: 493, 5: 649, 6: 721, 7: 809, 8: 905, 9: 99999,`,
    `};`,
    ``,
    `export function getPokemonForGen(maxGen: number): PokemonSpecies[] {`,
    `  const maxId = GEN_MAX_ID[maxGen] ?? 99999;`,
    `  return POKEMON_SPECIES.filter(p => p.id <= maxId);`,
    `}`,
    ``,
    `export const POKEMON_SPECIES: PokemonSpecies[] = [`,
  ];

  let genIdx = 0;
  for (const p of allPokemon) {
    if (!p) continue;
    while (genIdx < genBoundaries.length && p.id > genBoundaries[genIdx].end) genIdx++;
    if (p.id === genBoundaries[genIdx]?.start) lines.push(``, `  // ${genBoundaries[genIdx].label}`);
    const typeStr = p.types.length === 1
      ? `['${p.types[0]}']`
      : `['${p.types[0]}', '${p.types[1]}']`;
    const escapedName = p.name.replace(/'/g, "\\'");
    lines.push(`  { id: ${String(p.id).padStart(4)}, name: '${escapedName}', types: ${typeStr} },`);
  }

  lines.push(
    `];`,
    ``,
    `// Build reverse lookup: canonical type-combo key → Pokémon list`,
    `function comboKey(types: PokemonType[]): string {`,
    `  return [...types].sort().join('/');`,
    `}`,
    ``,
    `export const POKEMON_BY_TYPE_COMBO: Record<string, PokemonSpecies[]> = {};`,
    `for (const p of POKEMON_SPECIES) {`,
    `  const key = comboKey(p.types);`,
    `  if (!POKEMON_BY_TYPE_COMBO[key]) POKEMON_BY_TYPE_COMBO[key] = [];`,
    `  POKEMON_BY_TYPE_COMBO[key].push(p);`,
    `}`,
    ``,
    `export function getPokemonForTypes(types: PokemonType[], maxGen?: number): PokemonSpecies[] {`,
    `  const all = POKEMON_BY_TYPE_COMBO[comboKey(types)] ?? [];`,
    `  if (maxGen === undefined) return all;`,
    `  const maxId = GEN_MAX_ID[maxGen] ?? 99999;`,
    `  return all.filter(p => p.id <= maxId);`,
    `}`,
    ``,
    `export function getSpriteUrl(id: number): string {`,
    `  return \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/\${id}.png\`;`,
    `}`,
    ``,
    `export function getOfficialArtUrl(id: number): string {`,
    `  return \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\${id}.png\`;`,
    `}`,
    ``,
    `// Search Pokémon by name prefix, optionally constrained to a generation`,
    `export function searchPokemon(query: string, maxGen?: number): PokemonSpecies[] {`,
    `  const q = query.toLowerCase().trim();`,
    `  if (q.length < 2) return [];`,
    `  const pool = maxGen !== undefined ? getPokemonForGen(maxGen) : POKEMON_SPECIES;`,
    `  return pool.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);`,
    `}`,
  );

  const outPath = new URL('../src/data/pokemonSpecies.ts', import.meta.url).pathname;
  writeFileSync(outPath, lines.join('\n') + '\n');
  console.log(`\nWrote ${allPokemon.filter(Boolean).length} Pokémon to ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
