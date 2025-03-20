"use client";

import { getTierForLevel, TIER_COLORS, getTierProgress } from "@/lib/tiers";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  level: number;
  xp: number;
  habits: Habit[];
  followers: { id: string }[];
  following: { id: string }[];
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

interface UserStatsProps {
  user: User;
  isViewOnly?: boolean;
}

export default function UserStats({ user }: UserStatsProps) {
  const activeHabits = user.habits.filter((h) => !h.isArchived);
  const tier = getTierForLevel(user.level);
  const tierProgress = getTierProgress(user.level, user.xp);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        className={cn(
          "flex flex-col gap-2 p-4 rounded-lg bg-muted/50 shine-effect transform transition-transform duration-200 hover:scale-[1.02]",
          "relative overflow-hidden"
        )}
        style={{ 
          '--shine-color': `rgba(var(--${tier}-rgb), 0.2)`
        } as React.CSSProperties}
      >
        <div className="space-y-2">
          <p className={cn("text-2xl font-bold capitalize", TIER_COLORS[tier].text)}>
            {tier}
          </p>
          <p className="text-lg">Level {user.level}</p>
          <div className="space-y-1">
            {tier !== 'platinum' && (
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", TIER_COLORS[tier].bg)}
                  style={{ width: `${Math.round(tierProgress)}%` }}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {tier !== 'platinum' && `${Math.round(tierProgress)}% to next tier`}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-muted/50 transform transition-transform duration-200 hover:scale-[1.02]">
        <h3 className="text-sm font-medium">Active Habits</h3>
        <p className="text-2xl font-bold">{activeHabits.length}</p>
      </div>
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-muted/50 transform transition-transform duration-200 hover:scale-[1.02]">
        <h3 className="text-sm font-medium">Followers</h3>
        <p className="text-2xl font-bold">{user.followers?.length || 0}</p>
      </div>
    </div>
  );
} 