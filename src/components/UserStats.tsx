"use client";

import { getTierForLevel, TIER_COLORS, getTierProgress } from "@/lib/tiers";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  level: number;
  xp: number;
  habits: Habit[];
  challenges: Challenge[];
}

interface Habit {
  id: string;
  name: string;
  isArchived: boolean;
  completions: {
    id: string;
    userId: string;
    habitId: string;
    completedAt: Date;
    xpEarned: number;
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
  user: User;
}

export default function UserStats({ user }: UserStatsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const activeHabits = user.habits.filter((h) => !h.isArchived);
  const completedChallenges = user.challenges.filter((c) => c.status === "completed");
  const streakDays = calculateStreak(user.habits);
  const tier = getTierForLevel(user.level);
  const tierProgress = getTierProgress(user.level, user.xp);

  const handleDevBoost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dev/boost-xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to boost XP");
      }

      router.refresh();
    } catch (error) {
      console.error("Error boosting XP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg bg-primary/5">
        <h3 className="text-sm font-medium text-muted-foreground">Level & Tier</h3>
        <p className="text-2xl font-bold">
          {user.level}
          <span className={`ml-2 text-lg ${TIER_COLORS[tier].text}`}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </span>
        </p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${TIER_COLORS[tier].bg}`}
            style={{ width: `${tierProgress}%` }}
          />
        </div>
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

      <button
        onClick={handleDevBoost}
        disabled={isLoading}
        className="absolute bottom-4 right-4 px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
      >
        {isLoading ? "Boosting..." : "+50 XP"}
      </button>
    </div>
  );
}

function calculateStreak(habits: Habit[]): number {
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