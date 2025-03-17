import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { EditHabitForm } from "@/components/habits/EditHabitForm";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Prisma, Habit } from "@prisma/client";

interface Frequency {
  type: "interval" | "weekdays";
  value?: number;
  unit?: "hours" | "days";
}

type HabitWithParsedFrequency = {
  id: string;
  name: string;
  description: string | null;
  frequency: Frequency;
  difficulty: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
};

function EditHabitFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

async function HabitEditor({ habitId }: { habitId: string }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: {
      id: true,
      name: true,
      description: true,
      frequency: true,
      difficulty: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      isArchived: true,
    },
  }) as unknown as (Omit<HabitWithParsedFrequency, 'frequency'> & { frequency: string });

  if (!habit || habit.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // Parse the frequency JSON string back to an object
  const parsedHabit: HabitWithParsedFrequency = {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    frequency: typeof habit.frequency === 'string' 
      ? JSON.parse(habit.frequency) 
      : habit.frequency as Frequency,
    difficulty: habit.difficulty,
    userId: habit.userId,
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
    isArchived: habit.isArchived,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Habit</h1>
        <p className="text-muted-foreground">
          Update your habit details
        </p>
      </div>

      <Suspense fallback={<EditHabitFormSkeleton />}>
        <EditHabitForm habit={parsedHabit} />
      </Suspense>
    </div>
  );
}

type PageProps = {
  params: { habitId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Edit Habit',
  };
}

export default function EditHabitPage({ params }: PageProps) {
  return (
    <Suspense fallback={<EditHabitFormSkeleton />}>
      <HabitEditor habitId={params.habitId} />
    </Suspense>
  );
} 