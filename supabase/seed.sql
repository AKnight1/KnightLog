-- One-time seed: your user, a project, and membership linking them.
-- Run once in the SQL Editor after creating your dashboard user.
-- Mirrors PROJECT / USER in lib/mock.ts.

update profiles
set full_name = 'Alex Knight', role = 'engineer'
where id = 'a624c9d6-3d7b-46ef-8469-692c5169d048';

insert into projects (id, name, contract, postcode)
values (
  '11111111-1111-1111-1111-111111111111',
  'Chirmorie Wind Farm',
  'NEC4 ECC',
  'KA26 0PS'
);

insert into project_members (project_id, user_id, role)
values (
  '11111111-1111-1111-1111-111111111111',
  'a624c9d6-3d7b-46ef-8469-692c5169d048',
  'engineer'
);
