-- Run once in the Supabase SQL Editor. No privileged key belongs in the website.
create table if not exists public.manege_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.manege_admins enable row level security;
revoke all on public.manege_admins from anon,authenticated;
grant select on public.manege_admins to authenticated;
create policy admin_own_membership on public.manege_admins for select to authenticated using(user_id=(select auth.uid()));
create or replace function public.is_manege_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.manege_admins where user_id=(select auth.uid()));
$$;
revoke all on function public.is_manege_admin() from public;
grant execute on function public.is_manege_admin() to anon,authenticated;

create table if not exists public.manege_records (
 id text primary key check(length(id) between 1 and 150),
 kind text not null check(kind in ('stakeholder','wish')),
 data jsonb not null default '{}'::jsonb check(jsonb_typeof(data)='object'),
 published boolean not null default false,
 deleted boolean not null default false,
 updated_at timestamptz not null default clock_timestamp()
);
create or replace function public.manege_touch() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=clock_timestamp();return new;end;$$;
create trigger manege_touch_records before update on public.manege_records for each row execute function public.manege_touch();
alter table public.manege_records enable row level security;
revoke all on public.manege_records from anon,authenticated;
grant select on public.manege_records to anon,authenticated;
grant insert,update,delete on public.manege_records to authenticated;
create policy records_read on public.manege_records for select to anon,authenticated using(published or (select public.is_manege_admin()));
create policy records_insert on public.manege_records for insert to authenticated with check((select public.is_manege_admin()));
create policy records_update on public.manege_records for update to authenticated using((select public.is_manege_admin())) with check((select public.is_manege_admin()));
create policy records_delete on public.manege_records for delete to authenticated using((select public.is_manege_admin()));

create table if not exists public.manege_talks (
 id uuid primary key,
 stakeholder_id text not null,
 title text not null check(length(trim(title))>0),
 date date,
 body text not null default '',
 file_path text,
 file_name text,
 proposals jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.manege_talks enable row level security;
revoke all on public.manege_talks from anon,authenticated;
grant select,insert,update,delete on public.manege_talks to authenticated;
create policy talks_read on public.manege_talks for select to authenticated using((select public.is_manege_admin()));
create policy talks_insert on public.manege_talks for insert to authenticated with check((select public.is_manege_admin()));
create policy talks_update on public.manege_talks for update to authenticated using((select public.is_manege_admin())) with check((select public.is_manege_admin()));
create policy talks_delete on public.manege_talks for delete to authenticated using((select public.is_manege_admin()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('manege-private','manege-private',false,20971520,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','application/octet-stream'])
on conflict(id) do update set public=false,file_size_limit=20971520;
create policy private_files_read on storage.objects for select to authenticated using(bucket_id='manege-private' and (select public.is_manege_admin()));
create policy private_files_insert on storage.objects for insert to authenticated with check(bucket_id='manege-private' and (select public.is_manege_admin()));
create policy private_files_update on storage.objects for update to authenticated using(bucket_id='manege-private' and (select public.is_manege_admin())) with check(bucket_id='manege-private' and (select public.is_manege_admin()));
create policy private_files_delete on storage.objects for delete to authenticated using(bucket_id='manege-private' and (select public.is_manege_admin()));

-- After creating/inviting an Auth user in the dashboard, grant the first admin
-- in the SQL Editor only (replace the placeholder with that user's UUID):
-- insert into public.manege_admins(user_id) values('AUTH-USER-UUID');

-- Duplicate protection also applies to concurrent clients, not only form checks.
create unique index manege_unique_stakeholder_name on public.manege_records(lower(trim(data->>'name'))) where kind='stakeholder' and not deleted;
create or replace function public.manege_check_wish_duplicate() returns trigger language plpgsql set search_path='' as $$
declare title_key text;
begin
 if new.kind='wish' and not new.deleted then
  title_key=lower(regexp_replace(trim(new.data->>'title'),'\s+',' ','g'));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(title_key));
  if exists(select 1 from public.manege_records r where r.kind='wish' and not r.deleted and r.id<>new.id and lower(regexp_replace(trim(r.data->>'title'),'\s+',' ','g'))=title_key and (r.data->'stakeholders') ?| array(select jsonb_array_elements_text(new.data->'stakeholders'))) then
   raise exception 'Deze wens is al geregistreerd bij een geselecteerde stakeholder.';
  end if;
 end if;
 return new;
end;$$;
create trigger manege_duplicate_wish before insert or update on public.manege_records for each row execute function public.manege_check_wish_duplicate();
