-- Follow-up hardening of online pond v1; no user data removed.
revoke all on public.pwnd_ponds, public.pwnd_buildings from public;
alter table public.pwnd_buildings alter column carry type numeric(20,18) using carry::numeric(20,18);

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
      -- Clamp before writing: numeric(20,18) would otherwise round near-one
      -- fractions up to exactly 1 and violate its CHECK constraint.
      carry = case when next_bank >= free_capacity then 0
        else least(0.999999999999999999::numeric,
                   greatest(0::numeric, exact_amount - floor(exact_amount))) end
      where user_id = p_user and type = item.type;
  end loop;
  update public.pwnd_ponds set last_tick = sampled_at where user_id = p_user;
end;
$$;
revoke all on function public.pwnd_accrue(uuid) from public, anon, authenticated;
