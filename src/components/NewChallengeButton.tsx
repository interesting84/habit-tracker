"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewChallengeButtonProps {
  userId: string;
}

export default function NewChallengeButton({ userId }: NewChallengeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const generateChallenge = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/challenges/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate challenge");
      }

      const data = await response.json();
      toast.success("New challenge generated!");
      router.refresh();
    } catch (error) {
      console.error("Error generating challenge:", error);
      toast.error("Failed to generate challenge");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={generateChallenge}
      disabled={isLoading}
      className="relative"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
      ) : (
        "Generate Challenge"
      )}
    </Button>
  );
} 