"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to register");
      }

      toast.success("Account created successfully! Please sign in.");
      router.push("/signin");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Input
            name="name"
            placeholder="Username (letters and numbers only)"
            required
            disabled={isLoading}
            pattern="^[a-zA-Z0-9]+$"
            title="Username must contain only letters and numbers, no spaces"
            onChange={(e) => {
              const value = e.target.value;
              if (value && !/^[a-zA-Z0-9]*$/.test(value)) {
                e.target.setCustomValidity("Username must contain only letters and numbers, no spaces");
              } else {
                e.target.setCustomValidity("");
              }
            }}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Username must contain only letters and numbers, no spaces
          </p>
        </div>
        <div>
          <Input
            name="email"
            type="email"
            placeholder="Email"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
} 