alter table public.routine_logs
  add column if not exists time_of_day public.time_of_day;

update public.routine_logs
set time_of_day = 'am'
where time_of_day is null;

alter table public.routine_logs
  alter column time_of_day set default 'am';

alter table public.routine_logs
  alter column time_of_day set not null;

alter table public.routine_logs
  drop constraint if exists routine_logs_unique;

alter table public.routine_logs
  add constraint routine_logs_unique unique (user_id, date, product_id, time_of_day);
