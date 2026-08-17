"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/", label: "Home", icon: Icon.home },
  { href: "/capture", label: "Capture", icon: Icon.bolt },
  { href: "/diary/new", label: "Diary", icon: Icon.plus },
  { href: "/history", label: "History", icon: Icon.calendar },
  { href: "/settings", label: "Settings", icon: Icon.gear },
];

export function TabBar() {
  const path = usePathname();
  const [captureBadge, setCaptureBadge] = useState(0);

  useEffect(() => {
    if (path === "/login" || path === "/signup") return;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    createClient()
      .from("captures")
      .select("id", { count: "exact", head: true })
      .gte("captured_at", startOfDay.toISOString())
      .then(({ count }) => setCaptureBadge(count ?? 0));
  }, [path]);

  if (path === "/login" || path === "/signup") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-line bg-bg/95 backdrop-blur-xl px-1 pt-1.5 pb-[calc(0.25rem+env(safe-area-inset-bottom))] md:top-0 md:bottom-auto md:w-[248px] md:flex-col md:justify-start md:border-t-0 md:border-r md:bg-surface md:px-3 md:pb-4 md:pt-5 md:gap-1">
      {TABS.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        const badge = t.href === "/capture" ? captureBadge : 0;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-1.5 md:flex-none md:flex-row md:justify-start md:gap-3 md:rounded-lg md:px-3 md:py-2.5 ${
              active ? "text-accent md:bg-accent-soft" : "text-muted md:hover:bg-bg"
            }`}
          >
            <span className="w-[22px] h-[22px] md:w-5 md:h-5">{t.icon}</span>
            <span className="text-[9px] font-semibold md:text-[14.5px]">
              {t.label}
            </span>
            {badge > 0 && (
              <span className="absolute top-0.5 right-[calc(50%-19px)] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-signal-red px-1 text-[9.5px] font-bold text-white md:static md:ml-auto md:h-[19px] md:min-w-[20px]">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}