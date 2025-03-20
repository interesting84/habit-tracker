import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ error: "You must be logged in." }),
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email ?? "" },
    select: { name: true, email: true }
  });

  if (!user) {
    return new NextResponse(
      JSON.stringify({ error: "User not found." }),
      { status: 404 }
    );
  }

  return NextResponse.json(user);
} 