/**
 * Calculates the XP required for a given level.
 * Formula: 100 * level * 1.5, rounded to nearest 10
 * Level 1: 150 XP
 * Level 2: 300 XP
 * Level 3: 450 XP
 * Level 4: 600 XP
 * etc.
 */
export function getXPRequiredForLevel(level: number): number {
  const rawXP = 100 * level * 1.5;
  return Math.round(rawXP / 10) * 10; // Round to nearest 10
}

/**
 * Calculates what level a user should be based on their total XP
 */
export function calculateLevel(totalXP: number): number {
  let level = 1;
  let xpRequired = getXPRequiredForLevel(level);
  let accumulatedXP = 0;

  while (accumulatedXP + xpRequired <= totalXP) {
    accumulatedXP += xpRequired;
    level++;
    xpRequired = getXPRequiredForLevel(level);
  }

  return level;
}

/**
 * Gets the XP progress within the current level
 */
export function getCurrentLevelXP(totalXP: number): number {
  let level = 1;
  let xpRequired = getXPRequiredForLevel(level);
  let accumulatedXP = 0;

  while (accumulatedXP + xpRequired <= totalXP) {
    accumulatedXP += xpRequired;
    level++;
    xpRequired = getXPRequiredForLevel(level);
  }

  return totalXP - accumulatedXP;
}

/**
 * Calculates the current level progress as a percentage
 */
export function getLevelProgress(totalXP: number): number {
  const level = calculateLevel(totalXP);
  const currentLevelXP = getCurrentLevelXP(totalXP);
  const requiredXP = getXPRequiredForLevel(level);
  
  return Math.min(100, Math.max(0, (currentLevelXP / requiredXP) * 100));
}

/**
 * Gets formatted XP display string (e.g. "150/300 XP")
 */
export function getXPDisplayString(totalXP: number): string {
  const level = calculateLevel(totalXP);
  const currentLevelXP = getCurrentLevelXP(totalXP);
  const requiredXP = getXPRequiredForLevel(level);
  
  return `${currentLevelXP}/${requiredXP} XP`;
} 