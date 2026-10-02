-- Only changes defaults for future pwnd online ponds; does not touch existing accounts.
-- The cloud slice intentionally grants enough starting resources to test all three
-- buildings without trusting a browser-completed quiz.
alter table public.pwnd_ponds alter column water set default 500;
alter table public.pwnd_ponds alter column air set default 300;
alter table public.pwnd_ponds alter column love set default 100;
