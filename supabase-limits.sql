-- manualAI: Speicher-Limits (Schutz davor, dass jemand die Datenbank vollschreibt)
-- Ausführen: Supabase -> SQL Editor -> New query -> alles einfügen -> Run
-- Läuft nach supabase-schema.sql. Kann gefahrlos mehrmals ausgeführt werden.
--
-- Hintergrund: Chats werden direkt vom Browser in die Datenbank geschrieben und laufen
-- deshalb an den Tageslimits der API vorbei. Diese Regeln gelten daher in der Datenbank selbst.
-- Werte anpassen: 100 = neue Chats pro 24 Stunden, 600 = Nachrichten pro 24 Stunden
-- (Die API erlaubt 150 Fragen pro Tag, das sind höchstens 300 Nachrichten.)

-- ---------- Indizes fürs schnelle Zählen ----------

create index if not exists chats_user_created_idx on public.chats (user_id, created_at desc);
create index if not exists messages_user_created_idx on public.messages (user_id, created_at desc);

-- ---------- Neue Chats begrenzen ----------
-- Die Zeitstempel setzt immer die Datenbank, damit man das Limit nicht mit einem
-- falschen Datum umgehen kann.

create or replace function public.limit_new_chat()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.created_at := now();
  new.updated_at := now();
  if (
    select count(*) from public.chats
    where user_id = new.user_id and created_at > now() - interval '24 hours'
  ) >= 100 then
    raise exception 'daily chat limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists chats_limit on public.chats;
create trigger chats_limit
  before insert on public.chats
  for each row execute function public.limit_new_chat();

-- ---------- Neue Nachrichten begrenzen ----------

create or replace function public.limit_new_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.created_at := now();
  if (
    select count(*) from public.messages
    where user_id = new.user_id and created_at > now() - interval '24 hours'
  ) >= 600 then
    raise exception 'daily message limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists messages_limit on public.messages;
create trigger messages_limit
  before insert on public.messages
  for each row execute function public.limit_new_message();

-- ---------- Einstellungen klein halten ----------
-- Nutzer dürfen ihre "settings" selbst ändern. Ohne Obergrenze könnte dort beliebig viel stehen.

alter table public.profiles drop constraint if exists profiles_settings_size;
alter table public.profiles
  add constraint profiles_settings_size check (octet_length(settings::text) <= 4096);
