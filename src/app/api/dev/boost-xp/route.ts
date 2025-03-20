import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Add 50 XP
    const newXp = user.xp + 50;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: newXp },
    });

    return NextResponse.json({
      newXp,
      xpEarned: 50,
    });
  } catch (error) {
    console.error("Error boosting XP:", error);
    return NextResponse.json(
      { message: "Error boosting XP" },
      { status: 500 }
    );
  }
} 