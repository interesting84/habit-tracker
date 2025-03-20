import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
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
const createHabitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  frequency: frequencySchema,
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  userId: z.string().min(1, "User ID is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate request body
    const result = createHabitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { name, description, frequency, difficulty, userId } = result.data;

    // Verify that the userId matches the session user's id
    if (userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const habit = await prisma.$queryRaw`
      INSERT INTO "Habit" (
        id,
        name,
        description,
        frequency,
        difficulty,
        "userId",
        "createdAt",
        "updatedAt",
        "isArchived"
      )
      VALUES (
        gen_random_uuid(),
        ${name},
        ${description},
        ${JSON.stringify(frequency)}::jsonb,
        ${difficulty},
        ${userId},
        NOW(),
        NOW(),
        false
      )
      RETURNING *;
    `;

    return NextResponse.json(Array.isArray(habit) ? habit[0] : habit, { status: 201 });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { message: "Error creating habit" },
      { status: 500 }
    );
  }
} 