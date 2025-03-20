import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.update({
      where: { email: session.user.email ?? "" },
      data: {
        xp: 0,
        level: 1,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error resetting XP:", error);
    return NextResponse.json(
      { message: "Error resetting XP" },
      { status: 500 }
    );
  }
} 