import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: { challengeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const challengeId = context.params.challengeId;

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Start a transaction to ensure all updates happen together
    const result = await prisma.$transaction(async (tx) => {
      // Verify the challenge belongs to the user and get its details
      const challenge = await tx.challenge.findUnique({
        where: { id: challengeId },
      });

      console.log("Found challenge:", JSON.stringify(challenge, null, 2));

      if (!challenge || challenge.userId !== session.user.id) {
        throw new Error("Challenge not found");
      }

      // Check if the challenge is already permanently completed
      if (challenge.status === "completed" && challenge.endDate) {
        throw new Error("Challenge is already permanently completed");
      }

      // If there's a lastCompletedAt timestamp, check if enough time has passed
      if (challenge.lastCompletedAt) {
        const now = new Date();
        const lastCompletedAt = new Date(challenge.lastCompletedAt);
        const hoursSinceLastCompletion = (now.getTime() - lastCompletedAt.getTime()) / (1000 * 60 * 60);
        
        console.log("Time since last completion:", {
          now: now.toISOString(),
          lastCompletedAt: lastCompletedAt.toISOString(),
          hoursSinceLastCompletion,
          duration: challenge.duration
        });
        
        // For day-based challenges, check if it's a new day (past midnight)
        if (challenge.duration >= 24) {
          const isNewDay = lastCompletedAt.getDate() !== now.getDate() ||
                          lastCompletedAt.getMonth() !== now.getMonth() ||
                          lastCompletedAt.getFullYear() !== now.getFullYear();
          
          console.log("Day-based challenge check:", { isNewDay });
          
          if (!isNewDay) {
            throw new Error("Challenge can only be completed once per day");
          }
        } else {
          // For hour-based challenges, check if enough hours have passed
          if (hoursSinceLastCompletion < challenge.duration) {
            throw new Error(`You must wait ${Math.ceil(challenge.duration - hoursSinceLastCompletion)} more hours before completing this challenge again`);
          }
        }
      }

      // Get current user data
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Calculate if this completion should mark the challenge as permanently completed
      const now = new Date();
      const startDate = new Date(challenge.startDate);
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const shouldComplete = daysSinceStart >= challenge.duration;

      console.log("Challenge completion check:", {
        daysSinceStart,
        duration: challenge.duration,
        shouldComplete
      });

      // Update the challenge completion status and timestamp
      const updatedChallenge = await tx.challenge.update({
        where: { id: challengeId },
        data: {
          lastCompletedAt: now,
          status: shouldComplete ? "completed" : challenge.status === "active" ? "in_progress" : challenge.status,
          endDate: shouldComplete ? now : undefined,
        },
      });

      console.log("Updated challenge:", JSON.stringify(updatedChallenge, null, 2));

      // Update user's XP
      const newXp = user.xp + challenge.xpReward;
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXp,
        },
      });

      return {
        challenge: updatedChallenge,
        newXp,
        xpEarned: challenge.xpReward,
        completed: shouldComplete,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error completing challenge:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error completing challenge" },
      { status: 500 }
    );
  }
} 