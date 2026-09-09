-- Allow founder/admin updates from the Supabase SQL Editor.
-- Billing webhooks (service_role) still work. Client updates still blocked.

create or replace function public.protect_users_plan()
returns trigger
language plpgsql
as $$
begin
  if new.plan is distinct from old.plan
     and coalesce(auth.role(), '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'plan can only be updated by billing webhooks';
  end if;
  return new;
end;
$$;
