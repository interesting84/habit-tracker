import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center space-y-4 text-center">
        <h1 className="text-4xl font-bold">Welcome to HabitQuest</h1>
        <p className="text-xl text-muted-foreground">
          Level up your life by building better habits
        </p>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center mb-4">
              Sign in to start tracking your habits and leveling up your life!
            </p>
            <Button asChild>
              <Link href="/api/auth/signin">
                Sign in to Get Started
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
