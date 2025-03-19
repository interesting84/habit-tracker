import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Mistral } from "@mistralai/mistralai";
import type { ChatCompletionRequest } from "@mistralai/mistralai/models/components";
import type { Habit, HabitCompletion } from "@prisma/client";

type TimelineEntry = {
  date: string;
  predictions: Array<{
    category: "health" | "career" | "personal" | "relationships" | "skills";
    prediction: string;
    habitInfluence: string[];
  }>;
};

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user's traits from the request body
    const { traits } = await request.json();

    // Get user's current habits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        habits: {
          include: {
            completions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Get current date for context
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based

    // Prepare habit data for AI analysis
    const habitData = user.habits.map((habit: Habit & { completions: HabitCompletion[] }) => ({
      name: habit.name,
      description: habit.description,
      difficulty: habit.difficulty,
      frequency: habit.frequency,
      completionRate: habit.completions.length > 0
        ? habit.completions.length / ((Date.now() - new Date(habit.createdAt).getTime()) / (24 * 60 * 60 * 1000))
        : 0,
    }));

    // Generate AI predictions using Mistral
    const chatRequest: ChatCompletionRequest = {
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: `You are a life prediction expert who analyzes habits and personal traits to create detailed timeline predictions. Your task is to create predictions for key months over the next 2 years (5 months per year), starting from ${currentYear}-${currentMonth.toString().padStart(2, '0')}, showing how the user's life will likely change if they maintain their current habits consistently.

Your response must be a valid JSON object with the following structure:
{
  "timeline": [
    {
      "date": "YYYY-MM",
      "predictions": [
        {
          "category": "health" | "career" | "personal" | "relationships" | "skills",
          "prediction": "string (detailed prediction)",
          "habitInfluence": ["string"] (list of habits that influence this prediction)
        }
      ]
    }
  ],
  "summary": {
    "message": "string (message from the user's future self, in first person as if they are speaking directly to the user)",
    "criticalHabits": ["string"] (list of 2-3 current habits that will be most transformative)
  }
}

Rules for predictions:
1. Be specific and detailed in predictions
2. Consider compound effects of habits over time
3. Account for both direct and indirect impacts of habits
4. Consider how traits and habits interact
5. Include both positive outcomes and potential challenges
6. Only predict for 5 significant months each year (e.g., months where notable changes are expected)
7. Keep predictions concise but meaningful
8. All predicted dates must be after ${currentYear}-${currentMonth.toString().padStart(2, '0')}
9. For each prediction, cite specific statistics, like weight lost or awards won
10. Write the summary as if speaking directly to the user, using "you" and imperative statements
11. Focus on the compound effect of consistency - how small daily actions lead to massive changes

Consider the user's current traits in your predictions:
- Age: ${traits.age}
- Occupation: ${traits.occupation}
- Education: ${traits.education}
- Current Health Status: ${traits.health}
- Life Goals: ${traits.goals}
- Current Challenges: ${traits.challenges}

IMPORTANT: Return ONLY the raw JSON. Do not wrap it in code blocks. Do not include any text before or after the JSON.`
        },
        {
          role: "user",
          content: JSON.stringify({
            currentDate: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
            currentHabits: habitData,
            userTraits: traits,
            userLevel: user.level,
            userXP: user.xp,
          })
        }
      ],
      temperature: 0.7,
      maxTokens: 4000,
    };

    const completion = await mistral.chat.complete(chatRequest);

    const response = completion.choices?.[0]?.message?.content;
    if (!response || typeof response !== 'string') {
      throw new Error("No valid response from Mistral AI");
    }

    let predictions;
    try {
      predictions = JSON.parse(response.trim());

      // Validate the response structure
      if (!predictions.timeline || !Array.isArray(predictions.timeline)) {
        throw new Error("Invalid response structure");
      }

      // Validate that all predicted dates are in the future
      const currentDateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      const hasInvalidDates = predictions.timeline.some((entry: TimelineEntry) => entry.date <= currentDateStr);
      if (hasInvalidDates) {
        throw new Error("Predictions contain dates in the past");
      }
    } catch (error) {
      console.error("Error parsing Mistral response:", error);
      console.error("Raw response that failed to parse:", response);
      throw new Error("Failed to parse predictions");
    }

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Error generating life predictions:", error);
    return NextResponse.json(
      { message: "Error generating predictions" },
      { status: 500 }
    );
  }
} 