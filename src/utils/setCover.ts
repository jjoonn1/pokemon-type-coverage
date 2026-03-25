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

function bfsSolve(startMask: number, combos: TypeCombo[]): SolverResult {
  if (startMask === ALL_TYPES_MASK) return { minCount: 0, solutions: [[]] };

  const dp: Array<{ steps: number; prevMask: number; comboIdx: number } | null> =
    new Array(ALL_TYPES_MASK + 1).fill(null);

  dp[startMask] = { steps: 0, prevMask: -1, comboIdx: -1 };

  const queue: number[] = [startMask];
  let found = false;

  while (queue.length > 0 && !found) {
    const current = queue.shift()!;
    const currentSteps = dp[current]!.steps;

    for (let ci = 0; ci < combos.length; ci++) {
      const next = current | combos[ci].coverageMask;
      if (next === current) continue;
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

  if (!dp[ALL_TYPES_MASK]) return { minCount: -1, solutions: [] };

  const minCount = dp[ALL_TYPES_MASK]!.steps;
  const solutions: TypeCombo[][] = [];
  const MAX_SOLUTIONS = 20;

  function findAllSolutions(mask: number, remaining: number, path: TypeCombo[], startIdx: number) {
    if (solutions.length >= MAX_SOLUTIONS) return;
    if (mask === ALL_TYPES_MASK) { solutions.push([...path]); return; }
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
    let mask = ALL_TYPES_MASK;
    while (dp[mask]!.prevMask !== -1) {
      path.unshift(combos[dp[mask]!.comboIdx]);
      mask = dp[mask]!.prevMask;
    }
    solutions.push(path);
  }

  return { minCount, solutions };
}

export function findMinimumCoverage(): SolverResult {
  return bfsSolve(0, generateAllCombos());
}

export function findMinimumCoverageFrom(startMask: number): SolverResult {
  return bfsSolve(startMask, generateAllCombos());
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
