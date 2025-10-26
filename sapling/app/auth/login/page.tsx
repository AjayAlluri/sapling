import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: {
    redirectedFrom?: string;
  };
};

export default async function LoginPage({ searchParams }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect(searchParams?.redirectedFrom ?? "/journal");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Welcome back</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Sign in to continue tracking your emotional growth.
        </p>
      </div>
      <LoginForm redirectTo={searchParams?.redirectedFrom} />
    </div>
  );
}
