import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
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
    const habitData = user.habits.map(habit => ({
      name: habit.name,
      description: habit.description,
      difficulty: habit.difficulty,
      frequency: habit.frequency,
      completionRate: habit.completions.length > 0
        ? habit.completions.length / ((Date.now() - new Date(habit.createdAt).getTime()) / (24 * 60 * 60 * 1000))
        : 0,
    }));

    // Generate AI recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a habit formation expert and personal development coach. Analyze the user's current habits and suggest new habits that would complement their existing routine and help them achieve their goals."
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
      functions: [
        {
          name: "recommend_habits",
          description: "Generate habit recommendations based on user's current habits and progress",
          parameters: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    frequency: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["interval", "weekdays"] },
                        value: { type: "number", optional: true },
                        unit: { type: "string", enum: ["hours", "days"], optional: true }
                      }
                    },
                    reasoning: { type: "string" }
                  }
                }
              }
            },
            required: ["recommendations"]
          }
        }
      ],
      function_call: { name: "recommend_habits" }
    });

    const recommendationsResponse = completion.choices[0].message.function_call?.arguments;
    
    if (!recommendationsResponse) {
      throw new Error("Failed to generate recommendations");
    }

    const { recommendations } = JSON.parse(recommendationsResponse);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error generating habit recommendations:", error);
    return NextResponse.json(
      { message: "Error generating recommendations" },
      { status: 500 }
    );
  }
} 