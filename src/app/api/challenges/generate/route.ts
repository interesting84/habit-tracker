import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import prisma from "@/lib/prisma";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Get user's habits and completed challenges
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        habits: true,
        challenges: {
          where: { status: "completed" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate a personalized challenge using OpenAI
    const prompt = `Generate a personalized productivity challenge based on the following user data:
Level: ${user.level}
Current habits: ${user.habits.map(h => h.name).join(", ")}
Completed challenges: ${user.challenges.length}

The challenge should:
1. Be specific and actionable
2. Have a clear goal and timeframe
3. Be slightly challenging but achievable
4. Include a reward (XP points)
5. Have a difficulty level (easy, medium, or hard)

Format the response as a JSON object with these fields:
{
  "title": "Challenge title",
  "description": "Detailed description",
  "difficulty": "easy|medium|hard",
  "duration": "number of days",
  "xpReward": "number"
}`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a motivational AI coach that creates personalized challenges.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const challenge = JSON.parse(completion.data.choices[0].message?.content || "{}");

    // Create the challenge in the database
    const newChallenge = await prisma.challenge.create({
      data: {
        userId,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        duration: parseInt(challenge.duration),
        xpReward: parseInt(challenge.xpReward),
        status: "active",
        aiGenerated: true,
      },
    });

    return NextResponse.json(newChallenge);
  } catch (error) {
    console.error("Error generating challenge:", error);
    return NextResponse.json(
      { error: "Failed to generate challenge" },
      { status: 500 }
    );
  }
} 