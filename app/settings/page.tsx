import { Screen, PageTitle, GroupLabel, Group, Row } from "@/components/ui/Shell";
import { PROJECT, USER } from "@/lib/mock";

export default function SettingsPage() {
  return (
    <Screen>
      <PageTitle title="Settings" sub="Account, project and preferences" />

      <GroupLabel>You</GroupLabel>
      <Group>
        <Row title="Name" right={<span className="text-[15px] text-muted">{USER.name}</span>} />
        <Row title="Role" right={<span className="text-[15px] text-muted capitalize">{USER.role}</span>} />
      </Group>

      <GroupLabel>Project</GroupLabel>
      <Group>
        <Row title="Project" sub={PROJECT.name} />
        <Row title="Contract" sub={PROJECT.contract} />
        <Row title="Site postcode" sub={PROJECT.postcode} />
      </Group>

      <GroupLabel>Diary preferences</GroupLabel>
      <Group>
        <Row title="Carry forward" sub="Pre-fill labour & plant from last entry" right={<span className="text-[15px] text-muted">On</span>} />
        <Row title="Auto weather" sub="Fill AM/PM from site postcode" right={<span className="text-[15px] text-muted">On</span>} />
        <Row title="Daily reminder" sub="Off" right={<span className="text-[15px] text-muted">Off</span>} />
      </Group>

      <p className="mt-6 px-1 text-[12.5px] leading-relaxed text-muted">
        Stage 1 — example data only. Nothing is saved yet.
      </p>
    </Screen>
  );
}