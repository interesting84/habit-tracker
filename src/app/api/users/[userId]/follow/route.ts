import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const targetUserId = params.userId;

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.userFollower.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      return new NextResponse("Already following this user", { status: 400 });
    }

    // Create follow relationship
    await prisma.userFollower.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUserId,
      },
    });

    return new NextResponse("Successfully followed user", { status: 200 });
  } catch (error) {
    console.error("Error following user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 