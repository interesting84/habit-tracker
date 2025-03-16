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
  // This is a simplified streak calculation
  // In a real app, you'd want to check the completion dates
  // and ensure the streak is actually consecutive days
  return Math.floor(Math.random() * 10); // Placeholder implementation
} 