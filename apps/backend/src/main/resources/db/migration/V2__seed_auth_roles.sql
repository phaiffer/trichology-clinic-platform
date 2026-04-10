insert into roles (name)
values ('ADMIN')
on conflict (name) do nothing;

insert into roles (name)
values ('CLINICIAN')
on conflict (name) do nothing;

insert into roles (name)
values ('STAFF')
on conflict (name) do nothing;
