"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Frequency {
  type: "interval" | "weekdays";
  value?: number;
  unit?: "hours" | "days";
}

interface HabitRecommendation {
  name: string;
  description: string;
  difficulty: string;
  frequency: Frequency;
  reasoning: string;
}

export function HabitRecommendations() {
  const { data: session } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<HabitRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/habits/recommendations");
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to load habit recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = async (recommendation: HabitRecommendation) => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: recommendation.name,
          description: recommendation.description,
          frequency: recommendation.frequency,
          difficulty: recommendation.difficulty,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create habit");
      }

      toast.success("Habit added successfully!");
      // Remove the recommendation from the list
      setRecommendations(prev => prev.filter(r => r.name !== recommendation.name));
      // Refresh the page to show the new habit
      router.refresh();
    } catch (error) {
      console.error("Error adding habit:", error);
      toast.error("Failed to add habit");
    }
  };

  const formatFrequency = (frequency: Frequency): string => {
    if (frequency.type === "weekdays") {
      return "Every weekday";
    }
    return `Every ${frequency.value} ${frequency.unit}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">AI Suggestions</h2>
          <Sparkles className="w-5 h-5 text-yellow-500" />
        </div>
        {!isLoading && (
          <Button
            onClick={fetchRecommendations}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Get Suggestions
          </Button>
        )}
      </div>

      {isLoading && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <div>
              <p className="font-medium">Generating Personalized Recommendations</p>
              <p className="text-sm text-muted-foreground">
                Our AI is analyzing your habits and crafting tailored suggestions. This may take a moment...
              </p>
            </div>
          </div>
        </Card>
      )}

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.name} className="overflow-hidden transform transition-transform duration-200 hover:scale-[1.02]">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{recommendation.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {recommendation.description}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => addHabit(recommendation)}
                    size="sm"
                    className="shrink-0"
                  >
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary">{recommendation.difficulty}</Badge>
                  <Badge variant="outline">
                    {formatFrequency(recommendation.frequency)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {recommendation.reasoning}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Click the button above to get personalized habit suggestions
          </div>
        )
      )}
    </div>
  );
} 