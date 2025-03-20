import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { EditHabitForm } from "@/components/habits/EditHabitForm";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
    redirect("/login");
  }

  const habit = await prisma.habit.findUnique({
    where: {
      id: habitId,
    },
  });

  if (!habit) {
    return <div>Habit not found</div>;
  }

  if (habit.userId !== session.user.id) {
    return <div>You do not have permission to edit this habit</div>;
  }

  // Parse the frequency which is stored as a string in the database
  let parsedFrequency: Frequency;
  try {
    parsedFrequency = typeof habit.frequency === 'string'
      ? JSON.parse(habit.frequency as string)
      : habit.frequency;
  } catch (error) {
    console.error('Error parsing frequency:', error);
    parsedFrequency = { type: 'interval', value: 1, unit: 'days' };
  }

  const parsedHabit: HabitWithParsedFrequency = {
    ...habit,
    frequency: parsedFrequency,
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Habit</h1>
        <p className="text-slate-500">Update your habit details below</p>
      </div>
      <Suspense fallback={<EditHabitFormSkeleton />}>
        <EditHabitForm habit={parsedHabit} />
      </Suspense>
    </div>
  );
}

interface PageProps {
  params: Promise<{ habitId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata() {
  return {
    title: 'Edit Habit',
  };
}

export default async function EditHabitPage({ params }: PageProps) {
  const resolvedParams = await params;
  const habitId = resolvedParams.habitId;
  
  return (
    <Suspense fallback={<EditHabitFormSkeleton />}>
      <HabitEditor habitId={habitId} />
    </Suspense>
  );
} 