import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { name, email, password, inviteCode } = await request.json();

  if (!name?.trim() || !email?.trim() || !password || !inviteCode?.trim()) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("id")
    .eq("invite_code", inviteCode.trim())
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json({ error: "Invalid invite code." }, { status: 400 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: { full_name: name.trim() },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Could not create account." },
      { status: 400 },
    );
  }

  const { error: membershipError } = await admin.from("project_members").insert({
    project_id: project.id,
    user_id: created.user.id,
    role: "engineer",
  });

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
