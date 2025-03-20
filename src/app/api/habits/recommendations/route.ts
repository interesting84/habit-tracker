import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { Mistral } from "@mistralai/mistralai";
import type { Habit, HabitCompletion } from "@prisma/client";
import type { ChatCompletionRequest } from "@mistralai/mistralai/models/components";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's current habits and their completion data
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

    // Generate AI recommendations using Mistral
    const chatRequest: ChatCompletionRequest = {
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: `You are a habit formation expert and personal development coach. Analyze the user's current habits and suggest NEW habits that would complement their existing routine and help them achieve their goals. Do not suggest habits that the user already has - each suggestion must be unique and different from their current habits.

Your response must be a valid JSON object with the following structure:
{
  "recommendations": [
    {
      "name": "string",
      "description": "string",
      "difficulty": "easy" | "medium" | "hard",
      "frequency": {
        "type": "interval" | "weekdays",
        "value": number,
        "unit": "hours" | "days"
      },
      "reasoning": "string (explain why this new habit complements their existing routine)"
    }
  ]
}

Rules for recommendations:
1. Each suggestion must be a NEW habit not already in the user's current habits
2. The habit should complement but not duplicate their existing habits
3. Consider the user's current habit difficulty levels and suggest an appropriate mix of difficulties
4. Provide clear reasoning that explains how the new habit fits with their existing routine

IMPORTANT: Return ONLY the raw JSON. Do not wrap it in Markdown code blocks (no \`\`\`). Do not include any text before or after the JSON. The response must be parseable by JSON.parse().`
        },
        {
          role: "user",
          content: JSON.stringify({
            currentHabits: habitData,
            userLevel: user.level,
            userXP: user.xp,
          })
        }
      ],
      temperature: 0.2,
      maxTokens: 1000,
    };

    const completion = await mistral.chat.complete(chatRequest);

    const response = completion.choices?.[0]?.message?.content;
    if (!response || typeof response !== 'string') {
      throw new Error("No valid response from Mistral AI");
    }

    // Log the raw response for debugging
    console.log("Raw Mistral response:", response);

    let recommendations;
    try {
      // Clean the response by removing Markdown code block syntax
      const cleanedResponse = response
        .replace(/^```json\n/, '')  // Remove opening ```json
        .replace(/\n```$/, '')      // Remove closing ```
        .trim();
        
      recommendations = JSON.parse(cleanedResponse);

      // Validate the response structure
      if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error parsing Mistral response:", error);
      console.error("Raw response that failed to parse:", response);
      throw new Error("Failed to parse recommendations");
    }

    return NextResponse.json({ recommendations: recommendations.recommendations });
  } catch (error) {
    console.error("Error generating habit recommendations:", error);
    return NextResponse.json(
      { message: "Error generating recommendations" },
      { status: 500 }
    );
  }
} 