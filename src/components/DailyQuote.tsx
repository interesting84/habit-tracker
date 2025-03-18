"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Quote {
  content: string;
  author: string;
  userId: string | null;
}

export default function DailyQuote() {
  const { data: session } = useSession();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // Get today's date in user's local timezone
        const now = new Date();
        const today = now.toLocaleDateString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        const userId = session?.user?.id;
        
        if (!userId) {
          setIsLoading(false);
          return;
        }

        // Check if we have a cached quote for today and this user
        const cacheKey = `daily-quote-${userId}-${today}`;
        const cachedQuote = localStorage.getItem(cacheKey);
        
        if (cachedQuote) {
          const parsed = JSON.parse(cachedQuote);
          // Verify the cached quote belongs to the current user
          if (parsed.userId === userId) {
            setQuote(parsed);
            setIsLoading(false);
            return;
          }
        }

        // Fetch a new quote from our API endpoint
        const response = await fetch("/api/quotes");
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }
        
        const data = await response.json();
        const newQuote = {
          content: data.content,
          author: data.author,
          userId: data.userId
        };
        
        // Only cache if we got a valid user-specific quote
        if (newQuote.userId === userId) {
          localStorage.setItem(cacheKey, JSON.stringify(newQuote));
        }
        setQuote(newQuote);
      } catch (error) {
        console.error("Failed to fetch quote:", error);
        // Set a fallback quote if everything fails
        setQuote({
          content: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
          userId: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [session]); // Re-run if session changes

  if (isLoading) {
    return (
      <Card className="p-6 bg-primary/5">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-primary/10 rounded w-3/4"></div>
          <div className="h-4 bg-primary/10 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!quote || !session?.user) {
    return null;
  }

  return (
    <Card className="p-6 bg-primary/5">
      <blockquote className="space-y-2">
        <p className="text-lg italic">{quote.content}</p>
        <footer className="text-sm text-muted-foreground">
          — {quote.author}
        </footer>
      </blockquote>
    </Card>
  );
} 