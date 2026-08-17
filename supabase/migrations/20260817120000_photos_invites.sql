-- Adds: photo attachments on captures, a private storage bucket for them,
-- and an invite code per project so new engineers can self-signup instead
-- of being provisioned by hand.

alter table captures
  alter column body set default '',
  add column photo_path text;

alter table projects
  add column invite_code text not null default encode(gen_random_bytes(4), 'hex');

-- Friendly, memorable code for the existing seeded project (random hex
-- for any future projects created after this migration).
update projects
set invite_code = 'CHIRMORIE-2026'
where id = '11111111-1111-1111-1111-111111111111';

-- Private bucket: photos are only ever served via signed URLs generated
-- server-side (for the PDF export), never a public link.
insert into storage.buckets (id, name, public)
values ('captures', 'captures', false);

-- Storage RLS mirrors the captures table: only members of the project a
-- photo belongs to can read/write it. Photos are stored under a path of
-- "<project_id>/<filename>", so the first path segment is the project id.
create policy "members can read their project's photos" on storage.objects
  for select using (
    bucket_id = 'captures'
    and exists (
      select 1 from project_members
      where project_members.project_id = (storage.foldername(name))[1]::uuid
        and project_members.user_id = auth.uid()
    )
  );

create policy "members can upload photos to their project" on storage.objects
  for insert with check (
    bucket_id = 'captures'
    and exists (
      select 1 from project_members
      where project_members.project_id = (storage.foldername(name))[1]::uuid
        and project_members.user_id = auth.uid()
    )
  );

-- Team portal: seeing a teammate's name on their entries requires reading
-- their profile row, not just your own. Scope that to people who share a
-- project with you.
create policy "project co-members can read each other's profiles" on profiles
  for select using (
    exists (
      select 1 from project_members pm1
      join project_members pm2 on pm1.project_id = pm2.project_id
      where pm1.user_id = auth.uid()
        and pm2.user_id = profiles.id
    )
  );
