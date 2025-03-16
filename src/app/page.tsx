import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

export default async function HomePage() {
  const session = await getServerSession()

  if (session?.user) {
    redirect("/dashboard")
  }

  redirect("/signin")
}
