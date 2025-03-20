import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Use the user's ID as part of the request to get a consistent quote for each user
    const response = await fetch(
      "https://zenquotes.io/api/random",
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    
    const data = await response.json();
    return NextResponse.json({
      content: data[0].q,
      author: data[0].a,
      userId: session.user.id // Include the user ID in response
    });
  } catch {
    // Return a fallback quote if the API fails
    return NextResponse.json({
      content: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      userId: null
    });
  }
} 