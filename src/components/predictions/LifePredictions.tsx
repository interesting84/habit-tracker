"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Calendar, Brain, Trophy } from "lucide-react";
import { toast } from "sonner";

type Prediction = {
  category: "health" | "career" | "personal" | "relationships" | "skills";
  prediction: string;
  habitInfluence: string[];
};

type TimelineEntry = {
  date: string;
  predictions: Prediction[];
};

type PredictionResponse = {
  timeline: TimelineEntry[];
  summary: {
    message: string;
    keyMilestones: string[];
    powerStatement: string;
    criticalHabits: string[];
  };
};

const categoryIcons = {
  health: "❤️",
  career: "💼",
  personal: "🎯",
  relationships: "🤝",
  skills: "📚",
};

const formatRelativeDate = (dateStr: string): string => {
  const [year, month] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1);
  const now = new Date();
  
  const monthsDiff = (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
  
  if (monthsDiff < 12) {
    return monthsDiff <= 1 ? "1 month from now" : `${monthsDiff} months from now`;
  } else {
    const years = Math.floor(monthsDiff / 12);
    const remainingMonths = monthsDiff % 12;
    if (remainingMonths === 0) {
      return years === 1 ? "1 year from now" : `${years} years from now`;
    } else {
      return years === 1 ? `1 year and ${remainingMonths} months from now` : `${years} years and ${remainingMonths} months from now`;
    }
  }
};

export function LifePredictions() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [traits, setTraits] = useState({
    age: "",
    occupation: "",
    education: "",
    health: "",
    goals: "",
    challenges: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ traits }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate predictions");
      }

      const data = await response.json();
      setPredictions(data);
      toast.success("Life predictions generated successfully!");
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast.error("Failed to generate predictions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTraits((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-2xl p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8" />
          Life Predictions
        </h2>
        <p className="text-muted-foreground">
          Tell us about yourself, and our AI will predict how your life might
          change over the next 2 years based on your current habits.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              value={traits.age}
              onChange={handleInputChange}
              placeholder="e.g., 25"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Current Occupation</Label>
            <Input
              id="occupation"
              name="occupation"
              value={traits.occupation}
              onChange={handleInputChange}
              placeholder="e.g., Software Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education Level</Label>
            <Input
              id="education"
              name="education"
              value={traits.education}
              onChange={handleInputChange}
              placeholder="e.g., Bachelor's in Computer Science"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="health">Current Health Status</Label>
            <Input
              id="health"
              name="health"
              value={traits.health}
              onChange={handleInputChange}
              placeholder="e.g., Active, good health, 150 lbs"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="goals">Life Goals</Label>
            <Textarea
              id="goals"
              name="goals"
              value={traits.goals}
              onChange={handleInputChange}
              placeholder="What are your main goals in life? What do you want to achieve?"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="challenges">Current Challenges</Label>
            <Textarea
              id="challenges"
              name="challenges"
              value={traits.challenges}
              onChange={handleInputChange}
              placeholder="What challenges are you currently facing?"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full" style={{ display: isLoading ? 'none' : 'flex' }}>
          <span>Generate Life Predictions</span>
        </Button>
      </form>

      {isLoading && (
        <Card className="p-6 mt-8">
          <div className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div>
              <h3 className="font-semibold mb-1">Generating Your Life Predictions</h3>
              <p className="text-sm text-muted-foreground">
                Our AI is carefully analyzing your traits and potential future paths. This may take a minute or two...
              </p>
            </div>
          </div>
        </Card>
      )}

      {predictions && (
        <div className="space-y-8 mt-8">
          <Card className="p-6">
            <h3 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Your Transformation Journey
            </h3>
            
            <div className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <p className="text-lg font-medium text-primary">{predictions.summary.message}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Your Power Statement</h4>
                <p className="text-lg italic">{predictions.summary.powerStatement}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Key Milestones Ahead</h4>
                <ul className="list-disc list-inside space-y-2">
                  {predictions.summary.keyMilestones.map((milestone, index) => (
                    <li key={index} className="text-primary-foreground">{milestone}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Your Most Transformative Habits</h4>
                <ul className="list-none space-y-2">
                  {predictions.summary.criticalHabits.map((habit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-yellow-500">★</span>
                      <span>{habit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Timeline
            </h3>

            <div className="space-y-6">
              {predictions.timeline.map((entry, index) => (
                <Card key={index} className="p-6">
                  <h4 className="text-lg font-semibold mb-4">{formatRelativeDate(entry.date)}</h4>
                  <div className="space-y-4">
                    {entry.predictions.map((prediction, pIndex) => (
                      <div key={pIndex} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span>{categoryIcons[prediction.category]}</span>
                          <span className="font-medium">
                            {prediction.category.charAt(0).toUpperCase() +
                              prediction.category.slice(1)}
                          </span>
                        </div>
                        <p>{prediction.prediction}</p>
                        <div className="text-sm text-muted-foreground">
                          Influenced by habits:{" "}
                          {prediction.habitInfluence.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 