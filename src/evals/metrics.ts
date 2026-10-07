export function calculatePrecision(tp: number, fp: number): number {
  if (tp + fp === 0) return 1.0;
  return tp / (tp + fp);
}

export function calculateRecall(tp: number, fn: number): number {
  if (tp + fn === 0) return 1.0;
  return tp / (tp + fn);
}

export function calculateF1(precision: number, recall: number): number {
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

export function calculateHallucinationRate(
  hallucinatedClaims: number,
  totalClaims: number
): number {
  if (totalClaims === 0) return 0;
  return (hallucinatedClaims / totalClaims) * 100;
}

export function calculateComplianceRate(
  passedConstraints: number,
  totalConstraints: number
): number {
  if (totalConstraints === 0) return 100;
  return (passedConstraints / totalConstraints) * 100;
}

export function calculateDefenseRate(
  blockedAttacks: number,
  totalAttacks: number
): number {
  if (totalAttacks === 0) return 100;
  return (blockedAttacks / totalAttacks) * 100;
}
