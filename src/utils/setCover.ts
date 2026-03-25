import { TYPES, TYPE_INDEX, SUPER_EFFECTIVE, PokemonType } from '../data/typeChart';

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

export function findMinimumCoverage(): SolverResult {
  const combos = generateAllCombos();

  // BFS over bitmask states
  // dp[mask] = { steps, prevMask, comboUsed }
  const dp: Array<{ steps: number; prevMask: number; comboIdx: number } | null> =
    new Array(ALL_TYPES_MASK + 1).fill(null);

  dp[0] = { steps: 0, prevMask: -1, comboIdx: -1 };

  const queue: number[] = [0];
  let found = false;

  while (queue.length > 0 && !found) {
    const current = queue.shift()!;
    const currentSteps = dp[current]!.steps;

    if (current === ALL_TYPES_MASK) {
      found = true;
      break;
    }

    for (let ci = 0; ci < combos.length; ci++) {
      const next = current | combos[ci].coverageMask;
      if (next === current) continue; // no new coverage
      if (dp[next] === null) {
        dp[next] = { steps: currentSteps + 1, prevMask: current, comboIdx: ci };
        queue.push(next);
        if (next === ALL_TYPES_MASK) {
          found = true;
          break;
        }
      }
    }
  }

  if (!dp[ALL_TYPES_MASK]) {
    return { minCount: -1, solutions: [] };
  }

  // Reconstruct the path
  const minCount = dp[ALL_TYPES_MASK]!.steps;

  // Find all solutions with that many steps using DFS
  const solutions: TypeCombo[][] = [];
  const MAX_SOLUTIONS = 20;

  function findAllSolutions(
    mask: number,
    remaining: number,
    path: TypeCombo[],
    startComboIdx: number
  ) {
    if (solutions.length >= MAX_SOLUTIONS) return;

    if (mask === ALL_TYPES_MASK) {
      solutions.push([...path]);
      return;
    }

    if (remaining === 0) return;

    for (let ci = startComboIdx; ci < combos.length; ci++) {
      const next = mask | combos[ci].coverageMask;
      if (next === mask) continue; // no new coverage

      // Pruning: check if it's still possible to cover all types
      // in `remaining - 1` more steps
      // (simple check: uncovered bits that can be covered)
      path.push(combos[ci]);
      findAllSolutions(next, remaining - 1, path, ci + 1);
      path.pop();
    }
  }

  findAllSolutions(0, minCount, [], 0);

  // If DFS found nothing (can happen with ordering), fall back to reconstructed path
  if (solutions.length === 0) {
    const path: TypeCombo[] = [];
    let mask = ALL_TYPES_MASK;
    while (dp[mask]!.prevMask !== -1) {
      path.unshift(combos[dp[mask]!.comboIdx]);
      mask = dp[mask]!.prevMask;
    }
    solutions.push(path);
  }

  return { minCount, solutions };
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
