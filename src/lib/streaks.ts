interface Habit {
  completions: {
    completedAt: Date;
  }[];
}

/**
 * Calculates the current streak of consecutive days with completed habits
 */
export function calculateStreak(habits: Habit[]): number {
  if (!habits.length) return 0;

  // Get all completion dates and sort them in descending order
  const completionDates = habits
    .flatMap(habit => habit.completions.map(completion => new Date(completion.completedAt)))
    .sort((a, b) => b.getTime() - a.getTime());

  if (!completionDates.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // If no completion today or yesterday, streak is 0
  const mostRecentCompletion = completionDates[0];
  if (mostRecentCompletion < yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = today;

  // Count consecutive days backwards
  for (let i = 1; i < completionDates.length; i++) {
    const prevDate = new Date(completionDates[i]);
    prevDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(currentDate);
    expectedDate.setDate(currentDate.getDate() - 1);

    if (prevDate.getTime() === expectedDate.getTime()) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
} 