import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "./api/auth/[...nextauth]/route"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    // Find the user to get their username/email for redirection
    const user = await prisma.user.findUnique({
      where: { email: session.user.email ?? "" },
      select: { name: true, email: true }
    })

    if (user) {
      // Redirect to their profile using name if available, otherwise email
      redirect(`/profile/${user.name || user.email}`)
    }
  }

  redirect("/signin")
}
