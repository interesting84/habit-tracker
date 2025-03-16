import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import ChallengeList from "@/components/ChallengeList";
import { HabitList } from "@/components/habits/HabitList";
import UserStats from "@/components/UserStats";
import NewChallengeButton from "@/components/NewChallengeButton";

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email ?? "" },
    include: {
      habits: {
        where: { isArchived: false },
        include: { completions: true },
      },
      challenges: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
      },
      userBadges: {
        include: { badge: true },
      },
    },
  });

  if (!user) {
    redirect("/signin");
  }

  const xpToNextLevel = Math.pow(user.level, 1.5) * 100;
  const progress = (user.xp / xpToNextLevel) * 100;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <NewChallengeButton userId={user.id} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 col-span-full">
          <UserStats user={user} />
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Level {user.level}</span>
              <span>{user.xp}/{xpToNextLevel} XP</span>
            </div>
            <Progress value={progress} />
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Active Challenges</h2>
            <ChallengeList challenges={user.challenges} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Daily Habits</h2>
            <HabitList habits={user.habits} />
          </section>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
            <div className="grid grid-cols-3 gap-4">
              {user.userBadges.map((userBadge: { id: string; badge: { imageUrl: string; name: string } }) => (
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
      </div>
    </div>
  );
} 