"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, PageTitle, GroupLabel, Group } from "@/components/ui/Shell";
import { Icon } from "@/components/icons";
import { FLAG_LABEL, type Flag } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";

const ALL_FLAGS: Flag[] = ["blocked", "delay", "instruction", "hse", "visitor"];

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function NewDiaryEntryPage() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState("");
  const [flags, setFlags] = useState<Flag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    createClient()
      .from("projects")
      .select("name")
      .limit(1)
      .single()
      .then(({ data }) => setProjectName(data?.name ?? null));
  }, []);

  useEffect(() => {
    if (recording) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [recording]);

  function toggleFlag(f: Flag) {
    setFlags((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }

  function toggleRecording() {
    if (recording) {
      setRecording(false);
    } else {
      setElapsed(0);
      setRecording(true);
    }
  }

  async function handleSubmit() {
    if (!progress.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be signed in.");
      setSubmitting(false);
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (membershipError || !membership) {
      setError("No project found for your account.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("diary_entries").insert({
      project_id: membership.project_id,
      author_id: user.id,
      day: new Date().toISOString().slice(0, 10),
      progress: progress.trim(),
      flags,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    router.push("/history");
    router.refresh();
  }

  return (
    <Screen>
      <PageTitle title="New entry" sub={projectName ?? undefined} />

      <div className="flex flex-col items-center gap-2.5 py-2">
        <button
          onClick={toggleRecording}
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
        >
          {recording && (
            <span className="absolute inset-0 animate-ping rounded-full bg-signal-red/40" />
          )}
          <span
            className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-colors ${
              recording ? "bg-signal-red" : "bg-accent"
            }`}
          >
            <span className="h-8 w-8 text-white">{Icon.mic}</span>
          </span>
        </button>
        <p className="stamp">
          {recording ? `Recording · ${formatElapsed(elapsed)}` : "Tap to record a voice note"}
        </p>
      </div>

      <GroupLabel>Progress</GroupLabel>
      <Group>
        <textarea
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          placeholder="What happened on site today?"
          rows={8}
          className="w-full resize-none bg-transparent px-4 py-3.5 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-muted"
        />
      </Group>

      <GroupLabel>Flags (optional)</GroupLabel>
      <div className="flex flex-wrap gap-2">
        {ALL_FLAGS.map((f) => {
          const active = flags.includes(f);
          return (
            <button
              key={f}
              type="button"
              onClick={() => toggleFlag(f)}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface text-ink"
              }`}
            >
              {FLAG_LABEL[f]}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 px-1 text-[13px] text-signal-red">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!progress.trim() || submitting}
        className="mt-6 w-full rounded-xl bg-accent py-4 text-base font-bold text-white transition-transform active:scale-[0.985] disabled:opacity-40 disabled:active:scale-100"
      >
        {submitting ? "Saving…" : "Create entry"}
      </button>
    </Screen>
  );
}
