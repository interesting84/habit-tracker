"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Frequency {
  type: "interval" | "weekdays";
  value?: number;
  unit?: "hours" | "days";
}

type Habit = {
  id: string;
  name: string;
  description: string | null;
  frequency: Frequency;
  difficulty: string;
  completions: {
    id: string;
    completedAt: Date;
  }[];
};

const difficultyColors = {
  easy: "bg-green-500",
  medium: "bg-yellow-500",
  hard: "bg-red-500",
};

function formatFrequency(frequency: Frequency): string {
  if (frequency.type === "weekdays") {
    return "Every weekday";
  }
  if (frequency.unit === "days") {
    return frequency.value === 1 ? "Daily" : `Every ${frequency.value} days`;
  }
  return frequency.value === 1 ? "Hourly" : `Every ${frequency.value} hours`;
}

function getTimeUntilNextCompletion(habit: Habit): string | null {
  const lastCompletion = habit.completions[0];
  if (!lastCompletion) return null;

  const now = new Date();
  const lastCompletedAt = new Date(lastCompletion.completedAt);

  if (habit.frequency.type === "interval") {
    const minutesSinceLastCompletion = (now.getTime() - lastCompletedAt.getTime()) / (1000 * 60);
    const requiredMinutes = habit.frequency.unit === "days" ? habit.frequency.value! * 24 * 60 : habit.frequency.value! * 60;

    if (minutesSinceLastCompletion < requiredMinutes) {
      const minutesRemaining = Math.ceil(requiredMinutes - minutesSinceLastCompletion);
      
      if (minutesRemaining >= 60) {
        const hours = Math.floor(minutesRemaining / 60);
        const minutes = minutesRemaining % 60;
        if (minutes === 0) {
          return `Available in ${hours} hour${hours === 1 ? "" : "s"}`;
        }
        return `Available in ${hours}h ${minutes}m`;
      }
      
      return `Available in ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"}`;
    }
  } else if (habit.frequency.type === "weekdays") {
    // Check if it's still the same day
    const isNewDay = lastCompletedAt.getDate() !== now.getDate() ||
                    lastCompletedAt.getMonth() !== now.getMonth() ||
                    lastCompletedAt.getFullYear() !== now.getFullYear();

    if (!isNewDay) {
      return "Available tomorrow";
    }

    // Check if it's a weekend
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0) {
      return "Available Monday";
    } else if (dayOfWeek === 6) {
      return "Available Monday";
    }
  }

  return null;
}

export function HabitList({ habits }: { habits: Habit[] }) {
  const router = useRouter();
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(null);

  async function completeHabit(habitId: string, habitName: string) {
    setCompletingHabitId(habitId);
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to complete habit");
      }

      toast.success(`${habitName} completed! +${data.completion.xpEarned}XP 🌟`);
      router.refresh();
    } catch (error) {
      console.error("Error completing habit:", error);
      toast.error(error instanceof Error ? error.message : "Failed to complete habit");
    } finally {
      setCompletingHabitId(null);
    }
  }

  if (habits.length === 0) {
    return (
      <div className="text-center p-4 bg-secondary/50 rounded-lg">
        <p className="text-muted-foreground">No habits yet. Create one to get started!</p>
        <Link
          href="/habits/new"
          className="inline-flex items-center mt-2 text-sm text-primary hover:underline"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Habit
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {habits.map((habit) => {
          const timeUntilNext = getTimeUntilNextCompletion(habit);
          const isOnCooldown = timeUntilNext !== null;

          return (
            <div
              key={habit.id}
              className="flex items-center justify-between rounded-lg border overflow-hidden"
            >
              <div className={cn("w-1 self-stretch", difficultyColors[habit.difficulty as keyof typeof difficultyColors])} />
              <div className="flex-1 flex items-center justify-between p-4">
                <div>
                  <h3 className="font-medium">{habit.name}</h3>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Frequency: {formatFrequency(habit.frequency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Difficulty: {habit.difficulty}
                    </p>
                    {isOnCooldown && (
                      <p className="text-xs text-yellow-600">
                        {timeUntilNext}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/habits/${habit.id}/edit`}
                    className="rounded-md bg-secondary p-2 text-foreground hover:bg-secondary/90 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    className={cn(
                      "rounded-md px-4 py-2 text-sm font-medium text-white transition-colors",
                      isOnCooldown
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    )}
                    onClick={() => completeHabit(habit.id, habit.name)}
                    disabled={isOnCooldown || completingHabitId === habit.id}
                    title={isOnCooldown ? timeUntilNext : "Complete habit"}
                  >
                    {completingHabitId === habit.id ? "..." : "Complete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 