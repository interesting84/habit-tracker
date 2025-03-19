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

  // Get all completion dates, normalize to start of day in local time, and sort
  const completionDates = habits
    .flatMap(habit => habit.completions.map(completion => {
      const date = new Date(completion.completedAt);
      date.setHours(0, 0, 0, 0);
      return date;
    }))
    .sort((a, b) => b.getTime() - a.getTime())
    // Remove duplicate dates (multiple completions on same day)
    .filter((date, index, array) => 
      index === 0 || date.getTime() !== array[index - 1].getTime()
    );

  if (!completionDates.length) return 0;

  console.log('All completion dates (normalized):', completionDates.map(d => d.toISOString()));

  let streak = 1;
  let currentDate = completionDates[0];

  console.log('Starting streak count from:', currentDate.toISOString());

  // Count consecutive days backwards
  for (let i = 1; i < completionDates.length; i++) {
    const prevDate = completionDates[i];
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(currentDate.getDate() - 1);

    console.log('Checking date:', prevDate.toISOString());
    console.log('Expected date:', expectedDate.toISOString());
    console.log('Times match?', prevDate.getTime() === expectedDate.getTime());

    if (prevDate.getTime() === expectedDate.getTime()) {
      streak++;
      currentDate = prevDate;
      console.log('Streak increased to:', streak);
    } else {
      console.log('Streak broken - dates not consecutive');
      break;
    }
  }

  return streak;
} 