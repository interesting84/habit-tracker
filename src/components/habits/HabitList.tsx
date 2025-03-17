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

export function HabitList({ habits, isViewOnly = false }: { habits: Habit[], isViewOnly?: boolean }) {
  const router = useRouter();
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);

  async function completeHabit(habitId: string, habitName: string) {
    if (isViewOnly) return;
    
    try {
      setCompletingHabit(habitId);
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      toast.success(`Completed ${habitName}!`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to complete habit");
    } finally {
      setCompletingHabit(null);
    }
  }

  if (habits.length === 0) {
    return (
      <div className="text-center p-4 bg-secondary/50 rounded-lg">
        <p className="text-muted-foreground">No habits yet{isViewOnly ? "." : ". Create one to get started!"}</p>
        {!isViewOnly && (
          <Link
            href="/habits/new"
            className="inline-flex items-center mt-2 text-sm text-primary hover:underline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Habit
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const timeUntilNext = getTimeUntilNextCompletion(habit);
        const isCompleted = timeUntilNext !== null;
        const isLoading = completingHabit === habit.id;

        return (
          <div
            key={habit.id}
            className="flex overflow-hidden rounded-lg border"
          >
            <div className={cn("w-1 flex-shrink-0", difficultyColors[habit.difficulty as keyof typeof difficultyColors])} />
            <div className={cn(
              "flex-1 p-4",
              isCompleted && "bg-muted/50"
            )}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{habit.name}</h3>
                    {!isViewOnly && (
                      <Link
                        href={`/habits/${habit.id}/edit`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground">
                      {habit.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatFrequency(habit.frequency)}
                  </p>
                </div>
                {!isViewOnly && (
                  <button
                    onClick={() => completeHabit(habit.id, habit.name)}
                    disabled={isLoading || isCompleted}
                    className={cn(
                      "px-4 py-1 rounded-md text-sm font-medium transition-colors",
                      !isCompleted && !isLoading && "bg-green-500 hover:bg-green-600 text-white",
                      (isCompleted || isLoading) && "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? "..." : "Complete"}
                  </button>
                )}
              </div>
              {isCompleted && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Next completion available {timeUntilNext}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 