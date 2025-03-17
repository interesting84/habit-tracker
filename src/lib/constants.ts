export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export const XP_REWARDS = {
  [DIFFICULTY_LEVELS.EASY]: 10,
  [DIFFICULTY_LEVELS.MEDIUM]: 20,
  [DIFFICULTY_LEVELS.HARD]: 40,
} as const;

export type DifficultyLevel = keyof typeof XP_REWARDS; 