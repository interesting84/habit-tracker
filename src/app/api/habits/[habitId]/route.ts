import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Define the frequency schema
const frequencySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("interval"),
    value: z.number().min(1),
    unit: z.enum(["hours", "days"]),
  }),
  z.object({
    type: z.literal("weekdays"),
  }),
]);

// Define the request body schema
const updateHabitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  frequency: frequencySchema,
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract habitId from the URL
    const urlParts = req.url.split('/');
    const habitId = urlParts[urlParts.length - 1];

    const body = await req.json();
    
    // Validate request body
    const result = updateHabitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { name, description, frequency, difficulty } = result.data;

    // Verify the habit belongs to the user
    const existingHabit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!existingHabit || existingHabit.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Habit not found" },
        { status: 404 }
      );
    }

    // Update the habit with the frequency as a JSON string
    const updatedHabit = await prisma.$queryRaw`
      UPDATE "Habit"
      SET
        name = ${name},
        description = ${description},
        frequency = ${JSON.stringify(frequency)}::jsonb,
        difficulty = ${difficulty},
        "updatedAt" = NOW()
      WHERE id = ${habitId}
      RETURNING *;
    `;

    return NextResponse.json(Array.isArray(updatedHabit) ? updatedHabit[0] : updatedHabit);
  } catch (error) {
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { message: "Error updating habit" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract habitId from the URL
    const urlParts = req.url.split('/');
    const habitId = urlParts[urlParts.length - 1];

    // Verify the habit belongs to the user
    const existingHabit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!existingHabit || existingHabit.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Habit not found" },
        { status: 404 }
      );
    }

    // Delete the habit
    await prisma.habit.delete({
      where: { id: habitId },
    });

    return NextResponse.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { message: "Error deleting habit" },
      { status: 500 }
    );
  }
} 