import { getCurrentLevelXP, getXPRequiredForLevel } from "./xp";

export type Tier = 'newbie' | 'apprentice' | 'veteran' | 'champion' | 'legend';

/**
 * Tier level ranges:
 * - Newbie: [1, 3)
 * - Apprentice: [3, 10)
 * - Veteran: [10, 20)
 * - Champion: [20, 30)
 * - Legend: [30, ∞)
 */
export function getTierForLevel(level: number): Tier {
  if (level < 3) return 'newbie';
  if (level < 10) return 'apprentice';
  if (level < 20) return 'veteran';
  if (level < 30) return 'champion';
  return 'legend';
}

export function getNextTierLevel(currentLevel: number): number | null {
  if (currentLevel < 3) return 3;
  if (currentLevel < 10) return 10;
  if (currentLevel < 20) return 20;
  if (currentLevel < 30) return 30;
  return null; // Already at highest tier
}

export function getTierProgress(level: number, totalXP: number): number {
  const nextTierLevel = getNextTierLevel(level);
  if (!nextTierLevel) return 100; // Already at max tier
  
  let currentTierMinLevel: number;
  if (level < 3) currentTierMinLevel = 1;
  else if (level < 10) currentTierMinLevel = 3;
  else if (level < 20) currentTierMinLevel = 10;
  else if (level < 30) currentTierMinLevel = 20;
  else currentTierMinLevel = 30;

  // Calculate base progress through levels
  const levelRange = nextTierLevel - currentTierMinLevel;
  const levelsCompleted = level - currentTierMinLevel;
  
  // Add fractional progress through current level
  const currentLevelXP = getCurrentLevelXP(totalXP);
  const requiredXP = getXPRequiredForLevel(level);
  const levelProgress = currentLevelXP / requiredXP;
  
  // Combine whole levels completed with progress through current level
  const totalProgress = (levelsCompleted + levelProgress) / levelRange;
  
  console.log('Tier Progress Debug:', {
    level,
    totalXP,
    currentTierMinLevel,
    nextTierLevel,
    levelRange,
    levelsCompleted,
    currentLevelXP,
    requiredXP,
    levelProgress,
    totalProgress,
    percentage: totalProgress * 100
  });

  return Math.min(100, Math.max(0, totalProgress * 100));
}

interface TierColors {
  text: string;
  bg: string;
}

export const TIER_COLORS: Record<Tier, TierColors> = {
  newbie: {
    text: 'text-green-500',
    bg: 'bg-green-500',
  },
  apprentice: {
    text: 'text-cyan-500',
    bg: 'bg-cyan-500',
  },
  veteran: {
    text: 'text-violet-400',
    bg: 'bg-violet-400',
  },
  champion: {
    text: 'text-yellow-500',
    bg: 'bg-yellow-500',
  },
  legend: {
    text: 'text-slate-300',
    bg: 'bg-slate-300',
  },
} as const; 