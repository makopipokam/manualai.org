-- Private profile storage for the MyCat × MyDog dating-app onboarding.
-- Genotype is profile data only; this migration adds no matching rules or public access.
create table public.mycat_dating_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  genotype text not null
    constraint mycat_dating_profiles_genotype_check
    check (genotype in ('XX', 'XY', 'X0', 'XXY', 'XYY', 'XXX')),
  genotype_consent_at timestamptz not null default now(),
  genotype_consent_version text not null,
  mycat_result jsonb,
  mycat_result_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mycat_dating_profiles_result_object_check
    check (mycat_result is null or jsonb_typeof(mycat_result) = 'object'),
  constraint mycat_dating_profiles_result_consent_check
    check ((mycat_result is null and mycat_result_consent_at is null)
        or (mycat_result is not null and mycat_result_consent_at is not null))
);

alter table public.mycat_dating_profiles enable row level security;
revoke all on table public.mycat_dating_profiles from anon, public;
grant select, insert, update, delete on table public.mycat_dating_profiles to authenticated;

create policy mycat_dating_profiles_select_own
  on public.mycat_dating_profiles for select to authenticated
  using (auth.uid() = user_id);

create policy mycat_dating_profiles_insert_own
  on public.mycat_dating_profiles for insert to authenticated
  with check (auth.uid() = user_id);

create policy mycat_dating_profiles_update_own
  on public.mycat_dating_profiles for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy mycat_dating_profiles_delete_own
  on public.mycat_dating_profiles for delete to authenticated
  using (auth.uid() = user_id);
