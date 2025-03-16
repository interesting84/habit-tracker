import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/settings/SettingsForm";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function SettingsFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email ?? "" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        <Suspense fallback={<SettingsFormSkeleton />}>
          <SettingsForm user={user} />
        </Suspense>
      </div>
    </main>
  );
} 