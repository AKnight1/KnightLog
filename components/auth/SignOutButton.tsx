"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      onClick={handleSignOut}
      className="flex cursor-pointer items-center gap-3 border-b border-line-soft px-4 py-3.5 last:border-b-0 active:bg-line-soft"
    >
      <p className="text-[15.5px] font-medium tracking-[-0.01em] text-signal-red">
        Sign out
      </p>
    </div>
  );
}
