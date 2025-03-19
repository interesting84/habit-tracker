import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { XP_REWARDS } from "@/lib/constants";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not allowed in production", { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Get user's habits
    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
    });

    // Generate completions for the past year
    const now = new Date();
    const startDate = new Date(now);
    startDate.setFullYear(now.getFullYear() - 1); // Go back 1 year
    startDate.setHours(0, 0, 0, 0); // Start at beginning of the day
    
    const completions = [];
    
    for (const habit of habits) {
      // For each day in the past year
      const currentDate = new Date(startDate);
      while (currentDate <= now) {
        // Create completions with varying probability based on day of week
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
        
        // Base probability varies by day type
        let baseProb = isWeekday ? 0.7 : 0.4; // 70% on weekdays, 40% on weekends
        
        // Add some randomness to create natural gaps
        // Every few weeks, reduce probability significantly
        const weekNumber = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weekNumber % 3 === 0) {
          baseProb *= 0.3; // 30% of normal probability every third week
        }
        
        // Random chance to skip this day entirely
        const shouldComplete = Math.random() < baseProb;
        
        if (shouldComplete) {
          // Create 1-12 completions for this day, weighted towards lower numbers
          const maxCompletions = 12;
          const weightedRandom = Math.pow(Math.random(), 2); // Square to bias towards lower numbers
          const numCompletions = Math.floor(weightedRandom * (maxCompletions - 1)) + 1;
          
          for (let i = 0; i < numCompletions; i++) {
            // Spread completions throughout the day
            const completionDate = new Date(currentDate);
            completionDate.setHours(9 + Math.floor(Math.random() * 12)); // Between 9 AM and 9 PM
            completionDate.setMinutes(Math.floor(Math.random() * 60));
            
            completions.push({
              habitId: habit.id,
              userId: session.user.id,
              completedAt: completionDate,
              xpEarned: XP_REWARDS.easy,
            });
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Delete existing completions first to avoid conflicts
    await prisma.habitCompletion.deleteMany({
      where: {
        userId: session.user.id,
        completedAt: {
          gte: startDate,
          lte: now,
        },
      },
    });

    // Create all completions
    await prisma.habitCompletion.createMany({
      data: completions,
    });

    // Update user's XP
    const totalNewXP = completions.length * XP_REWARDS.easy;
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        xp: {
          increment: totalNewXP,
        },
      },
    });

    return new NextResponse("History generated successfully", { status: 200 });
  } catch (error) {
    console.error("Error generating history:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 