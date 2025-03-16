import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import SignInForm from "@/components/SignInForm";

export default async function SignInPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to continue your productivity journey
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
} 