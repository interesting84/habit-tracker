import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return new NextResponse("Query parameter 'q' is required", { status: 400 });
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 401 });
    }

    // Get users matching the search query
    const users = await prisma.user.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        NOT: {
          email: session.user.email,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        level: true,
        xp: true,
        followers: {
          where: {
            followerId: currentUser.id
          }
        }
      },
      take: 10,
    });

    // Transform the results to include isFollowing flag
    const transformedUsers = users.map(user => ({
      ...user,
      isFollowing: user.followers.length > 0,
      followers: undefined // Remove the followers array from the response
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 