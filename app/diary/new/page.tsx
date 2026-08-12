"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, PageTitle, GroupLabel, Group } from "@/components/ui/Shell";
import { Icon } from "@/components/icons";
import { PROJECT } from "@/lib/mock";

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
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  function toggleRecording() {
    if (recording) {
      setRecording(false);
    } else {
      setElapsed(0);
      setRecording(true);
    }
  }

  function handleSubmit() {
    if (!progress.trim() || submitting) return;
    setSubmitting(true);
    setTimeout(() => router.push("/history"), 600);
  }

  return (
    <Screen>
      <PageTitle title="New entry" sub={PROJECT.name} />

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

      <button
        onClick={handleSubmit}
        disabled={!progress.trim() || submitting}
        className="mt-6 w-full rounded-xl bg-accent py-4 text-base font-bold text-white transition-transform active:scale-[0.985] disabled:opacity-40 disabled:active:scale-100"
      >
        {submitting ? "Saving…" : "Create entry"}
      </button>

      <p className="stamp mt-4 text-center">Stage 1 — nothing is saved yet</p>
    </Screen>
  );
}
