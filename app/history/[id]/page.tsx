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

export default async function DiaryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("diary_entries")
    .select("id, day, progress, flags, reviewed, backdated_days, submitted_at")
    .eq("id", id)
    .single();

  if (!entry) notFound();

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
        sub={entry.backdated_days > 0 ? "Backdated entry" : undefined}
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
    </Screen>
  );
}
