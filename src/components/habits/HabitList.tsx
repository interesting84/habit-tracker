"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

type Habit = {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
};

export function HabitList({ habits }: { habits: Habit[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Habits</h2>
        <Link
          href="/habits/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
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
              className="flex items-center justify-between rounded-lg border p-4"
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
                className="rounded-md bg-primary/10 px-2 py-1 text-sm font-medium text-primary hover:bg-primary/20"
                onClick={() => {}}
              >
                Complete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 