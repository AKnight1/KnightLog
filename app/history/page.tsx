import { Screen, PageTitle, GroupLabel, Group } from "@/components/ui/Shell";
import { ENTRIES, FLAG_LABEL, FLAG_CLASS } from "@/lib/mock";
import { Icon } from "@/components/icons";

function prettyDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HistoryPage() {
  return (
    <Screen>
      <PageTitle title="History" sub={`${ENTRIES.length} entries`} />

      <GroupLabel>August 2026</GroupLabel>
      <Group>
        {ENTRIES.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-3 border-b border-line-soft px-4 py-3.5 last:border-b-0 active:bg-line-soft"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[15.5px] font-medium">
                {prettyDate(e.day)}
                {e.backdatedDays > 0 && (
                  <span className="text-muted"> · backdated</span>
                )}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[13px] text-muted">
                {e.progress}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {e.flags.map((f) => (
                  <span
                    key={f}
                    className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${FLAG_CLASS[f]}`}
                  >
                    {FLAG_LABEL[f]}
                  </span>
                ))}
              </div>
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
    </Screen>
  );
}