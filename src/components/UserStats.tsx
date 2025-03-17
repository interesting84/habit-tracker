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
  const [isResetting, setIsResetting] = useState(false);
  const [isBoostingBig, setIsBoostingBig] = useState(false);
  const activeHabits = user.habits.filter((h) => !h.isArchived);
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

  const handleBigBoost = async () => {
    try {
      setIsBoostingBig(true);
      const response = await fetch("/api/dev/boost-500-xp", {
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
      setIsBoostingBig(false);
    }
  };

  const handleResetXP = async () => {
    if (!confirm("Are you sure you want to reset your XP and level to 1?")) {
      return;
    }
    
    try {
      setIsResetting(true);
      const response = await fetch("/api/dev/reset-xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to reset XP");
      }

      router.refresh();
    } catch (error) {
      console.error("Error resetting XP:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      <div className="p-6 rounded-lg bg-primary/5 flex flex-col justify-between h-full">
        <div className="flex-grow">
          <p className="text-2xl font-bold">
            <span className={`text-xl ${TIER_COLORS[tier].text}`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
            <br />
            <span className="text-base">Level {user.level}</span>
          </p>
        </div>
        {tier !== 'legend' && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${TIER_COLORS[tier].bg}`}
              style={{ width: `${tierProgress}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="p-6 rounded-lg bg-primary/5 flex flex-col">
        <h3 className="text-sm font-medium text-muted-foreground">Active Habits</h3>
        <p className="text-2xl font-bold mt-1">{activeHabits.length}</p>
      </div>
      
      <div className="p-6 rounded-lg bg-primary/5 flex flex-col">
        <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
        <p className="text-2xl font-bold mt-1">{streakDays} days</p>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={handleResetXP}
          disabled={isResetting}
          className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
        >
          {isResetting ? "Resetting..." : "Reset XP"}
        </button>
        <button
          onClick={handleDevBoost}
          disabled={isLoading}
          className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
        >
          {isLoading ? "Boosting..." : "+50 XP"}
        </button>
        <button
          onClick={handleBigBoost}
          disabled={isBoostingBig}
          className="px-3 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors"
        >
          {isBoostingBig ? "Boosting..." : "+500 XP"}
        </button>
      </div>
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