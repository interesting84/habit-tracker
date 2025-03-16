"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Habit = {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
};

export function HabitList({ habits }: { habits: Habit[] }) {
  const router = useRouter();
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(null);

  async function completeHabit(habitId: string, habitName: string) {
    setCompletingHabitId(habitId);
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to complete habit");
      }

      const data = await response.json();
      
      if (data.leveledUp) {
        toast.success(`Level Up! You're now level ${data.newLevel}! 🎉`, {
          description: "Keep up the great work!",
        });
      } else {
        toast.success(`${habitName} completed! +${data.completion.xpEarned}XP 🌟`);
      }

      router.refresh();
    } catch (error) {
      console.error("Error completing habit:", error);
      toast.error("Failed to complete habit");
    } finally {
      setCompletingHabitId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Habits</h2>
        <Link
          href="/habits/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Habit
        </Link>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="font-semibold">No habits yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first habit to start leveling up!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between rounded-lg border p-4 hover:border-primary/50 transition-colors"
            >
              <div>
                <h3 className="font-medium">{habit.name}</h3>
                {habit.description && (
                  <p className="text-sm text-muted-foreground">
                    {habit.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Frequency: {habit.frequency}
                </p>
              </div>
              <button
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                onClick={() => completeHabit(habit.id, habit.name)}
                disabled={completingHabitId === habit.id}
              >
                {completingHabitId === habit.id ? "..." : "Complete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 