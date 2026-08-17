import Link from "next/link";
import { notFound } from "next/navigation";
import { Screen, PageTitle, GroupLabel, Group, Row } from "@/components/ui/Shell";
import { FLAG_LABEL, FLAG_CLASS, type Flag } from "@/lib/mock";
import { createClient } from "@/lib/supabase/server";

function prettyDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DiaryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("diary_entries")
    .select(
      "id, day, progress, flags, reviewed, backdated_days, submitted_at, author:profiles(full_name)",
    )
    .eq("id", id)
    .single();

  if (!entry) notFound();

  const { data: captures } = await supabase
    .from("captures")
    .select("id, body, photo_path, captured_at")
    .eq("entry_id", entry.id)
    .order("captured_at", { ascending: true });

  const notes = (captures ?? []).filter((c) => !c.photo_path);
  const photoPaths = (captures ?? [])
    .map((c) => c.photo_path)
    .filter((p): p is string => p !== null);

  let photoUrls: Record<string, string> = {};
  if (photoPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("captures")
      .createSignedUrls(photoPaths, 3600);
    photoUrls = Object.fromEntries(
      (signed ?? [])
        .filter((s) => s.signedUrl)
        .map((s) => [s.path, s.signedUrl]),
    );
  }

  const authorName =
    (entry.author as { full_name: string }[] | null)?.[0]?.full_name ??
    "Unknown";

  return (
    <Screen>
      <Link
        href="/history"
        className="mb-3 inline-block text-[13.5px] font-semibold text-accent"
      >
        ← History
      </Link>

      <PageTitle
        title={prettyDate(entry.day)}
        sub={`${authorName}${entry.backdated_days > 0 ? " · Backdated entry" : ""}`}
      />

      {entry.flags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {(entry.flags as Flag[]).map((f) => (
            <span
              key={f}
              className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${FLAG_CLASS[f]}`}
            >
              {FLAG_LABEL[f]}
            </span>
          ))}
        </div>
      )}

      <Group>
        <div className="px-4 py-3.5">
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed">
            {entry.progress}
          </p>
        </div>
      </Group>

      {notes.length > 0 && (
        <>
          <GroupLabel>Site notes</GroupLabel>
          <Group>
            {notes.map((n) => (
              <div
                key={n.id}
                className="flex gap-3 border-b border-line-soft px-4 py-3.5 last:border-b-0"
              >
                <span className="min-w-[42px] pt-px font-mono text-[12.5px] font-semibold text-muted">
                  {formatTime(n.captured_at)}
                </span>
                <p className="flex-1 text-[14.5px] leading-snug">{n.body}</p>
              </div>
            ))}
          </Group>
        </>
      )}

      {photoPaths.length > 0 && (
        <>
          <GroupLabel>Photos</GroupLabel>
          <div className="flex flex-wrap gap-2">
            {photoPaths.map((path) =>
              photoUrls[path] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={path}
                  src={photoUrls[path]}
                  alt="Site capture"
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ) : null,
            )}
          </div>
        </>
      )}

      <GroupLabel>Details</GroupLabel>
      <Group>
        <Row
          title="Reviewed"
          right={
            <span className="text-[15px] text-muted">
              {entry.reviewed ? "Yes" : "Not yet"}
            </span>
          }
        />
        <Row
          title="Submitted"
          right={
            <span className="text-[15px] text-muted">
              {new Date(entry.submitted_at).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          }
        />
      </Group>

      <a
        href={`/history/${entry.id}/pdf`}
        className="mt-6 block w-full rounded-xl bg-accent py-4 text-center text-base font-bold text-white transition-transform active:scale-[0.985]"
      >
        Download PDF
      </a>
    </Screen>
  );
}
