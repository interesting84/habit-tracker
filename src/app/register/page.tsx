import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import SignUpForm from "@/components/SignUpForm";

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Create Account</h1>
          <p className="mt-2 text-muted-foreground">
            Start your productivity journey today
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
} 