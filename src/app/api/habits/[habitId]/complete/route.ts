import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const XP_PER_COMPLETION = 10;
const XP_PER_LEVEL = 100;

export async function POST(
  request: Request,
  context: { params: Promise<{ habitId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const habitId = params.habitId;

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Start a transaction to ensure all updates happen together
    const result = await prisma.$transaction(async (tx) => {
      // Verify the habit belongs to the user
      const habit = await tx.habit.findUnique({
        where: { id: habitId },
      });

      if (!habit || habit.userId !== session.user.id) {
        throw new Error("Habit not found");
      }

      // Get current user data
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, level: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Create the completion record
      const completion = await tx.habitCompletion.create({
        data: {
          habitId,
          userId: session.user.id,
          xpEarned: XP_PER_COMPLETION,
        },
      });

      // Calculate new XP and level
      const currentXp = user.xp || 0;
      const currentLevel = user.level || 1;
      const newXp = currentXp + XP_PER_COMPLETION;
      const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

      // Update user's XP and level
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXp,
          level: newLevel,
        },
      });

      return {
        completion,
        newXp,
        newLevel,
        leveledUp: newLevel > currentLevel,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error completing habit:", error);
    if (error instanceof Error && error.message === "Habit not found") {
      return NextResponse.json(
        { message: "Habit not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Error completing habit" },
      { status: 500 }
    );
  }
} 