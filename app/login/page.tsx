"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Screen, PageTitle, Group } from "@/components/ui/Shell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Screen>
      <PageTitle title="Sign in" sub="KnightLog site diary" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <Group>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full border-b border-line-soft bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-muted"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="w-full bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-muted"
          />
        </Group>

        {error && <p className="px-1 text-[13px] text-signal-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 w-full rounded-xl bg-accent py-4 text-base font-bold text-white transition-transform active:scale-[0.985] disabled:opacity-40"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </Screen>
  );
}
