"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Quote {
  content: string;
  author: string;
}

export default function DailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // Get today's date as a string to use as a cache key
        const today = new Date().toISOString().split('T')[0];
        
        // Check if we have a cached quote for today
        const cachedQuote = localStorage.getItem(`daily-quote-${today}`);
        
        if (cachedQuote) {
          setQuote(JSON.parse(cachedQuote));
          setIsLoading(false);
          return;
        }

        // Fetch a new quote from our API endpoint
        const response = await fetch("/api/quotes");
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }
        
        const data = await response.json();
        const newQuote = {
          content: data.content,
          author: data.author
        };
        
        // Cache the quote with today's date
        localStorage.setItem(`daily-quote-${today}`, JSON.stringify(newQuote));
        setQuote(newQuote);
      } catch (error) {
        console.error("Failed to fetch quote:", error);
        // Set a fallback quote if everything fails
        setQuote({
          content: "The only way to do great work is to love what you do.",
          author: "Steve Jobs"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, []);

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

  if (!quote) {
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