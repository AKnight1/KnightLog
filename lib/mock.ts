// Temporary example data for Stage 1.
// Replaced by real Supabase queries in Stage 2.

export type Flag = "blocked" | "delay" | "instruction" | "hse" | "visitor";

export interface DiaryEntry {
  id: string;
  day: string;            // ISO date
  author: string;
  project: string;
  progress: string;
  flags: Flag[];
  reviewed: boolean;
  backdatedDays: number;
  submittedAt: string;
}

export const PROJECT = {
  name: "Chirmorie Wind Farm",
  contract: "NEC4 ECC",
  postcode: "KA26 0PS",
};

export const USER = {
  name: "Alex Knight",
  role: "engineer" as const,
};

export const ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    day: "2026-08-05",
    author: "Alex Knight",
    project: "Chirmorie Wind Farm",
    progress:
      "Poured C32/40 to bay 4 base slab, cubes taken. Formwork struck bay 3.",
    flags: ["delay", "instruction"],
    reviewed: false,
    backdatedDays: 0,
    submittedAt: "2026-08-05T17:12:00Z",
  },
  {
    id: "2",
    day: "2026-08-04",
    author: "Alex Knight",
    project: "Chirmorie Wind Farm",
    progress:
      "Rebar fixing continued to pile caps PC-07 to PC-10. Access road stone regraded.",
    flags: ["blocked"],
    reviewed: true,
    backdatedDays: 0,
    submittedAt: "2026-08-04T16:48:00Z",
  },
  {
    id: "3",
    day: "2026-08-03",
    author: "Alex Knight",
    project: "Chirmorie Wind Farm",
    progress:
      "Turbine base excavation T4 continued. Dewatering pump on site from 09:00.",
    flags: ["hse"],
    reviewed: true,
    backdatedDays: 1,
    submittedAt: "2026-08-04T07:20:00Z",
  },
];

export const CAPTURES = [
  { id: "a", at: "09:48", text: "Hanson ready-mix late — 40 mins, three loads." },
  { id: "b", at: "11:40", text: "PM instructed hold on bay 5 pour until rebar signed off." },
];

export const FLAG_LABEL: Record<Flag, string> = {
  blocked: "Work prevented",
  delay: "Early warning",
  instruction: "Instruction",
  hse: "Health & safety",
  visitor: "Visitor",
};

export const FLAG_CLASS: Record<Flag, string> = {
  blocked: "bg-signal-red-soft text-signal-red",
  delay: "bg-signal-amber-soft text-signal-amber",
  instruction: "bg-signal-blue-soft text-signal-blue",
  hse: "bg-signal-green-soft text-signal-green",
  visitor: "bg-signal-blue-soft text-signal-blue",
};