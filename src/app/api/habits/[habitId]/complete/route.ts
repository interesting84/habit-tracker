import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS } from "@/lib/constants";
import { checkAndAwardBadges } from "@/lib/badges";

export async function POST(
  request: Request
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Extract habitId from the URL
    const urlParts = new URL(request.url).pathname.split('/');
    const habitId = urlParts[urlParts.length - 2]; // Get the habitId from the URL

    // Use current UTC time for completion
    const completionTime = new Date();
    console.log('Server: Creating completion with time:', {
      raw: completionTime,
      iso: completionTime.toISOString(),
      utc: completionTime.toUTCString(),
      local: completionTime.toString(),
    });

    // Start a transaction to ensure all updates happen together
    const result = await prisma.$transaction(async (tx) => {
      // Verify the habit belongs to the user and get its details
      const habit = await tx.habit.findUnique({
        where: { id: habitId },
        include: {
          completions: {
            orderBy: { completedAt: 'desc' },
            take: 1
          }
        }
      });

      if (!habit || habit.userId !== session.user.id) {
        throw new Error("Habit not found");
      }

      // Parse the frequency JSON
      const frequency = typeof habit.frequency === 'string' 
        ? JSON.parse(habit.frequency as string)
        : habit.frequency;

      // Check if enough time has passed since last completion
      const lastCompletion = habit.completions[0];
      if (lastCompletion) {
        const lastCompletedAt = new Date(lastCompletion.completedAt);

        if (frequency.type === "interval") {
          const hoursSinceLastCompletion = (completionTime.getTime() - lastCompletedAt.getTime()) / (1000 * 60 * 60);
          const requiredHours = frequency.unit === "days" ? frequency.value * 24 : frequency.value;

          if (hoursSinceLastCompletion < requiredHours) {
            throw new Error(`You must wait ${Math.ceil(requiredHours - hoursSinceLastCompletion)} more hours before completing this habit again`);
          }
        } else if (frequency.type === "weekdays") {
          // For weekdays, check if it's still the same day (in UTC)
          const isNewDay = lastCompletedAt.getUTCDate() !== completionTime.getUTCDate() ||
                          lastCompletedAt.getUTCMonth() !== completionTime.getUTCMonth() ||
                          lastCompletedAt.getUTCFullYear() !== completionTime.getUTCFullYear();

          if (!isNewDay) {
            throw new Error("This habit can only be completed once per day");
          }

          // Check if today is a weekday (0 = Sunday, 6 = Saturday)
          const dayOfWeek = completionTime.getUTCDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            throw new Error("This habit can only be completed on weekdays");
          }
        }
      }

      // Calculate XP based on difficulty
      const xpEarned = XP_REWARDS[habit.difficulty as keyof typeof XP_REWARDS] || XP_REWARDS.easy;

      // Get current user data
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, level: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Create the completion record with UTC time
      const completion = await tx.habitCompletion.create({
        data: {
          habitId,
          userId: session.user.id,
          completedAt: completionTime,
          xpEarned,
        },
      });

      // Update user's XP
      const newXp = user.xp + xpEarned;
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXp,
        },
      });

      return {
        completion,
        newXp,
        xpEarned,
        leveledUp: false, // Level will be calculated on the dashboard
      };
    });

    // Check for badges after the transaction is complete
    await checkAndAwardBadges(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error completing habit:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error completing habit" },
      { status: 500 }
    );
  }
} 