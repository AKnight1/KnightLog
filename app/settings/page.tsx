import { Screen, PageTitle, GroupLabel, Group, Row } from "@/components/ui/Shell";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: project }] = await Promise.all([
    user
      ? supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single()
      : Promise.resolve({ data: null }),
    supabase.from("projects").select("name, contract, postcode").limit(1).single(),
  ]);

  return (
    <Screen>
      <PageTitle title="Settings" sub="Account, project and preferences" />

      <GroupLabel>You</GroupLabel>
      <Group>
        <Row
          title="Name"
          right={
            <span className="text-[15px] text-muted">
              {profile?.full_name || user?.email}
            </span>
          }
        />
        <Row
          title="Role"
          right={
            <span className="text-[15px] text-muted capitalize">
              {profile?.role ?? "—"}
            </span>
          }
        />
      </Group>

      <GroupLabel>Project</GroupLabel>
      <Group>
        <Row title="Project" sub={project?.name ?? "—"} />
        <Row title="Contract" sub={project?.contract ?? "—"} />
        <Row title="Site postcode" sub={project?.postcode ?? "—"} />
      </Group>

      <GroupLabel>Diary preferences</GroupLabel>
      <Group>
        <Row title="Carry forward" sub="Pre-fill labour & plant from last entry" right={<span className="text-[15px] text-muted">On</span>} />
        <Row title="Auto weather" sub="Fill AM/PM from site postcode" right={<span className="text-[15px] text-muted">On</span>} />
        <Row title="Daily reminder" sub="Off" right={<span className="text-[15px] text-muted">Off</span>} />
      </Group>

      <GroupLabel>Account</GroupLabel>
      <Group>
        <SignOutButton />
      </Group>

      <p className="mt-6 px-1 text-[12.5px] leading-relaxed text-muted">
        Diary preferences aren&apos;t wired up yet — everything else on this
        page is real.
      </p>
    </Screen>
  );
}
