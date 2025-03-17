"use client";

import { getTierForLevel, TIER_COLORS, getTierProgress } from "@/lib/tiers";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getLevelProgress } from "@/lib/xp";

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
  isViewOnly?: boolean;
}

export default function UserStats({ user, isViewOnly = false }: UserStatsProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-muted/50">
        <div className="space-y-2">
          <p className={cn("text-2xl font-bold capitalize", TIER_COLORS[tier].text)}>
            {tier}
          </p>
          <p className="text-lg">Level {user.level}</p>
          <div className="space-y-1">
            {tier !== 'legend' && (
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", TIER_COLORS[tier].bg)}
                  style={{ width: `${Math.round(tierProgress)}%` }}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {tier !== 'legend' && `${Math.round(tierProgress)}% to next tier`}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-muted/50">
        <h3 className="text-sm font-medium">Active Habits</h3>
        <p className="text-2xl font-bold">{activeHabits.length}</p>
      </div>
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-muted/50">
        <h3 className="text-sm font-medium">Current Streak</h3>
        <p className="text-2xl font-bold">{streakDays} days</p>
      </div>
      {!isViewOnly && process.env.NODE_ENV === "development" && (
        <div className="col-span-full flex gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDevBoost}
            disabled={isLoading}
          >
            {isLoading ? "Boosting..." : "Dev: Boost XP"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBigBoost}
            disabled={isBoostingBig}
          >
            {isBoostingBig ? "Boosting..." : "Dev: Big Boost"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetXP}
            disabled={isResetting}
          >
            {isResetting ? "Resetting..." : "Reset XP"}
          </Button>
        </div>
      )}
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