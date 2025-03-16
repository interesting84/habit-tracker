import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { HabitList } from "@/components/habits/HabitList";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  // Fetch fresh user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      level: true,
      xp: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.user.id,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name || "Adventurer"}!</h1>
        <p className="text-muted-foreground">
          Track your habits and level up your life
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Level {user.level}</h2>
          <p className="text-sm text-muted-foreground">Keep going to level up!</p>
        </div>
        
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">XP: {user.xp}</h2>
          <p className="text-sm text-muted-foreground">Complete habits to earn XP</p>
        </div>
        
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Active Habits</h2>
          <p className="text-sm text-muted-foreground">
            {habits.length} {habits.length === 1 ? "habit" : "habits"} being tracked
          </p>
        </div>
      </div>

      <HabitList habits={habits} />
    </div>
  );
} 