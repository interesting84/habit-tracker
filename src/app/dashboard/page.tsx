import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HabitList } from "@/components/habits/HabitList";
import { HabitRecommendations } from "@/components/habits/HabitRecommendations";

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
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  completions: {
    id: string;
    userId: string;
    habitId: string;
    completedAt: Date;
    xpEarned: number;
  }[];
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.user.id,
      isArchived: false,
    },
    include: {
      completions: {
        orderBy: {
          completedAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Parse the frequency JSON for each habit
  const parsedHabits: Habit[] = habits.map(habit => ({
    ...habit,
    frequency: typeof habit.frequency === 'string' 
      ? JSON.parse(habit.frequency as string)
      : habit.frequency,
  }));

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
      
      <div className="space-y-8">
        <HabitList habits={parsedHabits} />
        <HabitRecommendations />
      </div>
    </main>
  );
} 