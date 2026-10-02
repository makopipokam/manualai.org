-- pwnd online pond v1. Additive: does not read or trust existing browser saves.
-- Apply only to manualai.org's Supabase project via a privileged migration role.
create table if not exists public.pwnd_ponds (
  user_id uuid primary key references auth.users(id) on delete cascade,
  energy integer not null default 1000 check (energy between 0 and 100000000),
  water integer not null default 250 check (water between 0 and 100000000),
  air integer not null default 120 check (air between 0 and 100000000),
  love integer not null default 60 check (love between 0 and 100000000),
  revision bigint not null default 0 check (revision >= 0),
  last_tick timestamptz not null default clock_timestamp()
);
create table if not exists public.pwnd_buildings (
  user_id uuid not null references public.pwnd_ponds(user_id) on delete cascade,
  type text not null check (type in ('solar_lily','spring_pool','reed_windmill')),
  x smallint not null check (x between 0 and 8),
  y smallint not null check (y between 0 and 8),
  bank integer not null default 0 check (bank between 0 and 2000),
  carry numeric(12,9) not null default 0 check (carry >= 0 and carry < 1),
  primary key (user_id, type)
);
alter table public.pwnd_ponds enable row level security;
alter table public.pwnd_buildings enable row level security;
revoke all on public.pwnd_ponds, public.pwnd_buildings from anon, authenticated;

-- Distance between closest occupied cells of the 2x2 footprints.
create or replace function public.pwnd_footprint_distance(ax integer, ay integer, bx integer, by integer)
returns integer language sql immutable set search_path = '' as $$
  select greatest(0, bx - ax - 1, ax - bx - 1) +
         greatest(0, by - ay - 1, ay - by - 1);
$$;

-- Private helper. Called only under a locked pond row from the two public RPCs.
create or replace function public.pwnd_accrue(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  pond public.pwnd_ponds%rowtype;
  item public.pwnd_buildings%rowtype;
  spring public.pwnd_buildings%rowtype;
  seconds_elapsed numeric;
  rate_per_hour integer;
  current_balance integer;
  free_capacity integer;
  exact_amount numeric;
  next_bank integer;
  sampled_at timestamptz := clock_timestamp();
begin
  select * into pond from public.pwnd_ponds where user_id = p_user for update;
  if not found then raise exception 'pond_missing' using errcode = 'P0001'; end if;
  seconds_elapsed := least(28800::numeric, greatest(0::numeric,
    extract(epoch from sampled_at - pond.last_tick)));
  if seconds_elapsed <= 0 then return; end if;
  select * into spring from public.pwnd_buildings
    where user_id = p_user and type = 'spring_pool';
  for item in select * from public.pwnd_buildings where user_id = p_user order by type loop
    rate_per_hour := 120;
    if spring.type is not null and item.type = 'solar_lily' and
       public.pwnd_footprint_distance(item.x,item.y,spring.x,spring.y) <= 2 then
      rate_per_hour := 420;
    elsif spring.type is not null and item.type = 'reed_windmill' and
          public.pwnd_footprint_distance(item.x,item.y,spring.x,spring.y) <= 3 then
      rate_per_hour := 240;
    end if;
    current_balance := case item.type
      when 'solar_lily' then pond.energy
      when 'spring_pool' then pond.water else pond.air end;
    free_capacity := greatest(0, 2000 - current_balance);
    exact_amount := item.carry + seconds_elapsed * rate_per_hour / 3600;
    next_bank := least(free_capacity, item.bank + floor(exact_amount)::integer);
    update public.pwnd_buildings set bank = next_bank,
      carry = case when next_bank >= free_capacity then 0 else exact_amount - floor(exact_amount) end
      where user_id = p_user and type = item.type;
  end loop;
  update public.pwnd_ponds set last_tick = sampled_at where user_id = p_user;
end;
$$;

create or replace function public.pwnd_snapshot(p_user uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'revision', p.revision, 'serverTime', clock_timestamp(),
    'resources', jsonb_build_object('energy',p.energy,'water',p.water,'air',p.air,'love',p.love),
    'buildings', coalesce((select jsonb_agg(jsonb_build_object('type',b.type,'x',b.x,'y',b.y,
      'bank',b.bank,'carry',b.carry) order by b.type)
      from public.pwnd_buildings b where b.user_id = p.user_id), '[]'::jsonb)
  ) from public.pwnd_ponds p where p.user_id = p_user;
$$;

-- Authenticated reads use DB time. No caller-supplied user ID or saved resources.
create or replace function public.pwnd_get_pond()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'auth_required' using errcode = 'P0001'; end if;
  insert into public.pwnd_ponds(user_id) values(owner_id) on conflict (user_id) do nothing;
  perform public.pwnd_accrue(owner_id);
  return public.pwnd_snapshot(owner_id);
end;
$$;

-- Every action holds a row lock, verifies revision, validates cost/collision and returns
-- the new snapshot in the same transaction. No trust in client amount, clock or bank.
create or replace function public.pwnd_pond_action(
  p_kind text, p_type text, p_x integer, p_y integer, p_revision bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  pond public.pwnd_ponds%rowtype;
  item public.pwnd_buildings%rowtype;
  near_spring public.pwnd_buildings%rowtype;
  gained integer := 0;
  credit integer;
  is_move boolean;
begin
  if owner_id is null then raise exception 'auth_required' using errcode = 'P0001'; end if;
  select * into pond from public.pwnd_ponds where user_id = owner_id for update;
  if not found then raise exception 'pond_missing' using errcode = 'P0001'; end if;
  if p_revision is distinct from pond.revision then
    raise exception 'revision_conflict' using errcode = 'P0001';
  end if;
  perform public.pwnd_accrue(owner_id);
  select * into pond from public.pwnd_ponds where user_id = owner_id for update;
  if p_kind in ('place','move') then
    if p_type is null or p_type not in ('solar_lily','spring_pool','reed_windmill') or
       p_x is null or p_y is null or p_x not between 0 and 8 or p_y not between 0 and 8 then
      raise exception 'invalid_building' using errcode = 'P0001';
    end if;
    if p_x between 3 and 5 and p_y between 3 and 5 then
      raise exception 'core_collision' using errcode = 'P0001';
    end if;
    if exists(select 1 from public.pwnd_buildings b where b.user_id = owner_id and
      (p_kind = 'place' or b.type <> p_type) and
      p_x <= b.x + 1 and p_x + 1 >= b.x and p_y <= b.y + 1 and p_y + 1 >= b.y) then
      raise exception 'building_collision' using errcode = 'P0001';
    end if;
    select * into item from public.pwnd_buildings where user_id = owner_id and type = p_type;
    is_move := p_kind = 'move';
    if is_move then
      if item.type is null then raise exception 'building_missing' using errcode = 'P0001'; end if;
      if item.x = p_x and item.y = p_y then return public.pwnd_snapshot(owner_id); end if;
      update public.pwnd_buildings set x = p_x, y = p_y
        where user_id = owner_id and type = p_type;
    else
      if item.type is not null then raise exception 'building_exists' using errcode = 'P0001'; end if;
      if p_type = 'solar_lily' then
        if pond.energy < 120 or pond.water < 80 or pond.air < 20 or pond.love < 10 then
          raise exception 'insufficient_resources' using errcode = 'P0001'; end if;
        update public.pwnd_ponds set energy=energy-120, water=water-80, air=air-20,
          love=love-10 where user_id=owner_id;
      elsif p_type = 'spring_pool' then
        if pond.energy < 80 or pond.water < 120 or pond.air < 20 or pond.love < 10 then
          raise exception 'insufficient_resources' using errcode = 'P0001'; end if;
        update public.pwnd_ponds set energy=energy-80, water=water-120, air=air-20,
          love=love-10 where user_id=owner_id;
      else
        if pond.energy < 100 or pond.water < 80 or pond.air < 120 or pond.love < 15 then
          raise exception 'insufficient_resources' using errcode = 'P0001'; end if;
        update public.pwnd_ponds set energy=energy-100, water=water-80, air=air-120,
          love=love-15 where user_id=owner_id;
      end if;
      insert into public.pwnd_buildings(user_id,type,x,y)
        values(owner_id,p_type,p_x,p_y);
    end if;
  elsif p_kind = 'claim' then
    if p_type is not null or p_x is not null or p_y is not null then
      raise exception 'invalid_claim' using errcode = 'P0001'; end if;
    for item in select * from public.pwnd_buildings where user_id=owner_id order by type loop
      select * into pond from public.pwnd_ponds where user_id=owner_id for update;
      credit := least(item.bank, greatest(0, 2000 - (case item.type
        when 'solar_lily' then pond.energy when 'spring_pool' then pond.water else pond.air end)));
      if credit > 0 then
        if item.type = 'solar_lily' then
          update public.pwnd_ponds set energy=energy+credit where user_id=owner_id;
        elsif item.type = 'spring_pool' then
          update public.pwnd_ponds set water=water+credit where user_id=owner_id;
        else
          update public.pwnd_ponds set air=air+credit where user_id=owner_id;
        end if;
        update public.pwnd_buildings set bank=bank-credit where user_id=owner_id and type=item.type;
        gained := gained + credit;
      end if;
    end loop;
    if gained = 0 then return public.pwnd_snapshot(owner_id); end if;
  else
    raise exception 'invalid_action' using errcode = 'P0001';
  end if;
  update public.pwnd_ponds set revision=revision+1 where user_id=owner_id;
  return public.pwnd_snapshot(owner_id);
end;
$$;

-- SECURITY DEFINER is not a public API by default: expose only two entry points.
revoke all on function public.pwnd_footprint_distance(integer,integer,integer,integer) from public, anon, authenticated;
revoke all on function public.pwnd_accrue(uuid) from public, anon, authenticated;
revoke all on function public.pwnd_snapshot(uuid) from public, anon, authenticated;
revoke all on function public.pwnd_get_pond() from public, anon, authenticated;
revoke all on function public.pwnd_pond_action(text,text,integer,integer,bigint) from public, anon, authenticated;
grant execute on function public.pwnd_get_pond() to authenticated;
grant execute on function public.pwnd_pond_action(text,text,integer,integer,bigint) to authenticated;
