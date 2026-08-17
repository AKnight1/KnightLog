import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function daysAgo(n: number) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
}

export default async function Home() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("diary_entries")
    .select("day, flags");

  const list = entries ?? [];
  const today = isoDate(new Date());
  const weekStart = isoDate(startOfWeek(new Date()));
  const sevenDaysAgo = isoDate(daysAgo(7));

  const loggedToday = list.some((e) => e.day === today);
  const thisWeekCount = list.filter((e) => e.day >= weekStart).length;
  const flags7dCount = list.filter(
    (e) => e.day >= sevenDaysAgo && e.flags.length > 0,
  ).length;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Brand lockup */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-ground flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-6 h-6">
              <path
                d="M32 6l20 7v20c0 13-8.6 22.6-20 26C20.6 55.6 12 46 12 33V13l20-7z"
                fill="none"
                stroke="#C9A227"
                strokeWidth="3.4"
                strokeLinejoin="round"
              />
              <path
                d="M22 32.5h20M26 24.5h12M26 40.5h12"
                stroke="#E9F0E8"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-display font-extrabold text-xl tracking-tight leading-none">
              KnightLog
            </div>
            <div className="font-mono text-[9.5px] tracking-[0.22em] text-gold mt-1">
              SOLUTIONS
            </div>
          </div>
        </div>

        {/* Status card */}
        <div className="bg-surface border border-line-soft rounded-2xl p-5 mb-3">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                loggedToday ? "bg-signal-green-soft" : "bg-signal-amber-soft"
              }`}
            >
              {loggedToday ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="#3F8A48"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <circle cx="12" cy="12" r="9" stroke="#B07A16" strokeWidth="1.9" />
                  <path d="M12 7v5.2l3.2 3.2" stroke="#B07A16" strokeWidth="1.9" />
                </svg>
              )}
            </div>
            <div>
              <div className="font-bold text-[16.5px] tracking-tight">
                {loggedToday
                  ? "Today's diary logged"
                  : "Today's diary not logged"}
              </div>
              <div className="text-[13.5px] text-muted mt-0.5">
                {loggedToday ? "Nice work" : "Takes about a minute"}
              </div>
            </div>
          </div>
          <Link
            href={loggedToday ? "/history" : "/diary/new"}
            className="block w-full bg-accent text-white font-bold text-base text-center rounded-xl py-4 active:scale-[0.985] transition-transform"
          >
            {loggedToday ? "View history" : "Log today's entry"}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            [String(list.length), "Entries"],
            [String(thisWeekCount), "This week"],
            [String(flags7dCount), "Flags 7d"],
          ].map(([n, label]) => (
            <div
              key={label}
              className="bg-surface border border-line-soft rounded-xl py-4 text-center"
            >
              <div className="font-display font-extrabold text-2xl tracking-tight">
                {n}
              </div>
              <div className="text-[11px] text-muted font-semibold mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
