import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(
  request: Request,
  context: { params: { userId: string } }
) {
  try {
    // Await the params object before accessing its properties
    const params = await context.params;
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

    // Check if the follow relationship exists
    const existingFollow = await prisma.userFollower.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });

    if (!existingFollow) {
      return new NextResponse("Not following this user", { status: 400 });
    }

    // Delete the follow relationship
    await prisma.userFollower.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });

    return new NextResponse("Successfully unfollowed user", { status: 200 });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 