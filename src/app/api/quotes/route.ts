import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      "https://api.quotable.io/quotes/random?tags=inspirational,motivation",
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    
    const data = await response.json();
    return NextResponse.json(data[0]);
  } catch (error) {
    // Return a fallback quote if the API fails
    return NextResponse.json({
      content: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    });
  }
} 