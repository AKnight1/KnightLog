import { Screen, PageTitle, GroupLabel, Group } from "@/components/ui/Shell";
import { FLAG_LABEL, FLAG_CLASS, type Flag } from "@/lib/mock";
import { Icon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

function prettyDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("diary_entries")
    .select("id, day, progress, flags, reviewed, backdated_days")
    .order("day", { ascending: false });

  const list = entries ?? [];

  return (
    <Screen>
      <PageTitle
        title="History"
        sub={`${list.length} ${list.length === 1 ? "entry" : "entries"}`}
      />

      {list.length === 0 ? (
        <p className="mt-6 px-1 text-[13.5px] text-muted">
          No entries logged yet.
        </p>
      ) : (
        <>
          <GroupLabel>All entries</GroupLabel>
          <Group>
            {list.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 border-b border-line-soft px-4 py-3.5 last:border-b-0 active:bg-line-soft"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-medium">
                    {prettyDate(e.day)}
                    {e.backdated_days > 0 && (
                      <span className="text-muted"> · backdated</span>
                    )}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-muted">
                    {e.progress}
                  </p>
                  {e.flags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(e.flags as Flag[]).map((f) => (
                        <span
                          key={f}
                          className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${FLAG_CLASS[f]}`}
                        >
                          {FLAG_LABEL[f]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {e.reviewed && (
                  <span className="rounded-full bg-signal-green-soft px-2 py-1 text-[11px] font-bold text-signal-green">
                    ✓
                  </span>
                )}
                <span className="w-[15px] text-[#C4C2BA]">{Icon.chevron}</span>
              </div>
            ))}
          </Group>
        </>
      )}
    </Screen>
  );
}
