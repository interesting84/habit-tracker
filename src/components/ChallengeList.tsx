"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  xpReward: number;
  status: string;
  startDate: Date;
}

interface ChallengeListProps {
  challenges: Challenge[];
}

export default function ChallengeList({ challenges }: ChallengeListProps) {
  if (challenges.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No active challenges. Generate a new one to get started!
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
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
                  {challenge.duration} days
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Complete
            </Button>
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
              {getDaysLeft(challenge)} days left
            </div>
          </div>
        </Card>
      ))}
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