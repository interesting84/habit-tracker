"use client";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  level: number;
  xp: number;
}

interface Habit {
  id: string;
  name: string;
  isArchived: boolean;
  completions: {
    date: string;
  }[];
}

interface Challenge {
  id: string;
  status: string;
}

interface Badge {
  name: string;
  imageUrl: string;
}

interface UserBadge {
  id: string;
  badge: Badge;
}

interface UserStatsProps {
  user: User & {
    habits: Habit[];
    challenges: Challenge[];
    userBadges: UserBadge[];
  };
}

export default function UserStats({ user }: UserStatsProps) {
  const activeHabits = user.habits.filter((h) => !h.isArchived);
  const completedChallenges = user.challenges.filter((c) => c.status === "completed");
  const streakDays = calculateStreak(user.habits);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg bg-primary/5">
        <h3 className="text-sm font-medium text-muted-foreground">Level</h3>
        <p className="text-2xl font-bold">{user.level}</p>
      </div>
      
      <div className="p-4 rounded-lg bg-primary/5">
        <h3 className="text-sm font-medium text-muted-foreground">Active Habits</h3>
        <p className="text-2xl font-bold">{activeHabits.length}</p>
      </div>
      
      <div className="p-4 rounded-lg bg-primary/5">
        <h3 className="text-sm font-medium text-muted-foreground">Challenges Completed</h3>
        <p className="text-2xl font-bold">{completedChallenges.length}</p>
      </div>
      
      <div className="p-4 rounded-lg bg-primary/5">
        <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
        <p className="text-2xl font-bold">{streakDays} days</p>
      </div>
    </div>
  );
}

function calculateStreak(habits: Habit[]): number {
  if (!habits.length) return 0;

  // Get all completion dates and sort them in descending order
  const completionDates = habits
    .flatMap(habit => habit.completions.map(completion => new Date(completion.date)))
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