import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { HabitList } from "@/components/habits/HabitList";
import UserStats from "@/components/UserStats";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DailyQuote from "@/components/DailyQuote";
import { getLevelProgress, getXPDisplayString, calculateLevel } from "@/lib/xp";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { Plus } from "lucide-react";

interface HabitCompletion {
  id: string;
  userId: string;
  habitId: string;
  completedAt: Date;
  xpEarned: number;
}

interface DBHabit {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  difficulty: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  completions: HabitCompletion[];
}

interface Frequency {
  type: "interval" | "weekdays";
  value?: number;
  unit?: "hours" | "days";
}

interface ParsedHabit extends Omit<DBHabit, 'frequency'> {
  frequency: Frequency;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  status: string;
  xpReward: number;
  difficulty: string;
  duration: number;
  userId: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  aiGenerated: boolean;
  lastCompletedAt: Date | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface UserBadge {
  id: string;
  badge: Badge;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  level: number;
  xp: number;
  habits: ParsedHabit[];
  challenges: Challenge[];
  userBadges: UserBadge[];
}

function DashboardSkeleton() {
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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email ?? "" },
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
    },
  }) as User | null;

  if (!user) {
    redirect("/signin");
  }

  // Parse frequency JSON for each habit
  const parsedHabits = user.habits.map(habit => ({
    ...habit,
    frequency: typeof habit.frequency === 'string' 
      ? JSON.parse(habit.frequency as string)
      : habit.frequency
  })) as ParsedHabit[];
  user.habits = parsedHabits;

  const calculatedLevel = calculateLevel(user.xp);
  // Update user's level if it doesn't match their XP
  if (calculatedLevel !== user.level) {
    await prisma.user.update({
      where: { id: user.id },
      data: { level: calculatedLevel }
    });
    user.level = calculatedLevel;
  }

  const progress = getLevelProgress(user.xp);
  const xpDisplay = getXPDisplayString(user.xp);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <Card className="p-6 col-span-full">
            <UserStats user={user} />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Level {user.level}</span>
                <span>{xpDisplay}</span>
              </div>
              <Progress value={progress} />
            </div>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Daily Habits</h2>
                <Link
                  href="/habits/new"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Habit
                </Link>
              </div>
              <HabitList habits={user.habits} />
            </section>
          </div>

          <div className="space-y-6">
            <DailyQuote />
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
              <div className="grid grid-cols-3 gap-4">
                {user.userBadges.map((userBadge) => (
                  <div
                    key={userBadge.id}
                    className="flex flex-col items-center text-center"
                  >
                    <img
                      src={userBadge.badge.imageUrl}
                      alt={userBadge.badge.name}
                      className="w-12 h-12 mb-2"
                    />
                    <span className="text-sm">{userBadge.badge.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Suspense>
      </div>
    </div>
  );
} 