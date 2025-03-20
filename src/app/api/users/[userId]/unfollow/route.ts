import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function POST(req: NextRequest) {
  try {
    // Extract userId from the URL
    const urlParts = req.url.split('/');
    const userId = urlParts[urlParts.length - 2]; // [userId]/unfollow -> get userId
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "You must be logged in to unfollow a user" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the follow relationship exists
    const existingFollow = await prisma.userFollower.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { message: "Not following this user" },
        { status: 400 }
      );
    }

    // Delete the follow relationship
    await prisma.userFollower.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UNFOLLOW_USER]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 