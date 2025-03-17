"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  xpReward: number;
  status: string;
  startDate: Date;
  endDate: Date | null;
  lastCompletedAt: Date | null;
}

interface ChallengeListProps {
  challenges: Challenge[];
}

export default function ChallengeList({ challenges }: ChallengeListProps) {
  const [completingChallengeId, setCompletingChallengeId] = useState<string | null>(null);
  const router = useRouter();

  console.log("Rendering ChallengeList with challenges:", JSON.stringify(challenges, null, 2));

  async function completeChallenge(challengeId: string, challengeTitle: string) {
    setCompletingChallengeId(challengeId);
    try {
      const response = await fetch(`/api/challenges/${challengeId}/complete`, {
        method: "POST",
      });

      const data = await response.json();
      console.log("Challenge completion response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete challenge");
      }

      if (data.completed) {
        toast.success(`Challenge completed! Final reward: +${data.xpEarned}XP 🎉`);
      } else {
        toast.success(`Daily progress made! +${data.xpEarned}XP 🌟`);
      }
      router.refresh();
    } catch (error) {
      console.error("Error completing challenge:", error);
      toast.error(error instanceof Error ? error.message : "Failed to complete challenge");
    } finally {
      setCompletingChallengeId(null);
    }
  }

  if (challenges.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No active challenges. Generate a new one to get started!
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => {
        const timeRemaining = getTimeRemaining(challenge);
        const canComplete = !timeRemaining && challenge.status !== "completed";
        const isCompleted = challenge.status === "completed" && challenge.endDate;

        return (
          <Card key={challenge.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{challenge.title}</h3>
                <p className="text-muted-foreground">{challenge.description}</p>
                <div className="mt-2 flex gap-2 text-sm">
                  <span className="px-2 py-1 bg-primary/10 rounded-full">
                    {challenge.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-primary/10 rounded-full">
                    {challenge.xpReward} XP
                  </span>
                  <span className="px-2 py-1 bg-primary/10 rounded-full">
                    {challenge.duration} {challenge.duration >= 24 ? "days" : "hours"}
                  </span>
                  {isCompleted && (
                    <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
              </div>
              {!isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => completeChallenge(challenge.id, challenge.title)}
                  disabled={!canComplete || completingChallengeId === challenge.id}
                >
                  {completingChallengeId === challenge.id ? "..." : "Complete"}
                </Button>
              )}
            </div>
            <div className="mt-4">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${getProgress(challenge)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {isCompleted ? (
                  <span className="text-green-600">Challenge completed!</span>
                ) : timeRemaining ? (
                  <span className="text-yellow-600">{timeRemaining}</span>
                ) : (
                  <span>{getDaysLeft(challenge)} days left</span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function getProgress(challenge: Challenge): number {
  const total = challenge.duration;
  const elapsed = Math.floor(
    (Date.now() - challenge.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.min(100, (elapsed / total) * 100);
}

function getDaysLeft(challenge: Challenge): number {
  const elapsed = Math.floor(
    (Date.now() - challenge.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, challenge.duration - elapsed);
}

function getTimeRemaining(challenge: Challenge): string | null {
  if (!challenge.lastCompletedAt) return null;

  const now = new Date();
  const lastCompletedAt = new Date(challenge.lastCompletedAt);

  // For day-based challenges, check if it's still the same day
  if (challenge.duration >= 24) {
    const isNewDay = lastCompletedAt.getDate() !== now.getDate() ||
                    lastCompletedAt.getMonth() !== now.getMonth() ||
                    lastCompletedAt.getFullYear() !== now.getFullYear();
    
    if (!isNewDay) {
      return "Available tomorrow";
    }
    return null;
  }

  // For hour-based challenges
  const hoursSinceLastCompletion = (now.getTime() - lastCompletedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceLastCompletion < challenge.duration) {
    const hoursRemaining = Math.ceil(challenge.duration - hoursSinceLastCompletion);
    return `Available in ${hoursRemaining} hour${hoursRemaining === 1 ? "" : "s"}`;
  }

  return null;
} 