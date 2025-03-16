import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { NewHabitForm } from "@/components/habits/NewHabitForm";

export default async function NewHabitPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create a New Habit</h1>
        <p className="text-muted-foreground">
          Add a new habit to track and earn XP
        </p>
      </div>

      <NewHabitForm userId={session.user.id} />
    </div>
  );
} 