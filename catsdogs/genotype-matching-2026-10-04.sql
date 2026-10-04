-- cats&dogs: genotype-based matching
-- Product rule: two users are compatible only when their selected genotype is identical.
-- This is an app matching rule, not a biological compatibility claim.
-- Apply alongside the matching client release; do not expose genotype in pair profiles.

alter table public.cats_dogs_profiles
  add column if not exists genotype text;

-- Keep the legacy gender column for existing records/older clients, but new profiles no longer need it.
alter table public.cats_dogs_profiles
  alter column gender drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cats_dogs_profiles'::regclass
      and conname = 'cats_dogs_profiles_genotype_check'
  ) then
    alter table public.cats_dogs_profiles
      add constraint cats_dogs_profiles_genotype_check
      check (genotype is null or genotype = any (array['XX','XY','X0','XXY','XYY','XXX']::text[]));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cats_dogs_profiles'::regclass
      and conname = 'cats_dogs_profiles_match_attribute_check'
  ) then
    alter table public.cats_dogs_profiles
      add constraint cats_dogs_profiles_match_attribute_check
      check (genotype is not null or gender is not null);
  end if;
end;
$$;

comment on column public.cats_dogs_profiles.genotype is
  'Private matching attribute; never included in pair profile payloads.';

-- Existing locked profiles can set a genotype once without granting general UPDATE access.
create or replace function public.set_cats_dogs_genotype(p_genotype text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not_authenticated'; end if;
  if p_genotype is null or not (p_genotype = any (array['XX','XY','X0','XXY','XYY','XXX']::text[])) then
    raise exception 'genotype_invalid';
  end if;

  update public.cats_dogs_profiles
    set genotype = p_genotype
    where user_id = me and genotype is null;

  if not found and not exists (
    select 1 from public.cats_dogs_profiles p
    where p.user_id = me and p.genotype = p_genotype
  ) then
    raise exception 'genotype_locked_or_profile_missing';
  end if;
end;
$function$;

revoke all on function public.set_cats_dogs_genotype(text) from public;
revoke all on function public.set_cats_dogs_genotype(text) from anon;
grant execute on function public.set_cats_dogs_genotype(text) to authenticated;

-- Replace gender/orientation filtering with exact, symmetric genotype matching.
-- The genotype is read from the private profile table and is not copied into lobby or pair payloads.
create or replace function public.join_cats_dogs_lobby()
returns table(pair_id uuid, matched boolean)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  me uuid := auth.uid();
  other_user uuid;
  mine jsonb;
  other_profile jsonb;
  new_pair uuid;
  my_genotype text;
  state_row jsonb;
  now_ms bigint;
  pending_pair uuid;
begin
  if me is null then raise exception 'not_authenticated'; end if;

  select p.genotype,
         jsonb_build_object('uid', p.user_id, 'an', p.animal, 'br', p.breed, 'b', p.b5)
    into my_genotype, mine
    from public.cats_dogs_profiles p
    where p.user_id = me and p.profile_locked = true;
  if mine is null or my_genotype is null then raise exception 'profile_required'; end if;
  if public.cats_dogs_is_age_blocked(me) then raise exception 'age_blocked'; end if;

  perform pg_advisory_xact_lock(hashtextextended('cats_dogs_lobby', 0));
  select state into state_row from public.cats_dogs_profile_state where user_id = me;
  now_ms := floor(extract(epoch from clock_timestamp()) * 1000)::bigint;
  if state_row is not null and coalesce(nullif(state_row->>'gate', '')::numeric, 0) > now_ms then
    raise exception 'cooldown_active';
  end if;
  if state_row is not null and coalesce(nullif(state_row->>'nextMoveAt', '')::numeric, 0) > now_ms then
    raise exception 'next_move_locked';
  end if;

  -- Users already waiting receive a newly created match on their next call.
  if nullif(state_row->>'pendingPid', '') is not null then
    select p.pair_id into pending_pair
      from public.cats_dogs_pairs p
      where p.pair_id = (state_row->>'pendingPid')::uuid
        and me = any(p.user_ids)
        and p.started_at > now() - interval '60 seconds';
    update public.cats_dogs_profile_state
      set state = state - 'pendingPid', updated_at = clock_timestamp()
      where user_id = me;
    if pending_pair is not null then
      delete from public.cats_dogs_lobby where user_id = me;
      return query select pending_pair, true;
      return;
    end if;
  end if;

  delete from public.cats_dogs_lobby where expires_at < now();
  select l.user_id, l.profile
    into other_user, other_profile
    from public.cats_dogs_lobby l
    join public.cats_dogs_profiles p on p.user_id = l.user_id
    where l.user_id <> me
      and l.expires_at >= now()
      and p.profile_locked = true
      and p.genotype = my_genotype
      and not exists (
        select 1 from public.cats_dogs_blocks b
        where (b.blocker_id = me and b.blocked_id = l.user_id)
           or (b.blocker_id = l.user_id and b.blocked_id = me)
      )
      and not public.cats_dogs_is_age_blocked(l.user_id)
    order by l.joined_at
    limit 1
    for update of l skip locked;

  if other_user is null then
    insert into public.cats_dogs_lobby(user_id, profile, joined_at, expires_at)
      values (me, mine, now(), now() + interval '2 minutes')
      on conflict (user_id) do update
        set profile = excluded.profile, joined_at = now(), expires_at = excluded.expires_at;
    return query select null::uuid, false;
    return;
  end if;

  if other_profile is null then raise exception 'lobby_profile_missing'; end if;
  new_pair := gen_random_uuid();
  insert into public.cats_dogs_pairs(pair_id, user_ids, profiles)
    values (new_pair, array[me, other_user], jsonb_build_object(me::text, mine, other_user::text, other_profile));
  insert into public.cats_dogs_profile_state(user_id, state)
    values (me, jsonb_build_object('pid', new_pair))
    on conflict (user_id) do update
      set state = (public.cats_dogs_profile_state.state || jsonb_build_object('pid', new_pair)) - 'pendingPid',
          updated_at = now();
  insert into public.cats_dogs_profile_state(user_id, state)
    values (other_user, jsonb_build_object('pid', new_pair, 'pendingPid', new_pair))
    on conflict (user_id) do update
      set state = public.cats_dogs_profile_state.state || jsonb_build_object('pid', new_pair, 'pendingPid', new_pair),
          updated_at = now();
  delete from public.cats_dogs_lobby where user_id in (me, other_user);
  return query select new_pair, true;
end;
$function$;
