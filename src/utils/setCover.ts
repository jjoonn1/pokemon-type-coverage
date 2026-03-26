import { TYPES, TYPE_INDEX, SUPER_EFFECTIVE, PokemonType } from '../data/typeChart';
import { UNAVAILABLE_TYPES_BY_GEN } from '../data/games';
import { getPokemonInSet, POKEMON_SPECIES } from '../data/pokemonSpecies';

export interface TypeCombo {
  types: PokemonType[];
  label: string;
  coverageMask: number;
  coveredTypes: PokemonType[];
}

export interface SolverResult {
  minCount: number;
  solutions: TypeCombo[][];
}

const ALL_TYPES_MASK = (1 << TYPES.length) - 1; // 2^18 - 1

function computeCoverageMask(types: PokemonType[]): number {
  let mask = 0;
  for (const t of types) {
    for (const defended of SUPER_EFFECTIVE[t]) {
      mask |= (1 << TYPE_INDEX[defended]);
    }
  }
  return mask;
}

export function generateAllCombos(): TypeCombo[] {
  const combos: TypeCombo[] = [];

  // Single types
  for (const t of TYPES) {
    const coverageMask = computeCoverageMask([t]);
    const coveredTypes = TYPES.filter((_, i) => (coverageMask >> i) & 1);
    combos.push({ types: [t], label: t, coverageMask, coveredTypes });
  }

  // Dual types
  for (let i = 0; i < TYPES.length; i++) {
    for (let j = i + 1; j < TYPES.length; j++) {
      const types = [TYPES[i], TYPES[j]];
      const coverageMask = computeCoverageMask(types);
      const coveredTypes = TYPES.filter((_, k) => (coverageMask >> k) & 1);
      combos.push({
        types,
        label: `${TYPES[i]}/${TYPES[j]}`,
        coverageMask,
        coveredTypes,
      });
    }
  }

  return combos;
}

// Returns bitmask of types that exist as playable types in the given mechGen (undefined = all)
export function computeTargetMask(mechGen?: number): number {
  if (mechGen === undefined) return ALL_TYPES_MASK;
  const unavailable = new Set<string>(UNAVAILABLE_TYPES_BY_GEN[mechGen] ?? []);
  if (unavailable.size === 0) return ALL_TYPES_MASK;
  let mask = 0;
  for (let i = 0; i < TYPES.length; i++) {
    if (!unavailable.has(TYPES[i])) mask |= (1 << i);
  }
  return mask;
}

// Returns type combos available in a specific game (by Pokémon ID set + mechGen type rules)
export function generateCombosForGame(availableIds: Set<number>, mechGen: number): TypeCombo[] {
  const unavailable = new Set<string>(UNAVAILABLE_TYPES_BY_GEN[mechGen] ?? []);
  const gamePokemon = getPokemonInSet(availableIds);

  // Build set of sorted type-combo keys that actually exist as Pokémon in this game
  const existingCombos = new Set<string>();
  for (const p of gamePokemon) {
    existingCombos.add([...p.types].sort().join('/'));
  }

  const combos: TypeCombo[] = [];

  for (const t of TYPES) {
    if (unavailable.has(t)) continue;
    if (!existingCombos.has(t)) continue;
    const coverageMask = computeCoverageMask([t]);
    const coveredTypes = TYPES.filter((_, i) => (coverageMask >> i) & 1);
    combos.push({ types: [t], label: t, coverageMask, coveredTypes });
  }

  for (let i = 0; i < TYPES.length; i++) {
    if (unavailable.has(TYPES[i])) continue;
    for (let j = i + 1; j < TYPES.length; j++) {
      if (unavailable.has(TYPES[j])) continue;
      const key = [TYPES[i], TYPES[j]].sort().join('/');
      if (!existingCombos.has(key)) continue;
      const types = [TYPES[i], TYPES[j]];
      const coverageMask = computeCoverageMask(types);
      const coveredTypes = TYPES.filter((_, k) => (coverageMask >> k) & 1);
      combos.push({ types, label: `${TYPES[i]}/${TYPES[j]}`, coverageMask, coveredTypes });
    }
  }

  return combos;
}

// Kept for backward-compat: generates combos from all Pokémon for a given mechGen
export function generateCombosForMechGen(mechGen: number): TypeCombo[] {
  return generateCombosForGame(new Set(POKEMON_SPECIES.map(p => p.id)), mechGen);
}

function bfsSolve(startMask: number, combos: TypeCombo[], targetMask: number = ALL_TYPES_MASK): SolverResult {
  if ((startMask & targetMask) === targetMask) return { minCount: 0, solutions: [[]] };

  const dp: Array<{ steps: number; prevMask: number; comboIdx: number } | null> =
    new Array(ALL_TYPES_MASK + 1).fill(null);

  dp[startMask] = { steps: 0, prevMask: -1, comboIdx: -1 };

  const queue: number[] = [startMask];
  let found = false;
  let foundMask = -1;

  while (queue.length > 0 && !found) {
    const current = queue.shift()!;
    const currentSteps = dp[current]!.steps;

    for (let ci = 0; ci < combos.length; ci++) {
      const next = current | combos[ci].coverageMask;
      if (next === current) continue;
      if (dp[next] === null) {
        dp[next] = { steps: currentSteps + 1, prevMask: current, comboIdx: ci };
        queue.push(next);
        if ((next & targetMask) === targetMask) {
          found = true;
          foundMask = next;
          break;
        }
      }
    }
  }

  if (foundMask === -1) return { minCount: -1, solutions: [] };

  const minCount = dp[foundMask]!.steps;
  const solutions: TypeCombo[][] = [];
  const MAX_SOLUTIONS = 20;

  function findAllSolutions(mask: number, remaining: number, path: TypeCombo[], startIdx: number) {
    if (solutions.length >= MAX_SOLUTIONS) return;
    if ((mask & targetMask) === targetMask) { solutions.push([...path]); return; }
    if (remaining === 0) return;

    for (let ci = startIdx; ci < combos.length; ci++) {
      const next = mask | combos[ci].coverageMask;
      if (next === mask) continue;
      path.push(combos[ci]);
      findAllSolutions(next, remaining - 1, path, ci + 1);
      path.pop();
    }
  }

  findAllSolutions(startMask, minCount, [], 0);

  if (solutions.length === 0) {
    const path: TypeCombo[] = [];
    let mask = foundMask;
    while (dp[mask]!.prevMask !== -1) {
      path.unshift(combos[dp[mask]!.comboIdx]);
      mask = dp[mask]!.prevMask;
    }
    solutions.push(path);
  }

  return { minCount, solutions };
}

export function findMinimumCoverage(availableIds?: Set<number>, mechGen?: number): SolverResult {
  const combos = availableIds
    ? generateCombosForGame(availableIds, mechGen ?? 9)
    : generateAllCombos();
  return bfsSolve(0, combos, computeTargetMask(mechGen));
}

export function findMinimumCoverageFrom(startMask: number, availableIds?: Set<number>, mechGen?: number): SolverResult {
  const combos = availableIds
    ? generateCombosForGame(availableIds, mechGen ?? 9)
    : generateAllCombos();
  return bfsSolve(startMask, combos, computeTargetMask(mechGen));
}

export function computePartyCoverage(party: TypeCombo[]): {
  coveredMask: number;
  coveredTypes: PokemonType[];
  uncoveredTypes: PokemonType[];
} {
  let coveredMask = 0;
  for (const p of party) {
    coveredMask |= p.coverageMask;
  }
  const coveredTypes = TYPES.filter((_, i) => (coveredMask >> i) & 1);
  const uncoveredTypes = TYPES.filter((_, i) => !((coveredMask >> i) & 1));
  return { coveredMask, coveredTypes, uncoveredTypes };
}
