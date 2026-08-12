import { Screen, PageTitle, GroupLabel, Group } from "@/components/ui/Shell";
import { CAPTURES } from "@/lib/mock";

export default function CapturePage() {
  return (
    <Screen>
      <PageTitle
        title="Capture"
        sub="Log things as they happen — build the diary from these later"
      />

      <div className="flex flex-col gap-2.5">
        <button className="w-full rounded-xl bg-accent py-4 text-base font-bold text-white active:scale-[0.985] transition-transform">
          Add a note
        </button>
        <button className="w-full rounded-xl border border-line bg-surface py-4 text-base font-bold active:scale-[0.985] transition-transform">
          Add a photo
        </button>
      </div>

      <GroupLabel>Today&apos;s notes ({CAPTURES.length})</GroupLabel>
      <Group>
        {CAPTURES.map((c) => (
          <div
            key={c.id}
            className="flex gap-3 border-b border-line-soft px-4 py-3.5 last:border-b-0"
          >
            <span className="min-w-[42px] pt-px font-mono text-[12.5px] font-semibold text-muted">
              {c.at}
            </span>
            <p className="flex-1 text-[14.5px] leading-snug">{c.text}</p>
          </div>
        ))}
      </Group>
    </Screen>
  );
}