import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/options";
import { NewHabitForm } from "@/components/habits/NewHabitForm";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function NewHabitFormSkeleton() {
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

export default async function NewHabitPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pt-8">
      <div>
        <h1 className="text-3xl font-bold">Create a New Habit</h1>
        <p className="text-muted-foreground">
          Add a new habit to track and earn XP
        </p>
      </div>

      <Suspense fallback={<NewHabitFormSkeleton />}>
        <NewHabitForm userId={session.user.id} />
      </Suspense>
    </div>
  );
} 