"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const PRESET_FREQUENCIES = {
  hourly: { type: "interval", value: 1, unit: "hours" },
  daily: { type: "interval", value: 24, unit: "hours" },
  "every-other-day": { type: "interval", value: 48, unit: "hours" },
  weekdays: { type: "weekdays" },
} as const;

export function NewHabitForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [frequencyType, setFrequencyType] = useState<"preset" | "custom">("preset");
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESET_FREQUENCIES>("daily");
  const [customValue, setCustomValue] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<"hours" | "days">("days");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    // Construct frequency object
    const frequency = frequencyType === "preset" 
      ? PRESET_FREQUENCIES[selectedPreset]
      : { type: "interval", value: customValue, unit: customUnit };

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
          difficulty,
          userId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create habit");
      }

      router.push(`/profile/${session?.user?.name || session?.user?.email}`);
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
            className="mt-1 block w-full rounded-md border p-2 bg-background"
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
            className="mt-1 block w-full rounded-md border p-2 bg-background"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Frequency
          </label>
          <RadioGroup
            value={frequencyType}
            onValueChange={(value: string) => setFrequencyType(value as "preset" | "custom")}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="preset" id="preset" />
              <Label htmlFor="preset">Preset</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom</Label>
            </div>
          </RadioGroup>

          {frequencyType === "preset" ? (
            <div className="mt-2">
              <Select
                value={selectedPreset}
                onValueChange={(value: string) => setSelectedPreset(value as keyof typeof PRESET_FREQUENCIES)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="every-other-day">Every other day</SelectItem>
                  <SelectItem value="weekdays">Weekdays only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="1"
                  value={customValue}
                  onChange={(e) => setCustomValue(parseInt(e.target.value) || 1)}
                  disabled={isLoading}
                />
              </div>
              <Select
                value={customUnit}
                onValueChange={(value) => setCustomUnit(value as "hours" | "days")}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium">
            Difficulty
          </label>
          <Select
            value={difficulty}
            onValueChange={setDifficulty}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy (10 XP)</SelectItem>
              <SelectItem value="medium">Medium (20 XP)</SelectItem>
              <SelectItem value="hard">Hard (40 XP)</SelectItem>
            </SelectContent>
          </Select>
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