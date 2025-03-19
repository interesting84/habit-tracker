import { getCurrentLevelXP, getXPRequiredForLevel } from "./xp";

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * Tier level ranges:
 * - Bronze: [1, 3)
 * - Silver: [3, 10)
 * - Gold: [10, 20)
 * - Platinum: [20, ∞)
 */
export function getTierForLevel(level: number): Tier {
  if (level < 3) return 'bronze';
  if (level < 10) return 'silver';
  if (level < 20) return 'gold';
  return 'platinum';
}

export function getNextTierLevel(currentLevel: number): number | null {
  if (currentLevel < 3) return 3;
  if (currentLevel < 10) return 10;
  if (currentLevel < 20) return 20;
  return null; // Already at highest tier
}

export function getTotalXPForLevel(targetLevel: number): number {
  let total = 0;
  for (let l = 1; l < targetLevel; l++) {
    total += getXPRequiredForLevel(l);
  }
  return total;
}

export function getTierProgress(level: number, totalXP: number): number {
  const nextTierLevel = getNextTierLevel(level);
  if (!nextTierLevel) return 100; // Already at max tier
  
  let currentTierMinLevel: number;
  if (level < 3) currentTierMinLevel = 1;
  else if (level < 10) currentTierMinLevel = 3;
  else if (level < 20) currentTierMinLevel = 10;
  else currentTierMinLevel = 20;

  // Calculate total XP needed for tier boundaries
  const nextTierTotalXP = getTotalXPForLevel(nextTierLevel);
  const currentTierTotalXP = getTotalXPForLevel(currentTierMinLevel);
  
  // Calculate progress
  const xpNeededForTier = nextTierTotalXP - currentTierTotalXP;
  const currentProgress = totalXP - currentTierTotalXP;
  
  const percentage = (currentProgress / xpNeededForTier) * 100;
  return Math.min(100, Math.max(0, percentage));
}

interface TierColors {
  text: string;
  bg: string;
}

export const TIER_COLORS: Record<Tier, TierColors> = {
  bronze: {
    text: 'text-orange-700',
    bg: 'bg-orange-700',
  },
  silver: {
    text: 'text-slate-400',
    bg: 'bg-slate-400',
  },
  gold: {
    text: 'text-yellow-500',
    bg: 'bg-yellow-500',
  },
  platinum: {
    text: 'text-cyan-100',
    bg: 'bg-cyan-100',
  },
} as const; 