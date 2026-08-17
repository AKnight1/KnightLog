"use client";

import { useEffect, useRef, useState } from "react";
import { Screen, PageTitle, GroupLabel, Group } from "@/components/ui/Shell";
import { createClient } from "@/lib/supabase/client";

interface Capture {
  id: string;
  body: string;
  captured_at: string;
  photo_path: string | null;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type MembershipResult =
  | { ok: true; supabase: ReturnType<typeof createClient>; userId: string; projectId: string }
  | { ok: false; error: string };

async function getMembership(): Promise<MembershipResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You need to be signed in." };

  const { data: membership, error } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !membership) {
    return { ok: false, error: "No project found for your account." };
  }

  return { ok: true, supabase, userId: user.id, projectId: membership.project_id };
}

export default function CapturePage() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadCaptures() {
    const supabase = createClient();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("captures")
      .select("id, body, captured_at, photo_path")
      .gte("captured_at", startOfDay.toISOString())
      .order("captured_at", { ascending: true });

    const list = data ?? [];
    setCaptures(list);
    setLoading(false);

    const photoPaths = list
      .map((c) => c.photo_path)
      .filter((p): p is string => p !== null);

    if (photoPaths.length > 0) {
      const { data: signed } = await supabase.storage
        .from("captures")
        .createSignedUrls(photoPaths, 3600);

      const urls: Record<string, string> = {};
      list.forEach((c) => {
        const match = signed?.find((s) => s.path === c.photo_path);
        if (match?.signedUrl) urls[c.id] = match.signedUrl;
      });
      setPhotoUrls(urls);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reusable fetch, also called after mutations
    loadCaptures();
  }, []);

  async function handleAddNote() {
    if (!note.trim() || saving) return;
    setSaving(true);
    setError(null);

    const membership = await getMembership();
    if (!membership.ok) {
      setError(membership.error);
      setSaving(false);
      return;
    }

    const { error: insertError } = await membership.supabase.from("captures").insert({
      project_id: membership.projectId,
      author_id: membership.userId,
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

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);

    const membership = await getMembership();
    if (!membership.ok) {
      setError(membership.error);
      setUploadingPhoto(false);
      return;
    }

    const path = `${membership.projectId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await membership.supabase.storage
      .from("captures")
      .upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploadingPhoto(false);
      return;
    }

    const { error: insertError } = await membership.supabase.from("captures").insert({
      project_id: membership.projectId,
      author_id: membership.userId,
      photo_path: path,
    });

    if (insertError) {
      setError(insertError.message);
      setUploadingPhoto(false);
      return;
    }

    setUploadingPhoto(false);
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelected}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPhoto}
          className="w-full rounded-xl border border-line bg-surface py-4 text-base font-bold active:scale-[0.985] transition-transform disabled:opacity-40"
        >
          {uploadingPhoto ? "Uploading…" : "Add a photo"}
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
              {c.photo_path ? (
                photoUrls[c.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrls[c.id]}
                    alt="Site capture"
                    className="h-16 w-16 flex-1 grow-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-line-soft" />
                )
              ) : (
                <p className="flex-1 text-[14.5px] leading-snug">{c.body}</p>
              )}
            </div>
          ))}
        </Group>
      )}
    </Screen>
  );
}
