import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { HabitList } from "@/components/habits/HabitList";
import { HabitHeatmap } from "@/components/habits/HabitHeatmap";
import UserStats from "@/components/UserStats";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DailyQuote from "@/components/DailyQuote";
import { HabitRecommendations } from "@/components/habits/HabitRecommendations";
import { getLevelProgress, getXPDisplayString, calculateLevel } from "@/lib/xp";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Frequency {
  type: "interval" | "weekdays";
  value?: number;
  unit?: "hours" | "days";
}

interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: Frequency;
  difficulty: string;
  completions: {
    id: string;
    completedAt: Date;
  }[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  xpBonus: number;
}

interface UserBadge {
  id: string;
  badge: Badge;
}

interface PageProps {
  params: Promise<{ username: string }>;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </Card>
      
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { username } = await params;
  
  // Find the profile user by username (which could be email or name)
  const profileUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: username, mode: 'insensitive' } },
        { name: { equals: username, mode: 'insensitive' } }
      ]
    },
    include: {
      habits: {
        where: { isArchived: false },
        include: { 
          completions: {
            orderBy: { completedAt: 'desc' },
            take: 1
          }
        },
      },
      userBadges: {
        include: { badge: true },
      },
      followers: true,
      following: true,
    },
  });

  if (!profileUser) {
    redirect("/404");
  }

  // Parse frequency JSON for each habit
  const parsedHabits = profileUser.habits.map((habit: any) => {
    const parsed = {
      ...habit,
      frequency: typeof habit.frequency === 'string' 
        ? JSON.parse(habit.frequency) as unknown as Frequency
        : habit.frequency as unknown as Frequency,
      completions: habit.completions || []
    };
    return parsed;
  });

  const safeProfileUser = {
    ...profileUser,
    habits: parsedHabits,
    xp: profileUser.xp || 0,
    level: profileUser.level || 1
  };

  const calculatedLevel = calculateLevel(safeProfileUser.xp);
  // Update user's level if it doesn't match their XP
  if (calculatedLevel !== safeProfileUser.level) {
    await prisma.user.update({
      where: { id: safeProfileUser.id },
      data: { level: calculatedLevel }
    });
    safeProfileUser.level = calculatedLevel;
  }

  const progress = getLevelProgress(safeProfileUser.xp);
  const xpDisplay = getXPDisplayString(safeProfileUser.xp);
  
  // Check if the current user is viewing their own profile
  const isOwnProfile = session?.user?.email === safeProfileUser.email;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">
          {safeProfileUser.name || safeProfileUser.email}'s Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Suspense fallback={<ProfileSkeleton />}>
          <Card className="p-6 col-span-full">
            <UserStats user={safeProfileUser} isViewOnly={!isOwnProfile} />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Level {safeProfileUser.level}</span>
                <span>{xpDisplay}</span>
              </div>
              <Progress value={progress} />
            </div>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <HabitHeatmap habits={safeProfileUser.habits} />
            </Card>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Daily Habits</h2>
                {isOwnProfile && (
                  <Link
                    href="/habits/new"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Habit
                  </Link>
                )}
              </div>
              <HabitList habits={safeProfileUser.habits} isViewOnly={!isOwnProfile} />
            </section>
          </div>

          <div className="md:col-span-1 space-y-6">
            {isOwnProfile && (
              <>
                <DailyQuote />
                <Card className="p-6">
                  <HabitRecommendations />
                </Card>
              </>
            )}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Achievements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {safeProfileUser.userBadges.map((userBadge: UserBadge) => (
                  <div
                    key={userBadge.id}
                    className="group relative flex flex-col items-center text-center p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={userBadge.badge.imageUrl}
                        alt={userBadge.badge.name}
                        className="w-16 h-16 mb-3"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-full transition-colors" />
                    </div>
                    <span className="font-medium">{userBadge.badge.name}</span>
                    <span className="text-sm text-muted-foreground mt-1">{userBadge.badge.description}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      +{userBadge.badge.xpBonus} XP
                    </div>
                  </div>
                ))}
                {safeProfileUser.userBadges.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No achievements yet. Keep completing habits to earn badges!
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Suspense>
      </div>
    </div>
  );
} 