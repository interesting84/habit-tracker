"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewHabitForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const frequency = formData.get("frequency") as string;

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          frequency,
          userId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create habit");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred while creating the habit");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Habit Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g., Morning Exercise"
            className="mt-1 block w-full rounded-md border p-2"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="e.g., 30 minutes of exercise every morning"
            className="mt-1 block w-full rounded-md border p-2"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium">
            Frequency
          </label>
          <select
            id="frequency"
            name="frequency"
            required
            className="mt-1 block w-full rounded-md border p-2"
            disabled={isLoading}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary p-2 text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Habit"}
        </button>
      </div>
    </form>
  );
} 