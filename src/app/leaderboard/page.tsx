import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import type { User, UserFollower } from "@prisma/client";

interface UserWithIsCurrentFlag extends User {
  isCurrentUser: boolean;
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

async function LeaderboardContent() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/signin");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email ?? "" }
  });

  if (!currentUser) {
    redirect("/signin");
  }

  // Get all users being followed
  const userFollowers = await prisma.userFollower.findMany({
    where: {
      followerId: currentUser.id
    }
  });
  
  // Fetch all followed users with their data
  const followedUsers = await prisma.user.findMany({
    where: {
      id: {
        in: userFollowers.map((f: UserFollower) => f.followingId)
      }
    }
  });

  // Add the current user to the list
  const allUsers: UserWithIsCurrentFlag[] = [
    {
      ...currentUser,
      isCurrentUser: true
    },
    ...followedUsers.map((u: User) => ({
      ...u,
      isCurrentUser: false
    }))
  ];

  // Sort users by XP in descending order
  const rankedUsers = allUsers.sort((a, b) => b.xp - a.xp);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
      </div>

      <Card className="p-6">
        <LeaderboardList users={rankedUsers} currentUserId={currentUser.id} />
      </Card>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <LeaderboardContent />
    </Suspense>
  );
} 