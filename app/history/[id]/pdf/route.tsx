import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { FLAG_LABEL, type Flag } from "@/lib/mock";
import { DiaryEntryDocument } from "@/lib/pdf/DiaryEntryDocument";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("diary_entries")
    .select(
      "id, day, progress, flags, reviewed, submitted_at, project_id, author_id",
    )
    .eq("id", id)
    .single();

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const [{ data: project }, { data: author }, { data: captures }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("name, contract, postcode")
        .eq("id", entry.project_id)
        .single(),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", entry.author_id)
        .single(),
      supabase
        .from("captures")
        .select("body, photo_path, captured_at")
        .eq("entry_id", entry.id)
        .order("captured_at", { ascending: true }),
    ]);

  const notes = (captures ?? [])
    .filter((c) => !c.photo_path)
    .map((c) => ({
      time: new Date(c.captured_at).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      body: c.body,
    }));

  const photoPaths = (captures ?? [])
    .map((c) => c.photo_path)
    .filter((p): p is string => p !== null);

  let photoUrls: string[] = [];
  if (photoPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("captures")
      .createSignedUrls(photoPaths, 300);
    photoUrls = (signed ?? [])
      .map((s) => s.signedUrl)
      .filter((u): u is string => !!u);
  }

  const dayLabel = new Date(entry.day + "T12:00:00").toLocaleDateString(
    "en-GB",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  const buffer = await renderToBuffer(
    <DiaryEntryDocument
      projectName={project?.name ?? "—"}
      contract={project?.contract ?? null}
      postcode={project?.postcode ?? null}
      authorName={author?.full_name || "—"}
      day={dayLabel}
      reviewed={entry.reviewed}
      submittedAt={new Date(entry.submitted_at).toLocaleString("en-GB")}
      flags={(entry.flags as Flag[]).map((f) => FLAG_LABEL[f])}
      progress={entry.progress}
      notes={notes}
      photoUrls={photoUrls}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="diary-${entry.day}.pdf"`,
    },
  });
}
