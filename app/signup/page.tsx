"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Screen, PageTitle, Group } from "@/components/ui/Shell";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, inviteCode }),
    });
    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Screen>
      <PageTitle title="Create account" sub="Join your team on KnightLog" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <Group>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            required
            className="w-full border-b border-line-soft bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-muted"
          />
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
            autoComplete="new-password"
            required
            minLength={6}
            className="w-full border-b border-line-soft bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-muted"
          />
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Project invite code"
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
          {loading ? "Creating account…" : "Create account"}
        </button>

        <Link
          href="/login"
          className="mt-1 text-center text-[13.5px] font-semibold text-accent"
        >
          Already have an account? Sign in
        </Link>
      </form>
    </Screen>
  );
}
