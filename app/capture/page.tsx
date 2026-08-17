"use client";

import { useEffect, useState } from "react";
import { Screen, PageTitle, GroupLabel, Group } from "@/components/ui/Shell";
import { createClient } from "@/lib/supabase/client";

interface Capture {
  id: string;
  body: string;
  captured_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CapturePage() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCaptures() {
    const supabase = createClient();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("captures")
      .select("id, body, captured_at")
      .gte("captured_at", startOfDay.toISOString())
      .order("captured_at", { ascending: true });

    setCaptures(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const supabase = createClient();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    supabase
      .from("captures")
      .select("id, body, captured_at")
      .gte("captured_at", startOfDay.toISOString())
      .order("captured_at", { ascending: true })
      .then(({ data }) => {
        setCaptures(data ?? []);
        setLoading(false);
      });
  }, []);

  async function handleAddNote() {
    if (!note.trim() || saving) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be signed in.");
      setSaving(false);
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
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("captures").insert({
      project_id: membership.project_id,
      author_id: user.id,
      body: note.trim(),
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setNote("");
    setComposing(false);
    setSaving(false);
    loadCaptures();
  }

  return (
    <Screen>
      <PageTitle
        title="Capture"
        sub="Log things as they happen — build the diary from these later"
      />

      <div className="flex flex-col gap-2.5">
        {composing && (
          <Group>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's happening?"
              rows={3}
              autoFocus
              className="w-full resize-none bg-transparent px-4 py-3.5 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-muted"
            />
          </Group>
        )}

        {composing ? (
          <div className="flex gap-2.5">
            <button
              onClick={() => {
                setComposing(false);
                setNote("");
              }}
              className="flex-1 rounded-xl border border-line bg-surface py-3.5 text-[15px] font-bold active:scale-[0.985] transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              disabled={!note.trim() || saving}
              className="flex-1 rounded-xl bg-accent py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.985] disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setComposing(true)}
            className="w-full rounded-xl bg-accent py-4 text-base font-bold text-white active:scale-[0.985] transition-transform"
          >
            Add a note
          </button>
        )}

        <button
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-line bg-surface py-4 text-base font-bold text-muted opacity-60"
        >
          Add a photo · coming soon
        </button>
      </div>

      {error && (
        <p className="mt-3 px-1 text-[13px] text-signal-red">{error}</p>
      )}

      <GroupLabel>Today&apos;s notes ({captures.length})</GroupLabel>
      {loading ? (
        <p className="px-1 text-[13.5px] text-muted">Loading…</p>
      ) : captures.length === 0 ? (
        <p className="px-1 text-[13.5px] text-muted">
          Nothing logged yet today.
        </p>
      ) : (
        <Group>
          {captures.map((c) => (
            <div
              key={c.id}
              className="flex gap-3 border-b border-line-soft px-4 py-3.5 last:border-b-0"
            >
              <span className="min-w-[42px] pt-px font-mono text-[12.5px] font-semibold text-muted">
                {formatTime(c.captured_at)}
              </span>
              <p className="flex-1 text-[14.5px] leading-snug">{c.body}</p>
            </div>
          ))}
        </Group>
      )}
    </Screen>
  );
}
