import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: {
    redirectedFrom?: string;
  };
};

export default async function SignupPage({ searchParams }: PageProps) {
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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Join Sapling</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Create an account to start journaling and nurture your 3D tree.
        </p>
      </div>
      <SignupForm redirectTo={searchParams?.redirectedFrom} />
    </div>
  );
}
